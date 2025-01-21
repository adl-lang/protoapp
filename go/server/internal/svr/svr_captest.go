package svr

import (
	"context"
	"net/http"
	"time"

	"github.com/adl-lang/goadl_common/common/capability"
	http2 "github.com/adl-lang/goadl_common/common/http"
	"github.com/adl-lang/goadl_protoapp/protoapp/apis/captest"
)

type api_svr struct {
	a *a_svr
}
type a_svr struct {
	b *b_svr
}
type b_svr struct {
	c *c_svr
}
type c_svr struct {
}

// A implements captest.ApiRequests_Service.
func (a *api_svr) A(ctx context.Context, req http2.Unit) (captest.A_ApiResp, error) {
	return captest.Make_A_ApiResp_token("A-" + time.Now().Format(time.RFC3339Nano)), nil
}

// GetAccessTokenApi implements captest.ApiRequests_Service.
func (a *api_svr) GetAccessTokenApi() captest.A_Api_Service[captest.A_ApiToken, http2.Unit] {
	return a.a
}

// B implements captest.A_Api_Service.
func (a *a_svr) B(ctx context.Context, cp http2.Unit, req captest.AB) (captest.B_ApiResp, error) {
	return captest.Make_B_ApiResp_token("B-" + time.Now().Format(time.RFC3339Nano)), nil
}

// B implements captest.A_Api_Service.
func (a *a_svr) A2(ctx context.Context, cp http2.Unit) (captest.B_ApiResp, error) {
	return captest.Make_B_ApiResp_token("B-" + time.Now().Format(time.RFC3339Nano)), nil
}

// GetAccessTokenApi implements captest.A_Api_Service.
func (a *a_svr) GetAccessTokenApi() captest.B_Api_Service[captest.B_ApiToken, http2.Unit] {
	return a.b
}

// C implements captest.B_Api_Service.
func (b *b_svr) C(ctx context.Context, cp http2.Unit, req captest.B_ApiToken) (captest.C_ApiResp, error) {
	return captest.Make_C_ApiResp_token("C-" + time.Now().Format(time.RFC3339Nano)), nil
}

// GetAccessTokenApi implements captest.B_Api_Service.
func (b *b_svr) GetAccessTokenApi() captest.C_Api_Service[captest.C_ApiToken, http2.Unit] {
	return b.c
}

// Hello implements captest.C_Api_Service.
func (c *c_svr) Hello(ctx context.Context, cp http2.Unit, req captest.C_ApiToken) (string, error) {
	return "hw!!", nil
}

var _ captest.ApiRequests_Service = &api_svr{}
var _ captest.A_Api_Service[captest.A_ApiToken, http2.Unit] = &a_svr{}
var _ captest.B_Api_Service[captest.B_ApiToken, http2.Unit] = &b_svr{}
var _ captest.C_Api_Service[captest.C_ApiToken, http2.Unit] = &c_svr{}

type a_capr struct{}
type b_capr struct{}
type c_capr struct{}

// Retrieve implements capability.CapabilityRetriever.
func (a *a_capr) Retrieve(req *http.Request) (cap http2.Unit, token captest.A_ApiToken, err error) {
	return http2.Make_Unit(), "", nil
}

// Retrieve implements capability.CapabilityRetriever.
func (b *b_capr) Retrieve(req *http.Request) (cap http2.Unit, token captest.A_ApiToken, err error) {
	return http2.Make_Unit(), "", nil
}

// Retrieve implements capability.CapabilityRetriever.
func (c *c_capr) Retrieve(req *http.Request) (cap http2.Unit, token captest.A_ApiToken, err error) {
	return http2.Make_Unit(), "", nil
}

var (
	_ capability.CapabilityRetriever[captest.A_ApiToken, http2.Unit] = &a_capr{}
	_ capability.CapabilityRetriever[captest.B_ApiToken, http2.Unit] = &b_capr{}
	_ capability.CapabilityRetriever[captest.C_ApiToken, http2.Unit] = &c_capr{}
)
