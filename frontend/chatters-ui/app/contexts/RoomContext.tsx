"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useSignalR } from "../hooks/useSignalR";

interface RoomContextType {
  roomName: string | null;
  setRoomName: (room: string | null) => void;
  username: string | null;
  setUsername: (username: string | null) => void;
  isConnected: boolean;
  isConnecting: boolean;
  connectionError: string | null;
  sendMessage: (message: string) => Promise<void>;
  joinRoom: (roomName: string, username: string) => Promise<void>;
  leaveRoom: () => Promise<void>;
}

const RoomContext = createContext<RoomContextType | undefined>(undefined);

export function RoomProvider({ children }: { children: ReactNode }) {
  const [roomName, setRoomName] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  
  const {
    isConnected,
    isConnecting,
    error: connectionError,
    invoke,
    on,
    off
  } = useSignalR({
    url: "http://localhost:5243/chat",
    autoReconnect: true,
    onConnected: () => {
      console.log("Connected to SignalR hub");
    },
    onDisconnected: () => {
      console.log("Disconnected from SignalR hub");
    },
    onError: (error) => {
      console.error("SignalR error:", error);
    }
  });

  const joinRoom = async (roomName: string, username: string) => {
    try {
      await invoke("JoinChat", { userName: username, chatRoom: roomName });
      setRoomName(roomName);
      setUsername(username);
    } catch (error) {
      console.error("Failed to join room:", error);
      throw error;
    }
  };

  const leaveRoom = async () => {
    try {
      if (roomName && username) {
        await invoke("LeaveChat", { userName: username, chatRoom: roomName });
      }
      setRoomName(null);
      setUsername(null);
    } catch (error) {
      console.error("Failed to leave room:", error);
    }
  };

  const sendMessage = async (message: string) => {
    try {
      await invoke("SendMessage", { 
        userName: username, 
        chatRoom: roomName, 
        message 
      });
    } catch (error) {
      console.error("Failed to send message:", error);
      throw error;
    }
  };

  return (
    <RoomContext.Provider value={{ 
      roomName, 
      setRoomName, 
      username, 
      setUsername,
      isConnected,
      isConnecting,
      connectionError,
      sendMessage,
      joinRoom,
      leaveRoom
    }}>
      {children}
    </RoomContext.Provider>
  );
}

export function useRoom() {
  const context = useContext(RoomContext);
  if (context === undefined) {
    throw new Error("useRoom must be used within a RoomProvider");
  }
  return context;
}
