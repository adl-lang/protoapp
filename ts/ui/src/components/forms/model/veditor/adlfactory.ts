import * as adlrt  from "@adllang/adl-runtime";
import * as adlast from "@/adl-gen/sys/adlast";
import * as systypes from "@/adl-gen/sys/types";
import * as adltree from "../adl-tree";
import { createJsonBinding } from '@adllang/adl-runtime';

import {IVEditor, OVEditor, UpdateFn, Validated, invalid, mapValidated, valid} from "./type";
import {FieldFns} from "../fields/type";
import {scopedNamesEqual} from "@adllang/adl-runtime";
import { adlPrimitiveFieldFns, maybeField, nullableField } from "../fields/adl";
import { SelectState } from "../select";
import { getAdlTableInfo, Column, cellContent } from "../adl-table";

/**
 * Construct a VEditor from a a specified ADL type
 */
export function createVEditor<T,R>(
  typeExpr: adlrt.ATypeExpr<T>,
  declResolver: adlrt.DeclResolver,
  factory: Factory<R>
): IVEditor<T, unknown, unknown,R> {
  const adlTree = adltree.createAdlTree(typeExpr.value, declResolver);
  return createVEditor0(declResolver, nullContext, adlTree, factory) as IVEditor<
    T,
    unknown,
    unknown,
    R
  >;
}

export interface CustomContext {
  declResolver: adlrt.DeclResolver;
  scopedDecl: adlast.ScopedDecl | null;
  field: adlast.Field | null;
  typeExpr: adlast.TypeExpr;
}

export type VEditorCustomize<R> = (ctx: CustomContext) => OVEditor<unknown,R> | null;
export type FieldCustomize = (ctx: CustomContext) => FieldFns<unknown> | null;

export interface Factory<R> {
  getCustomVEditor(ctx: CustomContext): OVEditor<unknown,R> | null;
  getCustomField(ctx: CustomContext): FieldFns<unknown> | null;

  renderFieldEditor(props: FieldEditorProps): R;
  renderStructEditor(props: StructEditorProps<R>): R;
  renderUnionEditor(props: UnionEditorProps<R>): R;
  renderMaybeEditor(props: MaybeEditorProps<R>): R;
  renderVectorEditor(props: VectorEditorProps<unknown, R>): R;
  renderVoidEditor(): R;

  renderUnimplementedEditor(props: UnimplementedEditorProps): R;
}

export interface FieldEditorProps {
  fieldfns: FieldFns<unknown>;
  state: string;
  onUpdate: UpdateFn<string>  
};

export interface StructEditorProps<R> {
  fields: StructFieldProps<R>[];
}

export interface StructFieldProps<R> {
  name: string;
  label: string;
  annotations: adlast.Annotations;
  veditor: VEditorProps<unknown,unknown, unknown,R>
}

export interface UnionEditorProps<R> {
  selectState: SelectState,
  veditor: VEditorProps<unknown,unknown,unknown,R> | null;
}

export interface MaybeEditorProps<R> {
  isActive: boolean,
  toggleIsActive: () => void,
  veditor: VEditorProps<unknown,unknown,unknown,R>;
}

export interface VectorEditorProps<T,R> {
  values: T[];
  columns: Column<T,string>[];
  valueVEditor(): IVEditor<T,unknown,unknown,R>;
  splice(start: number, deleteCount: number, values: T[]): void;
}

export interface VEditorProps<T,S,E,R> {
  veditor: IVEditor<T,S,E,R>;
  state: S;
  onUpdate: (e: E) => void;
}


export interface UnimplementedEditorProps {
  typeExpr: adlast.TypeExpr;
}

interface InternalContext {
  scopedDecl: adlast.ScopedDecl | null;
  field: adlast.Field | null;
}

const nullContext = { scopedDecl: null, field: null };

