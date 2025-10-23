"use client";

import { Message } from "../../types/chat";

interface Props {
  message: Message;
}

export default function MessageItem({ message }: Props) {
  const isMe = message.sender === "You";
  const sentiment = message.sentiment;

  return (
    <div className={`w-full flex ${isMe ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[85%] sm:max-w-[80%] p-2 sm:p-3 rounded-lg ${isMe ? "bg-primary/20" : "bg-content2/40"}`}>
        <div className="flex items-center justify-between gap-2 sm:gap-3">
          <div className="text-xs sm:text-sm font-semibold text-foreground/90">{message.sender}</div>
          <div className="text-xs text-foreground/50">{new Date(message.timestamp).toLocaleTimeString()}</div>
        </div>

        <div className="mt-1 sm:mt-2 text-sm sm:text-base text-foreground/95 break-words">{message.content}</div>

        {sentiment && (
          <div className="mt-2 text-sm flex items-center gap-2">
            <span className={`px-2 py-1 rounded-full text-xs ${sentiment.label === 'positive' ? 'bg-green-800 text-green-200' : sentiment.label === 'negative' ? 'bg-red-800 text-red-200' : 'bg-neutral-800 text-neutral-200'}`}>
              {sentiment.label} • {(sentiment.score * 100).toFixed(0)}%
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
