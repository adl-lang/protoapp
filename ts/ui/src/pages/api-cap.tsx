// import { snHttpGet, snHttpPost, texprHttpGet, texprHttpPost } from "@/adl-gen/common/http";
import { snCapabilityApi, snCapabilityToken, snHttpGet, snHttpPost, texprCapabilityApi, texprHttpGet, texprHttpPost } from "@/adl-gen/common/capability";

// import * as API from "@/adl-gen/protoapp/apis/ui";
import * as CAP from "@/adl-gen/protoapp/apis/cap";
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
import { useMemo, useState } from "react";
import { ApiWorkbenchPresent } from "./api-workbench";
import { Api, CompletedRequest, CompletedResponse, Endpoint, HttpEndpoint, HttpGetEndpoint, HttpPostEndpoint } from "./api-types";
import { LoginResp } from "@/adl-gen/protoapp/apis/types";

type Endpointish = HttpEndpoint | Apiish<unknown>;

type Apiish<C> = {
  name: string;
  docString: string,
  kind: 'api';
  typetoken: ADL.ATypeExpr<C>;
  // token_val: C;
  // endpoints: Endpointish[];
  endpoints: HttpEndpoint[];
  parent: AST.Struct;
}

interface CapToken<C> {
  type: AST.TypeExpr;
  token: C;
  parent: AST.Struct;
};

