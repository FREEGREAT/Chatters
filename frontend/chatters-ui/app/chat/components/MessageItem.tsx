"use client";

import { Message } from "../../types/chat";

interface Props {
  message: Message;
  currentUser?: string;
}

export default function MessageItem({ message, currentUser }: Props) {
  const isMe = currentUser && message.sender === currentUser;
  const isSystem = message.sender === "System";
  const sentiment = message.sentiment;

  if (isSystem) {
    return (
      <div className="w-full flex justify-center">
        <div className="max-w-[90%] sm:max-w-[85%] py-1.5 px-4 rounded-full 
          bg-blue-500/20 text-blue-100 border border-blue-400/30
          text-center text-sm">
          <div className="text-center">{message.content}</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full flex ${isMe ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[85%] sm:max-w-[80%] p-2 sm:p-3 rounded-lg 
        ${isMe 
          ? "bg-violet-600/30 text-violet-50" 
          : "bg-gray-600/30 text-gray-50"
        }`}>
        <div className="flex items-center justify-between gap-2 sm:gap-3">
          <div className="text-xs sm:text-sm font-semibold text-foreground/90">{message.sender}</div>
          <div className="text-xs text-foreground/50">{new Date(message.timestamp).toLocaleTimeString()}</div>
        </div>

        <div className="mt-1 sm:mt-2 text-sm sm:text-base text-foreground/95 break-words">{message.content}</div>

        {!isSystem && sentiment && (
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
