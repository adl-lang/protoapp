import { HttpSecurity, snHttpPost, texprHttpPost } from "@/adl-gen/common/http";
import * as API from "@/adl-gen/protoapp/apis/ui";
import { RESOLVER } from "@/adl-gen/resolver";
import * as AST from "@/adl-gen/sys/adlast";
import { texprDoc } from "@/adl-gen/sys/annotations";
import { createVEditor } from "@/components/forms/model/veditor/adlfactory";
import { AdlForm, useAdlFormState } from "@/components/forms/mui/form";
import { Modal } from "@/components/forms/mui/modal";
import { VEditor } from "@/components/forms/mui/veditor";
import { createUiFactory } from "@/components/forms/factory";
import { AppState, AuthState, useApiWithToken, useAppState } from "@/hooks/use-app-state";
import { AdlRequestError, ServiceBase } from "@/service/service-base";
import * as ADL from "@adllang/adl-runtime";
import { Json, JsonBinding, createJsonBinding, scopedNamesEqual } from "@adllang/adl-runtime";
import { Box, Button, Card, CircularProgress, Container, Divider, IconButton, Typography } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import RefreshIcon from "@mui/icons-material/Refresh";
import { JSX, useMemo, useRef, useState } from "react";
import JsonView from 'react18-json-view';
import 'react18-json-view/src/style.css';

type ModalState = ChooseEndpoint | CreateRequest<unknown>;

interface ChooseEndpoint {
  state: 'choose-endpoint';
  endpoints: Endpoint[],
}

interface CreateRequest<I> {
  state: 'create-request';
  endpoint: Endpoint,
  initial: I | undefined,
}

interface ExecutingRequest<I, O> {
  startedAt: Date,
  endpoint: HttpPostEndpoint<I, O>,
  req: I,
}

interface CompletedRequest<I, O> {
  startedAt: Date,
  durationMs: number,
  endpoint: HttpPostEndpoint<I, O>,
  req: I,
  resp: CompletedResponse<O>,
}

type CompletedResponse<O>
  = { success: true, value: O }
  | { success: false, httpStatus: number, responseBody: string }
  ;

export function ApiWorkbench() {
  const appState = useAppState();
  const {authState, api} = appState;
  const jwt_decoded = authState.kind === 'auth' ? authState.auth.jwt_decoded : undefined;

  const endpoints = useMemo( () => {
    const allEndpoints = getEndpoints(RESOLVER, API.texprApiRequests());

    // only show endpoints accessible for the current authstate
    return allEndpoints.filter( ep =>
       ep.security.kind === 'public' ||
       ep.security.kind === 'token' && authState.kind == 'auth' ||
       ep.security.kind === 'tokenWithRole' && jwt_decoded && ep.security.value === jwt_decoded.role
   );
  }, [authState] );
    
  const [currentRequest, setCurrentRequest] = useState<ExecutingRequest<unknown, unknown>>();
  const [prevRequests, setPrevRequests] = useState<CompletedRequest<unknown, unknown>[]>([]);
  const [modal, setModal] = useState<ModalState | undefined>();
  const newRequestButtonRef = useRef<HTMLDivElement | null>(null);

  async function execute<I, O>(endpoint: HttpPostEndpoint<I, O>, req: I) {
    setModal(undefined);
    const startedAt = new Date();
    setCurrentRequest({ startedAt, endpoint, req });
    const jwt = authState.kind == 'auth' ? authState.auth.jwt : undefined;
    const completed = await executeRequest(api, jwt, endpoint, req, startedAt);
    if( completed.resp.success) {
      updateAppState(appState, endpoint, req, completed.resp.value);
    }
    setPrevRequests(pr => [...pr, completed]);
    setCurrentRequest(undefined);
    setTimeout(
      () => newRequestButtonRef?.current?.scrollIntoView({ behavior: "smooth" }),
      100
    );
  }

  async function removeCompleted(ci: number) {
    setPrevRequests(pr => {
      return pr.filter((_e, i) => i != ci);
    });
  }

  async function reexecuteCompleted<I, O>(completed: CompletedRequest<I, O>) {
    setModal({state:'create-request', endpoint:completed.endpoint, initial: completed.req});
  }

  function renderModal(): JSX.Element | undefined {
    if (modal) {
      switch (modal.state) {
        case 'choose-endpoint': return (
          <ModalChooseEndpoint
            cancel={() => setModal(undefined)}
            choose={endpoint => setModal({ state: 'create-request', endpoint, initial: undefined })}
            endpoints={endpoints}
          />
        );
        case 'create-request': return (
          <ModalCreateRequest
            cancel={() => setModal(undefined)}
            endpoint={modal.endpoint}
            execute={execute}
            initial={modal.initial}
          />
        );
      }
    }
  }

  return (
    <Container fixed>
      <Box>
        <Typography variant="h4" component="h1" sx={{ mb: 2, marginTop: "20px" }}>
          API Workbench
        </Typography>
        {prevRequests.map((value, i) => <CompletedRequest key={i} value={value} reexecute={reexecuteCompleted} remove={() => removeCompleted(i)}/>)}
        {currentRequest && <ExecutingRequest value={currentRequest} />}
        <Box ref={newRequestButtonRef} sx={{marginBottom: "20px", display:"flex",flexDirection:"row", justifyContent:"space-between", alignItems:"center"}}>
          <Button disabled={!!currentRequest} onClick={() => setModal({ 'state': 'choose-endpoint', endpoints })}>
            NEW REQUEST
          </Button>
          {jwt_decoded && <Box sx={{fontSize:"0.9rem"}}>sub: {jwt_decoded.sub} / role: {jwt_decoded.role}</Box>}
        </Box>
      </Box>
      {renderModal()}
    </Container>
  );
}

