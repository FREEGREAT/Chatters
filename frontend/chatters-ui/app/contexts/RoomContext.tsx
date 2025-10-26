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
  const [username, setUsername] = useState<string | null>(() => {
    // Initialize username from localStorage if available
    if (typeof window !== 'undefined') {
      return localStorage.getItem("chatters.username");
    }
    return null;
  });
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const joinRoom = async (roomName: string, username: string) => {
    setRoomName(roomName);
    setUsername(username);
  };

  const leaveRoom = async () => {
    setRoomName(null);
    setUsername(null);
  };

  const sendMessage = async (message: string) => {
    // This will be implemented in the chat component
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
