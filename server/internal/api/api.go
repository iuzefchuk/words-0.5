package api

import (
	"net/http"

	"server/internal/engine"
)

func New(eng *engine.Engine) http.Handler {
	mux := http.NewServeMux()
	addRoutes(mux, newSessionStore(eng))
	return http.MaxBytesHandler(mux, maxBodyBytes)
}

func addRoutes(mux *http.ServeMux, sessions *sessionStore) {
	mux.Handle("/", handleNotFound())
	mux.Handle("GET /api/boot", handleBoot())
	mux.Handle("GET /api/match", withClientID(handleStep(sessions, func(*engine.App, *http.Request) error { return nil })))
	mux.Handle("POST /api/match", withClientID(handleStep(sessions, resumeMatch)))
	mux.Handle("POST /api/match/opponent-turn", withClientID(handleStep(sessions, conflictOnError(playOpponentTurn))))
	mux.Handle("PATCH /api/match/settings", withClientID(handleStep(sessions, changeSettings)))
	mux.Handle("POST /api/match/pass", withClientID(handleStep(sessions, passTurn)))
	mux.Handle("POST /api/match/resign", withClientID(handleStep(sessions, resignMatch)))
	mux.Handle("POST /api/game/restart", withClientID(handleStep(sessions, restartGame)))
	mux.Handle("POST /api/match/turn", withClientID(handleStep(sessions, saveTurn)))
	mux.Handle("POST /api/match/validation", withClientID(handleStep(sessions, validateTurn)))
	mux.Handle("GET /api/playfield/geometry", withClientID(handleGeometry(sessions)))
	mux.Handle("PUT /api/playfield/tile", withClientID(handleStep(sessions, placeTile)))
	mux.Handle("DELETE /api/playfield/tile/{tile}", withClientID(handleStep(sessions, undoPlaceTile)))
}
