package api

import (
	"context"
	"crypto/rand"
	"fmt"
	"net/http"
	"regexp"
)

type clientIDKey struct{}

const (
	clientIDCookie = "client_id"
	clientIDMaxAge = 34_560_000
)

var clientIDPattern = regexp.MustCompile(`^[A-Za-z0-9-]{8,64}$`)

func withClientID(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		id := ""
		if cookie, err := r.Cookie(clientIDCookie); err == nil && clientIDPattern.MatchString(cookie.Value) {
			id = cookie.Value
		} else {
			id = newClientID()
			http.SetCookie(w, &http.Cookie{
				Name:     clientIDCookie,
				Value:    id,
				Path:     "/api",
				MaxAge:   clientIDMaxAge,
				HttpOnly: true,
				SameSite: http.SameSiteStrictMode,
			})
		}
		next.ServeHTTP(w, r.WithContext(context.WithValue(r.Context(), clientIDKey{}, id)))
	})
}

func clientID(ctx context.Context) string {
	id, _ := ctx.Value(clientIDKey{}).(string)
	return id
}

func newClientID() string {
	var bytes [16]byte
	rand.Read(bytes[:])
	bytes[6] = bytes[6]&0x0f | 0x40
	bytes[8] = bytes[8]&0x3f | 0x80
	return fmt.Sprintf("%x-%x-%x-%x-%x", bytes[0:4], bytes[4:6], bytes[6:8], bytes[8:10], bytes[10:])
}