function createVEditor0<R>(
  declResolver: adlrt.DeclResolver,
  ctx: InternalContext,
  adlTree: adltree.AdlTree,
  factory: Factory<R>,
): IVEditor<unknown, unknown, unknown, R> {
  const customContext = {
    declResolver,
    scopedDecl: ctx.scopedDecl,
    field: ctx.field,
    typeExpr: adlTree.typeExpr
  };

  // Use a custom editor if available
  const customVEditor = factory.getCustomVEditor(customContext);
  if (customVEditor !== null) {
    return customVEditor;
  }
  const customField = factory.getCustomField(customContext);
  if (customField) {
    return fieldVEditor(factory, adlTree.typeExpr, customField);
  }

  // Otherwise construct a standard one

  const details = adlTree.details();
  switch (details.kind) {
    case "primitive":
      if (details.ptype === "Void") {
        return voidVEditor(factory);
      } else {
        const fldfns = createField(adlTree, customContext, factory);
        if (fldfns === null) {
          return unimplementedVEditor(factory, adlTree.typeExpr);
        }
        return fieldVEditor(factory, adlTree.typeExpr, fldfns);
      }

    case "struct": {
      return structVEditor(factory, declResolver, details);
    }

    case "newtype":
      if (adlTree.typeExpr.typeRef.kind === 'reference' && scopedNamesEqual(systypes.snMap, adlTree.typeExpr.typeRef.value)) {
         return mapVEditor(declResolver, nullContext, factory, {value:adlTree.typeExpr.parameters[0]}, {value:adlTree.typeExpr.parameters[1]});
      }
      return createVEditor0(declResolver, nullContext, details.adlTree, factory);

    case "typedef":
      return createVEditor0(declResolver, nullContext, details.adlTree, factory);

    case "union": {
      // When T can be edited in a String field, we can use a string
      // field for Maybe<T> iff the empty string is not a valid value
      // of T.  So Maybe<Int> can be editied in a string field,
      // whereas Maybe<String> cannot.
      if (isMaybe(adlTree.typeExpr)) {
        const fldfns = createFieldForTParam0(adlTree, customContext, factory, declResolver);
        if (fldfns && fldfns.validate("") !== null) {
          return fieldVEditor(factory, adlTree.typeExpr, maybeField(fldfns));
        } else {
          return maybeVEditor(factory, declResolver, adlTree, details);
        }
      }
      else {
        const uveditor = unionVEditor(factory, declResolver, adlTree, details);
        if (isEnum(details.fields)) {
          // The union editor works fine for enums, but we need to map to the 
          // enum typescript representation
          return mappedVEditor(uveditor, unionFromEnum, enumFromUnion);
        } else {
          return uveditor;
        }
      }
    }

    case "nullable":
      const fieldfns = createFieldForTParam0(adlTree, customContext, factory, declResolver);
      if (fieldfns !== null  && fieldfns.validate("") !== null) {
        return fieldVEditor(factory, adlTree.typeExpr, nullableField(fieldfns));
      } else {
        // Use a maybe editor
        const maybeTypeExpr = systypes.texprMaybe({value:details.param.typeExpr});
        const maybeEditor = createVEditor(maybeTypeExpr, declResolver, factory);

        return mappedVEditor(maybeEditor, maybeFromNullable, nullableFromMaybe);
      }

    case "vector": {
      const udetails = details.param.details(); 
      const valueVEditor = () => createVEditor0(declResolver, ctx, details.param, factory);
      if (udetails.kind == 'struct') {
        const tableInfo = getAdlTableInfo(declResolver, {value: details.param.typeExpr}, ctx => factory.getCustomField(ctx));
        const columns = tableInfo.columns.map(c => c.column);
        return genericVectorVEditor(factory, columns, valueVEditor);

      } else if (udetails.kind == 'union') {
          // The default view for a vector of unions is to just show the discriminator
        if (isEnum(udetails.fields)) {
          let columns: Column<string, string>[] = [
             {
                header: cellContent(udetails.astDecl.name),
                id: "kind",
                content: v => cellContent(v),
             },
          ];
          return genericVectorVEditor(factory, columns, valueVEditor);
        } else {
          let columns: Column<{kind:string}, string>[] = [
             {
                header: cellContent(`${udetails.astDecl.name}`),
                id: "kind",
                content: v => cellContent(v.kind),
             },
          ];
          return genericVectorVEditor(factory, columns, valueVEditor);
        }
      }

      // Default to a single column table, showing the value as a string
      let columns: Column<string, string>[] = [
         {
            header: cellContent("value"),
            id: "kind",
            content: v => cellContent(v.toString()),
         },
      ];
      return genericVectorVEditor(factory, columns, valueVEditor);
    }

    case "stringmap":
      // An veditor over StringMap<T> is implemented in terms of
      // An veditor over sys.types.Map<String,T>
      type MapType = systypes.MapEntry<string,unknown>[];
      interface StringMapType {[key:string]: unknown}
      const valueType = adlTree.typeExpr.parameters[0];
      const underlyingVEditor = mapEntryVectorVEditor(declResolver, ctx, factory, adlrt.texprString(), {value:valueType});
      const stringMapFromMap = (m: MapType): StringMapType => {
        const result: StringMapType = {};
        for (const me of m) {
          result[me.key] = me.value;
        }
        return result;
      }
      const mapFromStringMap = (m: StringMapType): MapType => {
        return Object.keys(m).map( k => ({key:k, value:m[k]}));
      }
      return mappedVEditor(
        underlyingVEditor,
        mapFromStringMap,
        stringMapFromMap,
      );
  }
}

