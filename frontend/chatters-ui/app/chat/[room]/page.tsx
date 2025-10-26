"use client";

import { useEffect, useState } from "react";
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
  const { 
    setRoomName, 
    setUsername, 
    isConnected, 
    isConnecting, 
    connectionError,
    sendMessage,
    joinRoom,
    leaveRoom
  } = useRoom();

  // Ініціалізація кімнати та підключення до SignalR
  useEffect(() => {
    const initializeRoom = async () => {
      try {
        // Отримуємо збережений username
        const savedUsername = localStorage.getItem("chatters.username");
        if (!savedUsername) {
          router.push("/");
          return;
        }

        setUsername(savedUsername);
        setRoomName(room);
        
        // Чекаємо поки SignalR підключиться, потім приєднуємося до кімнати
        if (isConnected) {
          await joinRoom(room, savedUsername);
        }
      } catch (error) {
        console.error("Failed to initialize room:", error);
      }
    };

    initializeRoom();

    return () => {
      leaveRoom();
      setRoomName(null);
      setUsername(null);
    };
  }, [room, isConnected, setRoomName, setUsername, joinRoom, leaveRoom, router]);

  const handleSend = async (text: string) => {
    try {
      await sendMessage(text);
      
      // Додаємо повідомлення локально для миттєвого відображення
      const msg: Message = {
        id: Math.random().toString(36).slice(2, 9),
        content: text,
        sender: "You",
        timestamp: new Date().toISOString(),
      };
      
      setMessages((prev) => [...prev, msg]);
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  // Тестові повідомлення для демонстрації (можна видалити в продакшені)
  useEffect(() => {
    const testMessages: Message[] = Array.from({ length: 5 }, (_, i) => ({
      id: `test-${i}`,
      content: `Test message ${i + 1} - Welcome to the chat room!`,
      sender: i % 2 === 0 ? "You" : "Other User",
      timestamp: new Date(Date.now() - (5 - i) * 60000).toISOString(),
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
              {isConnected ? "🟢 Connected" : isConnecting ? "🟡 Connecting..." : "🔴 Disconnected"}
              {connectionError && <span className="text-danger ml-2">({connectionError})</span>}
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
