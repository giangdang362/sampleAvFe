import { throttle } from "lodash";
import { useSearchParams } from "next/navigation";
import {
  createContext,
  FC,
  MutableRefObject,
  PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";

export interface QueryParamsProviderProps extends PropsWithChildren {
  mode?: "push" | "replace";
  throttleRate?: number;
}

export interface QueryParamsContext {
  updateParam: (key: string, value: string | null) => void;
  updateParams: (keyMap: { [key: string]: string | null }) => void;
  addChangeListener: (
    key: string,
    callback: (value: string | null) => void,
  ) => () => void;
  addChangesListener: (
    keys: string[],
    callback: (values: { [key: string]: string | null }) => void,
  ) => () => void;
}

export const QueryParamsContext = createContext<QueryParamsContext | undefined>(
  undefined,
);

const QueryParamsProvider: FC<QueryParamsProviderProps> = ({
  mode = "replace",
  throttleRate = 700,
  children,
}) => {
  const paramsStateRef = useRef<{ [key: string]: string | null }>({});
  const syncHistoryRef = useRef<URLSearchParams[]>([]);

  const throttledSyncParams = useMemo(
    () =>
      throttle(() => {
        requestAnimationFrame(() => {
          const params = new URLSearchParams(window.location.search);
          const prevParamsStr = params.toString();

          for (const [key, value] of Object.entries(paramsStateRef.current)) {
            if (value !== null) {
              params.set(key, value);
            } else {
              params.delete(key);
            }
          }

          const paramsStr = params.toString();
          if (paramsStr !== prevParamsStr) {
            window.history[mode === "replace" ? "replaceState" : "pushState"](
              null,
              "",
              paramsStr ? "?" + paramsStr : location.pathname + location.hash,
            );
            syncHistoryRef.current.push(params);
          }
        });
      }, throttleRate),
    [mode, throttleRate],
  );

  const paramsChangeSubscribers = useRef<
    {
      key: string[];
      callback: (value: { [key: string]: string | null }) => void;
    }[]
  >([]);

  const addChangeListener = useCallback<
    QueryParamsContext["addChangeListener"]
  >((key, callback) => {
    paramsChangeSubscribers.current.push({
      key: [key],
      callback: (values) => callback(values[key]),
    });
    const index = paramsChangeSubscribers.current.length - 1;

    return () => {
      paramsChangeSubscribers.current.splice(index, 1);
    };
  }, []);

  const addChangesListener = useCallback<
    QueryParamsContext["addChangesListener"]
  >((key, callback) => {
    paramsChangeSubscribers.current.push({ key, callback });
    const index = paramsChangeSubscribers.current.length - 1;

    return () => {
      paramsChangeSubscribers.current.splice(index, 1);
    };
  }, []);

  const updateParam = useCallback<QueryParamsContext["updateParam"]>(
    (key, value) => {
      paramsStateRef.current[key] = value;
      throttledSyncParams();
    },
    [throttledSyncParams],
  );

  const updateParams = useCallback<QueryParamsContext["updateParams"]>(
    (keyMap) => {
      for (const [key, value] of Object.entries(keyMap)) {
        paramsStateRef.current[key] = value;
      }
      throttledSyncParams();
    },
    [throttledSyncParams],
  );

  return (
    <>
      <QueryParamsContext.Provider
        value={{
          updateParam,
          updateParams,
          addChangeListener,
          addChangesListener,
        }}
      >
        {children}
      </QueryParamsContext.Provider>
      <QueryParamsListener
        paramsChangeSubscribers={paramsChangeSubscribers}
        syncHistoryRef={syncHistoryRef}
      />
    </>
  );
};

export default QueryParamsProvider;

const QueryParamsListener = ({
  paramsChangeSubscribers,
  syncHistoryRef,
}: {
  paramsChangeSubscribers: MutableRefObject<
    {
      key: string[];
      callback: (value: { [key: string]: string | null }) => void;
    }[]
  >;
  syncHistoryRef: MutableRefObject<URLSearchParams[]>;
}) => {
  const searchParams = useSearchParams();
  const isRenderedRef = useRef(false);

  useEffect(() => {
    if (!isRenderedRef.current) {
      isRenderedRef.current = true;
      return;
    }

    const oldestSync = syncHistoryRef.current[0];
    if (searchParams.toString() === oldestSync?.toString()) {
      syncHistoryRef.current.pop();
    } else if (syncHistoryRef.current.length === 0) {
      paramsChangeSubscribers.current.forEach(({ key: keys, callback }) => {
        const values = Object.fromEntries(
          keys.map((key) => [key, searchParams.get(key)]),
        );
        callback(values);
      });
    }
  }, [paramsChangeSubscribers, searchParams, syncHistoryRef]);

  return null;
};
