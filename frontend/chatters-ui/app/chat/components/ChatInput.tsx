"use client";

import { useState } from "react";

interface Props {
  onSend: (text: string) => Promise<void> | void;
}

export default function ChatInput({ onSend }: Props) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!text.trim()) return;
    setLoading(true);
    try {
      await onSend(text.trim());
      setText("");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-1 sm:gap-2">
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && submit()}
        placeholder="Type a message..."
        className="flex-1 rounded-md px-2 sm:px-3 py-1 sm:py-1.5 bg-content2/30 text-foreground/95 outline-none focus:ring-2 focus:ring-primary text-xs sm:text-sm"
        disabled={loading}
      />
      <button
        onClick={submit}
        className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-md bg-primary text-black disabled:opacity-50 text-xs sm:text-sm font-medium"
        disabled={loading}
      >
        Send
      </button>
    </div>
  );
}
