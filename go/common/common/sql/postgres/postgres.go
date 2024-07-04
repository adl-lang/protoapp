// Code generated by goadlc v3 - DO NOT EDIT.
package postgres

import (
	"fmt"
)

type InsertExprs[T any] struct {
	_InsertExprs[T]
}

type _InsertExprs[T any] struct {
	Cols      []string `json:"cols"`
	TableName string   `json:"tableName"`
}

func MakeAll_InsertExprs[T any](
	cols []string,
	tablename string,
) InsertExprs[T] {
	return InsertExprs[T]{
		_InsertExprs[T]{
			Cols:      cols,
			TableName: tablename,
		},
	}
}

func Make_InsertExprs[T any](
	cols []string,
	tablename string,
) InsertExprs[T] {
	ret := InsertExprs[T]{
		_InsertExprs[T]{
			Cols:      cols,
			TableName: tablename,
		},
	}
	return ret
}

type SelectExpr struct {
	_SelectExpr
}

type _SelectExpr struct {
	Field       string   `json:"field"`
	FieldPrefix []string `json:"fieldPrefix"`
}

func MakeAll_SelectExpr(
	field string,
	fieldprefix []string,
) SelectExpr {
	return SelectExpr{
		_SelectExpr{
			Field:       field,
			FieldPrefix: fieldprefix,
		},
	}
}

func Make_SelectExpr(
	field string,
	fieldprefix []string,
) SelectExpr {
	ret := SelectExpr{
		_SelectExpr{
			Field:       field,
			FieldPrefix: fieldprefix,
		},
	}
	return ret
}

type SelectExprsFrom struct {
	_SelectExprsFrom
}

type _SelectExprsFrom struct {
	SelExprs   []SelectExpr     `json:"selExprs"`
	TableName  string           `json:"tableName"`
	TableAlias string           `json:"tableAlias"`
	Wheres     []WhereCondition `json:"wheres"`
}

func MakeAll_SelectExprsFrom(
	selexprs []SelectExpr,
	tablename string,
	tablealias string,
	wheres []WhereCondition,
) SelectExprsFrom {
	return SelectExprsFrom{
		_SelectExprsFrom{
			SelExprs:   selexprs,
			TableName:  tablename,
			TableAlias: tablealias,
			Wheres:     wheres,
		},
	}
}

func Make_SelectExprsFrom(
	selexprs []SelectExpr,
	tablename string,
	tablealias string,
) SelectExprsFrom {
	ret := SelectExprsFrom{
		_SelectExprsFrom{
			SelExprs:   selexprs,
			TableName:  tablename,
			TableAlias: tablealias,
			Wheres:     ((*SelectExprsFrom)(nil)).Default_wheres(),
		},
	}
	return ret
}

func (*SelectExprsFrom) Default_wheres() []WhereCondition {
	return []WhereCondition{}
}

type SelectJoin struct {
	_SelectJoin
}

type _SelectJoin struct {
	A SelectExprsFrom  `json:"a"`
	B []SelectJoinPart `json:"b"`
}

func MakeAll_SelectJoin(
	a SelectExprsFrom,
	b []SelectJoinPart,
) SelectJoin {
	return SelectJoin{
		_SelectJoin{
			A: a,
			B: b,
		},
	}
}

func Make_SelectJoin(
	a SelectExprsFrom,
	b []SelectJoinPart,
) SelectJoin {
	ret := SelectJoin{
		_SelectJoin{
			A: a,
			B: b,
		},
	}
	return ret
}

type SelectJoinPart struct {
	_SelectJoinPart
}

type _SelectJoinPart struct {
	Sef          SelectExprsFrom `json:"sef"`
	Col          string          `json:"col"`
	ToTableAlias string          `json:"toTableAlias"`
	ToCol        string          `json:"toCol"`
}

func MakeAll_SelectJoinPart(
	sef SelectExprsFrom,
	col string,
	totablealias string,
	tocol string,
) SelectJoinPart {
	return SelectJoinPart{
		_SelectJoinPart{
			Sef:          sef,
			Col:          col,
			ToTableAlias: totablealias,
			ToCol:        tocol,
		},
	}
}

func Make_SelectJoinPart(
	sef SelectExprsFrom,
	col string,
	totablealias string,
	tocol string,
) SelectJoinPart {
	ret := SelectJoinPart{
		_SelectJoinPart{
			Sef:          sef,
			Col:          col,
			ToTableAlias: totablealias,
			ToCol:        tocol,
		},
	}
	return ret
}

type WhereCondition struct {
	Branch WhereConditionBranch
}

type WhereConditionBranch interface {
	isWhereConditionBranch()
}

func (*WhereCondition) MakeNewBranch(key string) (any, error) {
	switch key {
	case "eqStr":
		return &_WhereCondition_EqStr{}, nil
	}
	return nil, fmt.Errorf("unknown branch is : %s", key)
}

type _WhereCondition_EqStr struct {
	V WhereEq[string] `branch:"eqStr"`
}

func (_WhereCondition_EqStr) isWhereConditionBranch() {}

func Make_WhereCondition_eqStr(v WhereEq[string]) WhereCondition {
	return WhereCondition{
		_WhereCondition_EqStr{v},
	}
}

func (un WhereCondition) Cast_eqStr() (WhereEq[string], bool) {
	br, ok := un.Branch.(_WhereCondition_EqStr)
	return br.V, ok
}

func Handle_WhereCondition[T any](
	_in WhereCondition,
	eqStr func(eqStr WhereEq[string]) T,
	_default func() T,
) T {
	switch _b := _in.Branch.(type) {
	case _WhereCondition_EqStr:
		if eqStr != nil {
			return eqStr(_b.V)
		}
	}
	if _default != nil {
		return _default()
	}
	panic("unhandled branch in : WhereCondition")
}

func HandleWithErr_WhereCondition[T any](
	_in WhereCondition,
	eqStr func(eqStr WhereEq[string]) (T, error),
	_default func() (T, error),
) (T, error) {
	switch _b := _in.Branch.(type) {
	case _WhereCondition_EqStr:
		if eqStr != nil {
			return eqStr(_b.V)
		}
	}
	if _default != nil {
		return _default()
	}
	panic("unhandled branch in : WhereCondition")
}

type WhereEq[T any] struct {
	_WhereEq[T]
}

type _WhereEq[T any] struct {
	Col string `json:"col"`
}

func MakeAll_WhereEq[T any](
	col string,
) WhereEq[T] {
	return WhereEq[T]{
		_WhereEq[T]{
			Col: col,
		},
	}
}

func Make_WhereEq[T any](
	col string,
) WhereEq[T] {
	ret := WhereEq[T]{
		_WhereEq[T]{
			Col: col,
		},
	}
	return ret
}
