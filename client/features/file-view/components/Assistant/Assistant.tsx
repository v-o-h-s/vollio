import { useState } from "react";

export default function Assistant() {
  const [messages, setMessages] =
    useState<{ roles: "user" | "assistant"; content: string }[]>();
    
  return <div></div>;
}
