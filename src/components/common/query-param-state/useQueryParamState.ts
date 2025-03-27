import { Parser } from "nuqs";
import {
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from "react";
import { QueryParamsContext } from "./QueryParamsProvider";

/**
 * nuqs's `useQueryState` but the URL's search params are just mirrors, not the source of truth
 */
export function useQueryParamState<T>(
  key: string,
  parser: Parser<T>,
): [T | null, Dispatch<SetStateAction<T | null>>];
export function useQueryParamState<T>(
  key: string,
  parser: Parser<T>,
  defaultValue: T,
): [T, Dispatch<SetStateAction<T | null>>];
export function useQueryParamState<T>(
  key: string,
  { serialize, parse, eq }: Parser<T>,
  defaultValue?: T,
): [T | null, Dispatch<SetStateAction<T | null>>] {
  const queryParamsContext = useContext(QueryParamsContext);
  if (!queryParamsContext) {
    throw new Error("Missing QueryParamsContext!");
  }
  const { updateParam, addChangeListener } = queryParamsContext;
  const [state, setState] = useState<T | null>(() => {
    if (typeof window === "undefined") return null;

    const initialSearchParams = new URLSearchParams(window.location.search);
    const value = initialSearchParams?.get(key) ?? null;
    const initialStateValue = value === null ? null : safeParse(parse, value);
    return initialStateValue ?? null;
  });

  serialize = serialize ?? String;

  useEffect(() => {
    setState((prevState) => {
      if (prevState === null) return null;

      const serializedState = serialize(prevState);
      const newParsedState = safeParse(parse, serializedState);

      if (newParsedState === null) return null;

      if (eq) {
        return eq(newParsedState, prevState) ? prevState : newParsedState;
      }

      return serialize(newParsedState) === serializedState
        ? prevState
        : newParsedState;
    });
  }, [eq, parse, serialize]);

  useEffect(() => {
    updateParam(
      key,
      state === null || state === defaultValue ? null : serialize(state),
    );
  }, [key, state, updateParam, serialize, defaultValue]);

  useEffect(() => {
    const unsubscribe = addChangeListener(key, (valueStr) => {
      const newValue = valueStr === null ? null : safeParse(parse, valueStr);
      setState((prevValue) => {
        if (newValue === null) return null;

        if (prevValue === null) return newValue;

        if (eq) return eq(prevValue, newValue) ? prevValue : newValue;

        return serialize(prevValue) === valueStr ? prevValue : newValue;
      });
    });

    return () => unsubscribe();
  }, [key, parse, eq, serialize, addChangeListener]);

  return [state === null ? defaultValue ?? null : state, setState];
}

function safeParse<T>(parser: Parser<T>["parse"], value: string) {
  try {
    return parser(value);
  } catch (error) {
    return null;
  }
}
