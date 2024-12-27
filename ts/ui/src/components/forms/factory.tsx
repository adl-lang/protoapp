import { ScopedDecl, scopedNamesEqual, texprString } from "@adllang/adl-runtime";
import { typeExprsEqual } from "@adllang/adl-runtime";

import { getValidRegexAnnotation } from "./model/adl-annotations";
import { regexStringFieldFns } from "./model/fields/primitive";
import { FieldFns } from "./model/fields/type";
import { CustomContext } from "./model/veditor/adlfactory";
import { UiFactory, wideFieldElement } from "./mui/factory";
import { OVEditor, UpdateFn, valid } from "./model/veditor/type";
import { RenderFn, RenderProps } from "./mui/veditor";
import { TextField } from "@mui/material";
import { snStringML } from "@/adl-gen/common/strings";
import { snDbKey } from "@/adl-gen/common/db";

export function createUiFactory() {
  const factory = new UiFactory();
  factory.addCustomField(regexpFields);
  factory.addCustomField(dbKeyField);
  factory.addCustomVEditor(multilineStringEditor);
  return factory;
}

/// for annotated adl type aliases like:
//   
//     type MyStringType = String;
//     
//     annotation MyStringType ValidRegex {
//       "regex" : "^...$",
//       "description" : "my string type",
//       "returnGroup" : 0
//     };
// 
/// use a text field restricted to match the regex
// 
function regexpFields(ctx: CustomContext): FieldFns<unknown> | null {
  if (ctx.typeExpr.typeRef.kind === "reference") {
    const decl: ScopedDecl = ctx.declResolver(ctx.typeExpr.typeRef.value);
    if (decl.decl.type_.kind === "type_") {
      if (typeExprsEqual(decl.decl.type_.value.typeExpr, texprString().value)) {
        const regex =  decl.decl && getValidRegexAnnotation(ctx.declResolver, decl.decl.annotations);
        if (regex !== null) {
          return regexStringFieldFns(regex.regex, regex.description, regex.returnGroup);
        }
      }
    }
  }
  return null;
}

/// for adl type: common.db.DbKey
// 
/// use a text field restricted to be a valid db key
function dbKeyField(ctx: CustomContext): FieldFns<unknown> | null {
  if (ctx.typeExpr.typeRef.kind === "reference" && scopedNamesEqual(ctx.typeExpr.typeRef.value, snDbKey)) {
      return regexStringFieldFns('^[A-Z]+-[A-Za-z0-9]+$', 'a db key', 0); 
  }
  return null;
}

/// for adl type: common.strings.StringML
// 
/// use a multiline text field
function multilineStringEditor(ctx: CustomContext): OVEditor<string,RenderFn> | null {
  if (ctx.typeExpr.typeRef.kind === "reference" && scopedNamesEqual(ctx.typeExpr.typeRef.value, snStringML)) {
      return {
        initialState: "",
        stateFromValue: (s:string) => s,
        valueFromState: (s:string) => valid(s),
        update: (_s,e) => e,
        render: renderMultilineStringEditor,
      }

  }
  return null;
}

function renderMultilineStringEditor(state: string, onUpdate: UpdateFn<string>): RenderFn {
  return ({disabled}: RenderProps ) => {
    const element = (
        <TextField 
          size="small" 
          fullWidth
          value={state} 
          onChange={(s) => onUpdate(s.currentTarget.value)} 
          disabled={disabled}
          multiline
        />
    );
    return wideFieldElement(element);
  };
}
