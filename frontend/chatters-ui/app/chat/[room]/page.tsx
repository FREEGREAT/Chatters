"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Message } from "../../types/chat";
import { ErrorBoundary } from "../../components/ErrorBoundary";
import MessageList from "../components/MessageList";
import ChatInput from "../components/ChatInput";
import { useRoom } from "../../contexts/RoomContext";
import { useSignalR } from "../../hooks/useSignalR";

export default function ChatRoomPage() {
  const params = useParams();
  const router = useRouter();
  const room = (params as any)?.room ?? "general";
  const [messages, setMessages] = useState<Message[]>([]);
  const { username, setUsername, leaveRoom } = useRoom();
  
  useEffect(() => {
    const savedUsername = localStorage.getItem("chatters.username");
    if (!savedUsername) {
      console.log("No saved username found, redirecting to login");
      router.push('/');
      return;
    }
    
    if (savedUsername.toLowerCase() === 'system') {
      console.log("Reserved username 'System' detected, redirecting to login");
      localStorage.removeItem("chatters.username");
      router.push('/');
      return;
    }
    
    if (!username) {
      console.log("Setting username from localStorage:", savedUsername);
      setUsername(savedUsername);
    }
  }, [username, setUsername, router]);
  
  const {
    isConnected,
    isConnecting,
    error: connectionError,
    invoke,
    on,
    off,
    disconnect,
  } = useSignalR({
    url: process.env.SIGNALR_URL || "http://localhost:5243/chat",
    autoReconnect: true,
    onConnected: async () => {
      console.log("Connected to SignalR hub");
      if (username && room) {
        try {
          await invoke("JoinChat", { userName: username, chatRoom: room });
          console.log("Joined room:", room);
        } catch (err) {
          console.error("Failed to join room:", err);
        }
      }
    },
    onDisconnected: () => {
      console.log("Disconnected from SignalR hub");
      // Clear messages when disconnected to avoid stale state
      setMessages([]);
    },
    onError: (error) => {
      console.error("SignalR error:", error);
    }
  });

  const handleLeaveChat = useCallback(async () => {
    console.log("Leaving chat...");
    try {
      await disconnect(); // 1. Закриваємо з'єднання SignalR
      leaveRoom();       // 2. Очищуємо стан кімнати та користувача
      router.push('/');  // 3. Перенаправляємо на головну сторінку
    } catch (error) {
      console.error("Failed to leave chat cleanly:", error);
      // Навіть якщо є помилка, все одно перенаправляємо
      router.push('/');
    }
  }, [disconnect, leaveRoom, router]);

  // Effect to handle SignalR connection and room joining
  const handleSendMessage = async (text: string) => {
    if (!isConnected || !username) {
      console.error("Cannot send message: not connected or no username");
      return;
    }
    
    try {
      await invoke("SendMessage", text);
      console.log("Message sent successfully");
    } catch (err) {
      console.error("Failed to send message:", err);
      throw err;
    }
  };

  useEffect(() => {
    if (!username || !room) {
      console.log("Waiting for username and room to be available");
      return;
    }

    let isMounted = true;
    let isJoined = false;
    let joinAttemptTimeout: NodeJS.Timeout | null = null;

    // Only attempt to join if we're connected
    if (!isConnected) {
      console.log("Waiting for SignalR connection...");
      return;
    }

    const handleReceiveMessage = (userName: string, message: string) => {
      if (!isMounted) return;
      console.log("Received message from:", userName, message);
      const newMessage: Message = {
        id: Date.now().toString(), // Generate temporary ID
        content: message,
        sender: userName,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, newMessage]);
    };

    const handleReceiveSentiment = (messageId: string, sentiment: any) => {
      if (!isMounted) return;
      console.log("Received sentiment for message:", messageId, sentiment);
      setMessages(prev =>
        prev.map(m => m.id === messageId ? { ...m, sentiment } : m)
      );
    };

    const joinRoom = async () => {
      if (!isMounted || isJoined || !isConnected) return;

      try {
        // Set up event handlers before joining room
        console.log("Setting up SignalR event handlers");
        on("RecieveMessage", handleReceiveMessage); // Note: matches the backend spelling
        on("ReceiveSentiment", handleReceiveSentiment);

        // Join room
        console.log("Joining chat room:", { username, room });
        await invoke("JoinChat", { userName: username, chatRoom: room });
        
        if (isMounted) {
          console.log("Successfully joined chat room");
          isJoined = true;
        } else {
          // Component unmounted during join, cleanup
          off("RecieveMessage", handleReceiveMessage);
          off("ReceiveSentiment", handleReceiveSentiment);
          try {
            await invoke("LeaveChat", { userName: username, chatRoom: room });
          } catch (err) {
            console.error("Error cleaning up after unmount during join:", err);
          }
        }
      } catch (err) {
        console.error("Failed to join chat room:", err);
        if (isMounted) {
          // Clean up handlers if join fails
          off("RecieveMessage", handleReceiveMessage);
          off("ReceiveSentiment", handleReceiveSentiment);
        }
      }
    };

    const leaveRoom = async () => {
      if (!isJoined) return;
      
      try {
        // Remove event handlers first to prevent any race conditions
        console.log("Removing SignalR event handlers");
        off("RecieveMessage", handleReceiveMessage);
        off("ReceiveSentiment", handleReceiveSentiment);
        
        if (isConnected) {
          console.log("Leaving chat room");
          await invoke("LeaveChat", { userName: username, chatRoom: room });
          console.log("Successfully left chat room");
        }
      } catch (err) {
        console.error("Error leaving chat room:", err);
      }
    };

    // Schedule join attempt with a small delay to prevent rapid reconnection attempts
    joinAttemptTimeout = setTimeout(joinRoom, 500);

    return () => {
      isMounted = false;
      if (joinAttemptTimeout) {
        clearTimeout(joinAttemptTimeout);
      }
      leaveRoom();
    };
  }, [username, room, isConnected, on, off, invoke]);

  const handleSend = useCallback(async (text: string) => {
    if (!isConnected || !username) {
      console.error("Cannot send message: not connected or no username");
      return;
    }

    try {
      await invoke("SendMessage", text);
      console.log("Message sent successfully");
    } catch (error) {
      console.error("Failed to send message:", error);
      throw error;
    }
  }, [isConnected, username, invoke]);

  return (
    <ErrorBoundary>
      <div className="h-[90vh] flex flex-col bg-gradient-to-br from-violet-900 via-slate-950 to-slate-900">
        <header className="px-6 py-4 flex items-center justify-between text-foreground/90">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold">Chatters</h2>
            <span className="text-sm opacity-70">Room: {room}</span>
          </div>
          <div className="text-sm">
            {isConnected ? (
              <span className="text-green-400">Connected</span>
            ) : isConnecting ? (
              <span className="text-yellow-300">Connecting...</span>
            ) : (
              <span className="text-red-400">Disconnected</span>
            )}
            {connectionError && (
              <span className="ml-2 text-red-400">{connectionError}</span>
            )}
          </div>
          <button
            onClick={handleLeaveChat}
            className="ml-4 px-3 py-1.5 rounded-md bg-red-600/80 hover:bg-red-600 text-white text-xs sm:text-sm font-medium transition-colors"
          >
            Leave
          </button>
        </header>

      <main className="flex-1 p-6 min-h-0">
        <div className="max-w-4xl mx-auto h-full flex flex-col bg-content1/30 rounded-lg shadow-lg">
          <div className="flex-1 overflow-hidden min-h-0">
            <div className="h-full overflow-y-auto">
              <MessageList messages={messages} currentUser={username || undefined} />
            </div>
          </div>
          <div className="flex-none border-t border-content1/20 p-4">
            <ChatInput onSend={handleSend} />
          </div>
        </div>
      </main>
    </div>
    </ErrorBoundary>
  );
}
