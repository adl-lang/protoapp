import * as capability from "@/adl-gen/common/capability";
import * as AST from "@/adl-gen/sys/adlast";
import * as ADL from "@adllang/adl-runtime";
import * as CAP from "@/adl-gen/protoapp/apis/captest";

import { RESOLVER } from "@/adl-gen/resolver";
import { texprDoc } from "@/adl-gen/sys/annotations";
import { createUiFactory } from "@/components/forms/factory";
import { createVEditor } from "@/components/forms/model/veditor/adlfactory";
import { createJsonBinding, scopedNamesEqual } from "@adllang/adl-runtime";
import { Api, CalledApi, CapToken, CapTokenInstance, Endpoint, HttpEndpoint, HttpXEndpoint } from "./api-types";


const JB_DOC = createJsonBinding(RESOLVER, texprDoc());
const UI_FACTORY = createUiFactory();

export function getEndpoints<API>(
  resolver: ADL.DeclResolver,
  texpr: ADL.ATypeExpr<API>,
  capTokens: CapToken<unknown>[],
): Endpoint[] {
  return getEndpoints0(resolver, texpr, capTokens, []);
}

export function getEndpoints0<API>(
  resolver: ADL.DeclResolver,
  texpr: ADL.ATypeExpr<API>,
  capTokens: CapToken<unknown>[],
  apis_called: CalledApi<unknown>[],
  token_delivery_method?: CapTokenInstance,
): Endpoint[] {
  if (texpr.value.typeRef.kind !== 'reference') {
    throw new Error("API must be a monomorphic declaration");
  }
  // if (texpr.value.typeRef.kind !== 'reference' || texpr.value.parameters.length != 0) {
  //   throw new Error("API must be a monomorphic declaration");
  // }
  const decl = resolver(texpr.value.typeRef.value);
  if (decl.decl.type_.kind !== 'struct_') {
    throw new Error("API must be a struct");
  }
  const struct = decl.decl.type_.value;

  const endpoints: Endpoint[] = [];
  for (const f of struct.fields) {
    if (f.typeExpr.typeRef.kind === 'reference') {
      if (scopedNamesEqual(f.typeExpr.typeRef.value, capability.snCapabilityApi)) {
        endpoints.push(...getApiEndpoint(resolver, f, capTokens, apis_called))
        // console.log("testname", f.name)
        continue
      }
      if (scopedNamesEqual(f.typeExpr.typeRef.value, capability.snHttpPost)) {
        endpoints.push(getHttpPostEndpoint(resolver, f, apis_called, token_delivery_method))
        // console.log(f.name)
        continue
      }
      if (scopedNamesEqual(f.typeExpr.typeRef.value, capability.snHttpGet)) {
        endpoints.push(getHttpGetEndpoint(resolver, f, apis_called, token_delivery_method))
        // console.log(f.name)
        continue
      }
      const rd = resolver(f.typeExpr.typeRef.value)
      if (rd.decl.type_.kind === 'struct_') {
        // console.log(f.name, f.annotations)
        endpoints.push(getApiStruct(resolver, f))
      }
    }
  }

  // populateFollowups(endpoints, resolver);
  // for (const ep of endpoints){
  //   if(ep.kind !== 'callable'){
  //     continue
  //   }
    // console.log("Namee:", ep.name, "Followup:", ep.followup)
  // }
  return endpoints;
}

// function getFollowups(endpoints: Endpoint[], resolver: ADL.DeclResolver): HttpEndpoint[] {
// }

// function populateFollowups(endpoints: Endpoint[], resolver: ADL.DeclResolver) {
//   const apis = endpoints.filter(ep => ep.kind === "api");
//   // console.log("apis", apis);
//   // const callable = endpoints.filter(ep => ep.kind === "callable")
//   for (const cb of endpoints) {
//     if (cb.kind !== "callable") {
//       continue;
//     }
//     // console.log("1");
//     const tt_tes_cb: AST.TypeExpr[] = getCapTokenTypes(resolver, cb.jsonBindingO.typeExpr);
//     // console.log("tt_tes_cb up of cb", cb.name, tt_tes_cb)
//     for (const api of apis) {
//       for (const ep of api.endpoints) {
//         if (ep.kind !== "callable") {
//           continue;
//         }
//         if (ep.token === undefined) {
//           continue;
//         }
//         const ep_te = ep.apis_called![ep.apis_called!.length - 1].token_type;
//         for (const tt_te_cb of tt_tes_cb) {
//           // console.log("3");
//           if (ADL.typeExprsEqual(ep_te.value, tt_te_cb)) {
//             // console.log("typewhooooo", tt_te_cb);
//             cb.followup.push(ep);
//             console.log("Endpoint followup", cb.followup)
//             break;
//           }
//         }
//       }
//       // if ( api.apis_called.length === 0 ) {
//       //   continue
//       // }
//       // console.log("2")
//       // const api_called = api.apis_called[api.apis_called.length - 1]
//       // console.log("api_called", api_called, "vs ",)
//     }
//     // console.log("follow up of cb", cb.name, cb.followup)
//   }

