package api

import (
	"context"
	"net/http"
	"regexp"
	"uuid"
)

type clientIDKey struct{}

const (
	clientIDCookie = "client_id"
	clientIDMaxAge = 34_560_000
)

var clientIDPattern = regexp.MustCompile(`^[A-Za-z0-9-]{8,64}$`)

func withClientID(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		var id string
		if cookie, err := r.Cookie(clientIDCookie); err == nil && clientIDPattern.MatchString(cookie.Value) {
			id = cookie.Value
		} else {
			id = uuid.New().String()
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
