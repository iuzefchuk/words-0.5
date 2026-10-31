package engine

import "unsafe"

type App struct {
	engine *Engine
	handle uint32
}

func (a *App) ChangeMatchDifficulty(difficulty string) error {
	return a.command(a.engine.callWithString(difficulty, func(pointer unsafe.Pointer, length uint32) unsafe.Pointer {
		return a.engine.appChangeMatchDifficulty(a.handle, pointer, length)
	}))
}

func (a *App) ChangeMatchType(matchType string) error {
	return a.command(a.engine.callWithString(matchType, func(pointer unsafe.Pointer, length uint32) unsafe.Pointer {
		return a.engine.appChangeMatchType(a.handle, pointer, length)
	}))
}

func (a *App) ClearUserTiles() error {
	return a.command(a.engine.read(a.engine.appClearUserTiles(a.handle)))
}

func (a *App) Close() error {
	return a.command(a.engine.read(a.engine.appClose(a.handle)))
}

func (a *App) EventLog() ([]byte, error) {
	return a.engine.read(a.engine.appEventLog(a.handle))
}

func (a *App) MatchState() ([]byte, error) {
	return a.engine.read(a.engine.appMatchState(a.handle))
}

func (a *App) OpponentTurnIsDue() (bool, error) {
	payload, err := a.engine.read(a.engine.appOpponentTurnIsDue(a.handle))
	return string(payload) == "true", err
}

func (a *App) PassTurn() error {
	return a.command(a.engine.read(a.engine.appPassTurn(a.handle)))
}

func (a *App) PlaceTile(cell int, tile string) error {
	return a.command(a.engine.callWithString(tile, func(pointer unsafe.Pointer, length uint32) unsafe.Pointer {
		return a.engine.appPlaceTile(a.handle, uint32(cell), pointer, length)
	}))
}

func (a *App) PlayOpponentTurn() error {
	return a.command(a.engine.read(a.engine.appPlayOpponentTurn(a.handle)))
}

func (a *App) PlayfieldGeometry() ([]byte, error) {
	return a.engine.read(a.engine.appPlayfieldGeometry(a.handle))
}

func (a *App) ResignMatch() error {
	return a.command(a.engine.read(a.engine.appResignMatch(a.handle)))
}

func (a *App) RestartGame() error {
	return a.command(a.engine.read(a.engine.appRestartGame(a.handle)))
}

func (a *App) SaveTurn() error {
	return a.command(a.engine.read(a.engine.appSaveTurn(a.handle)))
}

func (a *App) ShuffleUserTiles() error {
	return a.command(a.engine.read(a.engine.appShuffleUserTiles(a.handle)))
}

func (a *App) UndoPlaceTile(tile string) error {
	return a.command(a.engine.callWithString(tile, func(pointer unsafe.Pointer, length uint32) unsafe.Pointer {
		return a.engine.appUndoPlaceTile(a.handle, pointer, length)
	}))
}

func (a *App) ValidateTurn() error {
	return a.command(a.engine.read(a.engine.appValidateTurn(a.handle)))
}

func (a *App) command(_ []byte, err error) error {
	return err
}
