
import { useState, useEffect, useCallback } from 'react';
import { fetchOKXTickers } from '@/services/okxApi';
import { toast } from 'sonner';

interface PriceData {
  price: number;
  change24h: number;
}

export const useLivePrices = (symbols: string[], intervalMs: number = 30000) => {
  const [prices, setPrices] = useState<{ [key: string]: PriceData }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const updatePrices = useCallback(async () => {
    if (symbols.length === 0) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const newPrices = await fetchOKXTickers(symbols);
      setPrices(newPrices);
      setLastUpdated(new Date());
      
      if (Object.keys(newPrices).length > 0) {
        toast.success(`Updated ${Object.keys(newPrices).length} prices from OKX`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch prices';
      setError(errorMessage);
      toast.error(`Price update failed: ${errorMessage}`);
      console.error('Price update error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [symbols]);

  useEffect(() => {
    updatePrices();
    
    const interval = setInterval(updatePrices, intervalMs);
    
    return () => clearInterval(interval);
  }, [updatePrices, intervalMs]);

  return {
    prices,
    isLoading,
    lastUpdated,
    error,
    updatePrices
  };
};
