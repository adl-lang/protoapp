import { HttpFetch } from "./http";
import * as API from "@/adl-gen/protoapp/apis/ui";
import { ServiceBase } from "./service-base";
import { RESOLVER } from "../adl-gen/resolver";


const api = API.makeApiRequests({});

export class Service extends ServiceBase {
  constructor(
    http: HttpFetch,
    baseUrl: string,
  ) {
    super(http, baseUrl, RESOLVER);
  }

  login = this.mkReqFn(api.login);
  refresh = this.mkReqFn(api.refresh);
  logout = this.mkReqFn(api.logout);
  new_message = this.mkAuthReqFn(api.new_message);
  recent_messages = this.mkAuthReqFn(api.recent_messages);
  who_am_i = this.mkAuthReqFn(api.who_am_i);
};
