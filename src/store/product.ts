import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface SettingsState {
  dataDetail?: API.ProductType;
  search?: string;
  productDetailType?: "admin" | "user";
}

const initialState: SettingsState = {
  dataDetail: undefined,
};

const productSlice = createSlice({
  name: "product",
  initialState,
  reducers: {
    setDataDetail: (
      state,
      action: PayloadAction<SettingsState["dataDetail"]>,
    ) => {
      state.dataDetail = action.payload;
    },
    setParamSearch: (state, action: PayloadAction<SettingsState["search"]>) => {
      state.search = action.payload;
    },
    setProductDetailType: (
      state,
      action: PayloadAction<SettingsState["productDetailType"]>,
    ) => {
      state.productDetailType = action.payload;
    },
  },
  selectors: {
    searchParam: (state) => state.search,
    selectProductDetailType: (state) => state.productDetailType,
  },
});

export const { searchParam, selectProductDetailType } = productSlice.selectors;

export const { setDataDetail, setParamSearch, setProductDetailType } =
  productSlice.actions;

export default productSlice;
