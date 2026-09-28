declare const brandSymbol: unique symbol;

type Brand<T, B extends string> = { readonly [brandSymbol]: B } & T;
