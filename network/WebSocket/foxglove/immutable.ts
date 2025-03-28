// eslint-disable-next-line no-restricted-syntax
export type Primitive = string | number | boolean | bigint | symbol | undefined | null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyArray<Type = any> = Array<Type> | ReadonlyArray<Type>;
// eslint-disable-next-line @typescript-eslint/ban-types
export type Builtin = Primitive | Function | Date | Error | RegExp;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type IsTuple<Type> = Type extends readonly any[]
  ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
    any[] extends Type
    ? never
    : Type
  : never; // https://stackoverflow.com/questions/49927523/disallow-call-with-any/49928360#49928360
export type IsAny<Type> = 0 extends 1 & Type ? true : false;
export type IsUnknown<Type> = IsAny<Type> extends true ? false : unknown extends Type ? true : false;
export type Immutable<Type> =
  Type extends Exclude<Builtin, Error>
    ? Type
    : Type extends Map<infer Keys, infer Values>
      ? ReadonlyMap<Immutable<Keys>, Immutable<Values>>
      : Type extends ReadonlyMap<infer Keys, infer Values>
        ? ReadonlyMap<Immutable<Keys>, Immutable<Values>>
        : Type extends WeakMap<infer Keys, infer Values>
          ? WeakMap<Immutable<Keys>, Immutable<Values>>
          : Type extends Set<infer Values>
            ? ReadonlySet<Immutable<Values>>
            : Type extends ReadonlySet<infer Values>
              ? ReadonlySet<Immutable<Values>>
              : Type extends WeakSet<infer Values>
                ? WeakSet<Immutable<Values>>
                : Type extends Promise<infer Value>
                  ? Promise<Immutable<Value>>
                  : Type extends AnyArray<infer Values>
                    ? Type extends IsTuple<Type>
                      ? { readonly [Key in keyof Type]: Immutable<Type[Key]> }
                      : ReadonlyArray<Immutable<Values>>
                    : // eslint-disable-next-line @typescript-eslint/ban-types
                      Type extends {}
                      ? { readonly [Key in keyof Type]: Immutable<Type[Key]> }
                      : IsUnknown<Type> extends true
                        ? unknown
                        : Readonly<Type>;