//   console.log("Populate", endpoints);
// }

export function getCapTokenTypes(
  resolver: ADL.DeclResolver,
  typeExpr: AST.TypeExpr,
): AST.TypeExpr[] {
  const tes: AST.TypeExpr[] = []
  if (typeExpr.typeRef.kind !== 'reference') {
    return tes
  }
  const sd = RESOLVER(typeExpr.typeRef.value);
  switch (sd.decl.type_.kind) {
    case "struct_":
      /// TODO complete
      console.error("not implmented")
      return tes
    case "type_":
      /// TODO complete
      console.error("not implmented")
      return tes
    case "newtype_":
      /// TODO complete
      console.error("not implmented")
      return tes
    case "union_": {
      const union = sd.decl.type_.value;
      for (const fd of union.fields) {
        for (const ann of fd.annotations) {
          const sd0 = RESOLVER(ann.key)
          if (sd0.decl.type_.kind !== 'type_' && sd0.decl.type_.kind !== 'newtype_') {
            continue
          }
          if (sd0.decl.type_.value.typeExpr.typeRef.kind !== "reference") {
            continue
          }
          if (!scopedNamesEqual(sd0.decl.type_.value.typeExpr.typeRef.value, capability.snCapabilityToken)) {
            continue
          }
          tes.push(sd0.decl.type_.value.typeExpr.parameters[0])
          // console.log("Pushed result", sd0.decl.type_.value.typeExpr.parameters[0])
          continue
        }
      }
    }
  }
  return tes
}

export function isArrayEqual(a: CalledApi<unknown>[], b: CalledApi<unknown>[]) {
  if (a.length !== b.length) {
    return false
  }
  for (let i = 0; i < a.length; i++) {
    if (!ADL.typeExprsEqual(a[i].token_type.value, b[i].token_type.value)) {
      return false
    }
    if (a[i].value !== b[i].value) {
      return false
    }
  }
  return true
}

// export function getCallablesForApiEndpoint<C, S, V>(
//   resolver: ADL.DeclResolver,
//   // field: AST.Field,
//   texpr: ADL.ATypeExpr<C>,
//   // capTokens: CapToken<unknown>[],
//   // apis_called: CalledApi<unknown>[],
//   // endpoint: HttpEndpoint,
// ): HttpEndpoint[] {
//   const filtered_endpoints: HttpEndpoint[] = []
//   // if (endpoint.jsonBindingI.typeExpr.typeRef.kind === 'reference') {
//   const endpoints = getEndpoints(resolver, texpr, [])
//   //}

//   for (const ep of endpoints) {
//     if (ep.kind == 'callable') {
//       filtered_endpoints.push(ep)
//     }
//   }
//   return filtered_endpoints;
//   //Make a type expression here
//   // console.log("param", field.typeExpr.parameters[0])
//   // const endpoints = getEndpoints(resolver, )
// }

function getApiEndpoint<C, S, V>(
  resolver: ADL.DeclResolver,
  field: AST.Field,
  capTokens: CapToken<unknown>[],
  apis_called: CalledApi<unknown>[],
): Api<C>[] {
  if (field.default.kind !== 'just') {
    throw new Error("API endpoint must have a default value");
  }
  const apis: Api<C>[] = []
  for (const ct of capTokens) {
    if (!ADL.typeExprsEqual(ct.type, field.typeExpr.parameters[0])) {
      continue
    }
    if (!isArrayEqual(apis_called, ct.apis_called)) {
      continue
    }
    const texprC = ADL.makeATypeExpr<C>(field.typeExpr.parameters[0]);
    const texprS = ADL.makeATypeExpr<S>(field.typeExpr.parameters[1]);
    const texprV = ADL.makeATypeExpr<V>(field.typeExpr.parameters[2]);

    const jb = createJsonBinding(resolver, capability.texprCapabilityApi(texprC, texprS, texprV));
    const capApi = jb.fromJson(field.default.value);
    const docString = ADL.getAnnotation(JB_DOC, field.annotations) || "";
    const apis_called0 = [...ct.apis_called, { token_type: texprC, value: ct.token_value }]
    const token: CapTokenInstance = {
      delivery_method: capApi.token_delivery,
      value: ct.token_value,
    }
    apis.push({
      kind: 'api',
      name: capApi.name === "" ? field.name : capApi.name,
      typetoken: texprC,
      docString,
      endpoints: getEndpoints0(resolver, texprV, capTokens, apis_called0, token),
      token_value: ct.token_value as C,
      apis_called: ct.apis_called,
    })
  }
  return apis
}

