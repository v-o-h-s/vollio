import { toast } from "react-hot-toast";

const baseStyle = {
  padding: "12px 16px",
  borderRadius: "8px",
  fontWeight: 600,
  fontSize: "14px",
};

export const notify = {
  success: (message: string) =>
    toast(message, {
      position: "top-right",
      style: {
        ...baseStyle,
        background: "#D1FADF", // light green
        color: "#027A48", // dark green
        border: "1px solid #027A48",
      },
      icon: "✔️",
    }),

  error: (message: string) =>
    toast(message, {
      position: "top-right",
      style: {
        ...baseStyle,
        background: "#FEE4E2", // light red
        color: "#B42318", // dark red
        border: "1px solid #B42318",
      },
      icon: "❌",
    }),

  loading: (message: string) =>
    toast.loading(message, {
      position: "top-right",
      style: {
        ...baseStyle,
        background: "#FFFFFF", // white
        color: "#555555",
        border: "1px solid #DDDDDD",
      },
      icon: "⏳",
    }),
};
