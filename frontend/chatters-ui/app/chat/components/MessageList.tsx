"use client";

import { Message } from "../../types/chat";
import MessageItem from "./MessageItem";
import useAutoScroll from "../hooks/useAutoScroll";

interface Props {
  messages: Message[];
}

export default function MessageList({ messages }: Props) {
  const { ref } = useAutoScroll();

  return (
    <div ref={ref} className="p-4 flex flex-col gap-3">
      {messages.map((m) => (
        <MessageItem key={m.id} message={m} />
      ))}
    </div>
  );
}
