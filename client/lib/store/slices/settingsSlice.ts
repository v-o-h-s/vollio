import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface SettingsState {
  notesFontSize: number;
  aiAssistantModel: "fast" | "smart" | "creative";
  aiAssistantTone: "formal" | "friendly" | "concise";
  aiAutoExplain: boolean;
}

const initialState: SettingsState = {
  notesFontSize: 16, // Default font size
  aiAssistantModel: "smart",
  aiAssistantTone: "friendly",
  aiAutoExplain: false,
};

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    setNotesFontSize: (state, action: PayloadAction<number>) => {
      state.notesFontSize = action.payload;
    },
    setAiAssistantModel: (
      state,
      action: PayloadAction<SettingsState["aiAssistantModel"]>
    ) => {
      state.aiAssistantModel = action.payload;
    },
    setAiAssistantTone: (
      state,
      action: PayloadAction<SettingsState["aiAssistantTone"]>
    ) => {
      state.aiAssistantTone = action.payload;
    },
    setAiAutoExplain: (state, action: PayloadAction<boolean>) => {
      state.aiAutoExplain = action.payload;
    },
    resetSettings: (state) => {
      return initialState;
    },
  },
});

export const {
  setNotesFontSize,
  setAiAssistantModel,
  setAiAssistantTone,
  setAiAutoExplain,
  resetSettings,
} = settingsSlice.actions;

export default settingsSlice.reducer;

export const selectSettings = (state: { settings: SettingsState }) =>
  state.settings;
