import type { Action, ThunkAction } from "@reduxjs/toolkit";
import { useDispatch, useSelector, useStore } from "react-redux";
import { combineSlices, configureStore } from "@reduxjs/toolkit";
import authSlice from "./features/auth";
import productSlice from "./product";
import { api } from "@/services/api";
import globalSlice from "./features/globalSlice";
import projectSlice from "./projectsSlice";
import pinterestApi from "@/services/images";
import { mutationErrorToast } from "@/services/error-toast";

// `combineSlices` automatically combines the reducers using
// their `reducerPath`s, therefore we no longer need to call `combineReducers`.
const rootReducer = combineSlices(authSlice, globalSlice, {
  [api.reducerPath]: api.reducer,
  [pinterestApi.reducerPath]: pinterestApi.reducer,
  [productSlice.name]: productSlice.reducer,
  [projectSlice.name]: projectSlice.reducer,
});
// Infer the `RootState` type from the root reducer
export type RootState = ReturnType<typeof rootReducer>;

// `makeStore` encapsulates the store configuration to allow
// creating unique store instances, which is particularly important for
// server-side rendering (SSR) scenarios. In SSR, separate store instances
// are needed for each request to prevent cross-request state pollution.
export const makeStore = () => {
  return configureStore({
    reducer: rootReducer,
    // Adding the api middleware enables caching, invalidation, polling,s
    // and other useful features of `rtk-query`.
    middleware: (getDefaultMiddleware) => {
      return getDefaultMiddleware({
        serializableCheck: false,
      })
        .concat(api.middleware)
        .concat(pinterestApi.middleware)
        .concat(mutationErrorToast);
    },
  });
};

// Infer the return type of `makeStore`
export type AppStore = ReturnType<typeof makeStore>;
// Infer the `AppDispatch` type from the store itself
export type AppDispatch = AppStore["dispatch"];
export type AppThunk<ThunkReturnType = void> = ThunkAction<
  ThunkReturnType,
  RootState,
  unknown,
  Action
>;
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
export const useAppStore = useStore.withTypes<AppStore>();
