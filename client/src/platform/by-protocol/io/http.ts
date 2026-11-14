enum Method {
  Delete = 'DELETE',
  Get = 'GET',
  Patch = 'PATCH',
  Post = 'POST',
  Put = 'PUT',
}

type ResponseEvaluation = { error: string } | { payload: unknown };

class HttpExchange {
  static async execute<T>(method: Method, path: string, body?: unknown): Promise<T> {
    const response = await fetch(path, this.encodeRequest(method, body));
    const evaluation = await this.evaluateResponse(response, method, path);
    if ('error' in evaluation) throw new Error(evaluation.error, { cause: response });
    return evaluation.payload as T;
  }

  private static encodeRequest(method: Method, body: unknown): RequestInit {
    return {
      body: body === undefined ? null : JSON.stringify(body),
      headers: body === undefined ? {} : { 'Content-Type': 'application/json' },
      method,
    };
  }

  private static async evaluateResponse(response: Response, method: Method, path: string): Promise<ResponseEvaluation> {
    if (response.status === 204) return { payload: undefined };
    const isJson = response.headers.get('Content-Type')?.includes('json') === true;
    if (response.ok) return { payload: isJson ? await response.json() : await response.arrayBuffer() };
    const failure = `${method} ${path} failed with status ${String(response.status)}`;
    if (!isJson) return { error: `${failure}: expected a JSON body` };
    const payload: unknown = await response.json();
    if (typeof payload !== 'object') return { error: `${failure}: expected an object body` };
    if (payload === null) return { error: `${failure}: expected an object body, got null` };
    if (!('error' in payload)) return { error: `${failure}: expected "error" in body` };
    if (typeof payload.error !== 'string') return { error: `${failure}: expected "error" to be a string` };
    return { error: payload.error };
  }
}

export default {
  delete<T = void>(path: string): Promise<T> {
    return HttpExchange.execute(Method.Delete, path);
  },
  get<T>(path: string): Promise<T> {
    return HttpExchange.execute(Method.Get, path);
  },
  patch<T = void>(path: string, body: unknown): Promise<T> {
    return HttpExchange.execute(Method.Patch, path, body);
  },
  post<T = void>(path: string, body?: unknown): Promise<T> {
    return HttpExchange.execute(Method.Post, path, body);
  },
  put<T = void>(path: string, body: unknown): Promise<T> {
    return HttpExchange.execute(Method.Put, path, body);
  },
};
