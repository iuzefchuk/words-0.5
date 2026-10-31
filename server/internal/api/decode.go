package api

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log/slog"
	"math"
	"net/http"
	"regexp"
	"slices"
	"strings"
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

const (
	cellCount    = 225
	maxBodyBytes = 1 << 20
)

var (
	difficulties = []string{"High", "Low", "Medium"}
	matchTypes   = []string{"Classic", "Random"}
	tilePattern  = regexp.MustCompile(`^[A-Z]-\d+$`)
)

type settingsPatch struct {
	difficulty *string
	matchType  *string
}

type tilePlacement struct {
	cell int
	tile string
}

func decodeSettings(r *http.Request) (settingsPatch, error) {
	record, err := decodeRecord(r)
	if err != nil {
		return settingsPatch{}, err
	}
	var settings settingsPatch
	if raw, ok := record["difficulty"]; ok {
		difficulty, err := parseMember(raw, difficulties, "difficulty")
		if err != nil {
			return settingsPatch{}, err
		}
		settings.difficulty = &difficulty
	}
	if raw, ok := record["type"]; ok {
		matchType, err := parseMember(raw, matchTypes, "type")
		if err != nil {
			return settingsPatch{}, err
		}
		settings.matchType = &matchType
	}
	return settings, nil
}

func decodeTilePlacement(r *http.Request) (tilePlacement, error) {
	record, err := decodeRecord(r)
	if err != nil {
		return tilePlacement{}, err
	}
	var cell float64
	if err := json.Unmarshal(record["cell"], &cell); err != nil || cell != math.Trunc(cell) || cell < 0 || cell >= cellCount {
		return tilePlacement{}, badRequest("cell must be a cell index")
	}
	var tile string
	if err := json.Unmarshal(record["tile"], &tile); err != nil {
		return tilePlacement{}, badRequest("tile must be a tile id")
	}
	tile, err = parseTile(tile)
	if err != nil {
		return tilePlacement{}, err
	}
	return tilePlacement{cell: int(cell), tile: tile}, nil
}

func parseTile(value string) (string, error) {
	if !tilePattern.MatchString(value) {
		return "", badRequest("tile must be a tile id")
	}
	return value, nil
}

func decodeRecord(r *http.Request) (map[string]json.RawMessage, error) {
	body, err := io.ReadAll(http.MaxBytesReader(nil, r.Body, maxBodyBytes))
	if err != nil {
		return nil, badRequest("body must be valid json")
	}
	var record map[string]json.RawMessage
	if err := json.Unmarshal(body, &record); err != nil {
		var typeError *json.UnmarshalTypeError
		if errors.As(err, &typeError) {
			return nil, badRequest("body must be an object")
		}
		return nil, badRequest("body must be valid json")
	}
	if record == nil {
		return nil, badRequest("body must be an object")
	}
	return record, nil
}

func parseMember(raw json.RawMessage, allowed []string, name string) (string, error) {
	var value string
	if err := json.Unmarshal(raw, &value); err != nil || !slices.Contains(allowed, value) {
		return "", badRequest(fmt.Sprintf("%s must be one of %s", name, strings.Join(allowed, ", ")))
	}
	return value, nil
}

func writeError(w http.ResponseWriter, err error) {
	status := http.StatusInternalServerError
	var known statusError
	if errors.As(err, &known) {
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