function voidVEditor<R>(factory: Factory<R>): IVEditor<null,null,null,R> {
  return {
    initialState: null,
    stateFromValue: () => null,
    valueFromState: () => valid(null),
    update: s => s,
    render: () => factory.renderVoidEditor(),
  };
}

function fieldVEditor<T,R>(factory: Factory<R>, _typeExpr: adlast.TypeExpr, fieldfns: FieldFns<T>): IVEditor<T,string,string,R> {
  function valueFromState(s: string): Validated<T> {
    const err = fieldfns.validate(s);
    return err === null ? valid(fieldfns.fromText(s)) : invalid([err]);
  }

  const veditor: IVEditor<T,string,string,R> = {
    initialState: "",
    stateFromValue: fieldfns.toText,
    valueFromState,
    update: (_s,e) => e,
    render: (state, onUpdate) => factory.renderFieldEditor({fieldfns, state, onUpdate}),
  };

  return veditor;
}

interface StructFieldStates {
  [key: string]: unknown;
}

interface StructState {
  fieldStates: StructFieldStates;
}

interface StructFieldEvent {
  kind: "field";
  field: string;
  fieldEvent: unknown;
}

type StructEvent = StructFieldEvent;

export type VField<R> = {
  field: adltree.Field;
  veditor: OVEditor<unknown,R>;
};


