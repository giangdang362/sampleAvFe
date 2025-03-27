import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export function useHashState<const V extends readonly string[]>(
  acceptedValue: V,
): V[number] | undefined;
export function useHashState<const V extends readonly string[]>(
  acceptedValue: V,
  defaultValue: V[number],
): V[number];
export function useHashState<const V extends readonly string[]>(
  acceptedValue: V,
  defaultValue?: V[number],
): V[number] | undefined {
  const [state, setState] = useState<V[number] | undefined>(() => {
    const hash =
      typeof window !== "undefined"
        ? window.location.hash.substring(1)
        : undefined;

    return hash && acceptedValue.includes(hash) ? hash : undefined;
  });

  const acceptedValueKey = JSON.stringify(acceptedValue);

  const params = useParams();
  useEffect(() => {
    const hash = window.location.hash.substring(1);
    setState(hash && acceptedValue.includes(hash) ? hash : undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  useEffect(() => {
    setState((prevState) =>
      prevState && acceptedValue.includes(prevState) ? prevState : undefined,
    );

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [acceptedValueKey, params]);

  return state ?? defaultValue;
}
