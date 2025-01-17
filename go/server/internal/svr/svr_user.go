package svr

import (
	"context"
	"fmt"

	// using a side effect import so time.adl AST is registered
	"github.com/adl-lang/goadl_common/common/http"
	_ "github.com/adl-lang/goadl_common/common/time"

	"github.com/adl-lang/goadl_protoapp/protoapp/apis/cap"
	"github.com/adl-lang/goadl_protoapp/protoapp/apis/types"
	db2 "github.com/adl-lang/goadl_protoapp/protoapp/db"
	"github.com/jmoiron/sqlx"
)

type userSvr struct {
	db *sqlx.DB
}

// Create_user implements cap.UserApiRequests_Service.
func (u *userSvr) Create_user(ctx context.Context, cp cap.Capability, req types.UserDetails) (db2.AppUserId, error) {
	return "", fmt.Errorf("unimplemented")
}

// Query_users implements cap.UserApiRequests_Service.
func (u *userSvr) Query_users(ctx context.Context, cp cap.Capability, req types.QueryUsersReq) (types.Paginated[types.UserWithId], error) {
	return types.Make_Paginated(
		[]types.UserWithId{},
		0,
		0,
	), fmt.Errorf("unimplemented")
}

// Update_user implements cap.UserApiRequests_Service.
func (u *userSvr) Update_user(ctx context.Context, cp cap.Capability, req types.WithId[db2.AppUserId, types.UserDetails]) (http.Unit, error) {
	return http.Make_Unit(), fmt.Errorf("unimplemented")
}

var _ cap.UserApiRequests_Service[types.AdminAccessToken, cap.Capability] = &userSvr{}
