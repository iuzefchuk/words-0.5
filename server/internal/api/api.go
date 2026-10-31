package api

import (
	"fmt"
	"net/http"

	"server/internal/engine"
)

func New(eng *engine.Engine) http.Handler {
	mux := http.NewServeMux()
	addRoutes(mux, newSessions(eng))
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if _, pattern := mux.Handler(r); pattern == "" {
			writeError(w, statusError{http.StatusNotFound, fmt.Sprintf("%s %s not found", r.Method, r.URL.Path)})
			return
		}
		mux.ServeHTTP(w, r)
	})
}

func addRoutes(mux *http.ServeMux, sessions *sessions) {
	mux.Handle("GET /api/boot", handleBoot())
	mux.Handle("GET /api/match", withClientID(state(sessions, func(*engine.App, *http.Request) error { return nil })))
	mux.Handle("POST /api/match", withClientID(state(sessions, resumeMatch)))
	mux.Handle("POST /api/match/opponent-turn", withClientID(state(sessions, conflictOnError(playOpponentTurn))))
	mux.Handle("PATCH /api/match/settings", withClientID(state(sessions, changeSettings)))
	mux.Handle("POST /api/match/pass", withClientID(state(sessions, passTurn)))
	mux.Handle("POST /api/match/resign", withClientID(state(sessions, resignMatch)))
	mux.Handle("POST /api/game/restart", withClientID(state(sessions, restartGame)))
	mux.Handle("POST /api/match/turn", withClientID(state(sessions, saveTurn)))
	mux.Handle("POST /api/match/validation", withClientID(state(sessions, validateTurn)))
	mux.Handle("GET /api/playfield/geometry", withClientID(handleGeometry(sessions)))
	mux.Handle("PUT /api/playfield/tile", withClientID(state(sessions, placeTile)))
	mux.Handle("DELETE /api/playfield/tile/{tile}", withClientID(state(sessions, undoPlaceTile)))
}
