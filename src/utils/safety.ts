import { Maybe, PartialData } from "@/types/safety";

// There's a limitation with any/unknown value: https://github.com/microsoft/TypeScript/issues/7648
export function isSafe<T extends NonNullable<unknown>>(
  value: Maybe<T>,
): value is T {
  return value !== undefined && value !== null;
}

export function withDefault<T extends object>(
  value: PartialData<T>,
  defaultValue: T,
): T {
  if (!value) return defaultValue;

  const cleanedValue = Object.fromEntries(
    Object.entries(value)?.filter(([_, v]) => isSafe(v)),
  );
  return Object.assign({ ...defaultValue }, cleanedValue);
}
