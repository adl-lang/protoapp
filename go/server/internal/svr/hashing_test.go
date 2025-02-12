package svr

import (
	"fmt"
	"testing"

	"github.com/adl-lang/goadl_common/common/hashing"
)

func TestBcrypt(t *testing.T) {
	bp := hashing.Make_BcryptParams()
	hash, err := bp.GenerateFromPassword("abcde")
	if err != nil {
		t.Fatal(err)
	}
	fmt.Printf("TestBcrypt : %v\n", hash)

	ok, err := bp.ComparePasswordAndHash("abcde", hash)
	if err != nil {
		t.Fatal(err)
	}
	if !ok {
		t.Errorf("password doesn't mactch")
	}
}

func TestArgon2id(t *testing.T) {
	ap := hashing.Make_Argon2idParams()
	str := "$argon2id$v=19$m=19456,t=2,p=1$6FILFOGNpxNg2Pip+rWIBQ$JsitSehcoNEjClQ4dLhnMpYpWmD+Gw1doi5U6CDu2mc"
	ok, err := ap.ComparePasswordAndHash("abcde", str)
	if err != nil {
		t.Fatal(err)
	}
	if !ok {
		t.Errorf("password doesn't mactch")
	}
	hash, err := ap.GenerateFromPassword("abcde")
	if err != nil {
		t.Fatal(err)
	}
	fmt.Printf("hash %s\n", hash)
}
