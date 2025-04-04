/* @generated from adl */
import { declResolver, ScopedDecl } from "@adllang/adl-runtime";
import { _AST_MAP as common_db } from "./common/db";
import { _AST_MAP as common_http } from "./common/http";
import { _AST_MAP as common_strings } from "./common/strings";
import { _AST_MAP as common_time } from "./common/time";
import { _AST_MAP as common_ui } from "./common/ui";
import { _AST_MAP as protoapp_apis_ui } from "./protoapp/apis/ui";
import { _AST_MAP as protoapp_db } from "./protoapp/db";
import { _AST_MAP as sys_adlast } from "./sys/adlast";
import { _AST_MAP as sys_annotations } from "./sys/annotations";
import { _AST_MAP as sys_types } from "./sys/types";

export const ADL: { [key: string]: ScopedDecl } = {
  ...common_db,
  ...common_http,
  ...common_strings,
  ...common_time,
  ...common_ui,
  ...protoapp_apis_ui,
  ...protoapp_db,
  ...sys_adlast,
  ...sys_annotations,
  ...sys_types,
};

export const RESOLVER = declResolver(ADL);
