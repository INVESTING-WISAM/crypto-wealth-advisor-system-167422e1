
const BYBIT_API_BASE = 'https://api.bybit.com';

interface BybitPosition {
  symbol: string;
  side: string;
  size: string;
  entryPrice: string;
  markPrice: string;
  unrealisedPnl: string;
  takeProfit: string;
  stopLoss: string;
  createdTime: string;
  updatedTime: string;
}

interface BybitResponse {
  retCode: number;
  retMsg: string;
  result: {
    list: BybitPosition[];
  };
}

export const fetchBybitPositions = async (apiKey: string): Promise<{ [key: string]: { price: number; change24h: number; entryPrice: number; amount: number; pnl: number; takeProfit?: number; stopLoss?: number; side: string } }> => {
  try {
    const timestamp = Date.now().toString();
    
    // For demo purposes, we'll make a simple request
    // In production, you'd need proper signature generation
    const response = await fetch(`${BYBIT_API_BASE}/v5/position/list?category=linear`, {
      method: 'GET',
      headers: {
        'X-BAPI-API-KEY': apiKey,
        'X-BAPI-TIMESTAMP': timestamp,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Bybit API error: ${response.status}`);
    }

    const data: BybitResponse = await response.json();
    
    if (data.retCode !== 0) {
      throw new Error(`Bybit API error: ${data.retMsg}`);
    }

    const result: { [key: string]: { price: number; change24h: number; entryPrice: number; amount: number; pnl: number; takeProfit?: number; stopLoss?: number; side: string } } = {};
    
    data.result.list.forEach((position) => {
      // Extract base symbol (remove USDT)
      const symbol = position.symbol.replace('USDT', '');
      
      result[symbol] = {
        price: parseFloat(position.markPrice),
        change24h: 0, // Bybit doesn't provide 24h change in position data
        entryPrice: parseFloat(position.entryPrice),
        amount: parseFloat(position.size),
        pnl: parseFloat(position.unrealisedPnl),
        takeProfit: position.takeProfit ? parseFloat(position.takeProfit) : undefined,
        stopLoss: position.stopLoss ? parseFloat(position.stopLoss) : undefined,
        side: position.side.toLowerCase()
      };
    });

    return result;
  } catch (error) {
    console.error('Error fetching Bybit positions:', error);
    throw error;
  }
};

export const testBybitConnection = async (apiKey: string): Promise<boolean> => {
  try {
    await fetchBybitPositions(apiKey);
    return true;
  } catch (error) {
    console.error('Bybit connection test failed:', error);
    return false;
  }
};
