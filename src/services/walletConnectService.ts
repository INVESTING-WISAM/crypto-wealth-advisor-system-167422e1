
import { createWeb3Modal, defaultWagmiConfig } from '@walletconnect/modal-react';
import { mainnet, bsc } from 'viem/chains';
import { reconnect, http } from 'wagmi';

// Your WalletConnect project ID
const PROJECT_ID = '5727e933b117fb2899f78b5e7221b2f2';

// Define the chains you want to support
const chains = [mainnet, bsc] as const;

// Configure the modal
const metadata = {
  name: 'Portfolio Tracker',
  description: 'Track your crypto portfolio across multiple wallets',
  url: window.location.origin,
  icons: [`${window.location.origin}/favicon.ico`]
};

const config = defaultWagmiConfig({
  chains,
  projectId: PROJECT_ID,
  metadata,
  transports: {
    [mainnet.id]: http(),
    [bsc.id]: http()
  }
});

// Create the modal instance
let web3Modal: any = null;

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
        address: result.address || 'Connected',
        chainId: result.chainId || 1
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
