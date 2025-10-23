
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Card, CardBody, CardHeader } from "@heroui/card";

export default function Home() {
  const [username, setUsername] = useState("");
  const [chatroom, setChatroom] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  // Check if user is already logged in
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check for existing username on component mount
  useState(() => {
    try {
      const savedUsername = localStorage.getItem("chatters.username");
      if (savedUsername) {
        setUsername(savedUsername);
        setIsLoggedIn(true);
      }
    } catch (err) {
      // ignore storage errors
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!username.trim() || !chatroom.trim()) {
      setError("Please provide both username and chat room name.");
      return;
    }

    try {
      localStorage.setItem("chatters.username", username.trim());
    } catch (err) {
      // ignore storage errors
    }

    router.push(`/chat/${encodeURIComponent(chatroom.trim())}`);
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem("chatters.username");
      setUsername("");
      setIsLoggedIn(false);
    } catch (err) {
      // ignore storage errors
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-900 via-slate-950 to-slate-900">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="flex flex-col gap-1 items-center">
          <h1 className="text-2xl font-bold text-foreground">Welcome to Chatters</h1>
          <p className="text-sm text-foreground-500">Enter your details to join the chat</p>
          {isLoggedIn && (
            <div className="flex items-center gap-2 mt-2">
              <span className="text-sm text-foreground-600">Logged in as: {username}</span>
              <Button 
                size="sm" 
                color="danger" 
                variant="light"
                onClick={handleLogout}
              >
                Logout
              </Button>
            </div>
          )}
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && <div className="text-sm text-danger/80">{error}</div>}

            <Input
              label="Username"
              placeholder="Enter your username"
              value={username}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
              variant="bordered"
              isRequired
            />

            <Input
              label="Chat Room"
              placeholder="Enter chat room name"
              value={chatroom}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setChatroom(e.target.value)}
              variant="bordered"
              isRequired
            />

            <Button color="secondary" type="submit" className="w-full" size="lg">
              Join Chat
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
