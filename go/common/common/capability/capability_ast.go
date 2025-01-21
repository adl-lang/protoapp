// Code generated by goadlc v3 - DO NOT EDIT.
package capability

import (
	goadl "github.com/adl-lang/goadl_rt/v3"
	"github.com/adl-lang/goadl_rt/v3/customtypes"
	"github.com/adl-lang/goadl_rt/v3/sys/adlast"
	"github.com/adl-lang/goadl_rt/v3/sys/types"
)

func Texpr_CapCall[C any, P any](c adlast.ATypeExpr[C], p adlast.ATypeExpr[P]) adlast.ATypeExpr[CapCall[C, P]] {
	te := adlast.Make_TypeExpr(
		adlast.Make_TypeRef_reference(
			adlast.Make_ScopedName("common.capability", "CapCall"),
		),
		[]adlast.TypeExpr{c.Value, p.Value},
	)
	return adlast.Make_ATypeExpr[CapCall[C, P]](te)
}

func AST_CapCall() adlast.ScopedDecl {
	decl := adlast.MakeAll_Decl(
		"CapCall",
		types.Make_Maybe_nothing[uint32](),
		adlast.Make_DeclType_struct_(
			adlast.MakeAll_Struct(
				[]adlast.Ident{
					"C",
					"P",
				},
				[]adlast.Field{
					adlast.MakeAll_Field(
						"token",
						"token",
						adlast.MakeAll_TypeExpr(
							adlast.Make_TypeRef_typeParam(
								"C",
							),
							[]adlast.TypeExpr{},
						),
						types.Make_Maybe_nothing[any](),
						customtypes.MapMap[adlast.ScopedName, any]{},
					),
					adlast.MakeAll_Field(
						"payload",
						"payload",
						adlast.MakeAll_TypeExpr(
							adlast.Make_TypeRef_typeParam(
								"P",
							),
							[]adlast.TypeExpr{},
						),
						types.Make_Maybe_nothing[any](),
						customtypes.MapMap[adlast.ScopedName, any]{},
					),
				},
			),
		),
		customtypes.MapMap[adlast.ScopedName, any]{},
	)
	return adlast.Make_ScopedDecl("common.capability", decl)
}

func init() {
	goadl.RESOLVER.Register(
		adlast.Make_ScopedName("common.capability", "CapCall"),
		AST_CapCall(),
	)
}

func Texpr_CapabilityApi[C any, S any, V any](c adlast.ATypeExpr[C], s adlast.ATypeExpr[S], v adlast.ATypeExpr[V]) adlast.ATypeExpr[CapabilityApi[C, S, V]] {
	te := adlast.Make_TypeExpr(
		adlast.Make_TypeRef_reference(
			adlast.Make_ScopedName("common.capability", "CapabilityApi"),
		),
		[]adlast.TypeExpr{c.Value, s.Value, v.Value},
	)
	return adlast.Make_ATypeExpr[CapabilityApi[C, S, V]](te)
}

