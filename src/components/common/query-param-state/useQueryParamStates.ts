import {
  Parser,
  UseQueryStatesKeysMap,
  UseQueryStatesReturn,
  Values,
} from "nuqs";
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { QueryParamsContext } from "./QueryParamsProvider";

type Nullable<T> = {
  [K in keyof T]: T[K] | null;
};

/**
 * nuqs's `useQueryStates` but the URL's search params are just mirrors, not the source of truth
 */
export function useQueryParamStates<KeyMap extends UseQueryStatesKeysMap>(
  keyMap: KeyMap,
): [
  UseQueryStatesReturn<KeyMap>[0],
  Dispatch<SetStateAction<Partial<Nullable<Values<KeyMap>>>>>,
] {
  const queryParamsContext = useContext(QueryParamsContext);
  if (!queryParamsContext) {
    throw new Error("Missing QueryParamsContext!");
  }
  const { updateParams, addChangesListener } = queryParamsContext;
  const [state, setState] = useState<Values<KeyMap>>(() => {
    if (typeof window === "undefined") return {} as Values<KeyMap>;

    const initialSearchParams = new URLSearchParams(window.location.search);
    return Object.fromEntries(
      Object.entries(keyMap).map(([key, { parse, defaultValue }]) => {
        const value = initialSearchParams?.get(key) ?? null;
        const initialStateValue =
          value === null ? null : safeParse(parse, value);
        return [key, initialStateValue ?? defaultValue];
      }),
    ) as Values<KeyMap>;
  });

  const {
    keyDepKey,
    eqDepKey,
    parseDepKey,
    serializeDepKey,
    defaultValueDepKey,
  } = useKeyMapDependencies(keyMap);

  useEffect(() => {
    setState((prevState) => {
      return Object.fromEntries(
        Object.entries(keyMap).map(
          ([key, { eq, parse, serialize, defaultValue }]) => {
            function getValue() {
              const prevValue = prevState[key] ?? null;
              if (prevValue === null) return null;

              serialize = serialize ?? String;
              const serializedValue = serialize(prevValue);
              const newParsedValue = safeParse(parse, serializedValue);

              if (newParsedValue === null) return null;

              if (eq) {
                return eq(newParsedValue, prevValue)
                  ? prevValue
                  : newParsedValue;
              }

              return serialize(newParsedValue) === serializedValue
                ? prevValue
                : newParsedValue;
            }

            return [key, getValue() ?? defaultValue];
          },
        ),
      ) as Values<KeyMap>;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyDepKey, eqDepKey, parseDepKey, serializeDepKey, defaultValueDepKey]);

  useEffect(() => {
    updateParams(
      Object.fromEntries(
        Object.entries(keyMap).map(([key, { serialize, defaultValue }]) => {
          serialize = serialize ?? String;
          const value = state[key] ?? null;

          return [
            key,
            value === null || value === defaultValue ? null : serialize(value),
          ];
        }),
      ),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyDepKey, serializeDepKey, defaultValueDepKey, state, updateParams]);

  useEffect(() => {
    const unsubscribe = addChangesListener(Object.keys(keyMap), (valueStrs) => {
      setState((prevState) => {
        return Object.fromEntries(
          Object.entries(keyMap).map(
            ([key, { eq, parse, serialize, defaultValue }]) => {
              function getValue() {
                const valueStr = valueStrs[key] ?? null;
                const newValue =
                  valueStr === null ? null : safeParse(parse, valueStr);
                const prevValue = prevState[key] ?? null;

                if (newValue === null) return null;

                if (prevValue === null) return newValue;

                if (eq) return eq(prevValue, newValue) ? prevValue : newValue;

                serialize = serialize ?? String;
                return serialize(prevValue) === valueStr ? prevValue : newValue;
              }

              return [key, getValue() ?? defaultValue];
            },
          ),
        ) as Values<KeyMap>;
      });
    });

    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    keyDepKey,
    eqDepKey,
    parseDepKey,
    serializeDepKey,
    defaultValueDepKey,
    addChangesListener,
  ]);

  const setPartialState = useCallback<
    Dispatch<SetStateAction<Partial<Nullable<Values<KeyMap>>>>>
  >((action) => {
    setState((prevState) => {
      const newState =
        typeof action === "function" ? action(prevState) : action;

      return Object.fromEntries(
        Object.entries(prevState).map(([key, prevValue]) => {
          const newValue = newState[key];
          return [key, newValue === undefined ? prevValue : newValue];
        }),
      ) as Values<KeyMap>;
    });
  }, []);

  return [state, setPartialState];
}

function useKeyMapDependencies(keyMap: UseQueryStatesKeysMap): {
  keyDepKey: number;
  eqDepKey: number;
  parseDepKey: number;
  serializeDepKey: number;
  defaultValueDepKey: number;
} {
  const keyChangedCount = useRef<number>(0);
  const eqChangedCount = useRef<number>(0);
  const parseChangedCount = useRef<number>(0);
  const serializeChangedCount = useRef<number>(0);
  const defaultValueChangedCount = useRef<number>(0);

  const keys = Object.keys(keyMap).sort().join("/");
  const prevKeyMapKeys = useRef<string>();
  const keysChanged =
    prevKeyMapKeys.current !== undefined && keys !== prevKeyMapKeys.current;
  prevKeyMapKeys.current = keys;
  if (keysChanged) {
    keyChangedCount.current++;
    eqChangedCount.current++;
    parseChangedCount.current++;
    serializeChangedCount.current++;
    defaultValueChangedCount.current++;
  }

  const prevKeyMap = useRef<UseQueryStatesKeysMap>();
  if (!keysChanged && prevKeyMap.current) {
    let eqChanged = false;
    let parseChanged = false;
    let serializeChanged = false;
    let defaultValueChanged = false;

    for (const [key, { eq, parse, serialize, defaultValue }] of Object.entries(
      keyMap,
    )) {
      const {
        eq: prevEq,
        parse: prevParse,
        serialize: prevSerialize,
        defaultValue: prevDefaultValue,
      } = prevKeyMap.current[key]!;

      if (!eqChanged) eqChanged = prevEq !== eq;
      if (!parseChanged) parseChanged = prevParse !== parse;
      if (!serializeChanged) serializeChanged = prevSerialize !== serialize;
      if (!defaultValueChanged)
        defaultValueChanged = prevDefaultValue !== defaultValue;
    }

    if (eqChanged) eqChangedCount.current++;
    if (parseChanged) parseChangedCount.current++;
    if (serializeChanged) serializeChangedCount.current++;
    if (defaultValueChanged) defaultValueChangedCount.current++;
  }
  prevKeyMap.current = keyMap;

  return {
    keyDepKey: keyChangedCount.current,
    eqDepKey: eqChangedCount.current,
    parseDepKey: parseChangedCount.current,
    serializeDepKey: serializeChangedCount.current,
    defaultValueDepKey: defaultValueChangedCount.current,
  };
}

function safeParse<T>(parser: Parser<T>["parse"], value: string) {
  try {
    return parser(value);
  } catch (error) {
    return null;
  }
}
