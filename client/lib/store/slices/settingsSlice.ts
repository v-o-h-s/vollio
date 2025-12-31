import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface SettingsState {
  vollNotesFontSize: number;
  vollAiFontSize: number;
}

const initialState: SettingsState = {
  vollNotesFontSize: 16,
  vollAiFontSize: 14,
};

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    setVollNotesFontSize: (state, action: PayloadAction<number>) => {
      state.vollNotesFontSize = action.payload;
    },
    setVollAiFontSize: (state, action: PayloadAction<number>) => {
      state.vollAiFontSize = action.payload;
    },
    resetSettings: (state) => {
      return initialState;
    },
  },
});

export const { setVollNotesFontSize, setVollAiFontSize, resetSettings } =
  settingsSlice.actions;

export default settingsSlice.reducer;

export const selectSettings = (state: { settings: SettingsState }) =>
  state.settings;