function structVEditor<R>(
  factory: Factory<R>,
  declResolver: adlrt.DeclResolver,
  struct: adltree.Struct,
): IVEditor<unknown, StructState, StructEvent,R> {
  const fieldDetails = struct.fields.map(field => {
    const veditor = createVEditor0(declResolver, nullContext,  field.adlTree, factory);
    const jsonBinding = createJsonBinding<unknown>(declResolver, { value: field.adlTree.typeExpr });
    return {
      name: field.astField.name,
      annotations: field.astField.annotations,
      default: field.astField.default,
      jsonBinding,
      label: fieldLabel(field.astField.name),
      veditor,
    };
  });

  const veditorsByName : Record<string,OVEditor<unknown,R>>  = {};
  const initialState : StructState = { fieldStates: {} };

  // It's unclear what the initialState for an empty struct
  // editor should be... either every field empty, or
  // with default values filled in for those fields that have
  // defaults specified. the flag below set's this behaviour, though
  // we may want to change initialState to be a function that takes
  // this as a parameter.
  const USE_DEFAULTS_FOR_STRUCT_FIELDS = true;

  for (const fd of fieldDetails) {
    veditorsByName[fd.name] = fd.veditor;
    if (USE_DEFAULTS_FOR_STRUCT_FIELDS && fd.default.kind === "just") {
      initialState.fieldStates[fd.name] = fd.veditor.stateFromValue(
        fd.jsonBinding.fromJsonE(fd.default.value)
      );
    } else {
      initialState.fieldStates[fd.name] = fd.veditor.initialState;
    }
  }

  function stateFromValue(value: Record<string,unknown>) {
    const state: StructState = {
      fieldStates: {},
    };
    for (const fd of fieldDetails) {
      if (value[fd.name]) {
        state.fieldStates[fd.name] = fd.veditor.stateFromValue(value[fd.name]);
      } else {
        state.fieldStates[fd.name] = fd.veditor.stateFromValue(fd.veditor.initialState);
      }
    }
    return state;
  }

  function valueFromState(state: StructState): Validated<unknown> {
    let errors: string[] = [];
    const value: Record<string,unknown> = {};
    for (const fd of fieldDetails) {
      const vv = fd.veditor.valueFromState(state.fieldStates[fd.name]);
      if (!vv.isValid) {
        errors = [...errors, ...vv.errors];
      } else {
        value[fd.name] = vv.value;
      }
    }
    if (errors.length > 0) {
      return invalid(errors);
    } else {
      return valid(value);
    }
  }

  function update(state: StructState, event: StructEvent): StructState {
    if (event.kind === "field") {
      const newFieldStates = {
        ...state.fieldStates
      };
      const newfs = veditorsByName[event.field].update(
        state.fieldStates[event.field],
        event.fieldEvent
      );
      newFieldStates[event.field] = newfs;
      const newState =  {
        fieldStates: newFieldStates,
      };
      return newState;
    } else {
      return state;
    }
  }

  function render(
    state: StructState,
    onUpdate: UpdateFn<StructEvent>
  ): R {
    const fields: StructFieldProps<R>[] =  fieldDetails.map(fd => ({
      ...fd,
      veditor: {
        veditor: fd.veditor,
        state: state.fieldStates[fd.name],
        onUpdate: event => {
          onUpdate({ kind: "field", field: fd.name, fieldEvent: event });
        }
      }
     }));
    return factory.renderStructEditor({fields});
  }

  return {
    initialState,
    stateFromValue,
    valueFromState,
    update,
    render
  };
}

// Convert snake/camel case to human readable spaced name
export function fieldLabel(name: string): string {
  return (
    name
      // insert a space before all caps
      .replace(/([A-Z])/g, " $1")
      // uppercase the first character
      .replace(/^./, function(str) {
        return str.toUpperCase();
      })
      // replace _ with space
      .replace(/_/g, " ")
  );
}


interface UnionState {
  currentField: string | null;
  selectActive: boolean,
  fieldStates: { [key: string]: unknown };
}

interface UnionToggleActive {
  kind: "toggleActive",
} // Show the dropdown
interface UnionSetField {
  kind: "switch";
  field: string | null;
} // Switch the discriminator
interface UnionUpdate {
  kind: "update";
  event: unknown;
} // Update the value
type UnionEvent = UnionToggleActive | UnionSetField | UnionUpdate;

interface SomeUnion {
  kind: string;
  value: unknown;
}

