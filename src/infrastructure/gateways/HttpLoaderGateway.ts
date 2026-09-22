import type { AppLoaderGateway } from '@/app/types/gateways.ts';

export default class HttpLoaderGateway {
  static async load(url: string): Promise<ArrayBufferLike> {
    const gzUrl = `${url}.gz`;
    const response = await fetch(gzUrl);
    if (!response.ok) throw new Error(`failed to fetch ${gzUrl}: ${String(response.status)} ${response.statusText}`);
    const compressed = await response.arrayBuffer();
    if (typeof SharedArrayBuffer === 'undefined') return HttpLoaderGateway.decompress(compressed);
    return HttpLoaderGateway.decompressIntoSharedBuffer(compressed);
  }

  private static async decompress(buffer: ArrayBuffer): Promise<ArrayBuffer> {
    if (!HttpLoaderGateway.isGzipped(buffer)) return buffer;
    const stream = new Blob([buffer]).stream().pipeThrough(HttpLoaderGateway.gzipDecompressor());
    return new Response(stream).arrayBuffer();
  }

  private static async decompressIntoSharedBuffer(compressed: ArrayBuffer): Promise<SharedArrayBuffer> {
    if (!HttpLoaderGateway.isGzipped(compressed)) {
      const sab = new SharedArrayBuffer(compressed.byteLength);
      new Uint8Array(sab).set(new Uint8Array(compressed));
      return sab;
    }
    const uncompressedSize = new DataView(compressed).getUint32(compressed.byteLength - 4, true);
    const sab = new SharedArrayBuffer(uncompressedSize);
    const target = new Uint8Array(sab);
    const reader = new Blob([compressed]).stream().pipeThrough(HttpLoaderGateway.gzipDecompressor()).getReader();
    let offset = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      if (offset + value.byteLength > target.byteLength) throw new Error('dictionary overflow: decompressed size exceeds ISIZE');
      target.set(value, offset);
      offset += value.byteLength;
    }
    if (offset !== uncompressedSize) {
      throw new Error(`dictionary size mismatch: got ${String(offset)}, expected ${String(uncompressedSize)}`);
    }
    return sab;
  }

  private static gzipDecompressor(): ReadableWritablePair<Uint8Array, Uint8Array> {
    return new DecompressionStream('gzip') as unknown as ReadableWritablePair<Uint8Array, Uint8Array>;
  }

  private static isGzipped(buffer: ArrayBuffer): boolean {
    const bytes = new Uint8Array(buffer);
    return bytes.length >= 2 && bytes[0] === 0x1f && bytes[1] === 0x8b;
  }
}

HttpLoaderGateway satisfies AppLoaderGateway;
