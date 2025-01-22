import { snHttpGet, snHttpPost, texprHttpGet, texprHttpPost } from "@/adl-gen/common/http";
// import { snCapabilityApi, snHttpGet, snHttpPost, texprCapabilityApi, texprHttpGet, texprHttpPost } from "@/adl-gen/common/capability";

import * as API from "@/adl-gen/protoapp/apis/ui";
// import * as CAP from "@/adl-gen/protoapp/apis/cap";
import * as AST from "@/adl-gen/sys/adlast";
import * as ADL from "@adllang/adl-runtime";

import { RESOLVER } from "@/adl-gen/resolver";
import { texprDoc } from "@/adl-gen/sys/annotations";
import { createUiFactory } from "@/components/forms/factory";
import { createVEditor } from "@/components/forms/model/veditor/adlfactory";
import { AppState, useAppState } from "@/hooks/use-app-state";
import { AdlRequestError, ServiceBase } from "@/service/service-base";
import { Json, createJsonBinding, scopedNamesEqual } from "@adllang/adl-runtime";
import { Box, Container } from "@mui/material";
import { useMemo } from "react";
import { ApiWorkbenchPresent } from "./api-workbench";
import { Api, CompletedRequest, CompletedResponse, Endpoint, HttpEndpoint, HttpXEndpoint } from "./api-types";
import { LoginResp } from "@/adl-gen/protoapp/apis/types";

export function ApiWorkbench() {
  const appState = useAppState();
  const { authState, api } = appState;
  const jwt_decoded = authState.kind === 'auth' ? authState.auth.jwt_decoded : undefined;

  const endpoints = useMemo(() => {
    const allEndpoints = getEndpoints(RESOLVER, API.texprApiRequests());
    // only show endpoints accessible for the current authstate
    return allEndpoints.filter(ep => {
      return ep.kind === 'api' || 
      ep.security!.kind === 'public' ||
        ep.security!.kind === 'token' && authState.kind == 'auth' ||
        ep.security!.kind === 'tokenWithRole' && jwt_decoded && ep.security!.value === jwt_decoded.role
    });
  }, [authState]);

  function updateAppState<I, O>(endpoint: Endpoint, resp: O) {
    // All the endpoint handling is generic except for here, where we update the auth state when the
    // login or logout endpoints are called.
    switch (endpoint.name) {
      case 'login': appState.setAuthStateFromLogin(resp as LoginResp); break;
      case 'logout': appState.logout(); break;
    }
  }

  return (
    <Container fixed>
      <Box>
        <ApiWorkbenchPresent
          endpoints={endpoints}
          executeRequest={(endpoint, startedAt, req, reqbody) => {
            const jwt = authState.kind == 'auth' ? authState.auth.jwt : undefined;
            return executeRequest(api, jwt, endpoint, startedAt, req, reqbody)
          }}
          updateAppState={updateAppState}
        />
        {jwt_decoded && <Box sx={{ fontSize: "0.9rem" }}>sub: {jwt_decoded.sub} / role: {jwt_decoded.role}</Box>}
      </Box>
    </Container>
  )
}

async function executeRequest<I>(
  service: ServiceBase,
  jwt: string | undefined,
  endpoint: HttpEndpoint,
  startedAt: Date,
  req?: I,
  reqbody?: Json,
): Promise<CompletedRequest> {

  let resp: CompletedResponse;
  try {
    const value = await service.requestAdl(endpoint.method, endpoint.path, reqbody, endpoint.jsonBindingO, jwt);
    resp = { success: true, value };
  } catch (e: unknown) {
    if (e instanceof AdlRequestError) {
      resp = { success: false, httpStatus: e.respStatus, responseBody: e.respBody };
    } else if (e instanceof Error) {
      resp = { success: false, httpStatus: 999, responseBody: 'internal Error: ' + e };
    } else {
      resp = { success: false, httpStatus: 999, responseBody: 'unknown error' };
    }
  }

  return {
    startedAt,
    durationMs: new Date().getTime() - startedAt.getTime(),
    endpoint,
    req,
    resp,
  }
}