function unionVEditor<R>(
  factory: Factory<R>,
  declResolver: adlrt.DeclResolver,
  _adlTree: adltree.AdlTree,
  union: adltree.Union,
): IVEditor<SomeUnion, UnionState, UnionEvent,R> {

  const fieldDetails = union.fields.map(field => {
    const formLabel = fieldLabel(field.astField.name);
    const ctx = {
      scopedDecl: { moduleName: union.moduleName, decl: union.astDecl },
      field: field.astField
    };

    return {
      name: field.astField.name,
      label: formLabel,
      veditor: () => createVEditor0(declResolver, ctx, field.adlTree, factory)
    };
  });

  const veditorsByName : {[name: string]: () => OVEditor<unknown,R>}= {};
  for (const fd of fieldDetails) {
    veditorsByName[fd.name] = fd.veditor;
  }

  const initialState = { currentField: null, selectActive: false, fieldStates: {} };

  function stateFromValue(uvalue: SomeUnion): UnionState {
    const kind = uvalue.kind;
    if (!kind) {
      throw new Error("union must have kind field");
    }
    const value = uvalue.value === undefined ? null : uvalue.value;
    const veditor = veditorsByName[kind]();
    if (!veditor) {
      throw new Error("union with invalid kind field");
    }
    return {
      currentField: kind,
      selectActive: false,
      fieldStates: { [kind]: veditor.stateFromValue(value) }
    };
  }

  function valueFromState(state: UnionState): Validated<SomeUnion> {
    const kind = state.currentField;
    if (kind === null) {
      return invalid(["selection required"]);
    }

    const vv = veditorsByName[kind]().valueFromState(state.fieldStates[kind]);
    if (vv.isValid) {
      return valid({kind, value: vv.value});
    } else {
      return invalid(vv.errors);
    }
  }

  function update(state: UnionState, event: UnionEvent): UnionState {
    if (event.kind === "toggleActive") {
      return {
        ...state,
        selectActive: !state.selectActive,
      };
    } else if (event.kind === "switch") {
      const field = event.field;
      const newFieldStates = { ...state.fieldStates };
      if (field && !newFieldStates[field]) {
        newFieldStates[field] = veditorsByName[field]().initialState;
      }
      return {
        currentField: event.field,
        selectActive: state.selectActive,
        fieldStates: newFieldStates
      };
    } else if (event.kind === "update") {
      const field = state.currentField;
      if (field === null) {
        throw new Error("BUG: union update received when current field not set");
      }
      const newFieldStates = { ...state.fieldStates };
      newFieldStates[field] = veditorsByName[field]().update(newFieldStates[field], event.event);
      return {
        ...state,
        fieldStates: newFieldStates
      };
    } else {
      return state;
    }
  }
  
  function render(state: UnionState, onUpdate: UpdateFn<UnionEvent>): R {
    
    let current: number | null = null;
    if (state.currentField) {
      current = fieldDetails.findIndex(fd => fd.name == state.currentField);
    }

    const selectState: SelectState = {
      current,
      active: state.selectActive,
      choices: fieldDetails.map(fd => fd.label),
      onClick: () => onUpdate({kind:"toggleActive"}),
      onChoice: (i:number | null) => {
        onUpdate({kind:"toggleActive"});
        onUpdate({kind:"switch", field: i === null ? null : fieldDetails[i].name});
      },
    };
    
    let veditor: VEditorProps<unknown,unknown,unknown,R> | null = null;
    if (state.currentField) {
      veditor = {
        veditor: veditorsByName[state.currentField](),
        state: state.fieldStates[state.currentField],
        onUpdate: event => onUpdate({kind:"update",event})
      }
    }

    return factory.renderUnionEditor({selectState,veditor});
  }

  return {
    initialState,
    stateFromValue,
    valueFromState,
    update,
    render
  };
}

interface VectorState<T> {
  values: T[];
}

interface VectorSplice<T> {
  kind: "splice";
  start: number,
  deleteCount: number,
  values: T[];
}

type VectorEvent<T> = VectorSplice<T>;

type Vector<T> = T[];

export function genericVectorVEditor<T,R>(
  factory: Factory<R>,
  columns: Column<T, string>[],
  valueVEditor: () => OVEditor<T,R>,
): IVEditor<Vector<T>, VectorState<T>, VectorEvent<T>, R> {

  const initialState = { values:[] };

  function stateFromValue(v: Vector<T>): VectorState<T> {
    return {values:v};
  }

  function valueFromState(state: VectorState<T>): Validated<Vector<T>> {
    return valid(state.values);
  }

  function update(state: VectorState<T>, event: VectorEvent<T>): VectorState<T> {
    let values = [...state.values];
    switch (event.kind) {
      case 'splice':
        values.splice(event.start, event.deleteCount, ...event.values);
        break;
    }
    return {values};
  }

  function render(state: VectorState<T>, onUpdate: UpdateFn<VectorEvent<T>>): R {
    const props: VectorEditorProps<T,R> = {
      values: state.values,
      columns,
      valueVEditor,
      splice: (start, deleteCount, values) => onUpdate({kind: 'splice', start, deleteCount, values: values as T[]}),
    };
    return factory.renderVectorEditor(props);
  }

  return {
    initialState,
    stateFromValue,
    valueFromState,
    update,
    render
  };
}

export interface MaybeState {
  isActive: boolean,
  underlying: unknown,
}

// Show the dropdown
interface MaybeToggleActive {
  kind: "toggleActive",
}

