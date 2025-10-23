"use client";

import { useEffect, useRef } from "react";
import { Message } from "../../types/chat";
import MessageItem from "./MessageItem";

interface Props {
  messages: Message[];
}

export default function MessageList({ messages }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages.length]);

  return (
    <div 
      ref={ref} 
      className="overflow-y-scroll overflow-x-hidden p-4 flex flex-col gap-3 h-full"
      style={{ 
        height: 'calc(100vh - 200px)',
        maxHeight: 'calc(100vh - 200px)',
        minHeight: '300px'
      }}
    >
      {messages.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-foreground/50">
          <p>No messages yet. Start the conversation!</p>
        </div>
      ) : (
        <>
          {messages.map((m) => (
            <MessageItem key={m.id} message={m} />
          ))}
          {/* Spacer to ensure last message is visible */}
          <div className="h-1" />
        </>
      )}
    </div>
  );
}
