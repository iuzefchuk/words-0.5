export interface NetworkPort {
  delete<T = void>(path: string): Promise<T>;
  getArrayBuffer(path: string): Promise<ArrayBuffer>;
  getJson<T>(path: string): Promise<T>;
  patch<T = void>(path: string, body: unknown): Promise<T>;
  post<T = void>(path: string, body?: unknown): Promise<T>;
  put<T = void>(path: string, body: unknown): Promise<T>;
}
