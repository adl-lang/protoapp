import { HttpFetch } from "./http";
import { endpoints, ServiceBase } from "./service-base";

import * as API from "@protoapp/adl/protoapp/apis/ui";
import { RESOLVER } from "@protoapp/adl/resolver";

const api = endpoints(RESOLVER, API.texprApiRequests(), API.makeApiRequests({}));
const web = endpoints(RESOLVER, API.texprWebRequests(), API.makeWebRequests({}));

export class Service extends ServiceBase {
  constructor(http: HttpFetch, baseUrl: string) {
    super(http, baseUrl, RESOLVER);
  }

  // public api
  login = this.mkReqFn(web.login);
  refresh = this.mkReqFn(web.refresh);
  logout = this.mkReqFn(web.logout);

  // token protected api
  whoAmI = this.mkAuthReqFn(api.who_am_i);
  newMessage = this.mkAuthReqFn(api.new_message);
  recentMessages = this.mkAuthReqFn(api.recent_messages);
}
