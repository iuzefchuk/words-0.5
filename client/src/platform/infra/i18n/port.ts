export interface I18nPort {
  loadNamespace(namespace: string): Promise<void>;
  t(recordPath: `${string}.${string}`, props?: Record<string, number | string>): string;
}
