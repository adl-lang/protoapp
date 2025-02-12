package server

import (
	"encoding/json"
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

var _ jwt.Claims = AccessClaims{}
var _ jwt.Claims = RefreshClaims{}

func (cl AccessClaims) MarshalJSON() (b []byte, err error) {
	return json.Marshal(cl._AccessClaims)
}
func (cl *AccessClaims) UnmarshalJSON(b []byte) (err error) {
	return json.Unmarshal(b, &cl._AccessClaims)
}

func (cl RefreshClaims) MarshalJSON() (b []byte, err error) {
	return json.Marshal(cl._RefreshClaims)
}
func (cl *RefreshClaims) UnmarshalJSON(b []byte) (err error) {
	return json.Unmarshal(b, &cl._RefreshClaims)
}

type AccessTokener interface {
	CreateAccessToken(userID string, role string) (string, error)
	ParseAccessToken(tokenTxt string) (AccessClaims, error)
}

type RefreshTokener interface {
	CreateRefreshToken(userID string) (string, error)
	ParseRefreshToken(tokenTxt string) (RefreshClaims, error)
}

func (sc ServerConfig) CreateAccessToken(userID string, role string) (string, error) {
	exp := jwt.NewNumericDate(time.Now().Add(time.Second * time.Duration(sc.Jwt_access_expiry_secs)))
	ac := Make_AccessClaims(
		sc.Jwt_issuer,
		userID,
		// int64(sc.Jwt_access_expiry_secs),
		exp.Unix(),
		role,
	)
	token := jwt.NewWithClaims(
		jwt.SigningMethodHS256,
		ac,
	)
	tokenString, err := token.SignedString([]byte(sc.Jwt_access_secret))
	if err != nil {
		return "", err
	}
	return tokenString, nil
}

func (sc ServerConfig) ParseAccessToken(tokenTxt string) (AccessClaims, error) {
	ac := AccessClaims{}
	token, err := jwt.ParseWithClaims(
		tokenTxt,
		&ac,
		sc.accessKeyFunc,
		jwt.WithValidMethods([]string{"HS256"}),
	)
	if err != nil {
		return ac, err
	}
	if !token.Valid {
		return ac, fmt.Errorf("invalid token")
	}
	return ac, nil
}

func (sc ServerConfig) CreateRefreshToken(userID string) (string, error) {
	exp := jwt.NewNumericDate(time.Now().Add(time.Second * time.Duration(sc.Jwt_refresh_expiry_secs)))
	ac := Make_RefreshClaims(
		sc.Jwt_issuer,
		userID,
		exp.Unix(),
	)
	token := jwt.NewWithClaims(
		jwt.SigningMethodHS256,
		ac,
	)
	tokenString, err := token.SignedString([]byte(sc.Jwt_refresh_secret))
	if err != nil {
		return "", err
	}
	return tokenString, nil
}

func (sc ServerConfig) ParseRefreshToken(tokenTxt string) (RefreshClaims, error) {
	ac := RefreshClaims{}
	token, err := jwt.ParseWithClaims(
		tokenTxt,
		&ac,
		sc.refreshKeyFunc,
		jwt.WithValidMethods([]string{"HS256"}),
	)
	if err != nil {
		return ac, err
	}
	if !token.Valid {
		return ac, fmt.Errorf("invalid token")
	}
	return ac, nil
}

func (sc ServerConfig) accessKeyFunc(t *jwt.Token) (interface{}, error) {
	return []byte(sc.Jwt_access_secret), nil
}

func (sc ServerConfig) refreshKeyFunc(t *jwt.Token) (interface{}, error) {
	return []byte(sc.Jwt_refresh_secret), nil
}

func (a AccessClaims) GetAudience() (jwt.ClaimStrings, error) { return nil, nil }
func (a AccessClaims) GetExpirationTime() (*jwt.NumericDate, error) {
	return jwt.NewNumericDate(time.Unix(a.Exp, 0)), nil
}
func (a AccessClaims) GetIssuedAt() (*jwt.NumericDate, error)  { return nil, nil }
func (a AccessClaims) GetIssuer() (string, error)              { return a.Iss, nil }
func (a AccessClaims) GetNotBefore() (*jwt.NumericDate, error) { return nil, nil }
func (a AccessClaims) GetSubject() (string, error)             { return a.Sub, nil }

func (r RefreshClaims) GetAudience() (jwt.ClaimStrings, error) { return nil, nil }
func (r RefreshClaims) GetExpirationTime() (*jwt.NumericDate, error) {
	return jwt.NewNumericDate(time.Unix(r.Exp, 0)), nil
}
func (r RefreshClaims) GetIssuedAt() (*jwt.NumericDate, error)  { return nil, nil }
func (r RefreshClaims) GetIssuer() (string, error)              { return r.Iss, nil }
func (r RefreshClaims) GetNotBefore() (*jwt.NumericDate, error) { return nil, nil }
func (r RefreshClaims) GetSubject() (string, error)             { return r.Sub, nil }
