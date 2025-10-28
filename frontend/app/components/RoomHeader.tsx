"use client";

import { useRoom } from "../contexts/RoomContext";

export function RoomHeader() {
  const { roomName } = useRoom();

  if (!roomName) return null;

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm opacity-60">Room:</span>
      <span className="text-lg font-semibold text-primary">{roomName}</span>
    </div>
  );
}
