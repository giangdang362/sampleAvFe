import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface SettingsState {
  dataDetail?: API.ProjectItem;
}

const initialState: SettingsState = {
  dataDetail: undefined,
};

const projectSlice = createSlice({
  name: "project",
  initialState,
  reducers: {
    setDataDetail: (
      state,
      action: PayloadAction<SettingsState["dataDetail"]>,
    ) => {
      state.dataDetail = action.payload;
    },
  },
});

export const { setDataDetail } = projectSlice.actions;

export default projectSlice;
