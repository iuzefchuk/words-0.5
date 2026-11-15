import CryptoRngAdapter from '@/client/src/platform/by-port/crypto/adapters/rng.ts';
import StorageDbAdapter from '@/client/src/platform/by-port/storage/adapters/db.ts';
import WasmProtocol from '@/client/src/platform/by-protocol/io/wasm.ts';
import dictionaryBin from '@/client/src/platform/by-protocol/usage/http/per-file/dictionary.bin.ts';
import engineWasm from '@/client/src/platform/by-protocol/usage/http/per-file/engine.wasm.ts';
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

class EngineInstance {
  private static engine: Engine | undefined;

  private static readonly EVENTS_KEY = 'play_runtime_events';

  static getOpened(): Engine {
    if (this.engine === undefined) throw new ReferenceError('expected opened engine, got undefined');
    return this.engine;
  }

  static loadState(): Promise<PlayState> {
    const { exports, handle } = this.getOpened();
    return Promise.resolve(WasmProtocol.callJson(() => exports.app_match_state(handle)) as PlayState);
  }

  static async open(): Promise<void> {
    const [dictionary, wasm] = await Promise.all([dictionaryBin.get(), engineWasm.get()]);
    const exports = await WasmProtocol.instantiate<EngineExports>(wasm);
    WasmProtocol.callText(() => exports.engine_open(WasmProtocol.allocate(new Uint8Array(dictionary))));
    const version = WasmProtocol.callNumber(() => exports.events_schema_version());
    const snapshot = (await StorageDbAdapter.load(this.EVENTS_KEY, version)) as { events: unknown; version: number } | null;
    const events = snapshot?.version === version ? snapshot.events : null;
    const seed = CryptoRngAdapter.generateSeed();
    const handle = Number(
      WasmProtocol.callText(() =>
        exports.app_open(WasmProtocol.allocate(events === null ? '' : JSON.stringify(events)), 0, seed),
      ),
    );
    this.engine = { exports, handle, version };
    if (WasmProtocol.callJson(() => exports.app_opponent_turn_is_due(handle)) === true) {
      WasmProtocol.callText(() => exports.app_play_opponent_turn(handle));
    }
    await this.persist();
  }

  static async persist(): Promise<PlayState> {
    const { exports, handle, version } = this.getOpened();
    const log = WasmProtocol.callJson(() => exports.app_event_log(handle));
    await StorageDbAdapter.save(this.EVENTS_KEY, version, { events: log, version });
    return this.loadState();
  }
}

export default {
  changeSettings({ difficulty, type }: Partial<PlaySettings>): Promise<PlayState> {
    const { exports, handle } = EngineInstance.getOpened();
    if (difficulty !== undefined) {
      WasmProtocol.callText(() => exports.app_change_match_difficulty(handle, WasmProtocol.allocate(difficulty)));
    }
    if (type !== undefined) {
      WasmProtocol.callText(() => exports.app_change_match_type(handle, WasmProtocol.allocate(type)));
    }
    return EngineInstance.persist();
  },
  loadGeometry(): Promise<PlayGeometry> {
    const { exports, handle } = EngineInstance.getOpened();
    return Promise.resolve(WasmProtocol.callJson(() => exports.app_playfield_geometry(handle)) as PlayGeometry);
  },
  loadState(): Promise<PlayState> {
    return EngineInstance.loadState();
  },
  open(): Promise<void> {
    return EngineInstance.open();
  },
  passTurn(): Promise<PlayState> {
    const { exports, handle } = EngineInstance.getOpened();
    WasmProtocol.callText(() => exports.app_pass_turn(handle));
    return EngineInstance.persist();
  },
  placeTile(link: { cell: PlaySlotId; tile: PlayBlockId }): Promise<PlayState> {
    const { exports, handle } = EngineInstance.getOpened();
    WasmProtocol.callText(() => exports.app_place_tile(handle, link.cell, WasmProtocol.allocate(link.tile)));
    WasmProtocol.callText(() => exports.app_validate_turn(handle));
    return EngineInstance.persist();
  },
  playOpponentTurn(): Promise<PlayState> {
    const { exports, handle } = EngineInstance.getOpened();
    WasmProtocol.callText(() => exports.app_play_opponent_turn(handle));
    return EngineInstance.persist();
  },
  resignMatch(): Promise<PlayState> {
    const { exports, handle } = EngineInstance.getOpened();
    WasmProtocol.callText(() => exports.app_resign_match(handle));
    return EngineInstance.persist();
  },
  restartGame(): Promise<PlayState> {
    const { exports, handle } = EngineInstance.getOpened();
    WasmProtocol.callText(() => exports.app_restart_game(handle));
    return EngineInstance.persist();
  },
  saveTurn(): Promise<PlayState> {
    const { exports, handle } = EngineInstance.getOpened();
    WasmProtocol.callText(() => exports.app_save_turn(handle));
    return EngineInstance.persist();
  },
  undoPlaceTile(tile: PlayBlockId): Promise<PlayState> {
    const { exports, handle } = EngineInstance.getOpened();
    WasmProtocol.callText(() => exports.app_undo_place_tile(handle, WasmProtocol.allocate(tile)));
    WasmProtocol.callText(() => exports.app_validate_turn(handle));
    return EngineInstance.persist();
  },
} satisfies PlayEngine;
