
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Initialize WalletConnect on app start
import { initializeWalletConnect } from './services/walletConnectService';
initializeWalletConnect();

createRoot(document.getElementById("root")!).render(<App />);
