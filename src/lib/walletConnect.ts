
import { createWeb3Modal } from '@web3modal/wagmi/react'
import { defaultWagmiConfig } from '@web3modal/wagmi/react/config'
import { mainnet, polygon, bsc } from 'wagmi/chains'

// Your WalletConnect Project ID
const projectId = '5727e933b117fb2899f78b5e7221b2f2'

// Define metadata
const metadata = {
  name: 'Portfolio Tracker',
  description: 'Track your crypto portfolio across multiple wallets',
  url: typeof window !== 'undefined' ? window.location.origin : '',
  icons: ['https://avatars.githubusercontent.com/u/37784886']
}

// Define chains
const chains = [mainnet, polygon, bsc] as const

// Create wagmiConfig
export const config = defaultWagmiConfig({
  chains,
  projectId,
  metadata,
  enableWalletConnect: true,
  enableInjected: true,
  enableEIP6963: true,
  enableCoinbase: true
})

// Create modal
createWeb3Modal({
  wagmiConfig: config,
  projectId,
  enableAnalytics: false
})
