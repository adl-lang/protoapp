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

  login = this.mkPostFn(api.login);
  refresh = this.mkPostFn(api.refresh);
  logout = this.mkPostFn(api.logout);
  new_message = this.mkAuthPostFn(api.new_message);
  recent_messages = this.mkAuthGetFn(api.recent_messages);
  who_am_i = this.mkAuthGetFn(api.who_am_i);
};
