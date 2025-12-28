import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface SettingsState {
  noterFontSize: number;
  assistantFontSize: number;
}

const initialState: SettingsState = {
  noterFontSize: 16,
  assistantFontSize: 14,
};

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    setNoterFontSize: (state, action: PayloadAction<number>) => {
      state.noterFontSize = action.payload;
    },
    setAssistantFontSize: (state, action: PayloadAction<number>) => {
      state.assistantFontSize = action.payload;
    },
    resetSettings: (state) => {
      return initialState;
    },
  },
});

export const { setNoterFontSize, setAssistantFontSize, resetSettings } =
  settingsSlice.actions;

export default settingsSlice.reducer;

export const selectSettings = (state: { settings: SettingsState }) =>
  state.settings;
