
import { Web3Modal } from '@walletconnect/modal';
import { createWeb3Modal, defaultConfig } from '@walletconnect/modal/react';

// WalletConnect project ID - you'll need to get this from https://cloud.walletconnect.com
const PROJECT_ID = 'YOUR_WALLETCONNECT_PROJECT_ID';

// Define the chains you want to support
const chains = [
  {
    chainId: 1,
    name: 'Ethereum',
    currency: 'ETH',
    explorerUrl: 'https://etherscan.io',
    rpcUrl: 'https://cloudflare-eth.com'
  },
  {
    chainId: 56,
    name: 'BNB Smart Chain',
    currency: 'BNB',
    explorerUrl: 'https://bscscan.com',
    rpcUrl: 'https://bsc-dataseed.binance.org'
  }
];

// Configure the modal
const metadata = {
  name: 'Portfolio Tracker',
  description: 'Track your crypto portfolio across multiple wallets',
  url: window.location.origin,
  icons: [`${window.location.origin}/favicon.ico`]
};

const config = defaultConfig({
  metadata,
  enableCoinbase: true,
  enableInjected: true,
  enableEIP6963: true,
  rpcUrl: 'https://cloudflare-eth.com',
  defaultChainId: 1
});

// Create the modal instance
let web3Modal: Web3Modal | null = null;

export const initializeWalletConnect = () => {
  if (!web3Modal) {
    web3Modal = createWeb3Modal({
      wagmiConfig: config,
      projectId: PROJECT_ID,
      chains,
      featuredWalletIds: [
        '4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0', // Trust Wallet
        'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96', // MetaMask
        '1ae92b26df02f0abca6304df07debccd18262fdf5fe82daa81593582dac9a369', // Rainbow
        '19177a98252e07ddfc9af2083ba8e07ef627cb6103467ffebb3f8f4205fd7927'  // Ledger Live
      ]
    });
  }
  return web3Modal;
};

export const connectWallet = async (walletType?: string) => {
  try {
    if (!web3Modal) {
      initializeWalletConnect();
    }

    const result = await web3Modal?.open();
    
    if (result) {
      return {
        success: true,
        address: result.address,
        chainId: result.chainId
      };
    }
    
    throw new Error('Connection cancelled by user');
  } catch (error) {
    console.error('WalletConnect error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to connect wallet'
    };
  }
};

export const disconnectWallet = async () => {
  try {
    await web3Modal?.disconnect();
    return { success: true };
  } catch (error) {
    console.error('Disconnect error:', error);
    return { success: false, error: 'Failed to disconnect wallet' };
  }
};

export const getWalletConnectModal = () => web3Modal;