export function CapWorkbench() {
  const appState = useAppState();
  const { authState, api } = appState;
  const jwt_decoded = authState.kind === 'auth' ? authState.auth.jwt_decoded : undefined;

  const [capTokens, setCapTokens] = useState<CapToken<unknown>[]>([]);

  const endpoints = useMemo(() => {
    const endpointsish = getEndpoints(RESOLVER, CAP.texprApiRequests());
    const apiish: Apiish<unknown>[] = [];
    function completeEndpoint(e: Endpointish): Endpoint | undefined {
      switch (e.kind) {
        case "api": {
          apiish.push(e);
          return undefined
        }
        default: return e;
      }
    }

    const endpoints = endpointsish.map(completeEndpoint).filter(e => e !== undefined)// as Endpoint[];

    const apis = capTokens.flatMap(ct => {
      const apis: Api<unknown>[] = []
      for(const f of ct.parent.fields) {
        if ( f.typeExpr.typeRef.kind === 'reference' && scopedNamesEqual(f.typeExpr.typeRef.value, snCapabilityApi)) {
          const texprC = f.typeExpr.parameters[0];
          if ( !ADL.typeExprsEqual( texprC, ct.type ) ) {
            continue
          }
          const apiish = getApiEndpoint(RESOLVER, f, ct.parent);
          apis.push({
            ...apiish,
            token_val: ct.token,
          });
        }
      }
      return apis;
    })

    return [...endpoints, ...apis];

    // // only show endpoints accessible for the current authstate
    // return allEndpoints.filter(ep => {
    //   if (ep.kind === 'api') {
    //     return true
    //   }
    //   return ep.security.kind === 'public' ||
    //     ep.security.kind === 'token' && authState.kind == 'auth' ||
    //     ep.security.kind === 'tokenWithRole' && jwt_decoded && ep.security.value === jwt_decoded.role
    // });
  }, [capTokens]);

  function updateAppState<I, O>(endpoint: HttpEndpoint, resp: O) {
    // console.log("updateAppState", endpoint, resp);
    if (endpoint.jsonBindingO.typeExpr.typeRef.kind === 'reference') {
      const sd_resp = RESOLVER(endpoint.jsonBindingO.typeExpr.typeRef.value);
      switch (sd_resp.decl.type_.kind) {
        case "union_": {
          const union = sd_resp.decl.type_.value;
          const field = union.fields.find(f => f.name === (resp as any)["kind"]);
          if (field) {
            const cap_token_type: CapToken<unknown>[] = field.annotations.flatMap(a => {
              const sd = RESOLVER(a.key)
              if (sd.decl.type_.kind !== 'type_' && sd.decl.type_.kind !== 'newtype_') {
                return []
              }
              if (sd.decl.type_.value.typeExpr.typeRef.kind !== "reference") {
                return []
              }
              if (!scopedNamesEqual(sd.decl.type_.value.typeExpr.typeRef.value, snCapabilityToken)) {
                return []
              }
              // TODO check that the token is of the correct type (ie no coding error),
              // i.e. sd.decl.type_.value.typeExpr.parameters[0] and endpoint.jsonBindingO.typeExpr (ie value used by resp.value) are of the same underlining type.
              return [{
                type: sd.decl.type_.value.typeExpr.parameters[0],
                token: (resp as any)["value"],
                parent: endpoint.parent,
              }]
            })
            setCapTokens(curr => [...curr, ...cap_token_type]);
            console.log("cap_token_type", cap_token_type);
          } else {
            console.error("field not found", union.fields, resp);
          }
        }
      }
    }
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
    const value = await service.requestAdl(endpoint.kind, endpoint.path, reqbody, endpoint.jsonBindingO, jwt);
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

function getEndpoints<API>(resolver: ADL.DeclResolver, texpr: ADL.ATypeExpr<API>): Endpointish[] {
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

  const endpoints: Endpointish[] = [];
  for (const f of struct.fields) {
    if (f.typeExpr.typeRef.kind === 'reference') {
      if (scopedNamesEqual(f.typeExpr.typeRef.value, snCapabilityApi)) {
        endpoints.push(getApiEndpoint(resolver, f, struct))
      }
      if (scopedNamesEqual(f.typeExpr.typeRef.value, snHttpPost)) {
        endpoints.push(getHttpPostEndpoint(resolver, f, struct))
      }
      if (scopedNamesEqual(f.typeExpr.typeRef.value, snHttpGet)) {
        endpoints.push(getHttpGetEndpoint(resolver, f, struct))
      }
    }
  }
  return endpoints;
}

function getHttpEndpoints<API>(resolver: ADL.DeclResolver, texpr: ADL.ATypeExpr<API>): HttpEndpoint[] {
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

  const endpoints: HttpEndpoint[] = [];
  for (const f of struct.fields) {
    if (f.typeExpr.typeRef.kind === 'reference') {
      if (scopedNamesEqual(f.typeExpr.typeRef.value, snHttpPost)) {
        endpoints.push(getHttpPostEndpoint(resolver, f, struct))
      }
      if (scopedNamesEqual(f.typeExpr.typeRef.value, snHttpGet)) {
        endpoints.push(getHttpGetEndpoint(resolver, f, struct))
      }
    }
  }
  return endpoints;
}

function getApiEndpoint<C, S, V>(resolver: ADL.DeclResolver, field: AST.Field, parent: AST.Struct): Apiish<C> {
  if (field.default.kind !== 'just') {
    throw new Error("API endpoint must have a default value");
  }
  const texprC = ADL.makeATypeExpr<C>(field.typeExpr.parameters[0]);
  const texprS = ADL.makeATypeExpr<S>(field.typeExpr.parameters[1]);
  const texprV = ADL.makeATypeExpr<V>(field.typeExpr.parameters[2]);

  const jb = createJsonBinding(resolver, texprCapabilityApi(texprC, texprS, texprV));
  const capApi = jb.fromJson(field.default.value);
  const docString = ADL.getAnnotation(JB_DOC, field.annotations) || "";

  return {
    kind: 'api',
    name: capApi.name === "" ? field.name : capApi.name,
    typetoken: texprC,
    docString,
    endpoints: getHttpEndpoints(resolver, texprV),
    parent,
  }
}

function getHttpPostEndpoint<I, O>(resolver: ADL.DeclResolver, field: AST.Field, parent: AST.Struct): HttpPostEndpoint<I, O> {
  if (field.default.kind !== 'just') {
    throw new Error("API endpoint must have a default value");
  }
  const texprI = ADL.makeATypeExpr<I>(field.typeExpr.parameters[0]);
  const texprO = ADL.makeATypeExpr<O>(field.typeExpr.parameters[1]);

  const jb = createJsonBinding(resolver, texprHttpPost(texprI, texprO));
  const httpPost = jb.fromJson(field.default.value);

  const veditorI = createVEditor(texprI, resolver, UI_FACTORY);
  const veditorO = createVEditor(texprO, resolver, UI_FACTORY);
  const jsonBindingI = createJsonBinding(resolver, texprI);
  const jsonBindingO = createJsonBinding(resolver, texprO);

  const docString = ADL.getAnnotation(JB_DOC, field.annotations) || "";
  return {
    kind: 'post',
    name: field.name,
    path: httpPost.path,
    docString,
    // security: httpPost.security,
    veditorI,
    veditorO,
    jsonBindingI,
    jsonBindingO,
    parent,
  }
}

function getHttpGetEndpoint<O>(resolver: ADL.DeclResolver, field: AST.Field, parent: AST.Struct): HttpGetEndpoint<O> {
  if (field.default.kind !== 'just') {
    throw new Error("API endpoint must have a default value");
  }
  const texprO = ADL.makeATypeExpr<O>(field.typeExpr.parameters[0]);

  const jb = createJsonBinding(resolver, texprHttpGet(texprO));
  const httpGet = jb.fromJson(field.default.value);

  const veditorO = createVEditor(texprO, resolver, UI_FACTORY);
  const jsonBindingO = createJsonBinding(resolver, texprO);

  const docString = ADL.getAnnotation(JB_DOC, field.annotations) || "";
  return {
    kind: 'get',
    name: field.name,
    path: httpGet.path,
    docString,
    // security: httpGet.security,
    veditorO,
    jsonBindingO,
    parent,
  }
}

const JB_DOC = createJsonBinding(RESOLVER, texprDoc());
const UI_FACTORY = createUiFactory();
