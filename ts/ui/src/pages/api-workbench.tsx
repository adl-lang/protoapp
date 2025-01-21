import { AdlForm, useAdlFormState } from "@/components/forms/mui/form";
import { Modal } from "@/components/forms/mui/modal";
import { Json } from "@adllang/adl-runtime";
import DeleteIcon from "@mui/icons-material/Delete";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import HelpIcon from '@mui/icons-material/Help';
import RefreshIcon from "@mui/icons-material/Refresh";
import * as material from "@mui/material";
import { JSX, useMemo, useRef, useState } from "react";
import JsonView from 'react18-json-view';
import 'react18-json-view/src/style.css';
import * as apiTypes from "./api-types";

type ModalState = ChooseEndpoint | CreateRequest<unknown>;

interface ChooseEndpoint {
  state: 'choose-endpoint';
  endpoints: apiTypes.Endpoint[],
}

interface CreateRequest<I> {
  state: 'create-request';
  endpoint: apiTypes.Endpoint,
  initial: I | undefined,
}

interface ApiWorkbenchPresentProps {
  endpoints: apiTypes.Endpoint[],
  executeRequest: (endpoint: apiTypes.HttpEndpoint, startedAt: Date, req?: unknown, reqbody?: Json) => Promise<apiTypes.CompletedRequest>
  updateAppState: (endpoint: apiTypes.HttpEndpoint, resp: unknown) => void
}
export function ApiWorkbenchPresent(props: ApiWorkbenchPresentProps) {
  const [currentRequest, setCurrentRequest] = useState<apiTypes.ExecutingRequest>();
  const [prevRequests, setPrevRequests] = useState<apiTypes.CompletedRequest[]>([]);
  const [modal, setModal] = useState<ModalState | undefined>();
  const newRequestButtonRef = useRef<HTMLDivElement | null>(null);

  async function execute(endpoint: apiTypes.HttpEndpoint, req?: unknown) {
    setModal(undefined);
    const startedAt = new Date();
    setCurrentRequest({ startedAt, endpoint, req });
    let reqbody: Json | undefined = undefined;
    if (endpoint.method === 'post' || endpoint.token !== undefined) {
      reqbody = endpoint.jsonBindingI.toJson(req);
    }
    const completed = await props.executeRequest(endpoint, startedAt, req, reqbody);
    if (completed.resp.success) {
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

  async function reexecuteCompleted(completed: apiTypes.CompletedRequest) {
    setModal({ state: 'create-request', endpoint: completed.endpoint, initial: completed.req });
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
          if (modal.endpoint.kind === "callable") {
            if (modal.endpoint.token !== undefined) {
              return (
                <ModalCreatePostRequest
                  cancel={() => setModal(undefined)}
                  endpoint={modal.endpoint}
                  execute={execute}
                  initial={modal.initial}
                />
              )
            }
            switch (modal.endpoint.method) {
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
  }

  return (
    <material.Container fixed>
      <material.Box>
        <material.Typography variant="h4" component="h1" sx={{ mb: 2, marginTop: "20px" }}>
          API Workbench
        </material.Typography>
        {prevRequests.map((value, i) => {
          return <CompletedRequestView
            key={i}
            value={value}
            jsonI={value.endpoint.method === "post" ? value.endpoint.jsonBindingI.toJson(value.req) : undefined}
            reexecute={reexecuteCompleted}
            remove={() => removeCompleted(i)}
          />
        })}
        {currentRequest && <ExecutingRequestView value={currentRequest} />}
        <material.Box ref={newRequestButtonRef} sx={{ marginBottom: "20px", display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <material.Button disabled={!!currentRequest} onClick={() => setModal({ 'state': 'choose-endpoint', endpoints: props.endpoints })}>
            NEW REQUEST
          </material.Button>
          {/* {jwt_decoded && <Box sx={{ fontSize: "0.9rem" }}>sub: {jwt_decoded.sub} / role: {jwt_decoded.role}</Box>} */}
        </material.Box>
      </material.Box>
      {renderModal()}
    </material.Container>
  );
}

function ModalChooseEndpoint(props: {
  endpoints: apiTypes.Endpoint[],
  choose: (e: apiTypes.Endpoint) => void,
  cancel: () => void
}) {
  return (
    <Modal onClickBackground={() => props.cancel()}>
      <div>
        <div>Select an endpoint:</div>
        <material.Divider sx={{ marginTop: "10px", marginBottom: "10px" }} />
        {props.endpoints.map((e, i) => {
          switch (e.kind) {
            case 'api': return <ApiView key={i} endpoint={e} choose={props.choose} />;
            default: return <HttpEndpointView key={i} endpoint={e} choose={props.choose} />;
          }
        })}
      </div>
    </Modal>
  );
}

function ApiView(props: {
  endpoint: apiTypes.Api<unknown>;
  choose: (e: apiTypes.Endpoint) => void,
  // cancel: () => void
}) {
  return <material.Box sx={{ marginLeft: "5px", marginTop: "5px", marginBottom: "5px" }}>
    <material.Accordion defaultExpanded>
      <material.AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="panel2-content"
        id="panel2-header"
      >
        <material.Box>
          <material.Typography component="span">{props.endpoint.name}</material.Typography>
          <material.Tooltip title={`${props.endpoint.token_value}`}>
            <material.IconButton>
              <HelpIcon />
            </material.IconButton>
          </material.Tooltip>
        </material.Box>
      </material.AccordionSummary>
      <material.AccordionDetails sx={{ marginLeft: "5px", marginTop: "0px", marginBottom: "0px" }}>
        <material.Typography>{props.endpoint.docString}</material.Typography>
      </material.AccordionDetails>
      {/* todo change this to an accordion */}
      {/* <Typography>{props.endpoint.docString}</Typography> */}
      <material.Divider />
      {props.endpoint.endpoints.map((e, i) => {
        switch (e.kind) {
          case 'api': return <ApiView key={i} endpoint={e} choose={props.choose} />;
          default: return <HttpEndpointView key={i} endpoint={e} choose={props.choose} />;
        }
      })}
    </material.Accordion>
    <material.Divider />
  </material.Box>;
}

function HttpEndpointView(props: {
  endpoint: apiTypes.HttpEndpoint;
  choose: (e: apiTypes.Endpoint) => void,
}) {
  return <material.Box sx={{ marginTop: "5px", marginBottom: "5px" }}>
    <material.Button onClick={() => props.choose(props.endpoint)}>
      {props.endpoint.name}
    </material.Button>
    <material.Typography>{props.endpoint.docString}</material.Typography>
  </material.Box>;
}

function ModalCreatePostRequest<I, O>(props: {
  endpoint: apiTypes.HttpXEndpoint<I, O>,
  cancel: () => void,
  execute: (endpoint: apiTypes.HttpXEndpoint<I, O>, req: I) => void,
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
        <material.Divider sx={{ marginTop: "10px", marginBottom: "10px" }} />
        <AdlForm
          state={state}
        />
        <material.Button
          onClick={() => {
            if (value.isValid) {
              props.execute(props.endpoint, value.value);
            }
          }}
          disabled={!value.isValid}
        >
          EXECUTE
        </material.Button>
      </div>
    </Modal>
  );
}

function ModalCreateGetRequest<I, O>(props: {
  endpoint: apiTypes.HttpXEndpoint<I, O>,
  cancel: () => void,
  execute: (endpoint: apiTypes.HttpXEndpoint<I, O>) => void,
}) {
  return (
    <Modal onClickBackground={() => props.cancel()}>
      <div>
        <div>{props.endpoint.name}:</div>
        <material.Divider sx={{ marginTop: "10px", marginBottom: "10px" }} />
        <material.Button
          onClick={() => {
            props.execute(props.endpoint);
          }}
        >
          EXECUTE
        </material.Button>
      </div>
    </Modal>
  );
}

function ExecutingRequestView<I, O>(props: {
  value: apiTypes.ExecutingRequest,
  jsonI?: Json,
}) {
  const { endpoint } = props.value;

  return (
    <material.Card sx={{ margin: "10px" }}>
      <material.Box sx={{ margin: "10px" }}>
        <b>{endpoint.name}</b>
      </material.Box>
      {props.jsonI ?
        <>
          <material.Divider />
          <material.Box sx={{ margin: "10px" }}>
            <MyJsonView data={props.jsonI} />
          </material.Box>
        </>
        : null}
      <material.Divider />
      <material.CircularProgress sx={{ margin: "10px" }} size="20px" />
    </material.Card>
  );
}


function CompletedRequestView(props: {
  value: apiTypes.CompletedRequest;
  jsonI?: Json,
  reexecute(cr: apiTypes.CompletedRequest): void;
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
    <material.Card sx={{ marginTop: "10px", marginBottom: "10px" }}>
      <material.Box sx={{ margin: "10px", display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <b>{endpoint.name}</b>
        <material.Box>
          <material.IconButton size="small" onClick={() => props.reexecute(props.value)} ><RefreshIcon fontSize="small" /></material.IconButton>
          <material.IconButton size="small" onClick={() => props.remove()}><DeleteIcon fontSize="small" /></material.IconButton>
        </material.Box>
      </material.Box>
      {props.jsonI ? <>
        <material.Divider />
        <material.Box sx={{ margin: "10px" }}>
          <MyJsonView data={props.jsonI} />
        </material.Box>
      </> : null}
      <material.Divider />
      <material.Box sx={{ margin: "10px" }}>
        {resp.success
          ? <MyJsonView data={jsonO} />
          : (
            <material.Box sx={{ color: "red" }}>
              <material.Box>Http Status: {resp.httpStatus}</material.Box>
              {resp.responseBody && <material.Box>Body: {resp.responseBody}</material.Box>}
            </material.Box>
          )
        }
      </material.Box>
    </material.Card>
  );
}

function MyJsonView(props: {
  data: Json
}) {
  return (
    <material.Box sx={{ fontSize: "0.8rem" }} >
      {props.data === null
        ? <div>null</div>
        : <JsonView src={props.data} />
      }
    </material.Box>
  );
}
