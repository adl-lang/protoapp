package postgres

import (
	"fmt"
	"reflect"
	"strconv"
	"strings"

	"github.com/adl-lang/goadl_common/common/db"
	goadl "github.com/adl-lang/goadl_rt/v3"
	"github.com/adl-lang/goadl_rt/v3/sys/adlast"
	"github.com/iancoleman/strcase"
	"github.com/samber/lo"
)

func (sef SelectExprsFrom) expressions() []string {
	return lo.Map[SelectExpr, string](sef.SelExprs, func(item SelectExpr, index int) string {
		if len(item.FieldPrefix) == 0 {
			return fmt.Sprintf(`%s.%s "%s"`, sef.TableAlias, strcase.ToSnake(item.Field), item.Field)
		}
		prefix := strings.Join(item.FieldPrefix, ".")
		return fmt.Sprintf(`%s.%s "%s.%s"`, sef.TableAlias, strcase.ToSnake(item.Field), prefix, item.Field)
	})
}

func Insert[T any](te adlast.ATypeExpr[T], vals ...T) (string, []any) {
	ie := InsertExprs[T]{}
	(&ie).getCols(te.Value)

	flds := []any{}
	params := []string{}
	for i, val := range vals {
		rv := reflect.ValueOf(val)
		ie.getFields(te.Value, rv, &flds)
		row := strings.Join(lo.Map[string, string](ie.Cols, func(item string, index int) string {
			return fmt.Sprintf("$%d", i*len(ie.Cols)+index+1)
		}), ", ")
		params = append(params, "("+row+")")
	}
	sql := fmt.Sprintf(`INSERT INTO  %s (%s) VALUES %s`,
		ie.TableName,
		strings.Join(ie.Cols, ", "),
		strings.Join(params, ", "),
	)
	return sql, flds
}

func Fields[T any](te adlast.ATypeExpr[T], val T) []any {
	ie := InsertExprs[T]{}
	rv := reflect.ValueOf(val)
	flds := []any{}
	ie.getFields(te.Value, rv, &flds)
	return flds
}

func getTableName(decl *adlast.ScopedDecl) string {
	if goadl.HasAnnotation(decl.Decl.Annotations, SN_DbTable) {
		jb := goadl.CreateJsonDecodeBinding(db.Texpr_DbTable(), goadl.RESOLVER)
		dbt, _ := goadl.GetAnnotation(decl.Decl.Annotations, SN_DbTable, jb)
		if dbt.Table_name != "" {
			return dbt.Table_name
		} else {
			return strings.TrimSuffix(strcase.ToSnake(decl.Decl.Name), "_table")
		}
	}
	return ""
}

func (sp *InsertExprs[T]) getCols(te adlast.TypeExpr) {
	ref, ok := te.TypeRef.Cast_reference()
	if !ok {
		panic("must be a ref")
	}
	decl := goadl.RESOLVER.Resolve(ref)
	if decl == nil {
		panic("decl not registered " + ref.ModuleName + "." + ref.Name)
	}
	if sp.TableName == "" {
		sp.TableName = getTableName(decl)
	}
	tp := goadl.TypeParamsFromDecl(decl.Decl)
	binder := goadl.CreateDecBoundTypeParams(tp, te.Parameters)
	adlast.Handle_DeclType[any](
		decl.Decl.Type_,
		func(struct_ adlast.Struct) any {
			if sp.TableName == "" {
				if goadl.HasAnnotation(decl.Decl.Annotations, SN_DbTable) {
					sp.TableName = strcase.ToSnake(decl.Decl.Name)
				}
			}
			for _, fld := range struct_.Fields {
				mono, _ := goadl.SubstituteTypeBindings(binder, fld.TypeExpr)
				adlast.Handle_TypeRef[any](
					mono.TypeRef,
					func(primitive string) any {
						sp.Cols = append(sp.Cols, strcase.ToSnake(fld.SerializedName))
						return nil
					},
					func(typeParam string) any {
						panic("type param not valid")
					},
					func(reference adlast.ScopedName) any {
						if goadl.HasAnnotation(fld.Annotations, SN_DbSpread) {
							sp.getCols(mono)
							return nil
						}
						sp.Cols = append(sp.Cols, strcase.ToSnake(fld.SerializedName))
						return nil
					},
					nil,
				)
			}
			return nil
		},
		func(union_ adlast.Union) any {
			panic("must be a struct")
		},
		func(type_ adlast.TypeDef) any {
			mono, _ := goadl.SubstituteTypeBindings(binder, type_.TypeExpr)
			sp.getCols(mono)
			return nil
		},
		func(newtype_ adlast.NewType) any {
			mono, _ := goadl.SubstituteTypeBindings(binder, newtype_.TypeExpr)
			sp.getCols(mono)
			return nil
		},
		nil,
	)
}