// Update the underlying value
interface MaybeUpdate {
  kind: "underlying";
  event: unknown;
} 

type MaybeEvent = MaybeToggleActive | MaybeUpdate;

type SomeMaybe = systypes.Maybe<unknown>;

function maybeVEditor<R>(
  factory: Factory<R>,
  declResolver: adlrt.DeclResolver,
  _adlTree: adltree.AdlTree,
  union: adltree.Union,
): IVEditor<SomeMaybe, MaybeState, MaybeEvent,R> {

  const field = union.fields[1];
  const ctx = {
    scopedDecl: { moduleName: union.moduleName, decl: union.astDecl },
    field: field.astField
  };

  const uveditor = createVEditor0(declResolver, ctx, field.adlTree, factory);
  const initialState = { isActive:false, underlying: uveditor.initialState};

  function stateFromValue(v: SomeMaybe): MaybeState {
    if (v.kind == 'nothing') {
      return initialState;
    } else {
      return {isActive: true, underlying: uveditor.stateFromValue(v.value)};
    }
  }

  function valueFromState(v: MaybeState): Validated<SomeMaybe> {
    if (v.isActive) {
      const vv = uveditor.valueFromState(v.underlying);
      if (!vv.isValid) {
        return vv;
      } else {
        return valid({kind:"just", value: vv.value});
      }
    } else {
      return valid({kind:"nothing"});
    }
  }

  function update(state: MaybeState, event: MaybeEvent): MaybeState {
    switch (event.kind) {
      case 'toggleActive':
        return {...state, isActive: !state.isActive};
      case 'underlying':
        return {...state, underlying: uveditor.update(state.underlying, event.event)};
    }
  }

  function render(state: MaybeState, onUpdate: UpdateFn<MaybeEvent>): R {
    return factory.renderMaybeEditor({
      isActive:state.isActive,
      toggleIsActive: () => onUpdate({kind:'toggleActive'}),
      veditor : {
        veditor: uveditor,
        state: state.underlying,
        onUpdate: (event: unknown) => onUpdate({kind:'underlying', event})
      }
    });
  }

  return {
    initialState,
    stateFromValue,
    valueFromState,
    update,
    render
  };
}


function unimplementedVEditor<R>(factory: Factory<R>, typeExpr: adlast.TypeExpr): OVEditor<unknown,R> {
    return {
      initialState: null,
      stateFromValue: () => null,
      valueFromState: () => valid(null),
      update: () => {},
      render: () => factory.renderUnimplementedEditor({typeExpr}),
    };
  }

// Create an editor over a Vector<Pair<K,V>>. This won't be required after
// we update sys.types.Map to have that type
function mapVEditor<K,V,R>(declResolver: adlrt.DeclResolver, ctx: InternalContext, factory: Factory<R>, ktype: adlrt.ATypeExpr<K>, vtype: adlrt.ATypeExpr<V>): IVEditor<systypes.Pair<K,V>[], unknown, unknown, R> {
  const map1 = (m: systypes.Pair<K,V>[]): systypes.MapEntry<K,V>[] => {
    return m.map( p => ({key:p.v1, value:p.v2}) );
  }
  const map2 = (m: systypes.MapEntry<K,V>[]): systypes.Pair<K,V>[] => {
    return m.map( me => ({v1:me.key, v2:me.value}) );
  }
  return mappedVEditor(
    mapEntryVectorVEditor(declResolver, ctx, factory, ktype, vtype),
    map1,
    map2,
  );
}

// Create an editor over a Vector<MapEntry<K,V>>. This won't be required after
// we update sys.types.Map to have that type
function mapEntryVectorVEditor<K,V,R>(declResolver: adlrt.DeclResolver, ctx: InternalContext, factory: Factory<R>, ktype: adlrt.ATypeExpr<K>, vtype: adlrt.ATypeExpr<V>): IVEditor<systypes.MapEntry<K,V>[], unknown, unknown, R> {
  type MapType = systypes.MapEntry<K,V>[];
  const mapTypeExpr : adlrt.ATypeExpr<MapType> = adlrt.texprVector(systypes.texprMapEntry(ktype,vtype));
  const mapAdlTree = adltree.createAdlTree(mapTypeExpr.value, declResolver);
  return createVEditor0(declResolver, ctx, mapAdlTree, factory) as OVEditor<MapType,R>;
}

