package capability

import (
	"context"
	"expvar"
	"fmt"
	"net/http"
	"strings"
	"time"

	goadl "github.com/adl-lang/goadl_rt/v3"
	"github.com/adl-lang/goadl_rt/v3/sys/adlast"
)

type CapabilityRetriever[C any, S any] interface {
	// note 'token C' is not needed by the caller, included to make this api type-safer
	Retrieve(req *http.Request) (cap S, token C, err error)
}

var endpoints *expvar.Map = expvar.NewMap("endpoints")

type CONTEXT_KEY string

const (
	REQ_KEY  CONTEXT_KEY = "req"
	RESP_KEY CONTEXT_KEY = "resp"
)

func AdlPost[I any, O any](
	serveMux *http.ServeMux,
	endpoint HttpPost[I, O],
	fn func(context.Context, I) (O, error)) func(http.ResponseWriter, *http.Request,
) {
	req_dec := goadl.CreateJsonDecodeBinding(endpoint.ReqType, goadl.RESOLVER)
	resp_enc := goadl.CreateJsonEncodeBinding(endpoint.RespType, goadl.RESOLVER)
	endpoints.Set(endpoint.Path, &expvar.String{})
	fmt.Printf("registering post %s\n", endpoint.Path)
	serveMux.HandleFunc(endpoint.Path, func(w http.ResponseWriter, r *http.Request) {
		fmt.Printf(">> post - %s\n", r.URL.Path)
		var (
			err  error
			req  I
			resp O
		)
		now := time.Now()
		status := http.StatusOK
		defer func() {
			duration := time.Since(now).Round(time.Microsecond)
			if err != nil {
				fmt.Printf("<< post - %d %s took:%v error:%v\n", status, r.URL.Path, duration, err)
			} else {
				fmt.Printf("<< post - %d %s took:%v\n", status, r.URL.Path, duration)
			}
		}()
		err = req_dec.Decode(r.Body, &req)
		if err != nil {
			status = http.StatusUnprocessableEntity
			http.Error(w, fmt.Sprintf("error decoding body : %v", err), http.StatusUnprocessableEntity)
			return
		}
		resp, err = fn(
			context.WithValue(context.WithValue(r.Context(), REQ_KEY, r), RESP_KEY, w),
			req,
		)
		if err != nil {
			status = http.StatusInternalServerError
			http.Error(w, fmt.Sprintf("error : %v", err), http.StatusInternalServerError)
			return
		}
		err = resp_enc.Encode(w, resp)
		if err != nil {
			status = http.StatusUnprocessableEntity
			http.Error(w, fmt.Sprintf("error encoding body : %v", err), http.StatusUnprocessableEntity)
			return
		}
	})
	return nil
}

func AdlGet[O any](
	serveMux *http.ServeMux,
	endpoint HttpGet[O],
	fn func(context.Context) (O, error)) func(http.ResponseWriter, *http.Request,
) {
	resp_enc := goadl.CreateJsonEncodeBinding(endpoint.RespType, goadl.RESOLVER)
	endpoints.Set(endpoint.Path, &expvar.String{})
	fmt.Printf("registering get %s\n", endpoint.Path)
	serveMux.HandleFunc(endpoint.Path, func(w http.ResponseWriter, r *http.Request) {
		fmt.Printf(">> get - %s\n", r.URL.Path)
		var (
			err  error
			resp O
		)
		status := http.StatusOK
		now := time.Now()
		defer func() {
			duration := time.Since(now).Round(time.Microsecond)
			if err != nil {
				fmt.Printf("<< get - %d %s took:%v error:%v\n", status, r.URL.Path, duration, err)
			} else {
				fmt.Printf("<< get - %d %s took:%v\n", status, r.URL.Path, duration)
			}
		}()
		resp, err = fn(
			context.WithValue(context.WithValue(r.Context(), REQ_KEY, r), RESP_KEY, w),
		)
		if err != nil {
			status = http.StatusInternalServerError
			http.Error(w, fmt.Sprintf("error : %v", err), http.StatusInternalServerError)
			return
		}
		err = resp_enc.Encode(w, resp)
		if err != nil {
			status = http.StatusUnprocessableEntity
			http.Error(w, fmt.Sprintf("error encoding body : %v", err), http.StatusUnprocessableEntity)
			return
		}
	})
	return nil
}

