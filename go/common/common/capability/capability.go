// Code generated by goadlc v3 - DO NOT EDIT.
package capability

import (
	"github.com/adl-lang/goadl_common/common/http"
	"github.com/adl-lang/goadl_rt/v3/sys/adlast"
)

type CapabilityApi[C any, S any, V any] struct {
	_CapabilityApi[C, S, V]
}

type _CapabilityApi[C any, S any, V any] struct {
	Token          adlast.ATypeExpr[C] `json:"token"`
	Cap            adlast.ATypeExpr[S] `json:"cap"`
	Service_prefix string              `json:"service_prefix"`
	Service        V                   `json:"service"`
}

func MakeAll_CapabilityApi[C any, S any, V any](
	token adlast.ATypeExpr[C],
	cap adlast.ATypeExpr[S],
	service_prefix string,
	service V,
) CapabilityApi[C, S, V] {
	return CapabilityApi[C, S, V]{
		_CapabilityApi[C, S, V]{
			Token:          token,
			Cap:            cap,
			Service_prefix: service_prefix,
			Service:        service,
		},
	}
}

// struct CapabilityApi contains at least one TypeToken, not generating Make_ funcs

type CapabilityToken[S any] struct {
	_CapabilityToken[S]
}

type _CapabilityToken[S any] struct {
	Cap adlast.ATypeExpr[S] `json:"cap"`
}

func MakeAll_CapabilityToken[S any](
	cap adlast.ATypeExpr[S],
) CapabilityToken[S] {
	return CapabilityToken[S]{
		_CapabilityToken[S]{
			Cap: cap,
		},
	}
}

// struct CapabilityToken contains at least one TypeToken, not generating Make_ funcs

type HttpGet[O any] struct {
	_HttpGet[O]
}

type _HttpGet[O any] struct {
	Path      string              `json:"path"`
	RateLimit *http.HttpRateLimit `json:"rateLimit"`
	RespType  adlast.ATypeExpr[O] `json:"respType"`
}

func MakeAll_HttpGet[O any](
	path string,
	ratelimit *http.HttpRateLimit,
	resptype adlast.ATypeExpr[O],
) HttpGet[O] {
	return HttpGet[O]{
		_HttpGet[O]{
			Path:      path,
			RateLimit: ratelimit,
			RespType:  resptype,
		},
	}
}

// struct HttpGet contains at least one TypeToken, not generating Make_ funcs

type HttpPost[I any, O any] struct {
	_HttpPost[I, O]
}

type _HttpPost[I any, O any] struct {
	Path      string              `json:"path"`
	RateLimit *http.HttpRateLimit `json:"rateLimit"`
	ReqType   adlast.ATypeExpr[I] `json:"reqType"`
	RespType  adlast.ATypeExpr[O] `json:"respType"`
}

func MakeAll_HttpPost[I any, O any](
	path string,
	ratelimit *http.HttpRateLimit,
	reqtype adlast.ATypeExpr[I],
	resptype adlast.ATypeExpr[O],
) HttpPost[I, O] {
	return HttpPost[I, O]{
		_HttpPost[I, O]{
			Path:      path,
			RateLimit: ratelimit,
			ReqType:   reqtype,
			RespType:  resptype,
		},
	}
}

// struct HttpPost contains at least one TypeToken, not generating Make_ funcs
