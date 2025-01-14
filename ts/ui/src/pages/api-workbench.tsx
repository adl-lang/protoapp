import { AdlForm, useAdlFormState } from "@/components/forms/mui/form";
import { Modal } from "@/components/forms/mui/modal";
import { Json } from "@adllang/adl-runtime";
import DeleteIcon from "@mui/icons-material/Delete";
import RefreshIcon from "@mui/icons-material/Refresh";
import { Box, Button, Card, CircularProgress, Container, Divider, IconButton, Typography } from "@mui/material";
import { JSX, useMemo, useRef, useState } from "react";
import JsonView from 'react18-json-view';
import 'react18-json-view/src/style.css';
import { CompletedRequest, Endpoint, ExecutingRequest, HttpGetEndpoint, HttpPostEndpoint } from "./types";

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

interface ApiWorkbenchPresentProps {
  endpoints: Endpoint[],
  executeRequest: (endpoint: Endpoint, startedAt: Date, req?: unknown, reqbody?: Json) => Promise<CompletedRequest>
  updateAppState: (endpoint: Endpoint, resp: unknown) => void
}
export function ApiWorkbenchPresent(props: ApiWorkbenchPresentProps) {
  const [currentRequest, setCurrentRequest] = useState<ExecutingRequest>();
  const [prevRequests, setPrevRequests] = useState<CompletedRequest[]>([]);
  const [modal, setModal] = useState<ModalState | undefined>();
  const newRequestButtonRef = useRef<HTMLDivElement | null>(null);

  async function execute(endpoint: Endpoint, req?: unknown) {
    setModal(undefined);
    const startedAt = new Date();
    setCurrentRequest({ startedAt, endpoint, req });
    let reqbody: Json | undefined = undefined;
    if (endpoint.kind === 'post') {
      reqbody = endpoint.jsonBindingI.toJson(req);
    }
    const completed = await props.executeRequest(endpoint, startedAt, req, reqbody);
    if( completed.resp.success) {
      props.updateAppState(endpoint, completed.resp.value);
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

  async function reexecuteCompleted(completed: CompletedRequest) {
    setModal({state:'create-request', endpoint:completed.endpoint, initial: completed.req});
  }

  function renderModal(): JSX.Element | undefined {
    if (modal) {
      switch (modal.state) {
        case 'choose-endpoint': return (
          <ModalChooseEndpoint
            cancel={() => setModal(undefined)}
            choose={endpoint => setModal({ state: 'create-request', endpoint, initial: undefined })}
            endpoints={props.endpoints}
          />
        );
        case 'create-request': {
          switch (modal.endpoint.kind) {
            case 'get': return (
              <ModalCreateGetRequest
                cancel={() => setModal(undefined)}
                endpoint={modal.endpoint}
                execute={execute}
              />
            );
            case 'post': return (
              <ModalCreatePostRequest
                cancel={() => setModal(undefined)}
                endpoint={modal.endpoint}
                execute={execute}
                initial={modal.initial}
              />
            );
          }
        }
      }
    }
  }

  return (
    <Container fixed>
      <Box>
        <Typography variant="h4" component="h1" sx={{ mb: 2, marginTop: "20px" }}>
          API Workbench
        </Typography>
        {prevRequests.map((value, i) => {
          return <CompletedRequestView
            key={i}
            value={value}
            jsonI={value.endpoint.kind === "post" ? value.endpoint.jsonBindingI.toJson(value.req) : undefined}
            reexecute={reexecuteCompleted}
            remove={() => removeCompleted(i)}
          />
        })}
        {currentRequest && <ExecutingRequestView value={currentRequest} />}
        <Box ref={newRequestButtonRef} sx={{ marginBottom: "20px", display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Button disabled={!!currentRequest} onClick={() => setModal({ 'state': 'choose-endpoint', endpoints: props.endpoints })}>
            NEW REQUEST
          </Button>
          {/* {jwt_decoded && <Box sx={{ fontSize: "0.9rem" }}>sub: {jwt_decoded.sub} / role: {jwt_decoded.role}</Box>} */}
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
        {props.endpoints.map((e,i) =>
          <Box key={i} sx={{ marginTop: "20px", marginBottom: "20px" }}>
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

function ModalCreatePostRequest<I, O>(props: {
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

function ModalCreateGetRequest<O>(props: {
  endpoint: HttpGetEndpoint<O>,
  cancel: () => void,
  execute: (endpoint: HttpGetEndpoint<O>) => void,
}) {
  return (
    <Modal onClickBackground={() => props.cancel()}>
      <div>
        <div>{props.endpoint.name}:</div>
        <Divider sx={{ marginTop: "10px", marginBottom: "10px" }} />
        <Button
          onClick={() => {
            props.execute(props.endpoint);
          }}
        >
          EXECUTE
        </Button>
      </div>
    </Modal>
  );
}

function ExecutingRequestView<I, O>(props: {
  value: ExecutingRequest,
  jsonI?: Json,
}) {
  const { endpoint } = props.value;

  return (
    <Card sx={{ margin: "10px" }}>
      <Box sx={{ margin: "10px" }}>
        <b>{endpoint.name}</b>
      </Box>
      {props.jsonI ?
        <>
          <Divider />
          <Box sx={{ margin: "10px" }}>
            <MyJsonView data={props.jsonI} />
          </Box>
        </>
        : null}
      <Divider />
      <CircularProgress sx={{ margin: "10px" }} size="20px" />
    </Card>
  );
}


function CompletedRequestView(props: {
  value: CompletedRequest;
  jsonI?: Json,
  reexecute(cr: CompletedRequest): void;
  remove(): void;
}) {
  const { endpoint, resp } = props.value;
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
      <Box sx={{ margin: "10px", display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <b>{endpoint.name}</b>
        <Box>
          <IconButton size="small" onClick={() => props.reexecute(props.value)} ><RefreshIcon fontSize="small" /></IconButton>
          <IconButton size="small" onClick={() => props.remove()}><DeleteIcon fontSize="small" /></IconButton>
        </Box>
      </Box>
      {props.jsonI ? <>
        <Divider />
        <Box sx={{ margin: "10px" }}>
          <MyJsonView data={props.jsonI} />
        </Box>
      </> : null}
      <Divider />
      <Box sx={{ margin: "10px" }}>
        {resp.success
          ? <MyJsonView data={jsonO} />
          : (
            <Box sx={{ color: "red" }}>
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