function getHttpPostEndpoint<I, O>(
  resolver: ADL.DeclResolver,
  field: AST.Field,
  apis_called: CalledApi<unknown>[],
  token?: CapTokenInstance,
): HttpXEndpoint<I, O> {
  if (field.default.kind !== 'just') {
    throw new Error("API endpoint must have a default value");
  }
  let texprI = ADL.makeATypeExpr<I>(field.typeExpr.parameters[0]);
  if (token !== undefined) {
    texprI = capability.texprCapCall(apis_called[apis_called.length - 1].token_type, texprI)
  }
  const texprO = ADL.makeATypeExpr<O>(field.typeExpr.parameters[1]);

  const jb = createJsonBinding(resolver, capability.texprHttpPost(texprI, texprO));
  const httpPost = jb.fromJson(field.default.value);

  const veditorI = createVEditor(texprI, resolver, UI_FACTORY);
  const veditorO = createVEditor(texprO, resolver, UI_FACTORY);
  const jsonBindingI = createJsonBinding(resolver, texprI);
  const jsonBindingO = createJsonBinding(resolver, texprO);

  const docString = ADL.getAnnotation(JB_DOC, field.annotations) || "";
  // const endpoints = getEndpoints0(resolver, { value: jsonBindingI.typeExpr }, [],apis_called)
  // console.log("Endpoints gotten", endpoints)
  return {
    kind: 'callable',
    method: 'post',
    name: field.name,
    path: httpPost.path,
    docString,
    // security: httpPost.security,
    veditorI,
    veditorO,
    jsonBindingI,
    jsonBindingO,
    apis_called,
    token,
    // followup: []
  }
}

function getHttpGetEndpoint<O>(
  resolver: ADL.DeclResolver,
  field: AST.Field,
  apis_called: CalledApi<unknown>[],
  token?: CapTokenInstance,
): HttpXEndpoint<null, O> {
  if (field.default.kind !== 'just') {
    throw new Error("API endpoint must have a default value");
  }
  let texprI = ADL.texprVoid();
  if (token !== undefined) {
    texprI = capability.texprCapCall(apis_called[apis_called.length - 1].token_type, texprI)
  }

  const texprO = ADL.makeATypeExpr<O>(field.typeExpr.parameters[0]);

  const jb = createJsonBinding(resolver, capability.texprHttpGet(texprO));
  const httpGet = jb.fromJson(field.default.value);

  const veditorI = createVEditor(texprI, resolver, UI_FACTORY);
  const veditorO = createVEditor(texprO, resolver, UI_FACTORY);
  const jsonBindingI = createJsonBinding(resolver, texprI);
  const jsonBindingO = createJsonBinding(resolver, texprO);


  // const endpoints = getEndpoints0(resolver, { value: jsonBindingI.typeExpr }, [],apis_called)
  // console.log("Endpoints gotten GET", endpoints)
  const docString = ADL.getAnnotation(JB_DOC, field.annotations) || "";
  return {
    kind: 'callable',
    method: 'get',
    name: field.name,
    path: httpGet.path,
    docString,
    // security: httpGet.security,
    veditorI,
    veditorO,
    jsonBindingI,
    jsonBindingO,
    apis_called,
    token,
    // followup: []
  }
}

// const JB_DOC = createJsonBinding(RESOLVER, texprDoc());
// const UI_FACTORY = createUiFactory();



function getApiStruct<C>(resolver: ADL.DeclResolver,
  field: AST.Field): Api<C> {
  const docString = ADL.getAnnotation(JB_DOC, field.annotations) || "";
  return {
    kind: "api",
    docString,
    apis_called: [],
    endpoints: getEndpoints(resolver, { value: field.typeExpr }, []),
    name: field.name,
  }
}
