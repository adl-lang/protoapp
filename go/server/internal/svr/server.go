package svr

import (
	"bytes"
	"context"
	"expvar"
	"fmt"
	"log"
	"net"
	"net/http"
	"net/http/pprof"
	"os"
	"os/signal"
	"text/template"
	"time"

	"github.com/jmoiron/sqlx"
	"github.com/jmoiron/sqlx/reflectx"
	"golang.org/x/sync/errgroup"

	"github.com/adl-lang/goadl_protoapp/internal/types"
	"github.com/adl-lang/goadl_protoapp/protoapp/apis/cap"
	"github.com/adl-lang/goadl_protoapp/protoapp/config/server"

	_ "github.com/lib/pq"
)

type srvCmd struct {
	rt  *types.Root
	Cfg server.ServerConfig
	mux http.ServeMux
}

func NewSrv(r *types.Root) types.Runner {
	return &srvCmd{
		rt: r,
	}
}

var PGConnTmpl = "postgresql://{{.User}}:{{.Password}}@{{.Host}}:{{.Port}}/{{.Dbname}}?sslmode=disable"

func (sc *srvCmd) Run() error {
	types.Config(*sc.rt, server.Texpr_ServerConfig(), &sc.Cfg)

	tmpl, err := template.New("").Parse(PGConnTmpl)
	if err != nil {
		return err
	}
	dbCon := bytes.Buffer{}
	err = tmpl.Execute(&dbCon, sc.Cfg.Db)
	if err != nil {
		return err
	}
	fmt.Printf("dbcon %v\n", dbCon.String())
	db, err := sqlx.Open("postgres", dbCon.String())
	if err != nil {
		return err
	}
	err = db.Ping()
	if err != nil {
		return err
	}

	db.Mapper = reflectx.NewMapperFunc("json", func(s string) string { return s })

	ps := &publicSvr{
		db:         db,
		pswdHasher: sc.Cfg.Password_hashing_algo,
		cfg:        sc.Cfg,
		tokenApi: &tokenSvr{
			db: db,
		},
		refreshApi: &refreshSvr{
			db:              db,
			refresh_tokener: sc.Cfg,
			access_tokener:  sc.Cfg,
			// tokener: sc.Cfg,
		},
	}
	acr := &accessTokenCapr{
		tokener: sc.Cfg,
	}
	rcr := &refreshTokenCapr{
		tokener: sc.Cfg,
	}

	registerDebugSvr(&sc.mux)
	cap.Register_ApiRequests(
		&sc.mux,
		ps,
		acr,
		rcr,
	)
	// cap_api.Register_TokenApi(&sc.mux, tcr, ts)
	// cap_api.Register_AdminTokenApi(&sc.mux, ecr, es)

	mainCtx, stop := signal.NotifyContext(context.Background(), os.Interrupt)
	defer stop()
	svr := &http.Server{
		Handler: sc,
		BaseContext: func(_ net.Listener) context.Context {
			return mainCtx
		},
		// ReadTimeout:  time.Second * 10,
		// WriteTimeout: time.Second * 10,
	}
	g, gCtx := errgroup.WithContext(mainCtx)
	g.Go(func() error {
		l, err := net.Listen("tcp", sc.Cfg.Http_bind_addr)
		if err != nil {
			return err
		}
		log.Printf("listening on http://%v", l.Addr())
		return svr.Serve(l)
	})
	g.Go(func() error {
		<-gCtx.Done()
		ctx, cancel := context.WithTimeout(context.Background(), time.Millisecond*30)
		defer cancel()
		return svr.Shutdown(ctx)
	})
	if err := g.Wait(); err != nil {
		fmt.Printf("exit reason: %s \n", err)
	}
	return nil
}

func (sc *srvCmd) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	fmt.Printf(">> %s\n", r.URL.Path)
	sc.mux.ServeHTTP(w, r)
	fmt.Printf("<< %s\n", r.URL.Path)
}

func registerDebugSvr(
	mux *http.ServeMux,
) {
	mux.HandleFunc("/debug/vars", expvar.Handler().ServeHTTP)
	mux.HandleFunc("/debug/pprof/", pprof.Index)
	mux.HandleFunc("/debug/pprof/cmdline", pprof.Cmdline)
	mux.HandleFunc("/debug/pprof/profile", pprof.Profile)
	mux.HandleFunc("/debug/pprof/symbol", pprof.Symbol)
	mux.HandleFunc("/debug/pprof/trace", pprof.Trace)
}