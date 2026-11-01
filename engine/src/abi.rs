#![expect(unsafe_code)]

use std::collections::HashMap;
use std::panic::{self, AssertUnwindSafe};
use std::sync::{Arc, LazyLock, Mutex, Once, OnceLock, PoisonError};

use serde::Serialize;
use serde::de::value::{self, StrDeserializer};

use crate::Engine;
use crate::app::App;
use crate::domain::published::{InventoryTile, MatchDifficulty, MatchSettings, MatchType, PlayfieldCell, TimelineEvent};

type Output = Result<Vec<u8>, String>;

struct Apps {
    by_handle: HashMap<u32, Arc<Mutex<App<'static>>>>,
    next_handle: u32,
}

static ENGINE: OnceLock<Engine> = OnceLock::new();

static APPS: LazyLock<Mutex<Apps>> = LazyLock::new(|| {
    Mutex::new(Apps {
        by_handle: HashMap::new(),
        next_handle: 0,
    })
});

static BUFFERS: LazyLock<Mutex<HashMap<usize, Vec<u8>>>> = LazyLock::new(|| Mutex::new(HashMap::new()));

static PANIC_MESSAGE: Mutex<String> = Mutex::new(String::new());

const STATUS_OK: u8 = 0;

const STATUS_ERROR: u8 = 1;

const HEADER_LEN: usize = 5;

#[unsafe(no_mangle)]
pub extern "C" fn alloc(len: u32) -> *mut u8 {
    if len == 0 {
        return std::ptr::null_mut();
    }
    keep(vec![0; len as usize])
}

#[unsafe(no_mangle)]
pub extern "C" fn dealloc(ptr: *mut u8) {
    take(ptr);
}

#[unsafe(no_mangle)]
pub extern "C" fn engine_open(dictionary_ptr: *const u8) -> *mut u8 {
    let dictionary = input(dictionary_ptr);
    respond(|| {
        install_panic_hook();
        ENGINE
            .set(Engine::new(dictionary?.into_boxed_slice()))
            .map_err(|_| "engine is already open".to_owned())?;
        Ok(Vec::new())
    })
}

#[unsafe(no_mangle)]
pub extern "C" fn events_schema_version() -> u32 {
    TimelineEvent::SCHEMA_VERSION
}

#[unsafe(no_mangle)]
pub extern "C" fn app_open(events_ptr: *const u8, settings_ptr: *const u8, seed: u32) -> *mut u8 {
    let events_json = input(events_ptr);
    let settings_json = input(settings_ptr);
    respond(|| {
        let engine = ENGINE.get().ok_or("engine is not open")?;
        let events: Option<Vec<TimelineEvent>> = parse_optional(&events_json?)?;
        let settings: Option<MatchSettings> = parse_optional(&settings_json?)?;
        let app = App::open(engine, events.as_deref(), settings, seed).map_err(|error| error.to_string())?;
        let mut apps = APPS.lock().map_err(|_| "app registry is poisoned")?;
        let handle = apps.next_handle;
        apps.next_handle += 1;
        apps.by_handle.insert(handle, Arc::new(Mutex::new(app)));
        json(&handle)
    })
}

#[unsafe(no_mangle)]
pub extern "C" fn app_close(handle: u32) -> *mut u8 {
    respond(|| {
        let mut apps = APPS.lock().map_err(|_| "app registry is poisoned")?;
        apps.by_handle
            .remove(&handle)
            .map(|_| Vec::new())
            .ok_or_else(|| format!("unknown app handle {handle}"))
    })
}

#[unsafe(no_mangle)]
pub extern "C" fn app_change_match_difficulty(handle: u32, ptr: *const u8) -> *mut u8 {
    let difficulty = input(ptr);
    with_app(handle, |app| {
        app.commands()
            .change_match_difficulty(parse_enum::<MatchDifficulty>(&difficulty?)?);
        Ok(Vec::new())
    })
}

#[unsafe(no_mangle)]
pub extern "C" fn app_change_match_type(handle: u32, ptr: *const u8) -> *mut u8 {
    let match_type = input(ptr);
    with_app(handle, |app| {
        app.commands().change_match_type(parse_enum::<MatchType>(&match_type?)?);
        Ok(Vec::new())
    })
}

#[unsafe(no_mangle)]
pub extern "C" fn app_clear_user_tiles(handle: u32) -> *mut u8 {
    with_app(handle, |app| empty(app.commands().clear_user_tiles()))
}

#[unsafe(no_mangle)]
pub extern "C" fn app_pass_turn(handle: u32) -> *mut u8 {
    with_app(handle, |app| empty(app.commands().pass_turn()))
}

#[unsafe(no_mangle)]
pub extern "C" fn app_place_tile(handle: u32, cell: u32, tile_ptr: *const u8) -> *mut u8 {
    let tile = input(tile_ptr);
    with_app(handle, |app| {
        let cell = PlayfieldCell::new(cell as usize).ok_or_else(|| format!("cell {cell} is not on the playfield"))?;
        empty(app.commands().place_tile(cell, parse_tile(&tile?)?))
    })
}

#[unsafe(no_mangle)]
pub extern "C" fn app_play_opponent_turn(handle: u32) -> *mut u8 {
    with_app(handle, |app| {
        app.commands()
            .play_opponent_turn()
            .map_err(|error| error.to_string())
            .and_then(|response| json(&response))
    })
}

#[unsafe(no_mangle)]
pub extern "C" fn app_resign_match(handle: u32) -> *mut u8 {
    with_app(handle, |app| empty(app.commands().resign_match()))
}

#[unsafe(no_mangle)]
pub extern "C" fn app_restart_game(handle: u32) -> *mut u8 {
    with_app(handle, |app| {
        app.commands().restart_game();
        Ok(Vec::new())
    })
}

