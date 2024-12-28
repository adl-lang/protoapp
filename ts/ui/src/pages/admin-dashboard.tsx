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
import { useApiWithToken } from "@/hooks/use-app-state";
import { AdlRequestError, ServiceBase } from "@/service/service-base";
import * as ADL from "@adllang/adl-runtime";
import { Json, JsonBinding, createJsonBinding, scopedNamesEqual } from "@adllang/adl-runtime";
import { Box, Button, Card, CircularProgress, Container, Divider, Typography } from "@mui/material";
import { JSX, useMemo, useRef, useState } from "react";
import JsonView from 'react18-json-view';
import 'react18-json-view/src/style.css';

type ModalState = ChooseEndpoint | CreateRequest;

interface ChooseEndpoint {
  state: 'choose-endpoint';
  endpoints: Endpoint[],
}

interface CreateRequest {
  state: 'create-request';
  endpoint: Endpoint,
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

export function AdminDashboard() {
  const { api, jwt } = useApiWithToken();
  const endpoints = getEndpoints(RESOLVER, API.texprApiRequests());

  const [currentRequest, setCurrentRequest] = useState<ExecutingRequest<unknown, unknown>>();
  const [prevRequests, setPrevRequests] = useState<CompletedRequest<unknown, unknown>[]>([]);
  const [modal, setModal] = useState<ModalState | undefined>();
  const newRequestButtonRef = useRef<HTMLDivElement | null>(null);

  async function execute<I, O>(endpoint: HttpPostEndpoint<I, O>, req: I) {
    setModal(undefined);
    const startedAt = new Date();
    setCurrentRequest({ startedAt, endpoint, req });
    const completed = await executeRequest(api, jwt, endpoint, req, startedAt);
    setPrevRequests(pr => [...pr, completed]);
    setCurrentRequest(undefined);
    setTimeout(
      () => newRequestButtonRef?.current?.scrollIntoView({ behavior: "smooth" }),
      100
    );
  }

  function renderModal(): JSX.Element | undefined {
    if (modal) {
      switch (modal.state) {
        case 'choose-endpoint': return (
          <ModalChooseEndpoint
            cancel={() => setModal(undefined)}
            choose={endpoint => setModal({ state: 'create-request', endpoint })}
            endpoints={endpoints}
          />
        );
        case 'create-request': return (
          <ModalCreateRequest
            cancel={() => setModal(undefined)}
            endpoint={modal.endpoint}
            execute={execute}
          />
        );
      }
    }
  }

  return (
    <Container fixed>
      <Box>
        <Typography variant="h4" component="h1" sx={{ mb: 2 }}>
          Admin Dashboard
        </Typography>
        {prevRequests.map((value, i) => <CompletedRequest key={i} value={value} />)}
        {currentRequest && <ExecutingRequest value={currentRequest} />}
        <div ref={newRequestButtonRef}>
          <Button sx={{ marginBottom: "20px" }} disabled={!!currentRequest} onClick={() => setModal({ 'state': 'choose-endpoint', endpoints })}>
            NEW REQUEST
          </Button>
        </div>
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
  execute: (endpoint: HttpPostEndpoint<I, O>, req: I) => void
}) {
  const state = useAdlFormState({
    veditor: props.endpoint.veditorI,
    jsonBinding: props.endpoint.jsonBindingI,
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
    <Card sx={{ marginTop: "10px", marginBottom: "10px" }}>
      <Box sx={{ margin: "10px" }}>
        <b>{endpoint.name}</b>
      </Box>
      <Divider />
      <Box sx={{ marginTop: "10px", marginBottom: "10px" }}>
        <MyJsonView data={jsonI} />
      </Box>
      <Divider />
      <CircularProgress sx={{ margin: "10px" }} size="20px" />
    </Card>
  );
}


function CompletedRequest<I, O>(props: {
  value: CompletedRequest<I, O>,
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
      <Box sx={{ margin: "10px" }}>
        <b>{endpoint.name}</b>
      </Box>
      <Divider />
      <Box sx={{ marginTop: "10px", marginBottom: "10px" }}>
        <MyJsonView data={jsonI} />
      </Box>
      <Divider />
      <Box sx={{ marginTop: "10px", marginBottom: "10px" }}>
        {resp.success
          ? <MyJsonView data={jsonO} />
          : (<>
            <div>Http Status: {resp.httpStatus}</div>
            <div>Body: {resp.responseBody}</div>
          </>
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

async function executeRequest<I, O>(service: ServiceBase, jwt: string, endpoint: HttpPostEndpoint<I, O>, req: I, startedAt: Date): Promise<CompletedRequest<I, O>> {

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
