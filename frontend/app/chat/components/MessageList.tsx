"use client";

import { Message } from "../../types/chat";
import MessageItem from "./MessageItem";
import useAutoScroll from "../hooks/useAutoScroll";

interface Props {
  messages: Message[];
  currentUser?: string;
}

export default function MessageList({ messages, currentUser }: Props) {
  const { ref } = useAutoScroll();

  return (
    <div ref={ref} className="p-4 flex flex-col gap-3 min-h-0">
      {messages.map((m) => (
        <MessageItem key={m.id} message={m} currentUser={currentUser} />
      ))}
    </div>
  );
}
