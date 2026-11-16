package api

import (
	"encoding/json/jsontext"
	"encoding/json/v2"
	"errors"
	"fmt"
	"math"
	"net/http"
	"regexp"
	"slices"
	"strings"
)

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
	rawCell := record["cell"]
	var cell float64
	if err := json.Unmarshal(rawCell, &cell); err != nil || rawCell.Kind() != jsontext.KindNumber || cell != math.Trunc(cell) || cell < 0 || cell >= cellCount {
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

func decodeRecord(r *http.Request) (map[string]jsontext.Value, error) {
	var record map[string]jsontext.Value
	if err := json.UnmarshalRead(r.Body, &record); err != nil {
		if tooLarge, ok := errors.AsType[*http.MaxBytesError](err); ok {
			return nil, statusError{http.StatusRequestEntityTooLarge, fmt.Sprintf("body must be at most %d bytes", tooLarge.Limit)}
		}
		if _, ok := errors.AsType[*json.SemanticError](err); ok {
			return nil, badRequest("body must be an object")
		}
		return nil, badRequest("body must be valid json")
	}
	if record == nil {
		return nil, badRequest("body must be an object")
	}
	return record, nil
}

func parseMember(raw jsontext.Value, allowed []string, name string) (string, error) {
	var value string
	if err := json.Unmarshal(raw, &value); err != nil || !slices.Contains(allowed, value) {
		return "", badRequest(fmt.Sprintf("%s must be one of %s", name, strings.Join(allowed, ", ")))
	}
	return value, nil
}
