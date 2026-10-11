enum Language {
  English = 'en',
}

type File = `${Language}_${Namespace}.json`;

type Key = string;

type Namespace = string;

type RecordLoader = () => Promise<Records>;

type RecordPath = `${Namespace}.${Key}`;

type Records = Record<Key, Value>;

type Value = string;

export default class I18nLibrary {
  private static readonly LANGUAGE = this.getLanguage();

  private static readonly PROP_REGEX = /\{(\w+)\}/g;

  private static readonly RECORD_LOADERS = this.getRecordLoaders();

  private static readonly RECORD_LOADERS_PENDING = new Map<File, Promise<void>>();

  private static readonly RECORDS = new Map<File, Records>();

  static async loadNamespace(namespace: Namespace): Promise<void> {
    const file = this.getNamespaceFile(namespace);
    const filePendingRecordLoader = this.RECORD_LOADERS_PENDING.get(file);
    if (filePendingRecordLoader !== undefined) return filePendingRecordLoader;
    const fileRecordLoader = this.RECORD_LOADERS.get(file);
    if (fileRecordLoader === undefined) throw new ReferenceError(`localization file "${file}" not found`);
    const promise = fileRecordLoader().then(
      records => {
        this.RECORDS.set(file, records);
      },
      (error: unknown) => {
        this.RECORD_LOADERS_PENDING.delete(file);
        throw error;
      },
    );
    this.RECORD_LOADERS_PENDING.set(file, promise);
    return promise;
  }

  static t(recordPath: RecordPath, props?: Record<string, number | string>): string {
    const value = this.getValueByRecordPath(recordPath);
    return value.replace(this.PROP_REGEX, (_, name: string) => {
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

  private static getNamespaceFile(namespace: Namespace): File {
    return `${this.LANGUAGE}_${namespace}.json`;
  }

  private static getRecordLoaders(): Map<File, RecordLoader> {
    const result = new Map<File, RecordLoader>();
    const modules = import.meta.glob<Records>('@/client/assets/json/*.json', { import: 'default' });
    for (const [path, recordLoader] of Object.entries(modules)) {
      result.set(path.slice(path.lastIndexOf('/') + 1) as File, recordLoader);
    }
    return result;
  }

  private static getValueByRecordPath(recordPath: RecordPath): Value {
    const separator = recordPath.indexOf('.');
    if (separator === -1) {
      throw new ReferenceError(`localization "${recordPath}" must be in "namespace.key" format`);
    }
    const namespace: Namespace = recordPath.slice(0, separator);
    const key: Key = recordPath.slice(separator + 1);
    const file = this.getNamespaceFile(namespace);
    const fileRecords = this.RECORDS.get(file);
    if (fileRecords === undefined) {
      if (!this.RECORD_LOADERS.has(file)) throw new ReferenceError(`localization file "${file}" not found`);
      throw new ReferenceError(`localization file "${file}" is not loaded, call loadNamespace("${namespace}") first`);
    }
    const value = fileRecords[key];
    if (typeof value !== 'string' || value === '') {
      throw new ReferenceError(`localization "${recordPath}" not found in "${file}"`);
    }
    return value;
  }
}
