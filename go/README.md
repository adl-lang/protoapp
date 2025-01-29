# Protoapp SVR Implemented in Go

## Generate Go from ADL

1. Edit the `common.cfg.json` and `protoapp.cfg.json` files, change paths to ADL source (`Searchdir`, `Files`, `AdlSrc`)
2. Ensure there is an `adlc` (version 1.2.3) on the path
3. Run commands below.

```sh
go run github.com/adl-lang/goadlc/cmd/goadlc@v1.0.0-alpha.13 -cfg common.cfg.json -debug
go run github.com/adl-lang/goadlc/cmd/goadlc@v1.0.0-alpha.13 -cfg protoapp.cfg.json -debug
```