func AdlCapPost[I any, O any, C any, S any, V any](
	serveMux *http.ServeMux,
	endpoint HttpPost[I, O],
	fn func(context.Context, S, I) (O, error),
	api CapabilityApi[C, S, V],
	capf CapabilityRetriever[C, S],
) func(http.ResponseWriter, *http.Request) {
	req_dec := goadl.CreateJsonDecodeBinding(endpoint.ReqType, goadl.RESOLVER)
	resp_enc := goadl.CreateJsonEncodeBinding(endpoint.RespType, goadl.RESOLVER)
	path := endpoint.Path
	if api.Service_prefix != "" {
		path = "/" + api.Service_prefix + "/" + path
		path = strings.ReplaceAll(path, "//", "/")
	}
	endpoints.Set(path, &expvar.String{})
	fmt.Printf("registering post cap %s\n", path)
	serveMux.HandleFunc(path, func(w http.ResponseWriter, r *http.Request) {
		var (
			cap  S
			err  error
			req  I
			resp O
		)
		status := http.StatusOK
		fmt.Printf(">> post cap - %s\n", r.URL.Path)
		now := time.Now()
		defer func() {
			duration := time.Since(now).Round(time.Microsecond)
			if err != nil {
				fmt.Printf("<< post cap - %d %s took:%v error:%v\n", status, r.URL.Path, duration, err)
			} else {
				fmt.Printf("<< post cap - %d %s took:%v\n", status, r.URL.Path, duration)
			}
		}()
		cap, _, err = capf.Retrieve(r)
		if err != nil {
			status = http.StatusUnauthorized
			http.Error(w, fmt.Sprintf("%v", err), http.StatusUnauthorized)
			return
		}
		err = req_dec.Decode(r.Body, &req)
		if err != nil {
			status = http.StatusUnprocessableEntity
			http.Error(w, fmt.Sprintf("error decoding body : %v", err), http.StatusUnprocessableEntity)
			return
		}
		resp, err = fn(
			context.WithValue(context.WithValue(r.Context(), REQ_KEY, r), RESP_KEY, w),
			cap,
			req,
		)
		if err != nil {
			status = http.StatusInternalServerError
			http.Error(w, fmt.Sprintf("error : %v", err), http.StatusInternalServerError)
			return
		}
		err = resp_enc.Encode(w, resp)
		if err != nil {
			status = http.StatusUnprocessableEntity
			http.Error(w, fmt.Sprintf("error encoding body : %v", err), http.StatusUnprocessableEntity)
			return
		}
	})
	return nil
}

var tejb goadl.JsonEncodeBinder[adlast.TypeExpr] = goadl.CreateJsonEncodeBinding(
	goadl.Texpr_TypeExpr(),
	goadl.RESOLVER,
)

func getinfo(te adlast.TypeExpr) func() any {
	return func() any {
		return te
		// buf := bytes.Buffer{}
		// tejb.Encode(&buf, te)
		// return buf.String()
	}
}

func AdlCapGet[O any, C any, S any, V any](
	serveMux *http.ServeMux,
	endpoint HttpGet[O],
	fn func(context.Context, S) (O, error),
	api CapabilityApi[C, S, V],
	capf CapabilityRetriever[C, S],
) func(http.ResponseWriter, *http.Request) {
	resp_enc := goadl.CreateJsonEncodeBinding(endpoint.RespType, goadl.RESOLVER)
	path := endpoint.Path
	if api.Service_prefix != "" {
		path = "/" + api.Service_prefix + "/" + path
		path = strings.ReplaceAll(path, "//", "/")
	}
	// info := &expvar.String{}
	// buf := bytes.Buffer{}
	// tejb.Encode(&buf, endpoint.RespType.Value)
	// info.Set(buf.String())
	// endpoints.Set(path, info)
	// endpoints.Set(path, &expvar.String{})
	endpoints.Set(path, expvar.Func(getinfo(endpoint.RespType.Value)))
	fmt.Printf("registering get cap %s\n", path)
	serveMux.HandleFunc(path, func(w http.ResponseWriter, r *http.Request) {
		var (
			cap  S
			err  error
			resp O
		)
		now := time.Now()
		status := http.StatusOK
		fmt.Printf(">> get cap - %s\n", r.URL.Path)
		defer func() {
			duration := time.Since(now).Round(time.Microsecond)
			if err != nil {
				fmt.Printf("<< get cap - %d %s took:%v error:%v\n", status, r.URL.Path, duration, err)
			} else {
				fmt.Printf("<< get cap - %d %s took:%v\n", status, r.URL.Path, duration)
			}
		}()
		cap, _, err = capf.Retrieve(r)
		if err != nil {
			status = http.StatusUnauthorized
			http.Error(w, fmt.Sprintf("%v", err), http.StatusUnauthorized)
			return
		}
		resp, err = fn(
			context.WithValue(context.WithValue(r.Context(), REQ_KEY, r), RESP_KEY, w),
			cap,
		)
		if err != nil {
			status = http.StatusInternalServerError
			http.Error(w, fmt.Sprintf("error : %v", err), http.StatusInternalServerError)
			return
		}
		err = resp_enc.Encode(w, resp)
		if err != nil {
			status = http.StatusUnprocessableEntity
			http.Error(w, fmt.Sprintf("error encoding body : %v", err), http.StatusUnprocessableEntity)
			return
		}
	})
	return nil
}

func CORS(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Add("Access-Control-Allow-Origin", "*")
		w.Header().Add("Access-Control-Allow-Credentials", "true")
		w.Header().Add("Access-Control-Allow-Headers",
			strings.Join([]string{
				"Content-Type",
				"Content-Length",
				"Accept-Encoding",
				"X-CSRF-Token",
				"Authorization",
				"accept",
				"origin",
				"Cache-Control",
				"X-Requested-With",
				"Access-Control-Allow-Headers",
			}, ", "))
		w.Header().Add("Access-Control-Allow-Methods",
			strings.Join([]string{
				"POST",
				"GET",
				"OPTIONS",
				"PUT",
				"DELETE",
			}, ", "))

		if r.Method == "OPTIONS" {
			http.Error(w, "No Content", http.StatusNoContent)
			return
		}

		next(w, r)
	}
}

func AllowIndex(allowIndex bool, h http.Handler) http.Handler {
	if allowIndex {
		return h
	}
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if strings.HasSuffix(r.URL.Path, "/") {
			http.NotFound(w, r)
			return
		}
		h.ServeHTTP(w, r)
	})
}