func (sp InsertExprs[T]) getFields(te adlast.TypeExpr, rv reflect.Value, flds *[]any) {
	ref, ok := te.TypeRef.Cast_reference()
	if !ok {
		panic("must be a ref")
	}
	decl := goadl.RESOLVER.Resolve(ref)
	if decl == nil {
		panic("decl not registered " + ref.ModuleName + "." + ref.Name)
	}
	tp := goadl.TypeParamsFromDecl(decl.Decl)
	binder := goadl.CreateDecBoundTypeParams(tp, te.Parameters)
	adlast.Handle_DeclType[any](
		decl.Decl.Type_,
		func(struct_ adlast.Struct) any {
			// generated structs have an embedded field
			rv = rv.Field(0)
			for i, fld := range struct_.Fields {
				mono, _ := goadl.SubstituteTypeBindings(binder, fld.TypeExpr)
				adlast.Handle_TypeRef[any](
					mono.TypeRef,
					func(primitive string) any {
						*flds = append(*flds, rv.Field(i).Interface())
						return nil
					},
					func(typeParam string) any {
						panic("type param not valid")
					},
					func(reference adlast.ScopedName) any {
						if goadl.HasAnnotation(fld.Annotations, SN_DbSpread) {
							sp.getFields(mono, rv.Field(i), flds)
							return nil
						}
						*flds = append(*flds, rv.Field(i).Interface())
						return nil
					},
					nil,
				)
			}
			return nil
		},
		func(union_ adlast.Union) any {
			panic("must be a struct")
		},
		func(type_ adlast.TypeDef) any {
			mono, _ := goadl.SubstituteTypeBindings(binder, type_.TypeExpr)
			sp.getFields(mono, rv, flds)
			return nil
		},
		func(newtype_ adlast.NewType) any {
			mono, _ := goadl.SubstituteTypeBindings(binder, newtype_.TypeExpr)
			sp.getFields(mono, rv, flds)
			return nil
		},
		nil,
	)
}

func (sp *SelectExprsFrom) Select() string {
	exprs := sp.expressions()
	// if len(sp.Wheres) != 0 {
	// 	return
	// 	panic("coding error, where clause set, much call Select on value returned by .WhereXxYy ie. method on SelectExprsFromWhere")
	// }
	sel := fmt.Sprintf(`select %s from %s %s`,
		strings.Join(exprs, ", "),
		sp.TableName,
		sp.TableAlias,
	)
	return sel
}
func (sp *SelectExprsFromWhere) Select() (string, []any) {
	sql := sp.SelectExprsFrom.Select()
	wc := lo.Map[WhereCondition, string](sp.Wheres, func(item WhereCondition, index int) string {
		return Handle_WhereCondition[string](
			item,
			func(eqStr WhereEq[string]) string {
				return fmt.Sprintf(`(%s.%s = %s)`, sp.TableAlias, eqStr.Col, "$"+strconv.Itoa(index+1))
			},
			nil,
		)
	})
	wheres := ""
	if len(wc) != 0 {
		wheres = " where " + strings.Join(wc, " and ")
	}
	sql = sql + wheres
	return sql, sp.Params
}
func (sp *SelectExprsFromLimit) Select() (string, []any) {
	sql, flds := sp.SelectExprsFromWhere.Select()
	if sp.Limit != nil {
		sql = sql + " limit " + "$" + strconv.Itoa(len(flds)+1)
		flds = append(flds, *sp.Limit)
	}
	return sql, flds
}
func (sp *SelectExprsFromOffset) Select() (string, []any) {
	sql, flds := sp.SelectExprsFromLimit.Select()
	if sp.Offset != nil {
		sql = sql + " offset " + "$" + strconv.Itoa(len(flds)+1)
		flds = append(flds, *sp.Offset)
	}
	return sql, flds
}

func (sp *SelectJoin) Select() string {
	exprs := sp.A.expressions()
	for _, sjp := range sp.B {
		exprs = append(exprs, sjp.Sef.expressions()...)
	}

	join := lo.Map[SelectJoinPart, string](sp.B, func(item SelectJoinPart, index int) string {
		return fmt.Sprintf(
			`join %s %s on %s.%s = %s.%s`,
			item.Sef.TableName, item.Sef.TableAlias,
			item.ToTableAlias, item.ToCol,
			item.Sef.TableAlias, item.Col,
		)
	})

	sel := fmt.Sprintf(
		`select %s from %s %s %s`,
		strings.Join(exprs, ", "),
		sp.A.TableName, sp.A.TableAlias,
		strings.Join(join, " "),
	)
	return sel
}

// Sql
// alias is used to disambigute table
// prefix is used to disambigute the fields of go structs
func Sql(te adlast.TypeExpr, alias string, prefix string) *SelectExprsFrom {
	sp := Make_SelectExprsFrom([]SelectExpr{}, "", "")
	prefix0 := []string{}
	if prefix != "" {
		prefix0 = []string{prefix}
	}
	(&sp).sql(te, alias, prefix0)
	return &sp
}

type SelectExprsFromWhere struct {
	SelectExprsFrom
	Params []any
}

