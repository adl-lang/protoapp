package svr

import (
	"context"
	"fmt"
	"os"
	"time"

	// using a side effect import so time.adl AST is registered
	_ "github.com/adl-lang/goadl_common/common/time"
	"github.com/samber/lo"
	"golang.org/x/sync/errgroup"

	"github.com/adl-lang/goadl_common/common/db"
	"github.com/adl-lang/goadl_common/common/sql/postgres"
	"github.com/adl-lang/goadl_protoapp/protoapp/apis/cap"
	"github.com/adl-lang/goadl_protoapp/protoapp/apis/types"
	db2 "github.com/adl-lang/goadl_protoapp/protoapp/db"
	"github.com/jmoiron/sqlx"
)

type tokenSvr struct {
	db *sqlx.DB
}

// NewMessage implements cap.AccessApiRequests_Service.
func (ts *tokenSvr) NewMessage(ctx context.Context, cp cap.Capability, req types.NewMessageReq) (resp db.DbKey[db2.MessageTable], err error) {
	msg := db.Make_WithId(
		db.RandKey("M-"),
		db2.Make_Message(
			time.Now(),
			db.DbKey[db2.AppUserTable](cp.User_id),
			req.Message,
		),
	)
	sql, flds := postgres.Insert(db2.Texpr_MessageTable(), db2.MessageTable(msg))
	fmt.Fprintf(os.Stderr, "sql %v\n", sql)
	fmt.Fprintf(os.Stderr, "flds %v\n", flds)
	_, err = ts.db.Exec(sql, flds...)
	if err != nil {
		fmt.Fprintf(os.Stderr, "ERROR insert error %v\n", err)
		return "", err
	}
	return db.DbKey[db2.MessageTable](msg.Id), nil
}

// RecentMessages implements cap.AccessApiRequests_Service.
func (ts *tokenSvr) RecentMessages(ctx context.Context, cp cap.Capability, req types.RecentMessagesReq) (resp types.Paginated[types.Message], resp_err error) {
	tbl := postgres.Sql(db2.Texpr_MessageTable().Value, "a", "")
	sql, flds := tbl.
		Limit(uint64(req.Page.Limit)).
		Offset(uint64(req.Page.Offset)).
		Select()
	mts := []db2.MessageTable{}
	var total uint64

	eg := errgroup.Group{}
	eg.Go(func() error {
		if err := ts.db.Select(&mts, sql, flds...); err != nil {
			fmt.Fprintf(os.Stderr, "ERROR sql %s %v\n", sql, err)
			return err
		}
		return nil
	})
	eg.Go(func() error {
		if err := ts.db.Get(&total, fmt.Sprintf(`select count(*) from %s`, tbl.TableName)); err != nil {
			fmt.Fprintf(os.Stderr, "ERROR %v\n", err)
			return err
		}
		return nil
	})
	if err := eg.Wait(); err != nil {
		return resp, fmt.Errorf("internal error")
	}
	msgs := lo.Map[db2.MessageTable, types.Message](mts, func(item db2.MessageTable, index int) types.Message {
		return types.Make_Message(
			db.DbKey[db2.MessageTable](item.Id),
			item.Value.Posted_at,
			string(item.Value.Posted_by),
			item.Value.Message,
		)
	})
	return types.Make_Paginated(msgs, req.Page.Offset, total), nil
}

// WhoAmI implements cap.AccessApiRequests_Service.
func (ts *tokenSvr) Who_am_i(ctx context.Context, cp cap.Capability) (types.UserWithId, error) {
	sp := postgres.Sql(db2.Texpr_AppUserTable().Value, "a", "").
		WhereEqStr("id", cp.User_id)
	sql, flds := sp.Select()
	fmt.Printf("sql %s\n", sql)
	user := db.WithId[db2.AppUser]{}
	if err := ts.db.Get(&user, sql, flds...); err != nil {
		fmt.Fprintf(os.Stderr, "ERROR select error %v\n", err)
		return types.UserWithId{}, err
	}
	return types.Make_WithId(
		db.DbKey[db2.AppUserTable](user.Id),
		types.Make_User(
			user.Value.Fullname,
			user.Value.Email,
			user.Value.Is_admin,
		),
	), nil
}

var _ cap.AccessApiRequests_Service[types.AccessToken, cap.Capability] = &tokenSvr{}
