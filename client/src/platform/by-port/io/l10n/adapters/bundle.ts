import type { L10nPort } from '@/client/src/platform/by-port/io/l10n/port.ts';

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

const LANGUAGE = getLanguage();

const PROP_REGEX = /\{(\w+)\}/g;

const RECORD_LOADERS = getRecordLoaders();

const RECORD_LOADERS_PENDING = new Map<File, Promise<void>>();

const RECORDS = new Map<File, Records>();

function getLanguage(): Language {
  const [lang = ''] = document.documentElement.lang.toLowerCase().split('-');
  if (!(Object.values(Language) as Array<string>).includes(lang)) {
    throw new ReferenceError(`localization language "${lang}" is not supported`);
  }
  return lang as Language;
}

function getNamespaceFile(namespace: Namespace): File {
  return `${LANGUAGE}_${namespace}.json`;
}

function getRecordLoaders(): Map<File, RecordLoader> {
  const result = new Map<File, RecordLoader>();
  const modules = import.meta.glob<Records>('@/client/assets/json/*.json', { import: 'default' });
  for (const [path, recordLoader] of Object.entries(modules)) {
    result.set(path.slice(path.lastIndexOf('/') + 1) as File, recordLoader);
  }
  return result;
}

function getValueByRecordPath(recordPath: RecordPath): Value {
  const separator = recordPath.indexOf('.');
  if (separator === -1) {
    throw new ReferenceError(`localization "${recordPath}" must be in "namespace.key" format`);
  }
  const namespace: Namespace = recordPath.slice(0, separator);
  const key: Key = recordPath.slice(separator + 1);
  const file = getNamespaceFile(namespace);
  const fileRecords = RECORDS.get(file);
  if (fileRecords === undefined) {
    if (!RECORD_LOADERS.has(file)) throw new ReferenceError(`localization file "${file}" not found`);
    throw new ReferenceError(`localization file "${file}" is not loaded, call loadNamespace("${namespace}") first`);
  }
  const value = fileRecords[key];
  if (typeof value !== 'string' || value === '') {
    throw new ReferenceError(`localization "${recordPath}" not found in "${file}"`);
  }
  return value;
}

async function loadFile(file: File): Promise<void> {
  const filePendingRecordLoader = RECORD_LOADERS_PENDING.get(file);
  if (filePendingRecordLoader !== undefined) return filePendingRecordLoader;
  const fileRecordLoader = RECORD_LOADERS.get(file);
  if (fileRecordLoader === undefined) throw new ReferenceError(`localization file "${file}" not found`);
  const promise = fileRecordLoader().then(
    records => {
      RECORDS.set(file, records);
    },
    (error: unknown) => {
      RECORD_LOADERS_PENDING.delete(file);
      throw error;
    },
  );
  RECORD_LOADERS_PENDING.set(file, promise);
  return promise;
}

for (const file of RECORD_LOADERS.keys()) {
  if (!file.startsWith(`${LANGUAGE}_`)) continue;
  loadFile(file).then(undefined, (error: unknown) => {
    console.warn('L10nBundleAdapter:', error);
  });
}

export default {
  loadNamespace(namespace: Namespace): Promise<void> {
    return loadFile(getNamespaceFile(namespace));
  },
  t(recordPath: RecordPath, props?: Record<string, number | string>): string {
    const value = getValueByRecordPath(recordPath);
    return value.replace(PROP_REGEX, (_, name: string) => {
      const prop = props?.[name];
      if (prop === undefined) throw new ReferenceError(`localization "${recordPath}" is missing prop "${name}"`);
      return String(prop);
    });
  },
} satisfies L10nPort;
