// Code generated by goadlc v3 - DO NOT EDIT.
package cap

import (
	"context"
	"github.com/adl-lang/goadl_common/common/capability"
	http2 "github.com/adl-lang/goadl_common/common/http"
	"github.com/adl-lang/goadl_protoapp/protoapp/apis/types"
	"github.com/adl-lang/goadl_protoapp/protoapp/db"
	"net/http"
)

type ApiRequests_Service interface {
	Healthy(ctx context.Context) (http2.Unit, error)
	Ping(ctx context.Context, req http2.Unit) (http2.Unit, error)
	Login(ctx context.Context, req types.LoginReq) (types.LoginResp, error)
	Logout(ctx context.Context, req http2.Unit) (http2.Unit, error)
	GetAccessTokenApi() AccessApiRequests_Service[AccessToken, Capability]
	GetRefreshTokenApi() RefreshApiRequests_Service[RefreshToken, http2.Unit]
	GetUserApi() UserApiRequests_Service[AdminAccessToken, Capability]
}

func Register_ApiRequests(
	mux *http.ServeMux,
	srv ApiRequests_Service,
	accesstokenapi_capr capability.CapabilityRetriever[AccessToken, Capability],
	refreshtokenapi_capr capability.CapabilityRetriever[RefreshToken, http2.Unit],
	userapi_capr capability.CapabilityRetriever[AdminAccessToken, Capability],
) {
	reqs := Make_ApiRequests()
	capability.AdlGet(mux, reqs.Healthy, srv.Healthy)
	capability.AdlPost(mux, reqs.Ping, srv.Ping)
	capability.AdlPost(mux, reqs.Login, srv.Login)
	capability.AdlPost(mux, reqs.Logout, srv.Logout)
	Register_AccessApiRequests(
		mux,
		srv.GetAccessTokenApi(),
		reqs.AccessTokenApi,
		accesstokenapi_capr,
	)
	Register_RefreshApiRequests(
		mux,
		srv.GetRefreshTokenApi(),
		reqs.RefreshTokenApi,
		refreshtokenapi_capr,
	)
	Register_UserApiRequests(
		mux,
		srv.GetUserApi(),
		reqs.UserApi,
		userapi_capr,
	)
}

type AccessApiRequests_Service[C any, S any] interface {
	NewMessage(ctx context.Context, cp S, req types.NewMessageReq) (db.MessageId, error)
	RecentMessages(ctx context.Context, cp S, req types.RecentMessagesReq) (types.Paginated[types.Message], error)
	Who_am_i(ctx context.Context, cp S) (types.UserWithId, error)
}

func Register_AccessApiRequests[C any, S any](
	mux *http.ServeMux,
	srv AccessApiRequests_Service[C, S],
	api capability.CapabilityApi[C, S, AccessApiRequests],
	capr capability.CapabilityRetriever[C, S],
) {
	reqs := api.Service
	capability.AdlCapPost(mux, reqs.NewMessage, srv.NewMessage, api, capr)
	capability.AdlCapPost(mux, reqs.RecentMessages, srv.RecentMessages, api, capr)
	capability.AdlCapGet(mux, reqs.Who_am_i, srv.Who_am_i, api, capr)
}

type RefreshApiRequests_Service[C any, S any] interface {
	Refresh(ctx context.Context, cp S, req types.RefreshReq) (types.RefreshResp, error)
}

func Register_RefreshApiRequests[C any, S any](
	mux *http.ServeMux,
	srv RefreshApiRequests_Service[C, S],
	api capability.CapabilityApi[C, S, RefreshApiRequests],
	capr capability.CapabilityRetriever[C, S],
) {
	reqs := api.Service
	capability.AdlCapPost(mux, reqs.Refresh, srv.Refresh, api, capr)
}

type UserApiRequests_Service[C any, S any] interface {
	Create_user(ctx context.Context, cp S, req types.UserDetails) (db.AppUserId, error)
	Update_user(ctx context.Context, cp S, req types.WithId[db.AppUserId, types.UserDetails]) (http2.Unit, error)
	Query_users(ctx context.Context, cp S, req types.QueryUsersReq) (types.Paginated[types.UserWithId], error)
}

func Register_UserApiRequests[C any, S any](
	mux *http.ServeMux,
	srv UserApiRequests_Service[C, S],
	api capability.CapabilityApi[C, S, UserApiRequests],
	capr capability.CapabilityRetriever[C, S],
) {
	reqs := api.Service
	capability.AdlCapPost(mux, reqs.Create_user, srv.Create_user, api, capr)
	capability.AdlCapPost(mux, reqs.Update_user, srv.Update_user, api, capr)
	capability.AdlCapPost(mux, reqs.Query_users, srv.Query_users, api, capr)
}
