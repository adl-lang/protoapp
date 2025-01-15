package svr

import (
	"context"
	"fmt"

	// using a side effect import so time.adl AST is registered
	"github.com/adl-lang/goadl_common/common/http"
	_ "github.com/adl-lang/goadl_common/common/time"

	"github.com/adl-lang/goadl_protoapp/protoapp/apis/cap"
	db2 "github.com/adl-lang/goadl_protoapp/protoapp/db"
	"github.com/jmoiron/sqlx"
)

type userSvr struct {
	db *sqlx.DB
}

// Create_user implements cap.UserApiRequests_Service.
func (u *userSvr) Create_user(ctx context.Context, cp cap.Capability, req cap.UserDetails) (db2.AppUserId, error) {
	return "", fmt.Errorf("unimplemented")
}

// Query_users implements cap.UserApiRequests_Service.
func (u *userSvr) Query_users(ctx context.Context, cp cap.Capability, req cap.QueryUsersReq) (cap.Paginated[cap.UserWithId], error) {
	return cap.Make_Paginated(
		[]cap.UserWithId{},
		0,
		0,
	), fmt.Errorf("unimplemented")
}

// Update_user implements cap.UserApiRequests_Service.
func (u *userSvr) Update_user(ctx context.Context, cp cap.Capability, req cap.WithId[db2.AppUserId, cap.UserDetails]) (http.Unit, error) {
	return http.Make_Unit(), fmt.Errorf("unimplemented")
}

var _ cap.UserApiRequests_Service[cap.AdminAccessToken, cap.Capability] = &userSvr{}
