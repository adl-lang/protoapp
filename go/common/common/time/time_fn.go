package time

import (
	"fmt"
	"reflect"
	"time"

	"github.com/adl-lang/goadl_rt/v3/adljson"
)

type InstantHelpers struct{}
type LocalDateHelpers struct{}
type LocalTimeHelpers struct{}
type LocalDateTimeHelpers struct{}

// DayOfWeekHelpers
// DurationHelpers

func (i *InstantHelpers) Construct(objPrt any, v any, typeparamDec ...adljson.DecodeFunc) (any, error) {
	tv := v.(int64)
	t := time.UnixMilli(tv)
	return t, nil
}
func (i *InstantHelpers) BuildDecodeFunc(typeparamDec ...adljson.DecodeFunc) adljson.DecodeFunc {
	return func(path []string, rval *reflect.Value, v any) error {
		tv := v.(int64)
		t := time.UnixMilli(tv)
		rval.Set(reflect.ValueOf(t))
		return nil
	}
}
func (i *InstantHelpers) BuildEncodeFunc(typeparamEnc ...adljson.EncoderFunc) adljson.EncoderFunc {
	var f adljson.EncoderFunc = func(e *adljson.EncodeState, v reflect.Value) error {
		t := v.Interface().(time.Time)
		_, err := e.WriteString(fmt.Sprintf("%d", (t.UnixMilli())))
		return err
	}
	return f
}

// A date in ISO8601 format
// newtype LocalDate = String = "1970-01-01";
func (l *LocalDateHelpers) Construct(objPrt any, v any, typeparamDec ...adljson.DecodeFunc) (any, error) {
	str := v.(string)
	if t, err := time.Parse(time.DateOnly, str); err != nil {
		return nil, err
	} else {
		return t, nil
	}
}
func (l *LocalDateHelpers) BuildDecodeFunc(typeparamDec ...adljson.DecodeFunc) adljson.DecodeFunc {
	return func(path []string, rv *reflect.Value, v any) error {
		str := v.(string)
		if t, err := time.Parse(time.DateOnly, str); err != nil {
			return err
		} else {
			rv.Set(reflect.ValueOf(t))
		}
		return nil
	}
}
func (l *LocalDateHelpers) BuildEncodeFunc(typeparamEnc ...adljson.EncoderFunc) adljson.EncoderFunc {
	return func(e *adljson.EncodeState, v reflect.Value) error {
		t := v.Interface().(time.Time)
		str := t.Format(time.DateOnly)
		e.WriteString(`"`)
		e.WriteString(str)
		e.WriteString(`"`)
		return nil
	}
}

// A time in ISO8601 format
// newtype LocalTime = String = "00:00:00";
func (l *LocalTimeHelpers) Construct(objPrt any, v any, typeparamDec ...adljson.DecodeFunc) (any, error) {
	str := v.(string)
	if t, err := time.Parse(time.TimeOnly, str); err != nil {
		return nil, err
	} else {
		return t, nil
	}
}
func (l *LocalTimeHelpers) BuildDecodeFunc(typeparamDec ...adljson.DecodeFunc) adljson.DecodeFunc {
	return func(path []string, rv *reflect.Value, v any) error {
		str := v.(string)
		if t, err := time.Parse(time.TimeOnly, str); err != nil {
			return err
		} else {
			rv.Set(reflect.ValueOf(t))
		}
		return nil
	}
}
func (l *LocalTimeHelpers) BuildEncodeFunc(typeparamEnc ...adljson.EncoderFunc) adljson.EncoderFunc {
	return func(e *adljson.EncodeState, v reflect.Value) error {
		t := v.Interface().(time.Time)
		str := t.Format(time.TimeOnly)
		e.WriteString(`"`)
		e.WriteString(str)
		e.WriteString(`"`)
		return nil
	}
}

const localDateTimeFormat = "2006-01-02T15:04:05"

// A datetime in ISO8601 format
// newtype LocalDateTime = String = "1970-01-01T00:00:00";
func (l *LocalDateTimeHelpers) Construct(objPrt any, v any, typeparamDec ...adljson.DecodeFunc) (any, error) {
	str := v.(string)
	if t, err := time.Parse(localDateTimeFormat, str); err != nil {
		return nil, err
	} else {
		return t, nil
	}
}
func (l *LocalDateTimeHelpers) BuildDecodeFunc(typeparamDec ...adljson.DecodeFunc) adljson.DecodeFunc {
	return func(path []string, rv *reflect.Value, v any) error {
		str := v.(string)
		if t, err := time.Parse(localDateTimeFormat, str); err != nil {
			return err
		} else {
			rv.Set(reflect.ValueOf(t))
		}
		return nil
	}
}
func (l *LocalDateTimeHelpers) BuildEncodeFunc(typeparamEnc ...adljson.EncoderFunc) adljson.EncoderFunc {
	return func(e *adljson.EncodeState, v reflect.Value) error {
		t := v.Interface().(time.Time)
		str := t.Format(localDateTimeFormat)
		e.WriteString(`"`)
		e.WriteString(str)
		e.WriteString(`"`)
		return nil
	}
}

var _ adljson.CustomTypeHelper = &InstantHelpers{}
var _ adljson.CustomTypeHelper = &LocalDateHelpers{}
var _ adljson.CustomTypeHelper = &LocalTimeHelpers{}
var _ adljson.CustomTypeHelper = &LocalDateTimeHelpers{}
