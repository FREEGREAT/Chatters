import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  HubConnection, 
  HubConnectionBuilder, 
  HubConnectionState,
  JsonHubProtocol
} from '@microsoft/signalr';

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
    console.log("Creating SignalR connection to:", url);
    const builder = new HubConnectionBuilder()
      .withUrl(url)
      .configureLogging("information")
      .withHubProtocol(new JsonHubProtocol())
    
    if (autoReconnect) {
      // Configure more conservative retry policy
      builder.withAutomaticReconnect({
        nextRetryDelayInMilliseconds: (retryContext) => {
          if (retryContext.previousRetryCount === 0) {
            return 0;
          }
          if (retryContext.elapsedMilliseconds > 180000) { // 3 minutes
            return null; // Stop retrying after 3 minutes
          }
          // Exponential backoff starting from 2 seconds
          return Math.min(2000 * Math.pow(2, retryContext.previousRetryCount - 1), 30000);
        }
      });
    }

    const connection = builder.build();
    
    // Preserve case in method names
    connection.on = ((originalOn) => {
      return function(methodName: string, newMethod: (...args: any[]) => void) {
        return originalOn.call(connection, methodName, newMethod);
      };
    })(connection.on);

    return connection;
  }, [url, autoReconnect]);

  const connect = useCallback(async () => {
    // Prevent multiple simultaneous connection attempts
    if (isConnecting) {
      console.log("Connection attempt already in progress");
      return;
    }

    if (connectionRef.current?.state === HubConnectionState.Connected) {
      console.log("Already connected");
      return;
    }

    // Add a connection lock
    const connectionLock = Math.random().toString(36).substring(7);
    const currentLock = connectionLock;
    
    console.log("Attempting to connect to SignalR hub");
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
      
      // Only update state if this is still the active connection attempt
      if (currentLock === connectionLock) {
        connectionRef.current = newConnection;
        setConnection(newConnection);
        setIsConnected(true);
        setIsConnecting(false);
        onConnected?.();
      } else {
        // If this isn't the active connection attempt, clean it up
        try {
          await newConnection.stop();
        } catch (err) {
          console.error("Error cleaning up superseded connection:", err);
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect';
      setError(errorMessage);
      setIsConnecting(false);
      onError?.(err instanceof Error ? err : new Error(errorMessage));
    }
  }, [createConnection, onConnected, onDisconnected, onError]);

  const disconnect = useCallback(async () => {
    const currentConnection = connectionRef.current;
    if (currentConnection) {
      // Clear the ref immediately to prevent any new operations
      connectionRef.current = null;
      setConnection(null);
      setIsConnected(false);
      setIsConnecting(false);

      try {
        await currentConnection.stop();
      } catch (err) {
        console.error('Error disconnecting:', err);
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
    let isEffectActive = true;

    const initializeConnection = async () => {
      if (!isEffectActive) return;
      
      try {
        await connect();
      } catch (err) {
        console.error("Failed to initialize connection:", err);
      }
    };

    initializeConnection();

    return () => {
      isEffectActive = false;
      disconnect();
    };
  }, []);

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
