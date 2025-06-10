declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      isTrust?: boolean;
      isTrustWallet?: boolean;
      isBinance?: boolean;
      isRainbow?: boolean;
      request?: (args: { method: string; params?: any[] }) => Promise<any>;
    };
    BinanceChain?: {
      request?: (args: { method: string; params?: any[] }) => Promise<any>;
    };
    trustWallet?: any;
    // WalletConnect related
    WalletConnect?: any;
    walletconnect?: any;
  }
}

export {};