func AST_CapabilityApi() adlast.ScopedDecl {
	decl := adlast.MakeAll_Decl(
		"CapabilityApi",
		types.Make_Maybe_nothing[uint32](),
		adlast.Make_DeclType_struct_(
			adlast.MakeAll_Struct(
				[]adlast.Ident{
					"C",
					"S",
					"V",
				},
				[]adlast.Field{
					adlast.MakeAll_Field(
						"token",
						"token",
						adlast.MakeAll_TypeExpr(
							adlast.Make_TypeRef_primitive(
								"TypeToken",
							),
							[]adlast.TypeExpr{
								adlast.MakeAll_TypeExpr(
									adlast.Make_TypeRef_typeParam(
										"C",
									),
									[]adlast.TypeExpr{},
								),
							},
						),
						types.Make_Maybe_just[any](
							nil,
						),
						customtypes.MapMap[adlast.ScopedName, any]{},
					),
					adlast.MakeAll_Field(
						"cap",
						"cap",
						adlast.MakeAll_TypeExpr(
							adlast.Make_TypeRef_primitive(
								"TypeToken",
							),
							[]adlast.TypeExpr{
								adlast.MakeAll_TypeExpr(
									adlast.Make_TypeRef_typeParam(
										"S",
									),
									[]adlast.TypeExpr{},
								),
							},
						),
						types.Make_Maybe_just[any](
							nil,
						),
						customtypes.MapMap[adlast.ScopedName, any]{},
					),
					adlast.MakeAll_Field(
						"service_prefix",
						"service_prefix",
						adlast.MakeAll_TypeExpr(
							adlast.Make_TypeRef_primitive(
								"String",
							),
							[]adlast.TypeExpr{},
						),
						types.Make_Maybe_just[any](
							"",
						),
						customtypes.MapMap[adlast.ScopedName, any]{},
					),
					adlast.MakeAll_Field(
						"service",
						"service",
						adlast.MakeAll_TypeExpr(
							adlast.Make_TypeRef_typeParam(
								"V",
							),
							[]adlast.TypeExpr{},
						),
						types.Make_Maybe_nothing[any](),
						customtypes.MapMap[adlast.ScopedName, any]{},
					),
					adlast.MakeAll_Field(
						"name",
						"name",
						adlast.MakeAll_TypeExpr(
							adlast.Make_TypeRef_primitive(
								"String",
							),
							[]adlast.TypeExpr{},
						),
						types.Make_Maybe_just[any](
							"",
						),
						customtypes.MapMap[adlast.ScopedName, any]{},
					),
					adlast.MakeAll_Field(
						"token_delivery",
						"token_delivery",
						adlast.MakeAll_TypeExpr(
							adlast.Make_TypeRef_reference(
								adlast.MakeAll_ScopedName(
									"common.capability",
									"DeliveryMethod",
								),
							),
							[]adlast.TypeExpr{},
						),
						types.Make_Maybe_nothing[any](),
						customtypes.MapMap[adlast.ScopedName, any]{},
					),
				},
			),
		),
		customtypes.MapMap[adlast.ScopedName, any]{adlast.Make_ScopedName("sys.annotations", "Doc"): "Used to create a field inside an API struct which represents a section of the api requiring a token.\nC is the type of the client-side token\nS is the type of the server-side capability\nV is the type of the API struct requiring the capability\n"},
	)
	return adlast.Make_ScopedDecl("common.capability", decl)
}

func init() {
	goadl.RESOLVER.Register(
		adlast.Make_ScopedName("common.capability", "CapabilityApi"),
		AST_CapabilityApi(),
	)
}

func Texpr_CapabilityToken[S any](s adlast.ATypeExpr[S]) adlast.ATypeExpr[CapabilityToken[S]] {
	te := adlast.Make_TypeExpr(
		adlast.Make_TypeRef_reference(
			adlast.Make_ScopedName("common.capability", "CapabilityToken"),
		),
		[]adlast.TypeExpr{s.Value},
	)
	return adlast.Make_ATypeExpr[CapabilityToken[S]](te)
}

func AST_CapabilityToken() adlast.ScopedDecl {
	decl := adlast.MakeAll_Decl(
		"CapabilityToken",
		types.Make_Maybe_nothing[uint32](),
		adlast.Make_DeclType_struct_(
			adlast.MakeAll_Struct(
				[]adlast.Ident{
					"S",
				},
				[]adlast.Field{
					adlast.MakeAll_Field(
						"cap",
						"cap",
						adlast.MakeAll_TypeExpr(
							adlast.Make_TypeRef_primitive(
								"TypeToken",
							),
							[]adlast.TypeExpr{
								adlast.MakeAll_TypeExpr(
									adlast.Make_TypeRef_typeParam(
										"S",
									),
									[]adlast.TypeExpr{},
								),
							},
						),
						types.Make_Maybe_just[any](
							nil,
						),
						customtypes.MapMap[adlast.ScopedName, any]{},
					),
				},
			),
		),
		customtypes.MapMap[adlast.ScopedName, any]{adlast.Make_ScopedName("sys.annotations", "Doc"): "Used to annotation resp struct of branch of resp union which creates a cap.\nmore accurately, since generic types can be used as annotation type, used to create a type alias which is used as the annotation.\n"},
	)
	return adlast.Make_ScopedDecl("common.capability", decl)
}

func init() {
	goadl.RESOLVER.Register(
		adlast.Make_ScopedName("common.capability", "CapabilityToken"),
		AST_CapabilityToken(),
	)
}

