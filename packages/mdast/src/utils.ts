export type Optional<T> = {
  // skipcq: JS-0296
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  [K in keyof T]?: T[K] extends object
    ? T[K] extends Function
      ? T[K]
      : Optional<T[K]>
    : T[K];
};

export type Required<T> = {
  // skipcq: JS-0296
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  [K in keyof T]-?: T[K] extends object
    ? T[K] extends Function
      ? T[K]
      : Required<T[K]>
    : T[K];
};

export type Mutable<T> = {
  -readonly [K in keyof T]: T[K] extends object
    ? T[K] extends Function
      ? T[K]
      : Mutable<T[K]>
    : T[K];
};

export type Immutable<T> = {
  readonly [K in keyof T]: T[K] extends object
    ? T[K] extends Function
      ? T[K]
      : Immutable<T[K]>
    : T[K];
};
