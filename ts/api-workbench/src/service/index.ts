import { HttpFetch } from "./http";
import * as API from "@protoapp/adl/protoapp/apis/ui";
import { ServiceBase } from "./service-base";
import { RESOLVER } from "@protoapp/adl/resolver";

const api = API.makeApiRequests({});
const web = API.makeWebRequests({});

export class Service extends ServiceBase {
  constructor(http: HttpFetch, baseUrl: string) {
    super(http, baseUrl, RESOLVER);
  }

  login = this.mkReqFn(web.login);
  refresh = this.mkReqFn(web.refresh);
  logout = this.mkReqFn(web.logout);
}
