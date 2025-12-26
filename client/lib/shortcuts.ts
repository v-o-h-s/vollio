export const shortcuts = {
  global: [],
  document: [
    // Focus mode shortcuts (avoid Ctrl+F which Syncfusion uses for search)
    { key: "Alt+F", action: "toggleFocusMode" },
    { key: "Alt+H", action: "toggleHeader" },
    { key: "Escape", action: "exitFocusMode" },
    // Tool shortcuts (use Alt modifier to avoid conflicts)
    { key: "Alt+1", action: "selectQuickHighlight" },
    { key: "Alt+2", action: "selectCommentHighlight" },
    { key: "Alt+3", action: "selectNoteHighlight" },
    { key: "Alt+D", action: "selectDeleteTool" },
    { key: "Alt+N", action: "selectNothingTool" },
    // Color shortcuts
    { key: "Shift+1", action: "setYellowColor" },
    { key: "Shift+2", action: "setOrangeColor" },
    { key: "Shift+3", action: "setPinkColor" },
    { key: "Shift+4", action: "setGreenColor" },
    { key: "Shift+5", action: "setBlueColor" },
    { key: "Shift+6", action: "setPurpleColor" },
    { key: "Shift+7", action: "setRedColor" },
    { key: "Shift+8", action: "setCyanColor" },
    // Zoom shortcuts (keep these as they're standard)
    { key: "Ctrl+=", action: "zoomIn" },
    { key: "Ctrl+-", action: "zoomOut" },
    { key: "Ctrl+0", action: "resetZoom" },
  ],
  documents: [],
};
