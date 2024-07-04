package main

import (
	"flag"
	"fmt"
	"os"

	"github.com/adl-lang/goadl_protoapp/internal/svr"
	"github.com/adl-lang/goadl_protoapp/internal/types"
)

func main() {
	rt := types.Root{}
	flag.BoolVar(&rt.Debug, "debug", false, "Print extra diagnostic information, especially about files being read/written")
	flag.BoolVar(&rt.DumpConfig, "dump-config", false, "Dump the config to stdout and exits")
	flag.StringVar(&rt.Cfg, "cfg", "", "Config file in json format")
	flag.Parse()
	if rt.Cfg == "" {
		flag.Usage()
		os.Exit(1)
	}

	// sc := &server.ServerConfig{}
	// if err := types.ReadConfig(rt, server.Texpr_ServerConfig(), sc); err != nil {
	// 	fmt.Fprintf(os.Stderr, "Error reading config %s\n", err)
	// 	flag.Usage()
	// 	os.Exit(1)
	// }

	if err := svr.NewSrv(&rt).Run(); err != nil {
		fmt.Fprintf(os.Stderr, "Error running service %s\n", err)
		flag.Usage()
		os.Exit(1)
	}
}
