package api

import (
	"encoding/json/v2"
	"errors"
	"log/slog"
	"net/http"
)

type statusError struct {
	status  int
	message string
}

func (e statusError) Error() string {
	return e.message
}

func badRequest(message string) error {
	return statusError{http.StatusBadRequest, message}
}

func writeError(w http.ResponseWriter, err error) {
	status := http.StatusInternalServerError
	if known, ok := errors.AsType[statusError](err); ok {
		status = known.status
	} else {
		slog.Error("request failed", "error", err)
	}
	writeValue(w, status, map[string]string{"error": err.Error()})
}

func writeValue(w http.ResponseWriter, status int, value any) {
	body, err := json.Marshal(value)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	writeJSON(w, status, body)
}

func writeJSON(w http.ResponseWriter, status int, body []byte) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	w.Write(body)
}