function getEndpoints<API>(resolver: ADL.DeclResolver, texpr: ADL.ATypeExpr<API>): Endpoint[] {
  if (texpr.value.typeRef.kind !== 'reference') {
    throw new Error("API must be a monomorphic declaration");
  }
  // if (texpr.value.typeRef.kind !== 'reference' || texpr.value.parameters.length != 0) {
  //   throw new Error("API must be a monomorphic declaration");
  // }
  const decl = resolver(texpr.value.typeRef.value);
  if (decl.decl.type_.kind !== 'struct_') {
    throw new Error("API must be a struct");
  }
  const struct = decl.decl.type_.value;

  const endpoints: Endpoint[] = [];
  for (const f of struct.fields) {
    if (f.typeExpr.typeRef.kind === 'reference') {
      if (scopedNamesEqual(f.typeExpr.typeRef.value, snHttpPost)) {
        endpoints.push(getHttpPostEndpoint(resolver, f))
        continue
      }
      if (scopedNamesEqual(f.typeExpr.typeRef.value, snHttpGet)) {
        endpoints.push(getHttpGetEndpoint(resolver, f))
        continue
      }
      const sd = resolver( f.typeExpr.typeRef.value )
      if ( sd.decl.type_.kind === "struct_" ){
        endpoints.push(getApiStruct(resolver, f))
      }
    }
  }
  console.log(endpoints);
  return endpoints;
}

function getApiStruct <C> (resolver: ADL.DeclResolver,
  field: AST.Field): Api<C>{
    const docString = ADL.getAnnotation(JB_DOC, field.annotations) || "";
    return {
      kind: "api",
      docString,
      apis_called: [],
      endpoints: getEndpoints(resolver, {value: field.typeExpr}),
      name: field.name,
    }
}

function getHttpPostEndpoint<I, O>(
  resolver: ADL.DeclResolver,
  field: AST.Field,
): HttpXEndpoint<I, O> {
  if (field.default.kind !== 'just') {
    throw new Error("API endpoint must have a default value");
  }
  let texprI = ADL.makeATypeExpr<I>(field.typeExpr.parameters[0]);
  const texprO = ADL.makeATypeExpr<O>(field.typeExpr.parameters[1]);

  const jb = createJsonBinding(resolver, texprHttpPost(texprI, texprO));
  const httpPost = jb.fromJson(field.default.value);

  const veditorI = createVEditor(texprI, resolver, UI_FACTORY);
  const veditorO = createVEditor(texprO, resolver, UI_FACTORY);
  const jsonBindingI = createJsonBinding(resolver, texprI);
  const jsonBindingO = createJsonBinding(resolver, texprO);

  const docString = ADL.getAnnotation(JB_DOC, field.annotations) || "";
  return {
    kind: 'callable',
    method: 'post',
    name: field.name,
    path: httpPost.path,
    docString,
    security: httpPost.security,
    veditorI,
    veditorO,
    jsonBindingI,
    jsonBindingO,
  }
}

function getHttpGetEndpoint<O>(
  resolver: ADL.DeclResolver,
  field: AST.Field,
): HttpXEndpoint<null,O> {
  if (field.default.kind !== 'just') {
    throw new Error("API endpoint must have a default value");
  }
  const texprI = ADL.texprVoid();
  const texprO = ADL.makeATypeExpr<O>(field.typeExpr.parameters[0]);

  const jb = createJsonBinding(resolver, texprHttpGet(texprO));
  const httpGet = jb.fromJson(field.default.value);

  const veditorI = createVEditor(texprI, resolver, UI_FACTORY);
  const veditorO = createVEditor(texprO, resolver, UI_FACTORY);
  const jsonBindingI = createJsonBinding(resolver, texprI);
  const jsonBindingO = createJsonBinding(resolver, texprO);

  const docString = ADL.getAnnotation(JB_DOC, field.annotations) || "";
  return {
    kind: 'callable',
    method: 'get',
    name: field.name,
    path: httpGet.path,
    docString,
    security: httpGet.security,
    veditorI,
    veditorO,
    jsonBindingI,
    jsonBindingO,
  }
}

const JB_DOC = createJsonBinding(RESOLVER, texprDoc());
const UI_FACTORY = createUiFactory();
