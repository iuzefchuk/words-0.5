package api

import (
	"net/http"

	"server/internal/engine"
)

type step func(app *engine.App, r *http.Request) error

func handleBoot() http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		writeValue(w, http.StatusOK, map[string]bool{"isReady": true})
	})
}

func handleGeometry(sessions *sessions) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		app, err := sessions.open(clientID(r.Context()))
		if err != nil {
			writeError(w, err)
			return
		}
		geometry, err := app.PlayfieldGeometry()
		if err != nil {
			writeError(w, err)
			return
		}
		writeJSON(w, http.StatusOK, geometry)
	})
}

func state(sessions *sessions, run step) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		app, err := sessions.open(clientID(r.Context()))
		if err != nil {
			writeError(w, err)
			return
		}
		if err := run(app, r); err != nil {
			writeError(w, err)
			return
		}
		matchState, err := app.MatchState()
		if err != nil {
			writeError(w, err)
			return
		}
		writeJSON(w, http.StatusOK, matchState)
	})
}

func conflictOnError(run step) step {
	return func(app *engine.App, r *http.Request) error {
		if err := run(app, r); err != nil {
			return statusError{http.StatusConflict, err.Error()}
		}
		return nil
	}
}

func resumeMatch(app *engine.App, _ *http.Request) error {
	due, err := app.OpponentTurnIsDue()
	if err != nil || !due {
		return err
	}
	return app.PlayOpponentTurn()
}

func playOpponentTurn(app *engine.App, _ *http.Request) error {
	return app.PlayOpponentTurn()
}

func changeSettings(app *engine.App, r *http.Request) error {
	settings, err := decodeSettings(r)
	if err != nil {
		return err
	}
	if settings.difficulty != nil {
		if err := app.ChangeMatchDifficulty(*settings.difficulty); err != nil {
			return err
		}
	}
	if settings.matchType != nil {
		if err := app.ChangeMatchType(*settings.matchType); err != nil {
			return err
		}
	}
	return nil
}

func passTurn(app *engine.App, _ *http.Request) error {
	return app.PassTurn()
}

func resignMatch(app *engine.App, _ *http.Request) error {
	return app.ResignMatch()
}

func restartGame(app *engine.App, _ *http.Request) error {
	return app.RestartGame()
}

func saveTurn(app *engine.App, _ *http.Request) error {
	return app.SaveTurn()
}

func validateTurn(app *engine.App, _ *http.Request) error {
	return app.ValidateTurn()
}

func placeTile(app *engine.App, r *http.Request) error {
	placement, err := decodeTilePlacement(r)
	if err != nil {
		return err
	}
	return app.PlaceTile(placement.cell, placement.tile)
}

func undoPlaceTile(app *engine.App, r *http.Request) error {
	tile, err := parseTile(r.PathValue("tile"))
	if err != nil {
		return err
	}
	return app.UndoPlaceTile(tile)
}
