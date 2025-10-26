"use client";

import { useState, useRef, useEffect, memo } from "react";

interface Props {
  onSend: (text: string) => Promise<void> | void;
}

function ChatInput({ onSend }: Props) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Фокус при першому рендері
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

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
      // Невеликий таймаут, щоб гарантувати, що фокус повернеться після всіх оновлень React
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  };

  return (
    <div className="flex gap-1 sm:gap-2">
      <input
        ref={inputRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            submit();
          }
        }}
        placeholder="Type a message..."
        className="flex-1 rounded-md px-2 sm:px-3 py-1 sm:py-1.5 bg-content2/30 text-foreground/95 outline-none focus:ring-2 focus:ring-primary text-xs sm:text-sm"
        disabled={loading}
        autoComplete="off"
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

export default memo(ChatInput);
