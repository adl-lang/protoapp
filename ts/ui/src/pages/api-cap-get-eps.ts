import * as capability from "@/adl-gen/common/capability";
import * as AST from "@/adl-gen/sys/adlast";
import * as ADL from "@adllang/adl-runtime";

import { RESOLVER } from "@/adl-gen/resolver";
import { texprDoc } from "@/adl-gen/sys/annotations";
import { createUiFactory } from "@/components/forms/factory";
import { createVEditor } from "@/components/forms/model/veditor/adlfactory";
import { createJsonBinding, scopedNamesEqual } from "@adllang/adl-runtime";
import { Api, CalledApi, CapToken, CapTokenInstance, Endpoint, HttpXEndpoint } from "./api-types";

export function getEndpoints<API>(
  resolver: ADL.DeclResolver,
  texpr: ADL.ATypeExpr<API>,
  capTokens: CapToken<unknown>[],
): Endpoint[] {
  return getEndpoints0(resolver, texpr, capTokens, []);
}

function getEndpoints0<API>(
  resolver: ADL.DeclResolver,
  texpr: ADL.ATypeExpr<API>,
  capTokens: CapToken<unknown>[],
  apis_called: CalledApi<unknown>[],
  token?: CapTokenInstance<unknown>,
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
      }
      if (scopedNamesEqual(f.typeExpr.typeRef.value, capability.snHttpPost)) {
        endpoints.push(getHttpPostEndpoint(resolver, f, apis_called, token))
      }
      if (scopedNamesEqual(f.typeExpr.typeRef.value, capability.snHttpGet)) {
        endpoints.push(getHttpGetEndpoint(resolver, f, apis_called, token))
      }
    }
  }
  return endpoints;
}

function isArrayEqual(a: CalledApi<unknown>[], b: CalledApi<unknown>[]) {
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
    const token: CapTokenInstance<C> = {
      delivery_method: capApi.token_delivery,
      value: ct.token_value as C,
      token_type: texprC,
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
  token?: CapTokenInstance<unknown>,
): HttpXEndpoint<I, O> {
  if (field.default.kind !== 'just') {
    throw new Error("API endpoint must have a default value");
  }
  let texprI = ADL.makeATypeExpr<I>(field.typeExpr.parameters[0]);
  if (token !== undefined) {
    texprI = capability.texprCapCall(apis_called[apis_called.length-1].token_type, texprI)
  }
  const texprO = ADL.makeATypeExpr<O>(field.typeExpr.parameters[1]);

  const jb = createJsonBinding(resolver, capability.texprHttpPost(texprI, texprO));
  const httpPost = jb.fromJson(field.default.value);

  const veditorI = createVEditor(texprI, resolver, UI_FACTORY);
  const veditorO = createVEditor(texprO, resolver, UI_FACTORY);
  const jsonBindingI = createJsonBinding(resolver, texprI);
  const jsonBindingO = createJsonBinding(resolver, texprO);

  const docString = ADL.getAnnotation(JB_DOC, field.annotations) || "";
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
  }
}

function getHttpGetEndpoint<O>(
  resolver: ADL.DeclResolver,
  field: AST.Field,
  apis_called: CalledApi<unknown>[],
  token?: CapTokenInstance<unknown>,
): HttpXEndpoint<null, O> {
  if (field.default.kind !== 'just') {
    throw new Error("API endpoint must have a default value");
  }
  let texprI = ADL.texprVoid();
  if (token !== undefined) {
    texprI = capability.texprCapCall(apis_called[apis_called.length-1].token_type, texprI)
    token.value = {token: token.value, payload: undefined}
  }

  const texprO = ADL.makeATypeExpr<O>(field.typeExpr.parameters[0]);

  const jb = createJsonBinding(resolver, capability.texprHttpGet(texprO));
  const httpGet = jb.fromJson(field.default.value);

  const veditorI = createVEditor(texprI, resolver, UI_FACTORY);
  const veditorO = createVEditor(texprO, resolver, UI_FACTORY);
  const jsonBindingI = createJsonBinding(resolver, texprI);
  const jsonBindingO = createJsonBinding(resolver, texprO);

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
  }
}

const JB_DOC = createJsonBinding(RESOLVER, texprDoc());
const UI_FACTORY = createUiFactory();