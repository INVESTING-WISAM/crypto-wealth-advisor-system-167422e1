
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

interface BybitError {
  retCode: number;
  retMsg: string;
}

const generateSignature = (timestamp: string, apiKey: string, apiSecret: string, params: string = '') => {
  const message = timestamp + apiKey + '5000' + params;
  return CryptoJS.HmacSHA256(message, apiSecret).toString();
};

export const validateBybitCredentials = (apiKey: string, apiSecret: string): { valid: boolean; error?: string } => {
  if (!apiKey || apiKey.trim().length < 10) {
    return { valid: false, error: 'API Key must be at least 10 characters long' };
  }
  
  if (!apiSecret || apiSecret.trim().length < 10) {
    return { valid: false, error: 'API Secret must be at least 10 characters long' };
  }

  // More flexible API key format validation
  if (!apiKey.trim().match(/^[A-Za-z0-9]{10,}$/)) {
    return { valid: false, error: 'Invalid API Key format. Please ensure you copied the complete key from Bybit.' };
  }

  return { valid: true };
};

export const getBybitSetupInstructions = () => {
  return {
    title: "Bybit API Setup Instructions",
    steps: [
      "1. Log into your Bybit account and go to Account & Security > API Management",
      "2. Click 'Create New Key' and choose 'System-generated API Key'",
      "3. Set permissions: Enable 'Read-only' and specifically 'Position' and 'Account' permissions",
      "4. For IP restrictions: Either disable IP restrictions OR add your current IP",
      "5. Copy both the API Key and Secret Key (you won't see the secret again!)",
      "6. Make sure you're using Mainnet keys, not Testnet"
    ],
    commonErrors: [
      "• IP restrictions enabled - Disable or add your IP to whitelist",
      "• Missing permissions - Ensure 'Position' and 'Account' permissions are enabled",
      "• Using Testnet keys - Switch to Mainnet keys for live trading data",
      "• Invalid API format - Make sure to copy the complete key without spaces"
    ]
  };
};

export const fetchBybitPositions = async (apiKey: string, apiSecret: string = ''): Promise<{ [key: string]: { price: number; change24h: number; entryPrice: number; amount: number; pnl: number; takeProfit?: number; stopLoss?: number; side: string } }> => {
  try {
    console.log('Starting Bybit API request...');
    
    // Validate credentials first
    const validation = validateBybitCredentials(apiKey, apiSecret);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    const timestamp = Date.now().toString();
    const params = 'category=linear';
    
    const headers: any = {
      'X-BAPI-API-KEY': apiKey.trim(),
      'X-BAPI-TIMESTAMP': timestamp,
      'X-BAPI-RECV-WINDOW': '5000',
      'Content-Type': 'application/json',
    };

    if (apiSecret && apiSecret.trim()) {
      const signature = generateSignature(timestamp, apiKey.trim(), apiSecret.trim(), params);
      headers['X-BAPI-SIGN'] = signature;
      console.log('Generated signature for authenticated request');
    }

    console.log('Making request to Bybit API...');
    const response = await fetch(`${BYBIT_API_BASE}/v5/position/list?${params}`, {
      method: 'GET',
      headers,
    });

    console.log('Bybit API response status:', response.status);

    if (!response.ok) {
      let errorMessage = 'Unknown error occurred';
      
      try {
        const errorData = await response.json();
        console.log('Bybit API error response:', errorData);
        
        if (errorData.retMsg) {
          errorMessage = errorData.retMsg;
        }
      } catch (parseError) {
        console.log('Could not parse error response');
      }

      if (response.status === 403) {
        throw new Error('Access denied. Please check your API permissions and ensure "Position" reading is enabled.');
      }
      if (response.status === 401) {
        throw new Error('Authentication failed. Please verify your API key and secret are correct.');
      }
      if (response.status === 400) {
        throw new Error('Bad request. Please check your API credentials format.');
      }
      
      throw new Error(`Bybit API error (${response.status}): ${errorMessage}`);
    }

    const data: BybitResponse = await response.json();
    console.log('Bybit API response data:', data);
    
    if (data.retCode !== 0) {
      const errorMessages: { [key: number]: string } = {
        10001: 'API authentication failed. Please check your API key and secret.',
        10002: 'Invalid API key format.',
        10003: 'API key expired or disabled.',
        10004: 'Invalid signature. Please check your API secret.',
        10005: 'Permission denied. Enable Position reading permissions in your API settings.',
        10006: 'Too many requests. Please wait and try again.',
        10007: 'IP not allowed. Disable IP restrictions or add your IP to whitelist.',
        33004: 'API key does not have permission to access this endpoint. Enable Position permissions.'
      };
      
      const userFriendlyError = errorMessages[data.retCode] || `Bybit API error (${data.retCode}): ${data.retMsg}`;
      throw new Error(userFriendlyError);
    }

    const result: { [key: string]: { price: number; change24h: number; entryPrice: number; amount: number; pnl: number; takeProfit?: number; stopLoss?: number; side: string } } = {};
    
    if (data.result && data.result.list) {
      console.log(`Found ${data.result.list.length} positions from Bybit`);
      
      data.result.list.forEach((position) => {
        if (parseFloat(position.size) > 0) {
          const symbol = position.symbol.replace('USDT', '');
          
          result[symbol] = {
            price: parseFloat(position.markPrice),
            change24h: 0,
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

    console.log('Processed Bybit positions:', result);
    return result;
  } catch (error) {
    console.error('Error fetching Bybit positions:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Unknown error occurred while connecting to Bybit');
  }
};

export const testBybitConnection = async (apiKey: string, apiSecret: string = ''): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log('Testing Bybit connection...');
    await fetchBybitPositions(apiKey, apiSecret);
    console.log('Bybit connection test successful');
    return { success: true };
  } catch (error) {
    console.error('Bybit connection test failed:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
};
