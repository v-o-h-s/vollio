import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface EditorState {
  shouldReadFromProps: boolean;
}

const initialState: EditorState = {
  shouldReadFromProps: false,
};

const editorSlice = createSlice({
  name: "editor",
  initialState,
  reducers: {
    setShouldReadFromProps: (state, action: PayloadAction<boolean>) => {
      state.shouldReadFromProps = action.payload;
    },
  },
});

export const { setShouldReadFromProps } = editorSlice.actions;
export default editorSlice.reducer;
