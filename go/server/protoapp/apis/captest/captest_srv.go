// Code generated by goadlc v3 - DO NOT EDIT.
package captest

import (
	"context"
	"github.com/adl-lang/goadl_common/common/capability"
	http2 "github.com/adl-lang/goadl_common/common/http"
	"net/http"
)

type ApiRequests_Service interface {
	A(ctx context.Context, req http2.Unit) (A_ApiResp, error)
	GetAccessTokenApi() A_Api_Service[A_ApiToken, http2.Unit]
}

func Register_ApiRequests(
	mux *http.ServeMux,
	srv ApiRequests_Service,
	accesstokenapi_capr capability.CapabilityRetriever[A_ApiToken, http2.Unit],
	accesstokenapi_accesstokenapi_capr capability.CapabilityRetriever[B_ApiToken, http2.Unit],
	accesstokenapi_accesstokenapi_accesstokenapi_capr capability.CapabilityRetriever[C_ApiToken, http2.Unit],
) {
	reqs := Make_ApiRequests()
	capability.AdlPost(mux, reqs.A, srv.A)
	Register_A_Api(
		mux,
		srv.GetAccessTokenApi(),
		reqs.AccessTokenApi,
		accesstokenapi_capr,
		accesstokenapi_accesstokenapi_capr,
		accesstokenapi_accesstokenapi_accesstokenapi_capr,
	)
}

type A_Api_Service[C any, S any] interface {
	B(ctx context.Context, cp S, req A_ApiToken) (B_ApiResp, error)
	GetAccessTokenApi() B_Api_Service[B_ApiToken, http2.Unit]
}

func Register_A_Api[C any, S any](
	mux *http.ServeMux,
	srv A_Api_Service[C, S],
	api capability.CapabilityApi[C, S, A_Api],
	capr capability.CapabilityRetriever[C, S],
	accesstokenapi_capr capability.CapabilityRetriever[B_ApiToken, http2.Unit],
	accesstokenapi_accesstokenapi_capr capability.CapabilityRetriever[C_ApiToken, http2.Unit],
) {
	reqs := api.Service
	capability.AdlCapPost(mux, reqs.B, srv.B, api, capr)
	Register_B_Api(
		mux,
		srv.GetAccessTokenApi(),
		reqs.AccessTokenApi,
		accesstokenapi_capr,
		accesstokenapi_accesstokenapi_capr,
	)
}

type B_Api_Service[C any, S any] interface {
	C(ctx context.Context, cp S, req B_ApiToken) (C_ApiResp, error)
	GetAccessTokenApi() C_Api_Service[C_ApiToken, http2.Unit]
}

func Register_B_Api[C any, S any](
	mux *http.ServeMux,
	srv B_Api_Service[C, S],
	api capability.CapabilityApi[C, S, B_Api],
	capr capability.CapabilityRetriever[C, S],
	accesstokenapi_capr capability.CapabilityRetriever[C_ApiToken, http2.Unit],
) {
	reqs := api.Service
	capability.AdlCapPost(mux, reqs.C, srv.C, api, capr)
	Register_C_Api(
		mux,
		srv.GetAccessTokenApi(),
		reqs.AccessTokenApi,
		accesstokenapi_capr,
	)
}

type C_Api_Service[C any, S any] interface {
	Hello(ctx context.Context, cp S, req C_ApiToken) (string, error)
}

func Register_C_Api[C any, S any](
	mux *http.ServeMux,
	srv C_Api_Service[C, S],
	api capability.CapabilityApi[C, S, C_Api],
	capr capability.CapabilityRetriever[C, S],
) {
	reqs := api.Service
	capability.AdlCapPost(mux, reqs.Hello, srv.Hello, api, capr)
}