type SelectExprsFromLimit struct {
	SelectExprsFromWhere
	Limit *uint64
}

type SelectExprsFromOffset struct {
	SelectExprsFromLimit
	Offset *uint64
}

func (sp *SelectExprsFrom) WhereEqStr(col string, val string) *SelectExprsFromWhere {
	spw := &SelectExprsFromWhere{
		SelectExprsFrom: *sp,
	}
	return spw.WhereEqStr(col, val)
	// sp.Wheres = append(sp.Wheres, Make_WhereCondition_eqStr(Make_WhereEq[string](col)))
	// spw := &SelectExprsFromWhere{
	// 	SelectExprsFrom: *sp,
	// 	Params:          []any{val},
	// }
	// return spw
}
func (sp *SelectExprsFrom) Limit(limit uint64) *SelectExprsFromLimit {
	return &SelectExprsFromLimit{
		SelectExprsFromWhere: SelectExprsFromWhere{
			SelectExprsFrom: *sp,
			Params:          []any{},
		},
		Limit: &limit,
	}
}
func (sp *SelectExprsFromWhere) Limit(limit uint64) *SelectExprsFromLimit {
	return &SelectExprsFromLimit{
		SelectExprsFromWhere: *sp,
		Limit:                &limit,
	}
}

func (sp *SelectExprsFrom) Offset(offset uint64) *SelectExprsFromOffset {
	return &SelectExprsFromOffset{
		SelectExprsFromLimit: SelectExprsFromLimit{
			SelectExprsFromWhere: SelectExprsFromWhere{
				SelectExprsFrom: *sp,
				Params:          []any{},
			},
			Limit: nil,
		},
		Offset: &offset,
	}
}
func (sp *SelectExprsFromWhere) Offset(offset uint64) *SelectExprsFromOffset {
	return &SelectExprsFromOffset{
		SelectExprsFromLimit: SelectExprsFromLimit{
			SelectExprsFromWhere: *sp,
			Limit:                nil,
		},
		Offset: &offset,
	}
}
func (sp *SelectExprsFromLimit) Offset(offset uint64) *SelectExprsFromOffset {
	return &SelectExprsFromOffset{
		SelectExprsFromLimit: *sp,
		Offset:               &offset,
	}
}

func (sp *SelectExprsFromWhere) WhereEqStr(col string, val string) *SelectExprsFromWhere {
	sp.Wheres = append(sp.Wheres, Make_WhereCondition_eqStr(Make_WhereEq[string](col)))
	sp.Params = append(sp.Params, val)
	return sp
}

func (sp *SelectExprsFrom) sql(te adlast.TypeExpr, alias string, prefix []string) {
	ref, ok := te.TypeRef.Cast_reference()
	if !ok {
		panic("must be a ref")
	}
	decl := goadl.RESOLVER.Resolve(ref)
	if decl == nil {
		panic("decl not registered " + ref.ModuleName + "." + ref.Name)
	}
	if sp.TableName == "" {
		sp.TableName = getTableName(decl)
		sp.TableAlias = alias
	}
	tp := goadl.TypeParamsFromDecl(decl.Decl)
	binder := goadl.CreateDecBoundTypeParams(tp, te.Parameters)
	adlast.Handle_DeclType[any](
		decl.Decl.Type_,
		func(struct_ adlast.Struct) any {
			for _, fld := range struct_.Fields {
				mono, _ := goadl.SubstituteTypeBindings(binder, fld.TypeExpr)
				adlast.Handle_TypeRef[any](
					mono.TypeRef,
					func(primitive string) any {
						sp.SelExprs = append(sp.SelExprs, Make_SelectExpr(fld.SerializedName, prefix))
						return nil
					},
					func(typeParam string) any {
						panic("type param not valid")
					},
					func(reference adlast.ScopedName) any {
						if goadl.HasAnnotation(fld.Annotations, SN_DbSpread) {
							prefix0 := strcase.ToSnake(fld.SerializedName)
							sp.sql(mono, alias, append(prefix, prefix0))
							return nil
						}
						sp.SelExprs = append(sp.SelExprs, Make_SelectExpr(fld.SerializedName, prefix))
						return nil
					},
					nil,
				)
			}
			return nil
		},
		func(union_ adlast.Union) any {
			panic("must be a struct")
		},
		func(type_ adlast.TypeDef) any {
			mono, _ := goadl.SubstituteTypeBindings(binder, type_.TypeExpr)
			sp.sql(mono, alias, prefix)
			return nil
		},
		func(newtype_ adlast.NewType) any {
			mono, _ := goadl.SubstituteTypeBindings(binder, newtype_.TypeExpr)
			sp.sql(mono, alias, prefix)
			return nil
		},
		nil,
	)
}

var SN_DbSpread = adlast.Make_ScopedName("common.db", "DbSpread")
var SN_DbTable = adlast.Make_ScopedName("common.db", "DbTable")