func Texpr_DeliveryMethod() adlast.ATypeExpr[DeliveryMethod] {
	te := adlast.Make_TypeExpr(
		adlast.Make_TypeRef_reference(
			adlast.Make_ScopedName("common.capability", "DeliveryMethod"),
		),
		[]adlast.TypeExpr{},
	)
	return adlast.Make_ATypeExpr[DeliveryMethod](te)
}

func AST_DeliveryMethod() adlast.ScopedDecl {
	decl := adlast.MakeAll_Decl(
		"DeliveryMethod",
		types.Make_Maybe_nothing[uint32](),
		adlast.Make_DeclType_union_(
			adlast.MakeAll_Union(
				[]adlast.Ident{},
				[]adlast.Field{
					adlast.MakeAll_Field(
						"none",
						"none",
						adlast.MakeAll_TypeExpr(
							adlast.Make_TypeRef_primitive(
								"Void",
							),
							[]adlast.TypeExpr{},
						),
						types.Make_Maybe_nothing[any](),
						customtypes.MapMap[adlast.ScopedName, any]{adlast.Make_ScopedName("sys.annotations", "Doc"): "don't send the token back to the server\n"},
					),
					adlast.MakeAll_Field(
						"jwt",
						"jwt",
						adlast.MakeAll_TypeExpr(
							adlast.Make_TypeRef_primitive(
								"Void",
							),
							[]adlast.TypeExpr{},
						),
						types.Make_Maybe_nothing[any](),
						customtypes.MapMap[adlast.ScopedName, any]{adlast.Make_ScopedName("sys.annotations", "Doc"): "add as an \"authorization: Bearer\" headder\n"},
					),
					adlast.MakeAll_Field(
						"header",
						"header",
						adlast.MakeAll_TypeExpr(
							adlast.Make_TypeRef_primitive(
								"String",
							),
							[]adlast.TypeExpr{},
						),
						types.Make_Maybe_nothing[any](),
						customtypes.MapMap[adlast.ScopedName, any]{adlast.Make_ScopedName("sys.annotations", "Doc"): "add as a cookie, the provided string in the cookie name\n"},
					),
				},
			),
		),
		customtypes.MapMap[adlast.ScopedName, any]{},
	)
	return adlast.Make_ScopedDecl("common.capability", decl)
}

func init() {
	goadl.RESOLVER.Register(
		adlast.Make_ScopedName("common.capability", "DeliveryMethod"),
		AST_DeliveryMethod(),
	)
}

func Texpr_HttpGet[O any](o adlast.ATypeExpr[O]) adlast.ATypeExpr[HttpGet[O]] {
	te := adlast.Make_TypeExpr(
		adlast.Make_TypeRef_reference(
			adlast.Make_ScopedName("common.capability", "HttpGet"),
		),
		[]adlast.TypeExpr{o.Value},
	)
	return adlast.Make_ATypeExpr[HttpGet[O]](te)
}

func AST_HttpGet() adlast.ScopedDecl {
	decl := adlast.MakeAll_Decl(
		"HttpGet",
		types.Make_Maybe_nothing[uint32](),
		adlast.Make_DeclType_struct_(
			adlast.MakeAll_Struct(
				[]adlast.Ident{
					"O",
				},
				[]adlast.Field{
					adlast.MakeAll_Field(
						"path",
						"path",
						adlast.MakeAll_TypeExpr(
							adlast.Make_TypeRef_primitive(
								"String",
							),
							[]adlast.TypeExpr{},
						),
						types.Make_Maybe_nothing[any](),
						customtypes.MapMap[adlast.ScopedName, any]{},
					),
					adlast.MakeAll_Field(
						"rateLimit",
						"rateLimit",
						adlast.MakeAll_TypeExpr(
							adlast.Make_TypeRef_primitive(
								"Nullable",
							),
							[]adlast.TypeExpr{
								adlast.MakeAll_TypeExpr(
									adlast.Make_TypeRef_reference(
										adlast.MakeAll_ScopedName(
											"common.http",
											"HttpRateLimit",
										),
									),
									[]adlast.TypeExpr{},
								),
							},
						),
						types.Make_Maybe_just[any](
							nil,
						),
						customtypes.MapMap[adlast.ScopedName, any]{},
					),
					adlast.MakeAll_Field(
						"respType",
						"respType",
						adlast.MakeAll_TypeExpr(
							adlast.Make_TypeRef_primitive(
								"TypeToken",
							),
							[]adlast.TypeExpr{
								adlast.MakeAll_TypeExpr(
									adlast.Make_TypeRef_typeParam(
										"O",
									),
									[]adlast.TypeExpr{},
								),
							},
						),
						types.Make_Maybe_just[any](
							nil,
						),
						customtypes.MapMap[adlast.ScopedName, any]{},
					),
				},
			),
		),
		customtypes.MapMap[adlast.ScopedName, any]{},
	)
	return adlast.Make_ScopedDecl("common.capability", decl)
}

