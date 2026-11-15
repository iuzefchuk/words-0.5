import type { L10nPort } from '@/client/src/platform/by-port/l10n/port.ts';

enum Language {
  English = 'en',
}

type Records = Record<string, string>;

class GlobLocalizer {
  private static readonly LANGUAGE = this.getLanguage();

  private static readonly PROP_REGEX = /\{(\w+)\}/g;

  private static readonly RECORD_LOADERS = this.getRecordLoaders();

  private static readonly RECORD_LOADERS_PENDING = new Map<string, Promise<Records>>();

  private static readonly RECORDS = new Map<string, Records>();

  static async loadNamespace(namespace: string): Promise<void> {
    const file = this.getNamespaceFile(namespace);
    const fileRecordLoader = this.RECORD_LOADERS.get(file);
    if (fileRecordLoader === undefined) throw new ReferenceError(`localization file "${file}" not found`);
    const promise = this.RECORD_LOADERS_PENDING.get(file) ?? fileRecordLoader();
    this.RECORD_LOADERS_PENDING.set(file, promise);
    try {
      this.RECORDS.set(file, await promise);
    } catch (error) {
      this.RECORD_LOADERS_PENDING.delete(file);
      throw error;
    }
  }

  static t(recordPath: `${string}.${string}`, props?: Record<string, number | string>): string {
    return this.getValueByRecordPath(recordPath).replace(this.PROP_REGEX, (_, name: string) => {
      const prop = props?.[name];
      if (prop === undefined) throw new ReferenceError(`localization "${recordPath}" is missing prop "${name}"`);
      return String(prop);
    });
  }

  private static getLanguage(): Language {
    const [lang = ''] = document.documentElement.lang.toLowerCase().split('-');
    if (!(Object.values(Language) as Array<string>).includes(lang)) {
      throw new ReferenceError(`localization language "${lang}" is not supported`);
    }
    return lang as Language;
  }

  private static getNamespaceFile(namespace: string): string {
    return `${this.LANGUAGE}_${namespace}.json`;
  }

  private static getRecordLoaders(): Map<string, () => Promise<Records>> {
    return new Map(
      Object.entries(import.meta.glob<Records>('@/client/assets/json/*.json', { import: 'default' })).map(
        ([path, recordLoader]) => [path.slice(path.lastIndexOf('/') + 1), recordLoader] as const,
      ),
    );
  }

  private static getValueByRecordPath(recordPath: `${string}.${string}`): string {
    const separator = recordPath.indexOf('.');
    if (separator === -1) throw new ReferenceError(`localization "${recordPath}" must be in "namespace.key" format`);
    const namespace = recordPath.slice(0, separator);
    const file = this.getNamespaceFile(namespace);
    const fileRecords = this.RECORDS.get(file);
    if (fileRecords === undefined) {
      if (!this.RECORD_LOADERS.has(file)) throw new ReferenceError(`localization file "${file}" not found`);
      throw new ReferenceError(`localization file "${file}" is not loaded, call loadNamespace("${namespace}") first`);
    }
    const value = fileRecords[recordPath.slice(separator + 1)];
    if (typeof value !== 'string' || value === '') {
      throw new ReferenceError(`localization "${recordPath}" not found in "${file}"`);
    }
    return value;
  }
}

export default {
  loadNamespace(namespace: string): Promise<void> {
    return GlobLocalizer.loadNamespace(namespace);
  },
  t(recordPath: `${string}.${string}`, props?: Record<string, number | string>): string {
    return GlobLocalizer.t(recordPath, props);
  },
} satisfies L10nPort;
