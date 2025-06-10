
declare global {
  interface Window {
    ethereum?: any;
    BinanceChain?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
    };
    trustwallet?: any;
  }
}

export {};
