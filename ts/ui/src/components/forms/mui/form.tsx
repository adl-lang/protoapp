import  { useState } from "react";
import { getAnnotation, isJsonParseException, JsonBinding } from '@adllang/adl-runtime';
import { Toggle } from "./toggle";
import { VEditor } from "./veditor";
import { Button, styled, TextField } from "@mui/material";
import { getAnnotations, getFormLabelFromAnnotation, hasDisabledAnnotation } from "../model/adl-annotations";

// A form for entry of an arbirary ADL value . It is provided with an initial value and its
// ADL type. The onApply() callback is made when the user presses the apply button on validated
// input.

export interface AdlFormProps<T> {
  state: AdlFormState<T>,
  onCancel?(): void;
  onClose?(): void;
  onApply?(value: T): void;
  disabled?: boolean;
  validate?(value: T): Promise<string | undefined>;
}

export interface AdlFormState<T> {
  value0:  T | undefined;
  veditor: VEditor<T>, 
  jsonBinding: JsonBinding<T> | undefined,

  veditorState: unknown;
  rawState: string;
  mode: Mode;
  pristine: boolean;
  formValidation: FormValidation;

  setValue0(value: T | undefined): void;
  setMode(mode:Mode): void,
  setVEditorState(state:unknown): void;
  setRawState(state: unknown): void;
  setFormValidation(formValidation: FormValidation): void;
}

export enum Mode {
  VE, // Edit with the generated ADL VEditor
  RAW // Edit with a (validated) json multiline text field
}

interface AwaitingValidation {
  type: "awaiting";
  validationSeq: number;
}

interface FormError {
  type: "error";
  error: string;
  validationSeq: number;
}

interface FormValidated {
  type: "ok";
  validationSeq: number;
}

type FormValidation = AwaitingValidation | FormError | FormValidated;


export function useAdlFormState<T>(params: {
    value0?: T, 
    veditor: VEditor<T>, 
    jsonBinding?: JsonBinding<T>,
  }): AdlFormState<T> {

  const [value0, _setValue0] = useState<T|undefined>(params.value0);
  const [pristine, setPristine] = useState<boolean>(true);
  const [veditorState, _setVEditorState] = useState<unknown>(() => makeVeditorState(params.value0));
  const [rawState, _setRawState] = useState<string>(() => makeRawState(params.value0));
  const [mode, setMode] = useState<Mode>(Mode.VE);
  const [formValidation, _setFormValidation] = useState<FormValidation>({type: "ok",validationSeq: 0});

  function makeVeditorState(v: T | undefined): unknown {
    return v === undefined
    ? params.veditor.initialState
    : params.veditor.stateFromValue(v);
  }

  function makeRawState(v: T | undefined): string {
    return params.jsonBinding && v != undefined ? JSON.stringify(params.jsonBinding.toJson(v), null, 2) : ""
  }

  function setValue0(v: T | undefined) {
    _setValue0(v);
    _setFormValidation({type: "ok",validationSeq: 0});
    _setVEditorState(makeVeditorState(v));
    _setRawState(makeRawState(v));
    setPristine(true);
  } 

  function setVEditorState(state: unknown) {
    _setVEditorState(state);
    setPristine(false);
  } 

  function setRawState(state: string) {
    _setRawState(state);
    setPristine(false);
  }

  function setFormValidation(f: FormValidation) {
    if (f.validationSeq >= formValidation.validationSeq) {
      _setFormValidation(f);
    }
  }

  return {
    veditor: params.veditor,
    jsonBinding: params.jsonBinding,
    value0,
    setValue0,
    veditorState,
    setVEditorState,
    rawState,
    setRawState,
    pristine,
    mode,
    setMode,
    formValidation,
    setFormValidation
  };
}


