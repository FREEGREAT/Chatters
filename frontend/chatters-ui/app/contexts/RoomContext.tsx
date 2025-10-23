"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface RoomContextType {
  roomName: string | null;
  setRoomName: (room: string | null) => void;
}

const RoomContext = createContext<RoomContextType | undefined>(undefined);

export function RoomProvider({ children }: { children: ReactNode }) {
  const [roomName, setRoomName] = useState<string | null>(null);

  return (
    <RoomContext.Provider value={{ roomName, setRoomName }}>
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
