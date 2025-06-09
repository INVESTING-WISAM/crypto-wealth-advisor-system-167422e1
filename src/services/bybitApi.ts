
import CryptoJS from 'crypto-js';

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

const generateSignature = (timestamp: string, apiKey: string, apiSecret: string, params: string = '') => {
  const message = timestamp + apiKey + '5000' + params; // 5000 is recv_window
  return CryptoJS.HmacSHA256(message, apiSecret).toString();
};

export const fetchBybitPositions = async (apiKey: string, apiSecret: string = ''): Promise<{ [key: string]: { price: number; change24h: number; entryPrice: number; amount: number; pnl: number; takeProfit?: number; stopLoss?: number; side: string } }> => {
  try {
    const timestamp = Date.now().toString();
    const params = 'category=linear';
    
    // For demo purposes, if no secret is provided, we'll try without signature
    let headers: any = {
      'X-BAPI-API-KEY': apiKey,
      'X-BAPI-TIMESTAMP': timestamp,
      'X-BAPI-RECV-WINDOW': '5000',
      'Content-Type': 'application/json',
    };

    // Only add signature if we have an API secret
    if (apiSecret) {
      const signature = generateSignature(timestamp, apiKey, apiSecret, params);
      headers['X-BAPI-SIGN'] = signature;
    }

    const response = await fetch(`${BYBIT_API_BASE}/v5/position/list?${params}`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error(`Bybit API error: ${response.status}`);
    }

    const data: BybitResponse = await response.json();
    
    if (data.retCode !== 0) {
      if (data.retCode === 10001) {
        throw new Error('API authentication failed. Please check your API key and secret. Make sure your API key has position reading permissions and IP restrictions are disabled.');
      }
      throw new Error(`Bybit API error: ${data.retMsg}`);
    }

    const result: { [key: string]: { price: number; change24h: number; entryPrice: number; amount: number; pnl: number; takeProfit?: number; stopLoss?: number; side: string } } = {};
    
    if (data.result && data.result.list) {
      data.result.list.forEach((position) => {
        // Only include positions with size > 0
        if (parseFloat(position.size) > 0) {
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
        }
      });
    }

    return result;
  } catch (error) {
    console.error('Error fetching Bybit positions:', error);
    throw error;
  }
};

export const testBybitConnection = async (apiKey: string, apiSecret: string = ''): Promise<boolean> => {
  try {
    await fetchBybitPositions(apiKey, apiSecret);
    return true;
  } catch (error) {
    console.error('Bybit connection test failed:', error);
    return false;
  }
};