function createFieldForTParam0<R>(
  adlTree: adltree.AdlTree,
  ctx: CustomContext,
  factory: Factory<R>,
  declResolver: adlrt.DeclResolver
): FieldFns<unknown> | null {
  const adlTree1 = adltree.createAdlTree(adlTree.typeExpr.parameters[0], declResolver);
  const ctx1 = {
    declResolver,
    scopedDecl: ctx.scopedDecl,
    field: ctx.field,
    typeExpr: adlTree.typeExpr.parameters[0]
  };
  return createField(adlTree1, ctx1, factory);
}

function createField<R>(
  adlTree: adltree.AdlTree,
  ctx: CustomContext,
  factory: Factory<R>,
): FieldFns<unknown> | null {
  let fieldfns = createField1(adlTree, ctx, factory);
  if (fieldfns === null) {
    // Try resolving through any typedefs or newtypes
    const adlTree2 = adltree.resolve(adlTree, true, true);
    fieldfns = createField1(adlTree2, ctx, factory);
  }
  return fieldfns;
}

function createField1<R>(
  adlTree: adltree.AdlTree,
  ctx: CustomContext,
  factory: Factory<R>,
): FieldFns<unknown> | null {
  if (factory) {
    const customField = factory.getCustomField(ctx);
    if (customField) {
      return customField;
    }
  }
  const details = adlTree.details();
  if (details.kind === "primitive") {
    const fieldfns = adlPrimitiveFieldFns(details.ptype);
    if (fieldfns !== null) {
      return fieldfns;
    }
  }
  return null;
}

/// Map a value editor from type A to a corresponding value
/// editor over type B.
export function mappedVEditor<A,B,S,E,R>(
  veditor: IVEditor<A,S,E,R>,
  aFromB: (b:B) => A,
  bFromA: (a:A) => B
  ) : IVEditor<B,S,E,R> {
  return {
    initialState: veditor.initialState,
    stateFromValue: (b:B) => veditor.stateFromValue(aFromB(b)),
    valueFromState: (s:S) => mapValidated( bFromA, veditor.valueFromState(s)),
    update: veditor.update,
    render: veditor.render,
  };
}

function isEnum(fields: adltree.Field[]): boolean {
  for (const f of fields) {
    const isVoid =
      f.astField.typeExpr.typeRef.kind === "primitive" &&
      f.astField.typeExpr.typeRef.value === "Void";
    if (!isVoid) {
      return false;
    }
  }
  return true;
}

function isMaybe(typeExpr: adlast.TypeExpr): boolean {
  if (typeExpr.typeRef.kind === "reference") {
    return (
      typeExpr.typeRef.value.moduleName === "sys.types" && typeExpr.typeRef.value.name === "Maybe"
    );
  }
  return false;
}

function maybeFromNullable<T>(value: T | null): systypes.Maybe<T> {
  if (value === null) {
    return {kind:'nothing'}
  } else {
    return {kind: 'just', value}
  }
}

// This function only works for types T which don't have null as
// a value.
function nullableFromMaybe<T>(value: systypes.Maybe<T>): T | null {
  if (value.kind === 'just') {
    return value.value;
  } else {
    return null
  }
}

function unionFromEnum(ev : string): {kind:string, value:unknown} {
  return {kind:ev, value:null};
}

function enumFromUnion(uv: {kind:string, value:unknown}) : string {
  return uv.kind;
}

// Extend a veditor with some additional validation
export function validatedVEditor<A,S,E,R>(
  veditor: IVEditor<A,S,E,R>,
  extraValidator: (v:A) => Validated<A>,
  ) : IVEditor<A,S,E,R> {
  return {
    initialState: veditor.initialState,
    stateFromValue: veditor.stateFromValue,
    valueFromState: (s: S) => {
      const va = veditor.valueFromState(s);
      if (va.isValid) {
        return extraValidator(va.value);
      } else {
        return va;
      }
    },
    update: veditor.update,
    render: veditor.render,
  };
}