function ModalChooseEndpoint(props: {
  endpoints: Endpoint[],
  choose: (e: Endpoint) => void,
  cancel: () => void
}) {
  return (
    <Modal onClickBackground={() => props.cancel()}>
      <div>
        <div>Select an endpoint:</div>
        <Divider sx={{ marginTop: "10px", marginBottom: "10px" }} />
        {props.endpoints.map(e =>
          <Box sx={{ marginTop: "20px", marginBottom: "20px" }}>
            <Button onClick={() => props.choose(e)}>
              {e.name}
            </Button>
            <Typography>{e.docString}</Typography>
          </Box>
        )}
      </div>
    </Modal>
  );
}

function ModalCreateRequest<I, O>(props: {
  endpoint: HttpPostEndpoint<I, O>,
  cancel: () => void,
  execute: (endpoint: HttpPostEndpoint<I, O>, req: I) => void,
  initial: I | undefined,
}) {
  const state = useAdlFormState({
    veditor: props.endpoint.veditorI,
    jsonBinding: props.endpoint.jsonBindingI,
    value0: props.initial,
  });

  const value = state.veditor.valueFromState(state.veditorState);

  return (
    <Modal onClickBackground={() => props.cancel()}>
      <div>
        <div>Parameters for {props.endpoint.name}:</div>
        <Divider sx={{ marginTop: "10px", marginBottom: "10px" }} />
        <AdlForm
          state={state}
        />
        <Button
          onClick={() => {
            if (value.isValid) {
              props.execute(props.endpoint, value.value);
            }
          }}
          disabled={!value.isValid}
        >
          EXECUTE
        </Button>
      </div>
    </Modal>
  );
}

function ExecutingRequest<I, O>(props: {
  value: ExecutingRequest<I, O>,
}) {
  const { endpoint, req } = props.value;

  const jsonI = useMemo(
    () => endpoint.jsonBindingI.toJson(req),
    [endpoint, req]
  );
  return (
    <Card sx={{ margin: "10px"}}>
      <Box sx={{ margin: "10px" }}>
        <b>{endpoint.name}</b>
      </Box>
      <Divider />
      <Box sx={{ margin: "10px"}}>
        <MyJsonView data={jsonI} />
      </Box>
      <Divider />
      <CircularProgress sx={{ margin: "10px" }} size="20px" />
    </Card>
  );
}


