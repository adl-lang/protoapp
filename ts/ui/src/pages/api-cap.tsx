import * as capability from "@/adl-gen/common/capability";
import * as CAP from "@/adl-gen/protoapp/apis/captest";

import { LoginResp, RefreshResp } from "@/adl-gen/protoapp/apis/types";
import { RESOLVER } from "@/adl-gen/resolver";
import { useAppState } from "@/hooks/use-app-state";
import { AdlRequestError, ServiceBase } from "@/service/service-base";
import { Json, scopedNamesEqual } from "@adllang/adl-runtime";
import { Box, Container } from "@mui/material";
import { useMemo, useState } from "react";
import { getEndpoints } from "./api-cap-get-eps";
import { CapToken, CompletedRequest, CompletedResponse, HttpEndpoint } from "./api-types";
import { ApiWorkbenchPresent } from "./api-workbench";
import { assertNever } from "@/utils/assertNever";
import * as apiTypes from "./api-types";

export function CapWorkbench() {
  const appState = useAppState();
  const { authState, api } = appState;
  const jwt_decoded = authState.kind === 'auth' ? authState.auth.jwt_decoded : undefined;

  const [capTokens, setCapTokens] = useState<CapToken<unknown>[]>([]);
  // const [prevRequests, setPrevRequests] = useState<apiTypes.CompletedRequest[]>([]);

  const endpoints = useMemo(() => {
    const endpoints = getEndpoints(RESOLVER, CAP.texprApiRequests(), capTokens);

    // setPrevRequests(pr => [...pr, completed]);


    return endpoints
  }, [capTokens]);

  function updateAppState<I, O>(endpoint: HttpEndpoint, resp: O) {
    // console.log("updateAppState", endpoint, resp);
    if (endpoint.jsonBindingO.typeExpr.typeRef.kind === 'reference') {
      const sd_resp = RESOLVER(endpoint.jsonBindingO.typeExpr.typeRef.value);
      switch (sd_resp.decl.type_.kind) {
        case "struct_":
          /// TODO complete
          console.error("not implmented")
          break
        case "type_":
          /// TODO complete
          console.error("not implmented")
          break
        case "newtype_":
          /// TODO complete
          console.error("not implmented")
          break
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
              if (!scopedNamesEqual(sd.decl.type_.value.typeExpr.typeRef.value, capability.snCapabilityToken)) {
                return []
              }
              // TODO check that the token is of the correct type (ie no coding error),
              // i.e. sd.decl.type_.value.typeExpr.parameters[0] and endpoint.jsonBindingO.typeExpr (ie value used by resp.value) are of the same underlining type.
              return [{
                type: sd.decl.type_.value.typeExpr.parameters[0],
                token_value: (resp as any)["value"],
                apis_called: endpoint.apis_called ? endpoint.apis_called : [],
                // parents: endpoint.parents,
              }]
            })
            setCapTokens(curr => [...curr, ...cap_token_type]);
            console.log("cap_token_type", cap_token_type);
          } else {
            console.error("field not found", union.fields, resp);
          }
          break
        }
        default:
          assertNever(sd_resp.decl.type_)
      }
    }
    // All the endpoint handling is generic except for here, where we update the auth state when the
    // login or logout endpoints are called.
    console.log("endpoint.name", endpoint.name)
    switch (endpoint.name) {
      case 'refresh': appState.setAuthStateFromRefreshResp(resp as RefreshResp); break;
      case 'login': appState.setAuthStateFromLogin(resp as LoginResp); break;
      case 'logout': appState.logout(); break;
    }
  }

  return (
    <Container fixed>
      <Box>
        <ApiWorkbenchPresent
          // choose={(endpoint) => {
          // }} 
          endpoints={endpoints}
          executeRequest={(endpoint, startedAt, req, reqbody) => {
            let body: unknown = reqbody;
            let cap_token: unknown = undefined;
            let jwt = authState.kind == 'auth' ? authState.auth.jwt : undefined;
            const headers: Record<string, string> = {};
            if (endpoint.token !== undefined && reqbody !== undefined) {
              if (endpoint.method === "get") {
                body = undefined;
              } else {
                body = (reqbody as unknown as capability.CapCall<unknown, unknown>).payload;
              }
              cap_token = (reqbody as unknown as capability.CapCall<unknown, unknown>).token;
              switch (endpoint.token.delivery_method.kind) {
                case "none":
                  break;
                case "header":
                  /// TODO use type info about cap_token to 'correctly;' turn cap_token into a string
                  headers[endpoint.token.delivery_method.value] = cap_token as string;
                  break;
                case "auth_bearer":
                  jwt = cap_token as string;
              }
              console.log("cap_token", cap_token);
            }
            return executeRequest(api, jwt, endpoint, startedAt, headers, req, body);
          } }
          updateAppState={updateAppState} prevRequests={[]} removeCompleted={function (ci: number): Promise<void> {
            throw new Error("Function not implemented.");
          } }        />
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
  headers: { [key: string]: string },
  req?: I,
  reqbody?: unknown,
): Promise<CompletedRequest> {

  let resp: CompletedResponse;
  try {
    const value = await service.requestAdl(
      endpoint.method,
      endpoint.path,
      reqbody,
      endpoint.jsonBindingO,
      jwt,
      headers,
    );
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

  // const followup: HttpEndpoint[] = []
  // if ( endpoint.apis_called !== undefined ) {
  //   const capTokens: CapToken<unknown>[] = [{
  //     apis_called: endpoint.apis_called,
  //     token_value: endpoint.token,
  //     type: endpoint.jsonBindingI.typeExpr,
  //   }]
  //   console.log("***", capTokens)
  //   const x = getEndpoints(RESOLVER, CAP.texprApiRequests(), capTokens);
  //   const z = x.filter(y => y.kind === "callable")
  //   followup.push(...z)
  // }

  return {
    startedAt,
    durationMs: new Date().getTime() - startedAt.getTime(),
    endpoint,
    req,
    resp,
  }
}
