
import { boolFieldFns, intFieldFns, jsonFieldFns, numberFieldFns, stringFieldFns } from "./primitive";
import { FieldFns } from "./type";
import * as systypes from "adl/sys/types";
import * as adlrt  from "@adllang/adl-runtime";
import * as adlast from "adl/sys/adlast";
import { createJsonBinding, jsonParseException } from "@adllang/adl-runtime";

const _primitiveFieldFns: Record<string, FieldFns<unknown>> = {
  String: stringFieldFns,
  Int8: intFieldFns(-128, 127),
  Int16: intFieldFns(-32678, 32767),
  Int32: intFieldFns(-2147483648, 2147483647),
  Int64: intFieldFns(null, null),
  Word8: intFieldFns(0, 255),
  Word16: intFieldFns(0, 65535),
  Word32: intFieldFns(0, 4294967295),
  Word64: intFieldFns(0, null),
  Float: numberFieldFns(null, null),
  Double: numberFieldFns(null, null),
  Bool: boolFieldFns(),
  Json: jsonFieldFns()
};

export function adlPrimitiveFieldFns(primitive: string): FieldFns<unknown> | null {
  if (_primitiveFieldFns[primitive]) {
    return _primitiveFieldFns[primitive];
  } else {
    return null;
  }
}


export function maybeField<T>(fieldFns: FieldFns<T>): FieldFns<systypes.Maybe<T>> {
  const newFieldFns: FieldFns<systypes.Maybe<T>> = {
    toText: v => (v.kind === "just" ? fieldFns.toText(v.value) : ""),
    validate: v => {
      if (v === "") {
        return null;
      }
      return fieldFns.validate(v);
    },
    fromText: text =>
      text === "" ? { kind: "nothing" } : { kind: "just", value: fieldFns.fromText(text) },
    equals: (v1, v2) => {
      if (v1.kind === "nothing") {
        return v2.kind === "nothing";
      } else {
        if (v2.kind === "nothing") {
          return false;
        } else {
          return fieldFns.equals(v1.value, v2.value);
        }
      }
    }
  };
  return newFieldFns;
}


// Nullable combinator, that allows a field to be empty.
export function nullableField<T>(fieldFns: FieldFns<T>): FieldFns<T | null> {
  const newFieldFns: FieldFns<T | null> = {
    toText: v => (v === null ? "" : fieldFns.toText(v)),
    validate: v => {
      if (v === "") {
        return null;
      }
      return fieldFns.validate(v);
    },
    fromText: text => (text === "" ? null : fieldFns.fromText(text)),
    equals: (v1, v2) => {
      if (v1 === null) {
        return v2 === null;
      }
      if (v2 === null) {
        return v1 === null;
      }
      return fieldFns.equals(v1, v2);
    }
  };
  return newFieldFns;
}

export function enumField(enumDecl: adlast.Decl, enumUnion: adlast.Union): FieldFns<string> {
  function isValid(v: string): boolean {
    for(const f of enumUnion.fields) {
      if (v === f.name) {
        return true;
      }
    }
    return false;
  }

  return {
    toText(v: string): string {
      return v;
    },
    validate(v: string): string | null {
      if (!isValid(v)) {
        return "must be a " + enumDecl.name;
      }
      return null;
    },
    fromText(v: string): string {
      if (!isValid(v)) {
        throw new Error("must be a " + enumDecl.name);
      }
      return v;
    },
    equals: (v1, v2) => {
      return v1 === v2;
    }
  };
}



/**
 * Construct a field for the specified ADL type, editing the values
 * as json
 */
 export function createAdlField<T>(
  typeExpr: adlrt.ATypeExpr<T>,
  declResolver: adlrt.DeclResolver
): FieldFns<T> {

  const jb = createJsonBinding(declResolver, typeExpr);

  function toText(v: T) {
    return JSON.stringify(jb.toJson(v), null, 2);
  }

  function fromText(s: string): T {
    return jb.fromJsonE(JSON.parse(s));
  }

  function equals(v1: T, v2: T): boolean {
    return JSON.stringify(jb.toJson(v1)) === JSON.stringify(jb.toJson(v2));
  }

  function validate(s: string) : string | null {
    let jv = undefined;
    try {
      jv = JSON.parse(s);
      try {
        jb.fromJsonE(jv);
        return null;
      } catch (e: unknown) {
        return (e as Error).message;
      }
    } catch (e) {
      return "Json is not well formed";
    }
  }

  return {
    toText, 
    equals,
    validate,
    fromText,
  }
}
