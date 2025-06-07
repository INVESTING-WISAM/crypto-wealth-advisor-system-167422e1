
import { useState, useEffect, useCallback } from 'react';
import { fetchBybitPositions } from '@/services/bybitApi';
import { toast } from 'sonner';

interface BybitPositionData {
  price: number;
  change24h: number;
  entryPrice: number;
  amount: number;
  pnl: number;
  takeProfit?: number;
  stopLoss?: number;
  side: string;
}

export const useBybitPositions = (apiKey: string | null, intervalMs: number = 30000) => {
  const [positions, setPositions] = useState<{ [key: string]: BybitPositionData }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const updatePositions = useCallback(async () => {
    if (!apiKey) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const newPositions = await fetchBybitPositions(apiKey);
      setPositions(newPositions);
      setLastUpdated(new Date());
      
      if (Object.keys(newPositions).length > 0) {
        toast.success(`Updated ${Object.keys(newPositions).length} Bybit positions`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch Bybit positions';
      setError(errorMessage);
      toast.error(`Bybit sync failed: ${errorMessage}`);
      console.error('Bybit positions error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [apiKey]);

  useEffect(() => {
    if (!apiKey) return;
    
    updatePositions();
    
    const interval = setInterval(updatePositions, intervalMs);
    
    return () => clearInterval(interval);
  }, [updatePositions, intervalMs, apiKey]);

  return {
    positions,
    isLoading,
    lastUpdated,
    error,
    updatePositions
  };
};
