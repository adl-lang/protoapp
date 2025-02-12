package svr

import (
	"fmt"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/adl-lang/goadl_common/common/capability"
	http2 "github.com/adl-lang/goadl_common/common/http"
	"github.com/adl-lang/goadl_protoapp/protoapp/apis/cap"
	"github.com/adl-lang/goadl_protoapp/protoapp/apis/types"
	"github.com/adl-lang/goadl_protoapp/protoapp/config/server"
)

type accessTokenCapr struct {
	tokener server.AccessTokener
}
type adminAccessTokenCapr struct {
	tokener server.AccessTokener
}
type refreshTokenCapr struct {
	tokener server.RefreshTokener
}

var _ capability.CapabilityRetriever[types.AccessToken, cap.Capability] = &accessTokenCapr{}
var _ capability.CapabilityRetriever[types.AdminAccessToken, cap.Capability] = &adminAccessTokenCapr{}
var _ capability.CapabilityRetriever[types.RefreshToken, http2.Unit] = &refreshTokenCapr{}

// Retrieve implements service.CapabilityRetriever.
func (capr *accessTokenCapr) Retrieve(req *http.Request) (cp cap.Capability, token types.AccessToken, err error) {
	token = types.AccessToken(req.Header.Get("Authorization"))
	if token == "" {
		return cp, token, fmt.Errorf("authorization not found")
	}
	parts := strings.Split(string(token), " ")
	if len(parts) != 2 {
		fmt.Fprintf(os.Stderr, "Authorization header bad format '%s'\n", token)
		return cp, token, fmt.Errorf("authorization not found")
	}
	if strings.ToLower(parts[0]) != "bearer" {
		fmt.Fprintf(os.Stderr, "Authorization header bad format '%s'\n", token)
		return cp, token, fmt.Errorf("authorization not found")
	}
	claims, err := capr.tokener.ParseAccessToken(parts[1])
	if err != nil {
		return cp, token, err
	}
	if claims.Sub == "" {
		return cp, token, fmt.Errorf("'user-id' missing from claim")
	}
	now := time.Now()
	fmt.Printf("claim %v\n", claims)
	fmt.Printf("now %v\n", now.Unix())
	return cap.Make_Capability(claims.Sub, []string{claims.Role}), token, nil
}

// Retrieve implements service.CapabilityRetriever.
func (capr *adminAccessTokenCapr) Retrieve(req *http.Request) (cp cap.Capability, token types.AdminAccessToken, err error) {
	token = types.AdminAccessToken(req.Header.Get("Authorization"))
	if token == "" {
		return cp, token, fmt.Errorf("authorization not found")
	}
	parts := strings.Split(string(token), " ")
	if len(parts) != 2 {
		fmt.Fprintf(os.Stderr, "Authorization header bad format '%s'\n", token)
		return cp, token, fmt.Errorf("authorization not found")
	}
	if strings.ToLower(parts[0]) != "bearer" {
		fmt.Fprintf(os.Stderr, "Authorization header bad format '%s'\n", token)
		return cp, token, fmt.Errorf("authorization not found")
	}
	claims, err := capr.tokener.ParseAccessToken(parts[1])
	if err != nil {
		return cp, token, err
	}
	if claims.Sub == "" {
		return cp, token, fmt.Errorf("'user-id' missing from claim")
	}
	now := time.Now()
	fmt.Printf("claim %v\n", claims)
	fmt.Printf("now %v\n", now.Unix())
	if claims.Role != "admin" {
		return cp, token, fmt.Errorf("role not admin")
	}
	return cap.Make_Capability(claims.Sub, []string{claims.Role}), token, nil
}

// Retrieve implements capability.CapabilityRetriever.
func (r *refreshTokenCapr) Retrieve(req *http.Request) (cap http2.Unit, token types.RefreshToken, err error) {
	// note the token could come from a cookie or request body, so leaving it to the endpoint to retrieve it.
	return
}
