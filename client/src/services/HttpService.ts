enum Method {
  Delete = 'DELETE',
  Get = 'GET',
  Patch = 'PATCH',
  Post = 'POST',
  Put = 'PUT',
}

export default class HttpService {
  static delete(path: string): Promise<void> {
    return this.request(Method.Delete, path);
  }

  static get<T>(path: string): Promise<T> {
    return this.request(Method.Get, path);
  }

  static patch(path: string, body: unknown): Promise<void> {
    return this.request(Method.Patch, path, body);
  }

  static post<T = void>(path: string, body?: unknown): Promise<T> {
    return this.request(Method.Post, path, body);
  }

  static put(path: string, body: unknown): Promise<void> {
    return this.request(Method.Put, path, body);
  }

  private static parseErrorMessage(payload: unknown, method: Method, path: string, status: number): string {
    if (typeof payload === 'object' && payload !== null && 'error' in payload && typeof payload.error === 'string') {
      return payload.error;
    }
    return `${method} ${path} failed with status ${String(status)}`;
  }

  private static async request<T>(method: Method, path: string, body?: unknown): Promise<T> {
    const headers: Record<string, string> = {};
    if (body !== undefined) headers['Content-Type'] = 'application/json';
    const response = await fetch(path, { body: body === undefined ? null : JSON.stringify(body), headers, method });
    if (response.status === 204) return undefined as T;
    const text = await response.text();
    let payload: unknown;
    try {
      payload = text === '' ? undefined : JSON.parse(text);
    } catch {
      payload = undefined;
    }
    if (!response.ok) throw new Error(this.parseErrorMessage(payload, method, path, response.status));
    if (payload === undefined) throw new Error(`${method} ${path} returned an unexpected response`);
    return payload as T;
  }
}
