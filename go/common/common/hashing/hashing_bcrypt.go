package hashing

import "golang.org/x/crypto/bcrypt"

func (bp BcryptParams) GenerateFromPassword(password string) (encodedHash string, err error) {
	hash, err := bcrypt.GenerateFromPassword(
		[]byte(password),
		int(bp.Cost),
	)
	if err != nil {
		return "", err
	}
	return string(hash), nil
}

func (BcryptParams) ComparePasswordAndHash(password, encodedHash string) (match bool, err error) {
	err = bcrypt.CompareHashAndPassword(
		[]byte(encodedHash),
		[]byte(password),
	)
	if err != nil {
		return false, err
	}
	return true, nil
}
