import { HttpFetch } from "./http";
import * as API from "@protoapp/adl/protoapp/apis/ui";
import { endpoints, ServiceBase } from "./service-base";
import { RESOLVER } from "@protoapp/adl/resolver";

const web = endpoints(RESOLVER, API.texprWebApi(), API.makeWebApi({}));

export class Service extends ServiceBase {
  constructor(http: HttpFetch, baseUrl: string) {
    super(http, baseUrl, RESOLVER);
  }

  login = this.mkReqFn(web.login);
  refresh = this.mkReqFn(web.refresh);
  logout = this.mkReqFn(web.logout);
}