export const AdlForm = (props: AdlFormProps<unknown>) => {

  const state = props.state;

  function onToggleMode() {
    switch (state.mode) {
      case Mode.VE:
        // Update the rawstate if we can, before switching to raw mode
        // tslint:disable-next-line:no-shadowed-variable
        const vv = state.veditor.valueFromState(state.veditorState);
        if (vv.isValid && state.jsonBinding) {
          const rawState = JSON.stringify(state.jsonBinding.toJson(vv.value), null, 2);
          state.setMode(Mode.RAW);
          state.setRawState(rawState);
        } else {
          state.setMode(Mode.RAW);
        }
        break;

      case Mode.RAW:
        // Update the veditor if we can, before switching to VE mode
        const result = parseRawText(state.rawState);
        if (result.kind === "value") {
          const adlState = state.veditor.stateFromValue(result.value);
          state.setMode(Mode.VE);
          state.setVEditorState(adlState);
        } else {
          state.setMode(Mode.VE);
        }
        break;
      default:
    }
  };


  const parseRawText = (
    text: string
  ): { kind: "error"; error: string } | { kind: "value"; value: unknown } => {
    try {
      const jv = JSON.parse(text);
      if (state.jsonBinding) {
        const value = state.jsonBinding.fromJson(jv);
        return { kind: "value", value };
      }
      return { kind: "error", error: "BUG: no allowRaw property" };
    } catch (e) {
      if (e instanceof SyntaxError) {
        return { kind: "error", error: "Json is not well formed" };
      } else if (isJsonParseException(e)) {
        return { kind: "error", error: e.getMessage() };
      } else {
        return { kind: "error", error: "Unknown error" };
      }
    }
  };

  const onUpdate = (event: unknown) => {
    const newVEditorState = state.veditor.update(state.veditorState, event);
    state.setVEditorState(newVEditorState);
    void validateForm(newVEditorState);
  }

  const validateForm = async (adlState: unknown) => {
    const vv = state.veditor.valueFromState(adlState);

    if (vv.isValid && props.validate && state.mode === Mode.VE) {
      const validationSeq = state.formValidation.validationSeq + 1;
      state.setFormValidation({
          type: "awaiting",
          validationSeq
      });
      console.log("awaiting validation of ", vv.value);
      const error: string | undefined = await props.validate(vv.value);
      console.log("done");
      if (error && error.length > 0) {
        state.setFormValidation({
          type: "error",
          error,
          validationSeq
        });

      } else {
        state.setFormValidation({
          type: "ok",
          validationSeq
        });
      }  
    }
  }

  const onApply = () => {
    let value: unknown = null;
    switch (state.mode) {
      case Mode.VE:
        const vv = state.veditor.valueFromState(state.veditorState);
        if (!vv.isValid) {
          throw new Error("BUG: onApply called with invalid state");
        }
        value = vv.value;
        break;
      case Mode.RAW:
        if (state.jsonBinding) {
          value = state.jsonBinding.fromJson(JSON.parse(state.rawState));
        }
        break;
      default:
    }
    if (props.onApply) {
      props.onApply(value);
      state.setValue0(value);
    }
  }

  let errors: string[] = [];
  let renderedEditor: JSX.Element | null = null;

  switch (state.mode) {
    case Mode.VE:
      const vv = state.veditor.valueFromState(state.veditorState);
      errors = !vv.isValid ? vv.errors : [];
      renderedEditor = <FormVEditor 
        veditor={state.veditor}
        veditorState={state.veditorState}
        disabled={props.disabled}
        onUpdate={onUpdate}
      />;
      break;
    case Mode.RAW:
      const result = parseRawText(state.rawState);
      const error =
        result.kind === "error" ? (
          <ErrLabel>
            {result.error}
          </ErrLabel>
        ) : null;
      renderedEditor = (
        <div>
            <RawJsonEditor
              disabled={props.disabled}
              value={state.rawState}
              onChange={state.setRawState}
            />
          {error}
        </div>
      );
      if (result.kind === "error") {
        errors = [result.error];
      }
      break;
    default:
  }

  function applyButton() {
    if (props.onApply) {
      return (
        <Button
          variant="contained"
          disabled={errors.length > 0 || state.formValidation.type !== 'ok'}
          onClick={onApply}
        >
          Apply
        </Button>
      );
    }
  }

  function closeButton() {
    if (props.onClose) {
      return (
        <Button variant="contained" onClick={props.onClose}>Close</Button>
      );
    }
  }

  function cancelButton() {
    if (props.onCancel) {
      return (
        <Button variant="outlined" onClick={props.onCancel}>Cancel</Button>
      );
    }
  }
  

  let rawToggle: JSX.Element | null = null;
  if (state.jsonBinding) {
    rawToggle = (
      <Toggle
        onChange={onToggleMode}
        checked={state.mode === Mode.RAW}
      />
    );
  }

  let formError: JSX.Element | null = null;
  if (state.formValidation.type === "error") {
    formError = (
      <div style={{ margin: "20px" }}>
        <ErrLabel>
          {state.formValidation.error}
        </ErrLabel>
      </div>
    );
  }

  return (
      <div>
        <div style={{ margin: "20px" }}>{renderedEditor}</div>
        {formError}
        <ActionBar>
          { rawToggle &&
            <ActionGroup>
              Edit raw
              {rawToggle}
            </ActionGroup>
          }
          <ActionGroup>
            {cancelButton()}
            {closeButton()}
            {applyButton()}
          </ActionGroup>

        </ActionBar>
      </div>
  );
}

function FormVEditor(props: {
  veditor: VEditor<unknown>,
  veditorState: unknown,
  disabled?: boolean,
  onUpdate: (ev:unknown) => void,
}) {
  const rendered = props.veditor.render(
    props.veditorState,
    props.onUpdate
  )({disabled: !!props.disabled});
  return rendered.element();
}

const ErrLabel = styled('label')({
  color: 'red',
});

const ActionBar = styled('div')({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
});

const ActionGroup = styled('div')({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '10px',
  marginLeft: '20px',
});

const RawJsonEditor = (props: {
  disabled?: boolean,
  value: string,
  onChange: (s: string) => void
}) =>  {
  return <TextField
    fullWidth
    multiline
    minRows={5}
    maxRows={10}
    disabled={props.disabled}
    value={props.value}
    onChange={ev => props.onChange(ev.target.value)}
  >
  </TextField>;
}
