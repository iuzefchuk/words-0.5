import dialog from './en/dialog.json';
import end from './en/end.json';
import game from './en/game.json';
import settings from './en/settings.json';

type Namespace = Record<string, string>;

// English uses a dot group separator (matches the source's NumberSeparatorType.Dot mapping).
const NUMBER_LOCALE = 'de-DE';

const NAMESPACES: Record<string, Namespace> = { dialog, end, game, settings };

class TextLocalizer {
  private readonly formatter = new Intl.NumberFormat(NUMBER_LOCALE, { maximumFractionDigits: 2 });

  load(): Promise<void> {
    // Every 'en' namespace is statically bundled, so there is nothing to fetch before first paint.
    return Promise.resolve();
  }

  loadNamespace(file: string): Namespace {
    const namespace = NAMESPACES[file];
    if (namespace === undefined) throw new ReferenceError(`unknown locale namespace "${file}"`);
    return namespace;
  }

  // Returns a translator bound to a namespace, so callers use short keys: `const t = namespace('game'); t('player_user')`.
  namespace(file: string): (key: string, props?: Record<string, number | string>) => string {
    this.loadNamespace(file); // fail fast if the namespace does not exist
    return (key, props) => this.text(`${file}.${key}`, props);
  }

  number(value: number): string {
    return this.formatter.format(value);
  }

  text(fullKey: string, props?: Record<string, number | string>): string {
    const [file, key] = fullKey.split('.');
    if (file === undefined || key === undefined) {
      throw new ReferenceError(`expected locale key in "file.key" format, got "${fullKey}"`);
    }
    const namespace = this.loadNamespace(file);
    const value = namespace[key];
    if (value === undefined || value === '') throw new ReferenceError(`locale not found for "${fullKey}"`);
    if (props === undefined) return value;
    let result = value;
    for (const [propKey, propValue] of Object.entries(props)) {
      result = result.replaceAll(`{${propKey}}`, String(propValue));
    }
    return result;
  }
}

export default new TextLocalizer();
