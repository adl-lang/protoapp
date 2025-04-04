import { DeclResolver } from "@adllang/adl-runtime";
import * as ast from "adl/sys/adlast";

// A fully resolved tree structure corresponding to an ADL type.
//
// Fully resolved here means that all declaration references have been resolved, and
// all generic type parameters have been substituted for concrete types.

export interface AdlTree {
  typeExpr: ast.TypeExpr;
  details: Lazy<AdlTreeDetails>;
}

export type AdlTreeDetails =
  | Primitive
  | Vector
  | StringMap
  | Nullable
  | Struct
  | Union
  | NewType
  | TypeDef;

export interface Primitive {
  kind: "primitive";
  ptype: string;
}

export interface Vector {
  kind: "vector";
  param: AdlTree;
}

export interface StringMap {
  kind: "stringmap";
  param: AdlTree;
}

export interface Nullable {
  kind: "nullable";
  param: AdlTree;
}

export interface Struct {
  kind: "struct";
  moduleName: string;
  astDecl: ast.Decl;
  fields: Field[];
}

export interface Union {
  kind: "union";
  moduleName: string;
  astDecl: ast.Decl;
  fields: Field[];
}

export interface NewType {
  kind: "newtype";
  moduleName: string;
  astDecl: ast.Decl;
  adlTree: AdlTree;
}

export interface TypeDef {
  kind: "typedef";
  moduleName: string;
  astDecl: ast.Decl;
  adlTree: AdlTree;
}

export interface Field {
  astField: ast.Field;
  adlTree: AdlTree;
}

type Lazy<T> = () => T;

interface TParamBindings {
  [key: string]: ast.TypeExpr;
}

// Walk a type expression to build an AdlTree from an adl type expression.
//
export function createAdlTree(typeExpr: ast.TypeExpr, declResolver: DeclResolver): AdlTree {
  function mkTreeDetails(typeExpre: ast.TypeExpr, tParamBindings: TParamBindings): AdlTreeDetails {
    switch (typeExpre.typeRef.kind) {
      case "primitive":
        switch (typeExpre.typeRef.value) {
          case "Vector":
            return {
              kind: "vector",
              param: mkTree(typeExpre.parameters[0], tParamBindings)
            };
          case "StringMap":
            return {
              kind: "stringmap",
              param: mkTree(typeExpre.parameters[0], tParamBindings)
            };
          case "Nullable":
            return {
              kind: "nullable",
              param: mkTree(typeExpre.parameters[0], tParamBindings)
            };
          default:
            return { kind: "primitive", ptype: typeExpre.typeRef.value };
        }
      case "typeParam":
        return mkTreeDetails(tParamBindings[typeExpre.typeRef.value], tParamBindings);
      case "reference":
        const scopedDecl = declResolver(typeExpre.typeRef.value);
        switch (scopedDecl.decl.type_.kind) {
          case "struct_":
            const struct = scopedDecl.decl.type_.value;
            return {
              kind: "struct",
              moduleName: scopedDecl.moduleName,
              astDecl: scopedDecl.decl,
              fields: mkFields(
                struct.fields,
                mkTParamBindings(tParamBindings, struct.typeParams, typeExpre.parameters)
              )
            };
          case "union_":
            const union = scopedDecl.decl.type_.value;
            return {
              kind: "union",
              moduleName: scopedDecl.moduleName,
              astDecl: scopedDecl.decl,
              fields: mkFields(
                union.fields,
                mkTParamBindings(tParamBindings, union.typeParams, typeExpre.parameters)
              )
            };
          case "type_":
            const typedef = scopedDecl.decl.type_.value;
            return {
              kind: "typedef",
              moduleName: scopedDecl.moduleName,
              astDecl: scopedDecl.decl,
              adlTree: mkTree(
                typedef.typeExpr,
                mkTParamBindings(tParamBindings, typedef.typeParams, typeExpre.parameters)
              )
            };
          case "newtype_":
            const newtype = scopedDecl.decl.type_.value;
            return {
              kind: "newtype",
              moduleName: scopedDecl.moduleName,
              astDecl: scopedDecl.decl,
              adlTree: mkTree(
                newtype.typeExpr,
                mkTParamBindings(tParamBindings, newtype.typeParams, typeExpre.parameters)
              )
            };
          default:
            // tslint:disable-next-line: no-any
            return null as any; // Why is this required for typechecking?
        }
      default:
        // tslint:disable-next-line: no-any
        return null as any; // Why is this required for typechecking?
    }
  }

  function mkTree(typeExpre: ast.TypeExpr, tParamBindings: TParamBindings): AdlTree {
    return {
      typeExpr: substituteTParams(typeExpre, tParamBindings),
      details: once(() => mkTreeDetails(typeExpre, tParamBindings))
    };
  }

  function substituteTParams(
    typeExpre: ast.TypeExpr,
    tParamBindings: TParamBindings
  ): ast.TypeExpr {
    return typeExpre.typeRef.kind === "typeParam"
      ? tParamBindings[typeExpre.typeRef.value]
      : {
          typeRef: typeExpre.typeRef,
          // tslint:disable-next-line: no-any
          parameters: typeExpre.parameters.map((p: any) => substituteTParams(p, tParamBindings))
        };
  }

  function mkTParamBindings(
    existing: TParamBindings,
    idents: string[],
    typeExprs: ast.TypeExpr[]
  ): TParamBindings {
    const sTypeExprs = typeExprs.map(t => substituteTParams(t, existing));
    const newBindings: Record<string,ast.TypeExpr> = {};
    Object.assign(newBindings, existing);
    idents.forEach((ident, i) => {
      newBindings[ident] = sTypeExprs[i];
    });
    return newBindings;
  }

  function mkFields(fields: ast.Field[], tParamBindings: TParamBindings): Field[] {
    return fields.map(field => ({
      astField: field,
      adlTree: mkTree(field.typeExpr, tParamBindings)
    }));
  }

  return mkTree(typeExpr, {});
}

// Get the details of an ADL tree, resolving newtypes and typedefs if requested.
export function resolve(
  adlTree: AdlTree,
  followTypedefs: boolean,
  followNewTypes: boolean
): AdlTree {
  const details = adlTree.details();
  if (details.kind === "typedef" && followTypedefs) {
    return resolve(details.adlTree, followTypedefs, followNewTypes);
  }
  if (details.kind === "newtype" && followNewTypes) {
    return resolve(details.adlTree, followTypedefs, followNewTypes);
  }
  return adlTree;
}

/**
 * Helper function that takes a thunk, and evaluates it only on the first call. Subsequent
 * calls return the previous value
 */
function once<T>(run: () => T): () => T {
  let result: T | null = null;
  return () => {
    if (result === null) {
      result = run();
    }
    return result;
  };
}
