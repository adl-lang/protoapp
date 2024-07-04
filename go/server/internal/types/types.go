package types

import (
	"bytes"
	"encoding/json"
	"fmt"
	"os"

	goadl "github.com/adl-lang/goadl_rt/v3"
	"github.com/adl-lang/goadl_rt/v3/sys/adlast"
)

type Runner interface {
	Run() error
}

// Root struct for commands
// Field tags control where the values come from
// If opts:"-" yaml:"-" are set in object creation
//
//	opts:="-" come from config file
//	yaml:="-" come from command line flags
type Root struct {
	Cfg        string `help:"Config file in json format (NOTE file entries take precedence over command-line flags & env)" json:"-"`
	DumpConfig bool   `help:"Dump the config to stdout and exits" json:"-"`
	Debug      bool
}

func Config[A any](
	rt Root,
	te adlast.ATypeExpr[A],
	in *A,
) error {
	if rt.Cfg != "" {
		fd, err := os.Open(rt.Cfg)
		// config is in its own func
		// this defer fire correctly
		//
		// won't fire if dump is used as os.Exit terminates program
		defer func() {
			fd.Close()
		}()
		if err != nil {
			cwd, _ := os.Getwd()
			return fmt.Errorf("error opening file cwd:%s cfg:%s err:%v", cwd, rt.Cfg, err)
		}
		dec := goadl.CreateJsonDecodeBinding(te, goadl.RESOLVER)
		err = dec.Decode(fd, in)
		if err != nil {
			return err
			// log.Fatalf("json error %v", err)
		}
	}
	if rt.DumpConfig {
		enc := goadl.CreateJsonEncodeBinding(te, goadl.RESOLVER)
		buf := bytes.Buffer{}
		err := enc.Encode(&buf, *in)
		if err != nil {
			return fmt.Errorf("json encoding error %v", err)
		}
		buf0 := bytes.Buffer{}
		err = json.Indent(&buf0, buf.Bytes(), "", "  ")
		if err != nil {
			return fmt.Errorf("json indent error %v", err)
		}
		fmt.Printf("%s\n", buf0.String())
		os.Exit(0)
	}
	return nil
}

func DumpConfig[A any](
	rt Root,
	te adlast.ATypeExpr[A],
	in A,
) error {
	enc := goadl.CreateJsonEncodeBinding(te, goadl.RESOLVER)
	buf := bytes.Buffer{}
	err := enc.Encode(&buf, in)
	if err != nil {
		return fmt.Errorf("json encoding error %v", err)
	}
	buf0 := bytes.Buffer{}
	err = json.Indent(&buf0, buf.Bytes(), "", "  ")
	if err != nil {
		return fmt.Errorf("json indent error %v", err)
	}
	fmt.Printf("%s\n", buf0.String())
	os.Exit(0)
	return nil
}

func ReadConfig[A any](
	rt Root,
	te adlast.ATypeExpr[A],
	in *A,
) error {
	fd, err := os.Open(rt.Cfg)
	defer func() {
		fd.Close()
	}()
	if err != nil {
		cwd, _ := os.Getwd()
		return fmt.Errorf("error opening file cwd:%s cfg:%s err:%v", cwd, rt.Cfg, err)
	}
	dec := goadl.CreateJsonDecodeBinding(te, goadl.RESOLVER)
	err = dec.Decode(fd, in)
	if err != nil {
		return err
	}
	return nil
}
