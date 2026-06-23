import { InventoryLetter as Letter } from '@/domain/value-objects/enums.ts';
import type { DictionaryGraph, DictionaryNode } from '@/domain/value-objects/types.ts';

// Byte-packed DAWG (see meta/dictionary/build.mjs).
//   node @ byte offset p:
//     bytes [p .. p+3]  uint32 LE: bits 0..25 = child bitmap, bit 26 = final flag
//     bytes [p+4 ..]    childCount x 3-byte LE child byte-offsets, ascending letter
// A node's identity is its byte offset; the root is at offset 0.
export default class Dictionary implements DictionaryGraph {
  private static readonly BITMAP_MASK = 0x03ff_ffff;

  private static readonly FINAL_BIT = 1 << 26;

  private static readonly FIRST_LETTER_CODE = Dictionary.computeFirstLetterCode();

  private static readonly HEADER_BYTES = 4;

  private static readonly LETTERS: ReadonlyArray<Letter> = Object.values(Letter);

  private static readonly POINTER_BYTES = 3;

  get rootNode(): DictionaryNode {
    return 0 as DictionaryNode;
  }

  private readonly bytes: Uint8Array;

  private readonly view: DataView;

  private constructor(bytes: Uint8Array, view: DataView) {
    this.bytes = bytes;
    this.view = view;
  }

  static create(buffer: ArrayBufferLike): Dictionary {
    return new Dictionary(new Uint8Array(buffer), new DataView(buffer));
  }

  private static computeFirstLetterCode(): number {
    const first = Object.values(Letter)[0];
    if (first === undefined) throw new ReferenceError('expected first letter, got undefined');
    return first.charCodeAt(0);
  }

  private static popcount(value: number): number {
    let bits = value;
    let count = 0;
    while (bits !== 0) {
      bits &= bits - 1;
      count++;
    }
    return count;
  }

  containsAllWords(words: ReadonlyArray<string>): boolean {
    if (words.length === 0) throw new Error('cannot check membership of empty word list');
    return words.every(word => {
      const node = this.getNode(word);
      return node !== null && this.isNodeFinal(node);
    });
  }

  forEachNodeChild(
    node: DictionaryNode,
    callback: (letter: Letter, childNode: DictionaryNode, letterIndex: number) => void,
  ): void {
    const offset = node as number;
    const bitmap = this.view.getUint32(offset, true) & Dictionary.BITMAP_MASK;
    let childIndex = 0;
    for (let idx = 0; idx < Dictionary.LETTERS.length; idx++) {
      if (((bitmap >>> idx) & 1) === 0) continue;
      const letter = Dictionary.LETTERS[idx];
      if (letter === undefined) throw new ReferenceError(`expected letter at index ${String(idx)}, got undefined`);
      const childOffset = this.readPointer(offset + Dictionary.HEADER_BYTES + childIndex * Dictionary.POINTER_BYTES);
      callback(letter, childOffset as DictionaryNode, idx);
      childIndex++;
    }
  }

  getNode(word: string, startNode: DictionaryNode = this.rootNode): DictionaryNode | null {
    let offset = startNode as number;
    for (let idx = 0; idx < word.length; idx++) {
      const letterIndex = word.charCodeAt(idx) - Dictionary.FIRST_LETTER_CODE;
      const bitmap = this.view.getUint32(offset, true) & Dictionary.BITMAP_MASK;
      if (((bitmap >>> letterIndex) & 1) === 0) return null;
      const childIndex = Dictionary.popcount(bitmap & ((1 << letterIndex) - 1));
      offset = this.readPointer(offset + Dictionary.HEADER_BYTES + childIndex * Dictionary.POINTER_BYTES);
    }
    return offset as DictionaryNode;
  }

  isNodeFinal(node: DictionaryNode): boolean {
    return (this.view.getUint32(node as number, true) & Dictionary.FINAL_BIT) !== 0;
  }

  private readPointer(offset: number): number {
    const bytes = this.bytes;
    const byte0 = bytes[offset] ?? 0;
    const byte1 = bytes[offset + 1] ?? 0;
    const byte2 = bytes[offset + 2] ?? 0;
    return byte0 | (byte1 << 8) | (byte2 << 16);
  }
}