#[unsafe(no_mangle)]
pub extern "C" fn app_save_turn(handle: u32) -> *mut u8 {
    with_app(handle, |app| {
        app.commands()
            .save_turn()
            .map_err(|error| error.to_string())
            .and_then(|response| json(&response))
    })
}

#[unsafe(no_mangle)]
pub extern "C" fn app_shuffle_user_tiles(handle: u32) -> *mut u8 {
    with_app(handle, |app| {
        app.commands().shuffle_user_tiles();
        Ok(Vec::new())
    })
}

#[unsafe(no_mangle)]
pub extern "C" fn app_undo_place_tile(handle: u32, tile_ptr: *const u8) -> *mut u8 {
    let tile = input(tile_ptr);
    with_app(handle, |app| empty(app.commands().undo_place_tile(parse_tile(&tile?)?)))
}

#[unsafe(no_mangle)]
pub extern "C" fn app_validate_turn(handle: u32) -> *mut u8 {
    with_app(handle, |app| empty(app.commands().validate_turn()))
}

#[unsafe(no_mangle)]
pub extern "C" fn app_event_log(handle: u32) -> *mut u8 {
    with_app(handle, |app| json(&app.queries().event_log()))
}

#[unsafe(no_mangle)]
pub extern "C" fn app_match_state(handle: u32) -> *mut u8 {
    with_app(handle, |app| json(&app.queries().match_state()))
}

#[unsafe(no_mangle)]
pub extern "C" fn app_opponent_turn_is_due(handle: u32) -> *mut u8 {
    with_app(handle, |app| json(&app.queries().opponent_turn_is_due()))
}

#[unsafe(no_mangle)]
pub extern "C" fn app_playfield_geometry(handle: u32) -> *mut u8 {
    with_app(handle, |app| json(&app.queries().playfield_geometry()))
}

#[unsafe(no_mangle)]
pub extern "C" fn panic_message() -> *mut u8 {
    respond(|| {
        Ok(PANIC_MESSAGE
            .lock()
            .map_or_else(|poisoned| poisoned.into_inner().clone(), |message| message.clone())
            .into_bytes())
    })
}

fn keep(mut buffer: Vec<u8>) -> *mut u8 {
    let ptr = buffer.as_mut_ptr();
    BUFFERS
        .lock()
        .unwrap_or_else(PoisonError::into_inner)
        .insert(ptr.addr(), buffer);
    ptr
}

fn take(ptr: *const u8) -> Option<Vec<u8>> {
    BUFFERS.lock().unwrap_or_else(PoisonError::into_inner).remove(&ptr.addr())
}

fn input(ptr: *const u8) -> Result<Vec<u8>, String> {
    if ptr.is_null() {
        return Ok(Vec::new());
    }
    take(ptr).ok_or_else(|| format!("unknown engine buffer {:#x}", ptr.addr()))
}

fn respond(call: impl FnOnce() -> Output) -> *mut u8 {
    let output = panic::catch_unwind(AssertUnwindSafe(call)).unwrap_or_else(|payload| Err(panic_text(payload.as_ref())));
    let (status, payload) = match output {
        Ok(payload) => (STATUS_OK, payload),
        Err(message) => (STATUS_ERROR, message.into_bytes()),
    };
    let length = u32::try_from(payload.len()).expect("a response length fits in u32");
    let mut buffer = Vec::with_capacity(HEADER_LEN + payload.len());
    buffer.push(status);
    buffer.extend_from_slice(&length.to_le_bytes());
    buffer.extend_from_slice(&payload);
    keep(buffer)
}

fn with_app(handle: u32, call: impl FnOnce(&mut App<'static>) -> Output) -> *mut u8 {
    respond(|| {
        let app = APPS
            .lock()
            .map_err(|_| "app registry is poisoned")?
            .by_handle
            .get(&handle)
            .cloned()
            .ok_or_else(|| format!("unknown app handle {handle}"))?;
        let mut app = app.lock().map_err(|_| format!("app {handle} is poisoned"))?;
        call(&mut app)
    })
}

fn empty<E: std::fmt::Display>(result: Result<(), E>) -> Output {
    result.map(|()| Vec::new()).map_err(|error| error.to_string())
}

fn json<T: Serialize>(value: &T) -> Output {
    serde_json::to_vec(value).map_err(|error| error.to_string())
}

fn parse_optional<T: serde::de::DeserializeOwned>(input: &[u8]) -> Result<Option<T>, String> {
    if input.is_empty() {
        Ok(None)
    } else {
        serde_json::from_slice(input).map(Some).map_err(|error| error.to_string())
    }
}

fn parse_enum<T: serde::de::DeserializeOwned>(input: &[u8]) -> Result<T, String> {
    let text = std::str::from_utf8(input).map_err(|error| error.to_string())?;
    T::deserialize(StrDeserializer::<value::Error>::new(text)).map_err(|error| error.to_string())
}

fn parse_tile(input: &[u8]) -> Result<InventoryTile, String> {
    let text = std::str::from_utf8(input).map_err(|error| error.to_string())?;
    text.parse::<InventoryTile>().map_err(|error| error.to_string())
}

fn panic_text(payload: &(dyn std::any::Any + Send)) -> String {
    payload
        .downcast_ref::<String>()
        .cloned()
        .or_else(|| payload.downcast_ref::<&str>().map(|text| (*text).to_owned()))
        .unwrap_or_else(|| "engine panicked".to_owned())
}

fn install_panic_hook() {
    static HOOK: Once = Once::new();
    HOOK.call_once(|| {
        panic::set_hook(Box::new(|info| {
            if let Ok(mut message) = PANIC_MESSAGE.lock() {
                *message = info.to_string();
            }
        }));
    });
}
