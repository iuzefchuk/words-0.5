import CryptoRngAdapter from '@/client/src/platform/by-port/io/crypto/adapters/rng.ts';
import playRuntimeEvents from '@/client/src/platform/by-port/usecases/storage/db/playRuntimeEvents.ts';
import WasmProtocol from '@/client/src/platform/by-protocol/io/wasm.ts';
import dictionaryBin from '@/client/src/platform/by-protocol/usecases/http/dictionary.bin.ts';
import engineWasm from '@/client/src/platform/by-protocol/usecases/http/engine.wasm.ts';
import type { PlayBlockId, PlayEngine, PlayGeometry, PlaySettings, PlaySlotId, PlayState } from '@/client/src/domain/play.ts';

type Engine = { exports: EngineExports; handle: number; version: number };

type EngineExports = {
  app_change_match_difficulty(handle: number, pointer: number): number;
  app_change_match_type(handle: number, pointer: number): number;
  app_event_log(handle: number): number;
  app_match_state(handle: number): number;
  app_open(eventsPointer: number, settingsPointer: number, seed: number): number;
  app_opponent_turn_is_due(handle: number): number;
  app_pass_turn(handle: number): number;
  app_place_tile(handle: number, cell: number, pointer: number): number;
  app_play_opponent_turn(handle: number): number;
  app_playfield_geometry(handle: number): number;
  app_resign_match(handle: number): number;
  app_restart_game(handle: number): number;
  app_save_turn(handle: number): number;
  app_undo_place_tile(handle: number, pointer: number): number;
  app_validate_turn(handle: number): number;
  engine_open(pointer: number): number;
  events_schema_version(): number;
};

let engine: Engine | undefined;

function loadState(): Promise<PlayState> {
  const { exports, handle } = openedEngine();
  return Promise.resolve(WasmProtocol.callJson(() => exports.app_match_state(handle)) as PlayState);
}

function openedEngine(): Engine {
  if (engine === undefined) throw new ReferenceError('expected opened engine, got undefined');
  return engine;
}

async function persist(): Promise<PlayState> {
  const { exports, handle, version } = openedEngine();
  const log = WasmProtocol.callJson(() => exports.app_event_log(handle));
  await playRuntimeEvents.save({ events: log, version });
  return loadState();
}

export default {
  changeSettings({ difficulty, type }: Partial<PlaySettings>): Promise<PlayState> {
    const { exports, handle } = openedEngine();
    if (difficulty !== undefined) {
      WasmProtocol.callText(() => exports.app_change_match_difficulty(handle, WasmProtocol.allocate(difficulty)));
    }
    if (type !== undefined) {
      WasmProtocol.callText(() => exports.app_change_match_type(handle, WasmProtocol.allocate(type)));
    }
    return persist();
  },
  loadGeometry(): Promise<PlayGeometry> {
    const { exports, handle } = openedEngine();
    return Promise.resolve(WasmProtocol.callJson(() => exports.app_playfield_geometry(handle)) as PlayGeometry);
  },
  loadState,
  async open(): Promise<void> {
    const [dictionary, wasm] = await Promise.all([dictionaryBin.get(), engineWasm.get()]);
    const exports = await WasmProtocol.instantiate<EngineExports>(wasm);
    WasmProtocol.callText(() => exports.engine_open(WasmProtocol.allocate(new Uint8Array(dictionary))));
    const version = WasmProtocol.callNumber(() => exports.events_schema_version());
    const snapshot = (await playRuntimeEvents.load()) as { events: unknown; version: number } | null;
    const events = snapshot?.version === version ? snapshot.events : null;
    const seed = CryptoRngAdapter.seed();
    const handle = Number(
      WasmProtocol.callText(() =>
        exports.app_open(WasmProtocol.allocate(events === null ? '' : JSON.stringify(events)), 0, seed),
      ),
    );
    engine = { exports, handle, version };
    if (WasmProtocol.callJson(() => exports.app_opponent_turn_is_due(handle)) === true) {
      WasmProtocol.callText(() => exports.app_play_opponent_turn(handle));
    }
    await persist();
  },
  passTurn(): Promise<PlayState> {
    const { exports, handle } = openedEngine();
    WasmProtocol.callText(() => exports.app_pass_turn(handle));
    return persist();
  },
  placeTile(link: { cell: PlaySlotId; tile: PlayBlockId }): Promise<PlayState> {
    const { exports, handle } = openedEngine();
    WasmProtocol.callText(() => exports.app_place_tile(handle, link.cell, WasmProtocol.allocate(link.tile)));
    WasmProtocol.callText(() => exports.app_validate_turn(handle));
    return persist();
  },
  playOpponentTurn(): Promise<PlayState> {
    const { exports, handle } = openedEngine();
    WasmProtocol.callText(() => exports.app_play_opponent_turn(handle));
    return persist();
  },
  resignMatch(): Promise<PlayState> {
    const { exports, handle } = openedEngine();
    WasmProtocol.callText(() => exports.app_resign_match(handle));
    return persist();
  },
  restartGame(): Promise<PlayState> {
    const { exports, handle } = openedEngine();
    WasmProtocol.callText(() => exports.app_restart_game(handle));
    return persist();
  },
  saveTurn(): Promise<PlayState> {
    const { exports, handle } = openedEngine();
    WasmProtocol.callText(() => exports.app_save_turn(handle));
    return persist();
  },
  undoPlaceTile(tile: PlayBlockId): Promise<PlayState> {
    const { exports, handle } = openedEngine();
    WasmProtocol.callText(() => exports.app_undo_place_tile(handle, WasmProtocol.allocate(tile)));
    WasmProtocol.callText(() => exports.app_validate_turn(handle));
    return persist();
  },
} satisfies PlayEngine;