func init() {
	goadl.RESOLVER.Register(
		adlast.Make_ScopedName("common.capability", "HttpGet"),
		AST_HttpGet(),
	)
}

func Texpr_HttpPost[I any, O any](i adlast.ATypeExpr[I], o adlast.ATypeExpr[O]) adlast.ATypeExpr[HttpPost[I, O]] {
	te := adlast.Make_TypeExpr(
		adlast.Make_TypeRef_reference(
			adlast.Make_ScopedName("common.capability", "HttpPost"),
		),
		[]adlast.TypeExpr{i.Value, o.Value},
	)
	return adlast.Make_ATypeExpr[HttpPost[I, O]](te)
}

func AST_HttpPost() adlast.ScopedDecl {
	decl := adlast.MakeAll_Decl(
		"HttpPost",
		types.Make_Maybe_nothing[uint32](),
		adlast.Make_DeclType_struct_(
			adlast.MakeAll_Struct(
				[]adlast.Ident{
					"I",
					"O",
				},
				[]adlast.Field{
					adlast.MakeAll_Field(
						"path",
						"path",
						adlast.MakeAll_TypeExpr(
							adlast.Make_TypeRef_primitive(
								"String",
							),
							[]adlast.TypeExpr{},
						),
						types.Make_Maybe_nothing[any](),
						customtypes.MapMap[adlast.ScopedName, any]{},
					),
					adlast.MakeAll_Field(
						"rateLimit",
						"rateLimit",
						adlast.MakeAll_TypeExpr(
							adlast.Make_TypeRef_primitive(
								"Nullable",
							),
							[]adlast.TypeExpr{
								adlast.MakeAll_TypeExpr(
									adlast.Make_TypeRef_reference(
										adlast.MakeAll_ScopedName(
											"common.http",
											"HttpRateLimit",
										),
									),
									[]adlast.TypeExpr{},
								),
							},
						),
						types.Make_Maybe_just[any](
							nil,
						),
						customtypes.MapMap[adlast.ScopedName, any]{},
					),
					adlast.MakeAll_Field(
						"reqType",
						"reqType",
						adlast.MakeAll_TypeExpr(
							adlast.Make_TypeRef_primitive(
								"TypeToken",
							),
							[]adlast.TypeExpr{
								adlast.MakeAll_TypeExpr(
									adlast.Make_TypeRef_typeParam(
										"I",
									),
									[]adlast.TypeExpr{},
								),
							},
						),
						types.Make_Maybe_just[any](
							nil,
						),
						customtypes.MapMap[adlast.ScopedName, any]{},
					),
					adlast.MakeAll_Field(
						"respType",
						"respType",
						adlast.MakeAll_TypeExpr(
							adlast.Make_TypeRef_primitive(
								"TypeToken",
							),
							[]adlast.TypeExpr{
								adlast.MakeAll_TypeExpr(
									adlast.Make_TypeRef_typeParam(
										"O",
									),
									[]adlast.TypeExpr{},
								),
							},
						),
						types.Make_Maybe_just[any](
							nil,
						),
						customtypes.MapMap[adlast.ScopedName, any]{},
					),
				},
			),
		),
		customtypes.MapMap[adlast.ScopedName, any]{},
	)
	return adlast.Make_ScopedDecl("common.capability", decl)
}

func init() {
	goadl.RESOLVER.Register(
		adlast.Make_ScopedName("common.capability", "HttpPost"),
		AST_HttpPost(),
	)
}
