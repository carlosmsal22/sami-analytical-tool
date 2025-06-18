// src/hooks/useChat.ts
import { useState } from "react";

export function useChat() {
  const [messages, setMsgs] = useState<{role: string; text: string}[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  async function send(text: string, files: File[] = []) {
    setIsLoading(true);
    setMsgs(m => [...m, {role: "user", text}]);

    try {
      // 1. upload files (if any)
      const fileIds = [];
      for (const f of files) {
        const form = new FormData(); 
        form.append("file", f);
        const r = await fetch("/.netlify/functions/upload", {
          method: "POST", 
          body: form
        });
        const data = await r.json();
        fileIds.push(data.id);
      }

      // 2. call chat
      const res = await fetch("/.netlify/functions/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({user_msg: text, file_ids: fileIds})
      });

      const reader = res.body?.getReader();
      let gptText = "";
      setMsgs(m => [...m, {role: "assistant", text: ""}]); // Empty assistant message

      if (reader) {
        while (true) {
          const {done, value} = await reader.read();
          if (done) break;
          gptText += new TextDecoder().decode(value);
          setMsgs(m => [...m.slice(0, -1), {role: "assistant", text: gptText}]);
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMsgs(m => [...m, {role: "assistant", text: "Sorry, an error occurred. Please try again."}]);
    } finally {
      setIsLoading(false);
    }
  }

  return {messages, send, isLoading};
}