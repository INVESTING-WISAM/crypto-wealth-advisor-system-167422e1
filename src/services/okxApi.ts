
const OKX_API_BASE = 'https://www.okx.com';
const API_KEY = 'fc2a0b85-961f-4408-996f-decf6f5660b2';

interface OKXTicker {
  instId: string;
  last: string;
  lastSz: string;
  askPx: string;
  askSz: string;
  bidPx: string;
  bidSz: string;
  open24h: string;
  high24h: string;
  low24h: string;
  volCcy24h: string;
  vol24h: string;
  sodUtc0: string;
  sodUtc8: string;
  ts: string;
}

interface OKXResponse {
  code: string;
  msg: string;
  data: OKXTicker[];
}

const CRYPTO_SYMBOLS_MAP: { [key: string]: string } = {
  'BTC': 'BTC-USDT',
  'ETH': 'ETH-USDT',
  'SOL': 'SOL-USDT',
  'CORE': 'CORE-USDT',
  'ADA': 'ADA-USDT',
  'DOT': 'DOT-USDT',
  'LINK': 'LINK-USDT',
  'UNI': 'UNI-USDT',
  'AVAX': 'AVAX-USDT',
  'MATIC': 'MATIC-USDT',
  'ATOM': 'ATOM-USDT',
  'LTC': 'LTC-USDT'
};

export const fetchOKXTickers = async (symbols: string[]): Promise<{ [key: string]: { price: number; change24h: number } }> => {
  try {
    const okxSymbols = symbols.map(symbol => CRYPTO_SYMBOLS_MAP[symbol]).filter(Boolean);
    
    if (okxSymbols.length === 0) {
      throw new Error('No valid symbols found');
    }

    const symbolsParam = okxSymbols.join(',');
    const response = await fetch(`${OKX_API_BASE}/api/v5/market/tickers?instType=SPOT&instId=${symbolsParam}`, {
      method: 'GET',
      headers: {
        'OK-ACCESS-KEY': API_KEY,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`OKX API error: ${response.status}`);
    }

    const data: OKXResponse = await response.json();
    
    if (data.code !== '0') {
      throw new Error(`OKX API error: ${data.msg}`);
    }

    const result: { [key: string]: { price: number; change24h: number } } = {};
    
    data.data.forEach((ticker) => {
      const symbol = Object.keys(CRYPTO_SYMBOLS_MAP).find(
        key => CRYPTO_SYMBOLS_MAP[key] === ticker.instId
      );
      
      if (symbol) {
        const currentPrice = parseFloat(ticker.last);
        const openPrice = parseFloat(ticker.open24h);
        const change24h = ((currentPrice - openPrice) / openPrice) * 100;
        
        result[symbol] = {
          price: currentPrice,
          change24h: change24h
        };
      }
    });

    return result;
  } catch (error) {
    console.error('Error fetching OKX data:', error);
    throw error;
  }
};

export const fetchSingleOKXPrice = async (symbol: string): Promise<number> => {
  try {
    const data = await fetchOKXTickers([symbol]);
    return data[symbol]?.price || 0;
  } catch (error) {
    console.error(`Error fetching price for ${symbol}:`, error);
    return 0;
  }
};
