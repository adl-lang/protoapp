package hashing

type Hasher interface {
	ComparePasswordAndHash(password, encodedHash string) (match bool, err error)
	GenerateFromPassword(password string) (encodedHash string, err error)
}

func (al Algorithm) ComparePasswordAndHash(password, encodedHash string) (match bool, err error) {
	return HandleWithErr_Algorithm[bool](
		al,
		func(bcrypt BcryptParams) (bool, error) {
			return bcrypt.ComparePasswordAndHash(password, encodedHash)
		},
		func(argon2id Argon2idParams) (bool, error) {
			return argon2id.ComparePasswordAndHash(password, encodedHash)
		},
		nil,
	)
}

func (al Algorithm) GenerateFromPassword(password string) (encodedHash string, err error) {
	return HandleWithErr_Algorithm[string](
		al,
		func(bcrypt BcryptParams) (string, error) {
			return bcrypt.GenerateFromPassword(password)
		},
		func(argon2id Argon2idParams) (string, error) {
			return argon2id.GenerateFromPassword(password)
		},
		nil,
	)
}
