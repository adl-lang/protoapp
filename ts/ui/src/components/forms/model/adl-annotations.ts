// Helper functions to extract various ADL annotations
import { DeclResolver } from "@adllang/adl-runtime";
import * as ui from "adl/common/ui";
import { createJsonBinding, JsonBinding } from "@adllang/adl-runtime";
import { typeExprsEqual } from "@adllang/adl-runtime";
import * as adlast from "adl/sys/adlast";
import * as systypes from "adl/sys/types";

type Json = {} | null;

export function getAnnotation<T>(
  anns: systypes.MapEntry<adlast.ScopedName, Json>[],
  jsonBinding: JsonBinding<T>
): T | null {
  for (const ann of anns) {
    const te: adlast.TypeExpr = {
      typeRef: { kind: "reference", value: ann.key},
      parameters: []
    };
    if (typeExprsEqual(te, jsonBinding.typeExpr)) {
      return jsonBinding.fromJson(ann.value);
    }
  }
  return null;
}

export function getGroupKeyFromAnnotation(
  dresolver: DeclResolver,
  annotations: adlast.Annotations,
): string | null {
  const jb = createJsonBinding(dresolver, ui.texprFormGroupKey());
  return getAnnotation(annotations, jb);
}

export function getFormLabelFromAnnotation(
  dresolver: DeclResolver,
  field: adlast.Field
): string | null {
  const jb = createJsonBinding(dresolver, ui.texprFormLabel());
  return getAnnotation(field.annotations, jb);
}


export function getFormGroupsFromAnnotation(
  dresolver: DeclResolver,
  annotations: adlast.Annotations,
): ui.FormGroups | null {
  const jb = createJsonBinding(dresolver, ui.texprFormGroups());
  return getAnnotation(annotations, jb);
}

export function getValidRegexAnnotation(
  dresolver: DeclResolver,
  annotations: adlast.Annotations
): ui.ValidRegex | null {
  const jb = createJsonBinding(dresolver, ui.texprValidRegex());
  return getAnnotation(annotations, jb);
}

export function getValidValuesAnnotation(
  dresolver: DeclResolver,
  annotations: adlast.Annotations
): ui.ValidValues | null {
  const jb = createJsonBinding(dresolver, ui.texprValidValues());
  return getAnnotation(annotations, jb);
}
