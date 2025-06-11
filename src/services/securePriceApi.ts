
export interface PriceData {
  price: number;
  change24h: number;
}

export interface PriceResponse {
  [symbol: string]: PriceData;
}

const BASE_URL = 'https://secure-api-se59.onrender.com';

export const fetchTokenPrice = async (symbol: string): Promise<PriceData | null> => {
  try {
    const response = await fetch(`${BASE_URL}/okx-price/${symbol}-USDT`);
    if (!response.ok) {
      throw new Error(`Failed to fetch price for ${symbol}`);
    }
    const data = await response.json();
    
    // Transform the response to match our expected format
    return {
      price: parseFloat(data.price || data.last || 0),
      change24h: parseFloat(data.change24h || data.changePercent || 0)
    };
  } catch (error) {
    console.error(`Error fetching price for ${symbol}:`, error);
    return null;
  }
};

export const fetchMultiplePrices = async (symbols: string[]): Promise<PriceResponse> => {
  const promises = symbols.map(async (symbol) => {
    const price = await fetchTokenPrice(symbol);
    return { symbol, price };
  });

  const results = await Promise.allSettled(promises);
  const priceData: PriceResponse = {};

  results.forEach((result, index) => {
    const symbol = symbols[index];
    if (result.status === 'fulfilled' && result.value.price) {
      priceData[symbol] = result.value.price;
    } else {
      // Fallback to mock data if API fails
      priceData[symbol] = {
        price: getMockPrice(symbol),
        change24h: Math.random() * 10 - 5 // Random change between -5% and 5%
      };
    }
  });

  return priceData;
};

// Fallback mock prices
const getMockPrice = (symbol: string): number => {
  const mockPrices: { [key: string]: number } = {
    BTC: 43500,
    ETH: 2650,
    SOL: 98,
    CORE: 1.25,
    ADA: 0.52,
    DOT: 7.85,
    LINK: 15.40,
    UNI: 6.80
  };
  return mockPrices[symbol] || 1;
};
