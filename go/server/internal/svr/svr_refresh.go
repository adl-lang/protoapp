package svr

import (
	"context"
	"fmt"
	"net/http"
	"os"

	"github.com/adl-lang/goadl_common/common/capability"
	http2 "github.com/adl-lang/goadl_common/common/http"
	"github.com/adl-lang/goadl_common/common/sql/postgres"
	"github.com/adl-lang/goadl_protoapp/protoapp/apis/cap"
	"github.com/adl-lang/goadl_protoapp/protoapp/apis/types"
	"github.com/adl-lang/goadl_protoapp/protoapp/config/server"
	db2 "github.com/adl-lang/goadl_protoapp/protoapp/db"

	"github.com/jmoiron/sqlx"
)

type refreshSvr struct {
	db              *sqlx.DB
	refresh_tokener server.RefreshTokener
	access_tokener  server.AccessTokener
}

// Refresh implements cap.RefreshApiRequests_Service.
func (rs *refreshSvr) Refresh(ctx context.Context, cp http2.Unit, req types.RefreshReq) (resp types.RefreshResp, rerr error) {
	hr := ctx.Value(capability.REQ_KEY).(*http.Request)
	var refresh_token string
	if req.Refresh_token != nil {
		refresh_token = *req.Refresh_token
	} else {
		if co, err := hr.Cookie(REFRESH_TOKEN); err != nil {
			rerr = fmt.Errorf("refresh token not provided")
			fmt.Printf("%v %v\n", rerr, err)
			return
		} else {
			refresh_token = co.Value
		}
	}
	claims, err := rs.refresh_tokener.ParseRefreshToken(refresh_token)
	if err != nil {
		rerr = fmt.Errorf("invalid refresh token")
		fmt.Printf("%v err '%v'\n", rerr, err)
		return
	}
	fmt.Printf("refresh for user %v\n", claims.Sub)
	sp := postgres.Sql(db2.Texpr_AppUserTable().Value, "a", "").
		WhereEqStr("id", claims.Sub)
	sql, flds := sp.Select()
	user := db2.AppUserTable{}
	if err := rs.db.Get(&user, sql, flds...); err != nil {
		fmt.Fprintf(os.Stderr, "ERROR %v\n", err)
		return types.Make_RefreshResp_invalid_refresh_token(), nil
	}
	role := ""
	if user.Value.Is_admin {
		role = "admin"
	}
	accesstoken, err := rs.access_tokener.CreateAccessToken(claims.Sub, role)
	if err != nil {
		fmt.Printf("error signing accesstoken: %v\n", err)
		return types.Make_RefreshResp_invalid_refresh_token(), nil
	}
	resp = types.Make_RefreshResp_access_token(accesstoken)
	return
}

var _ cap.RefreshApiRequests_Service[types.RefreshToken, http2.Unit] = &refreshSvr{}
