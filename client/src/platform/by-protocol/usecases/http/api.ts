import apiGameRestart from '@/client/src/platform/by-protocol/usecases/http/api-game-restart.ts';
import apiMatchOpponentTurn from '@/client/src/platform/by-protocol/usecases/http/api-match-opponent-turn.ts';
import apiMatchPass from '@/client/src/platform/by-protocol/usecases/http/api-match-pass.ts';
import apiMatchResign from '@/client/src/platform/by-protocol/usecases/http/api-match-resign.ts';
import apiMatchSettings from '@/client/src/platform/by-protocol/usecases/http/api-match-settings.ts';
import apiMatchTurn from '@/client/src/platform/by-protocol/usecases/http/api-match-turn.ts';
import apiMatchValidation from '@/client/src/platform/by-protocol/usecases/http/api-match-validation.ts';
import apiMatch from '@/client/src/platform/by-protocol/usecases/http/api-match.ts';
import apiPlayfieldGeometry from '@/client/src/platform/by-protocol/usecases/http/api-playfield-geometry.ts';
import apiPlayfieldTileTile from '@/client/src/platform/by-protocol/usecases/http/api-playfield-tile-{tile}.ts';
import apiPlayfieldTile from '@/client/src/platform/by-protocol/usecases/http/api-playfield-tile.ts';
import type { PlayBlockId, PlayEngine, PlayGeometry, PlaySettings, PlaySlotId, PlayState } from '@/client/src/domain/play.ts';

export default {
  changeSettings(settings: Partial<PlaySettings>): Promise<PlayState> {
    return apiMatchSettings.patch(settings);
  },
  loadGeometry(): Promise<PlayGeometry> {
    return apiPlayfieldGeometry.get();
  },
  loadState(): Promise<PlayState> {
    return apiMatch.get();
  },
  async open(): Promise<void> {
    await apiMatch.post();
  },
  passTurn(): Promise<PlayState> {
    return apiMatchPass.post();
  },
  async placeTile(link: { cell: PlaySlotId; tile: PlayBlockId }): Promise<PlayState> {
    await apiPlayfieldTile.put(link);
    return apiMatchValidation.post();
  },
  playOpponentTurn(): Promise<PlayState> {
    return apiMatchOpponentTurn.post();
  },
  resignMatch(): Promise<PlayState> {
    return apiMatchResign.post();
  },
  restartGame(): Promise<PlayState> {
    return apiGameRestart.post();
  },
  saveTurn(): Promise<PlayState> {
    return apiMatchTurn.post();
  },
  async undoPlaceTile(tile: PlayBlockId): Promise<PlayState> {
    await apiPlayfieldTileTile.delete(tile);
    return apiMatchValidation.post();
  },
} satisfies PlayEngine;
