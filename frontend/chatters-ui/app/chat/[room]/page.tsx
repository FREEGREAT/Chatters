"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Message } from "../../types/chat";
import MessageList from "../components/MessageList";
import ChatInput from "../components/ChatInput";
import { useRoom } from "../../contexts/RoomContext";
import { Button } from "@heroui/button";

export default function ChatRoomPage() {
  const params = useParams();
  const router = useRouter();
  const room = (params as any)?.room ?? "general";
  const [messages, setMessages] = useState<Message[]>([]);
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const { setRoomName } = useRoom();

  useEffect(() => {
    setRoomName(room);
    return () => setRoomName(null);
  }, [room, setRoomName]);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:5000/ws");
    wsRef.current = ws;

    ws.addEventListener("open", () => {
      setConnected(true);
      ws.send(JSON.stringify({ type: "join", room }));
    });

    ws.addEventListener("message", (ev) => {
      try {
        const payload = JSON.parse(ev.data);
        if (payload.type === "message") {
          setMessages((prev) => [...prev, payload.message]);
        }
        if (payload.type === "sentiment") {
          setMessages((prev) =>
            prev.map((m) => (m.id === payload.messageId ? { ...m, sentiment: payload.sentiment } : m))
          );
        }
      } catch (err) {
        console.error(err);
      }
    });

    ws.addEventListener("close", () => setConnected(false));
    ws.addEventListener("error", () => setConnected(false));

    return () => {
      ws.close();
    };
  }, [room]);

  const handleSend = async (text: string) => {
    const msg: Message = {
      id: Math.random().toString(36).slice(2, 9),
      content: text,
      sender: "You",
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, msg]);

    wsRef.current?.send(JSON.stringify({ type: "message", room, message: msg }));
  };

  useEffect(() => {
    const testMessages: Message[] = Array.from({ length: 50 }, (_, i) => ({
      id: `test-${i}`,
      content: `Test message ${i + 1} - This is a much longer message to test scrolling functionality. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`,
      sender: i % 2 === 0 ? "You" : "Other User",
      timestamp: new Date(Date.now() - (50 - i) * 60000).toISOString(),
    }));
    setMessages(testMessages);
  }, []);

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex-1 p-2 sm:p-4 min-h-0">
        <div className="max-w-4xl mx-auto h-full flex flex-col bg-content1/30 rounded-lg shadow-lg">
          <div className="p-3 border-b border-content1/20 flex justify-between items-center">
            <Button
              size="sm"
              variant="light"
              onClick={() => router.push("/")}
              className="text-foreground/70 hover:text-foreground"
            >
              ← Back to Home
            </Button>
            <div className="text-sm text-foreground/60">
              {connected ? "🟢 Connected" : "🟡 Connecting..."}
            </div>
          </div>
          
          <div className="flex-1 min-h-0 overflow-hidden">
            <MessageList messages={messages} />
          </div>
          <div className="border-t border-content1/20 p-2 sm:p-3 flex-shrink-0 bg-content1/30">
            <ChatInput onSend={handleSend} />
          </div>
        </div>
      </div>
    </div>
  );
}
