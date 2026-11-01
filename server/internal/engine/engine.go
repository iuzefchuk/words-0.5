package engine

import (
	"fmt"
	"os"
	"path/filepath"
	"runtime"
	"strconv"
	"unsafe"

	"github.com/ebitengine/purego"
)

type Engine struct {
	alloc                    func(uint32) unsafe.Pointer
	appChangeMatchDifficulty func(uint32, unsafe.Pointer) unsafe.Pointer
	appChangeMatchType       func(uint32, unsafe.Pointer) unsafe.Pointer
	appClearUserTiles        func(uint32) unsafe.Pointer
	appClose                 func(uint32) unsafe.Pointer
	appEventLog              func(uint32) unsafe.Pointer
	appMatchState            func(uint32) unsafe.Pointer
	appOpen                  func(unsafe.Pointer, unsafe.Pointer, uint32) unsafe.Pointer
	appOpponentTurnIsDue     func(uint32) unsafe.Pointer
	appPassTurn              func(uint32) unsafe.Pointer
	appPlaceTile             func(uint32, uint32, unsafe.Pointer) unsafe.Pointer
	appPlayOpponentTurn      func(uint32) unsafe.Pointer
	appPlayfieldGeometry     func(uint32) unsafe.Pointer
	appResignMatch           func(uint32) unsafe.Pointer
	appRestartGame           func(uint32) unsafe.Pointer
	appSaveTurn              func(uint32) unsafe.Pointer
	appShuffleUserTiles      func(uint32) unsafe.Pointer
	appUndoPlaceTile         func(uint32, unsafe.Pointer) unsafe.Pointer
	appValidateTurn          func(uint32) unsafe.Pointer
	dealloc                  func(unsafe.Pointer)
	engineOpen               func(unsafe.Pointer) unsafe.Pointer
	eventsSchemaVersion      func() uint32
}

func Open(dir string) (*Engine, error) {
	path := filepath.Join(dir, "target", "release", "libengine"+libraryExtension())
	library, err := purego.Dlopen(path, purego.RTLD_NOW|purego.RTLD_GLOBAL)
	if err != nil {
		return nil, fmt.Errorf("open engine library %s: %w", path, err)
	}
	e := &Engine{}
	symbols := map[string]any{
		"alloc":                       &e.alloc,
		"app_change_match_difficulty": &e.appChangeMatchDifficulty,
		"app_change_match_type":       &e.appChangeMatchType,
		"app_clear_user_tiles":        &e.appClearUserTiles,
		"app_close":                   &e.appClose,
		"app_event_log":               &e.appEventLog,
		"app_match_state":             &e.appMatchState,
		"app_open":                    &e.appOpen,
		"app_opponent_turn_is_due":    &e.appOpponentTurnIsDue,
		"app_pass_turn":               &e.appPassTurn,
		"app_place_tile":              &e.appPlaceTile,
		"app_play_opponent_turn":      &e.appPlayOpponentTurn,
		"app_playfield_geometry":      &e.appPlayfieldGeometry,
		"app_resign_match":            &e.appResignMatch,
		"app_restart_game":            &e.appRestartGame,
		"app_save_turn":               &e.appSaveTurn,
		"app_shuffle_user_tiles":      &e.appShuffleUserTiles,
		"app_undo_place_tile":         &e.appUndoPlaceTile,
		"app_validate_turn":           &e.appValidateTurn,
		"dealloc":                     &e.dealloc,
		"engine_open":                 &e.engineOpen,
		"events_schema_version":       &e.eventsSchemaVersion,
	}
	for name, function := range symbols {
		address, err := purego.Dlsym(library, name)
		if err != nil {
			return nil, fmt.Errorf("resolve engine symbol %s: %w", name, err)
		}
		purego.RegisterFunc(function, address)
	}
	dictionaryPath := filepath.Join(dir, "src", "assets", "dictionary.bin")
	dictionary, err := os.ReadFile(dictionaryPath)
	if err != nil {
		return nil, fmt.Errorf("read dictionary: %w", err)
	}
	if _, err := e.callWithBytes(dictionary, e.engineOpen); err != nil {
		return nil, fmt.Errorf("open engine: %w", err)
	}
	return e, nil
}

func (e *Engine) EventsSchemaVersion() uint32 {
	return e.eventsSchemaVersion()
}

func (e *Engine) NewApp(seed uint32) (*App, error) {
	payload, err := e.read(e.appOpen(nil, nil, seed))
	if err != nil {
		return nil, err
	}
	handle, err := strconv.ParseUint(string(payload), 10, 32)
	if err != nil {
		return nil, fmt.Errorf("parse app handle %q: %w", payload, err)
	}
	return &App{engine: e, handle: uint32(handle)}, nil
}

func libraryExtension() string {
	switch runtime.GOOS {
	case "darwin":
		return ".dylib"
	case "windows":
		return ".dll"
	default:
		return ".so"
	}
}
