import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export function useSocket(): Socket | null {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const newSocket = io('https://packagetracker-production.up.railway.app');
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  return socket;
}