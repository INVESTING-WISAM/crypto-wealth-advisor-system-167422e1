
import { useState, useEffect } from 'react';

interface ExchangeConnection {
  exchange: string;
  connected: boolean;
  connectedAt: string;
}

export const useExchangeConnection = () => {
  const [connection, setConnection] = useState<ExchangeConnection | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('exchangeConnection');
    if (stored) {
      try {
        setConnection(JSON.parse(stored));
      } catch (error) {
        console.error('Failed to parse exchange connection data:', error);
        localStorage.removeItem('exchangeConnection');
      }
    }
  }, []);

  const disconnect = () => {
    localStorage.removeItem('exchangeConnection');
    setConnection(null);
  };

  const isConnected = !!connection?.connected;

  return {
    connection,
    isConnected,
    disconnect,
    refresh: () => {
      const stored = localStorage.getItem('exchangeConnection');
      if (stored) {
        setConnection(JSON.parse(stored));
      }
    }
  };
};
