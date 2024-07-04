module github.com/adl-lang/goadl_protoapp

go 1.22.1

// use if hacking on git@github.com-gmhta:adl-lang/goadl.git and it clone in the right place
// replace github.com/adl-lang/goadl_rt/v3 => ../../../goadl/goadl_rt/v3

replace github.com/adl-lang/goadl_common => ../common

require (
	github.com/adl-lang/goadl_common v0.0.0-00010101000000-000000000000
	github.com/adl-lang/goadl_rt/v3 v3.0.0-alpha.9
	github.com/golang-jwt/jwt/v5 v5.2.1
	github.com/jmoiron/sqlx v1.4.0
	github.com/lib/pq v1.10.9
	github.com/samber/lo v1.44.0
	golang.org/x/sync v0.7.0
)

require (
	github.com/iancoleman/strcase v0.3.0 // indirect
	golang.org/x/crypto v0.25.0 // indirect
	golang.org/x/sys v0.22.0 // indirect
	golang.org/x/text v0.16.0 // indirect
)
