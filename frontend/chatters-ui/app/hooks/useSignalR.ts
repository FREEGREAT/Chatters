import { useState, useEffect, useRef, useCallback } from 'react';
import { HubConnection, HubConnectionBuilder, HubConnectionState } from '@microsoft/signalr';

interface UseSignalROptions {
  url: string;
  autoReconnect?: boolean;
  onConnected?: () => void;
  onDisconnected?: () => void;
  onError?: (error: Error) => void;
}

interface UseSignalRReturn {
  connection: HubConnection | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  invoke: (methodName: string, ...args: any[]) => Promise<any>;
  on: (methodName: string, callback: (...args: any[]) => void) => void;
  off: (methodName: string, callback?: (...args: any[]) => void) => void;
}

export const useSignalR = ({
  url,
  autoReconnect = true,
  onConnected,
  onDisconnected,
  onError
}: UseSignalROptions): UseSignalRReturn => {
  const [connection, setConnection] = useState<HubConnection | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const connectionRef = useRef<HubConnection | null>(null);

  const createConnection = useCallback(() => {
    const builder = new HubConnectionBuilder().withUrl(url);
    
    if (autoReconnect) {
      builder.withAutomaticReconnect();
    }

    return builder.build();
  }, [url, autoReconnect]);

  const connect = useCallback(async () => {
    if (connectionRef.current?.state === HubConnectionState.Connected) {
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      const newConnection = createConnection();
      
      newConnection.onclose((error) => {
        setIsConnected(false);
        setIsConnecting(false);
        if (error) {
          const errorMessage = error.message || 'Connection closed unexpectedly';
          setError(errorMessage);
          onError?.(new Error(errorMessage));
        }
        onDisconnected?.();
      });

      newConnection.onreconnecting((error) => {
        setIsConnected(false);
        setIsConnecting(true);
        if (error) {
          setError(error.message || 'Reconnecting...');
        }
      });

      newConnection.onreconnected((connectionId) => {
        setIsConnected(true);
        setIsConnecting(false);
        setError(null);
        onConnected?.();
      });

      await newConnection.start();
      
      connectionRef.current = newConnection;
      setConnection(newConnection);
      setIsConnected(true);
      setIsConnecting(false);
      onConnected?.();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect';
      setError(errorMessage);
      setIsConnecting(false);
      onError?.(err instanceof Error ? err : new Error(errorMessage));
    }
  }, [createConnection, onConnected, onDisconnected, onError]);

  const disconnect = useCallback(async () => {
    if (connectionRef.current) {
      try {
        await connectionRef.current.stop();
      } catch (err) {
        console.error('Error disconnecting:', err);
      } finally {
        connectionRef.current = null;
        setConnection(null);
        setIsConnected(false);
        setIsConnecting(false);
      }
    }
  }, []);

  const invoke = useCallback(async (methodName: string, ...args: any[]) => {
    if (!connectionRef.current || connectionRef.current.state !== HubConnectionState.Connected) {
      throw new Error('Connection is not established');
    }

    try {
      return await connectionRef.current.invoke(methodName, ...args);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to invoke method';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const on = useCallback((methodName: string, callback: (...args: any[]) => void) => {
    if (connectionRef.current) {
      connectionRef.current.on(methodName, callback);
    }
  }, []);

  const off = useCallback((methodName: string, callback?: (...args: any[]) => void) => {
    if (connectionRef.current) {
      if (callback) {
        connectionRef.current.off(methodName, callback);
      } else {
        connectionRef.current.off(methodName);
      }
    }
  }, []);

  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    connection,
    isConnected,
    isConnecting,
    error,
    connect,
    disconnect,
    invoke,
    on,
    off
  };
};
