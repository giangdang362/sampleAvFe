import { PartialDeep } from "type-fest";

// Cannot trust anybody

export type Maybe<T> = T | undefined | null;
export type PartialData<T> = Maybe<
  PartialDeep<NullableDeep<T>, { recurseIntoArrays: true }>
>;

type NullableDeep<T> =
  | {
      [K in keyof T]: NullableDeep<T[K]> | null;
    }
  | null;