function CompletedRequest<I, O>(props: {
  value: CompletedRequest<I, O>;
  reexecute(cr : CompletedRequest<I,O>): void;
  remove(): void;
}) {
  const { endpoint, req, resp } = props.value;
  const jsonI = useMemo(
    () => endpoint.jsonBindingI.toJson(req),
    [endpoint, req]
  );
  const jsonO = useMemo(
    () => {
      if (!resp.success) {
        return null;
      }
      return endpoint.jsonBindingO.toJson(resp.value);
    },
    [endpoint, resp]
  );
  return (
    <Card sx={{ marginTop: "10px", marginBottom: "10px" }}>
      <Box sx={{ margin: "10px", display: "flex", flexDirection:"row", justifyContent: "space-between", alignItems: "center" }}>
        <b>{endpoint.name}</b>
        <Box>
          <IconButton size="small" onClick={() => props.reexecute(props.value)} ><RefreshIcon fontSize="small"/></IconButton>
          <IconButton size="small" onClick={() => props.remove()}><DeleteIcon fontSize="small"/></IconButton>
        </Box>
      </Box>
      <Divider />
      <Box sx={{ margin: "10px" }}>
        <MyJsonView data={jsonI} />
      </Box>
      <Divider />
      <Box sx={{ margin: "10px"}}>
        {resp.success
          ? <MyJsonView data={jsonO} />
          : (
            <Box sx={{color:"red"}}>
              <Box>Http Status: {resp.httpStatus}</Box>
              {resp.responseBody && <Box>Body: {resp.responseBody}</Box>}
            </Box>
          )
        }
      </Box>
    </Card>
  );
}

function MyJsonView(props: {
  data: Json
}) {
  return (
    <Box sx={{fontSize:"0.8rem"}} >
     { props.data === null
       ? <div>null</div>
       : <JsonView src={props.data}/>
     }
    </Box>
  );
}

async function executeRequest<I, O>(service: ServiceBase, jwt: string | undefined, endpoint: HttpPostEndpoint<I, O>, req: I, startedAt: Date): Promise<CompletedRequest<I, O>> {

  let resp: CompletedResponse<O>;
  try {
    const reqbody = endpoint.jsonBindingI.toJson(req);
    const value = await service.requestAdl("post", endpoint.path, reqbody, endpoint.jsonBindingO, jwt);
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

function updateAppState<I, O>(appState: AppState, endpoint: HttpPostEndpoint<I, O>, req: I, resp: O) {
  // All the endpoint handling is generic except for here, where we update the auth state when the
  // login or logout endpoints are called.
  switch (endpoint.name) {
    case 'login': appState.setAuthStateFromLogin(resp as API.LoginResp); break;
    case 'logout': appState.logout(); break;
  }
}

type Endpoint = HttpPostEndpoint<unknown, unknown>;

interface HttpPostEndpoint<I, O> {
  name: string;
  path: string;
  security: HttpSecurity,
  docString: string,
  veditorI: VEditor<I>;
  veditorO: VEditor<O>;
  jsonBindingI: JsonBinding<I>;
  jsonBindingO: JsonBinding<O>;
}

function getEndpoints<API>(resolver: ADL.DeclResolver, texpr: ADL.ATypeExpr<API>): Endpoint[] {
  if (texpr.value.typeRef.kind !== 'reference' || texpr.value.parameters.length != 0) {
    throw new Error("API must be a monomorphic declaration");
  }
  const decl = resolver(texpr.value.typeRef.value);
  if (decl.decl.type_.kind !== 'struct_') {
    throw new Error("API must be a struct");
  }
  const struct = decl.decl.type_.value;

  const endpoints: Endpoint[] = [];
  for (const f of struct.fields) {
    if (f.typeExpr.typeRef.kind === 'reference' && scopedNamesEqual(f.typeExpr.typeRef.value, snHttpPost)) {
      endpoints.push(getHttpPostEndpoint(resolver, f))
    }
  }
  return endpoints;
}

function getHttpPostEndpoint<I, O>(resolver: ADL.DeclResolver, field: AST.Field): HttpPostEndpoint<I, O> {
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

const JB_DOC = createJsonBinding(RESOLVER, texprDoc());
const UI_FACTORY = createUiFactory();