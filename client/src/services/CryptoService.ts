export default class CryptoService {
  static createSeed(): number {
    const [seed] = crypto.getRandomValues(new Uint32Array(1));
    if (seed === undefined) throw new ReferenceError('expected random seed, got undefined');
    return seed;
  }
}
