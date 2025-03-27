import { PayloadAction, createSlice } from "@reduxjs/toolkit";
interface GlobalState {
  isHiddenSearch?: boolean;
}

const initialState: GlobalState = {
  isHiddenSearch: false,
};

const globalSlice = createSlice({
  name: "global",
  initialState,
  selectors: {
    selectIsHiddenSearch: (state) => state.isHiddenSearch,
  },
  reducers: {
    toggleHiddenSearch: (state, action: PayloadAction<GlobalState>) => {
      state.isHiddenSearch = action?.payload.isHiddenSearch;
    },
  },
});

export const { toggleHiddenSearch } = globalSlice.actions;
export const { selectIsHiddenSearch } = globalSlice.selectors;

export default globalSlice;
