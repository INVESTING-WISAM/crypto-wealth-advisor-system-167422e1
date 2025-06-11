
import { useState, useEffect, useCallback } from 'react';
import { fetchMultiplePrices, PriceResponse } from '@/services/securePriceApi';

export const useSecurePrices = (tokens: string[], refreshInterval: number = 30000) => {
  const [prices, setPrices] = useState<PriceResponse>({});
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const updatePrices = useCallback(async () => {
    if (tokens.length === 0) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const newPrices = await fetchMultiplePrices(tokens);
      setPrices(newPrices);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch prices');
    } finally {
      setIsLoading(false);
    }
  }, [tokens]);

  useEffect(() => {
    updatePrices();
    
    const interval = setInterval(updatePrices, refreshInterval);
    return () => clearInterval(interval);
  }, [updatePrices, refreshInterval]);

  return {
    prices,
    isLoading,
    lastUpdated,
    error,
    updatePrices
  };
};
