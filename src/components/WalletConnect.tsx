
import React, { useState } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wallet, LogOut } from "lucide-react";

interface WalletConnectProps {
  currentUser: string;
}

const WalletConnect: React.FC<WalletConnectProps> = ({ currentUser }) => {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleConnect = () => {
    // Close any existing modals first
    setIsModalOpen(false);
    
    // Find MetaMask connector or use the first available
    const connector = connectors.find(c => c.name === 'MetaMask') || connectors[0];
    if (connector) {
      connect({ connector });
    }
  };

  const handleDisconnect = () => {
    setIsModalOpen(false);
    disconnect();
  };

  // Force close any open modals
  React.useEffect(() => {
    setIsModalOpen(false);
    
    // Close any web3modal that might be open
    const closeModal = () => {
      const modal = document.querySelector('w3m-modal');
      if (modal) {
        modal.remove();
      }
      
      // Also try to close any backdrop/overlay
      const overlays = document.querySelectorAll('[data-testid="modal-backdrop"], .w3m-backdrop, .w3m-overlay');
      overlays.forEach(overlay => overlay.remove());
    };
    
    closeModal();
  }, []);

  if (isConnected && address) {
    return (
      <div className="flex items-center space-x-2">
        <Badge variant="secondary" className="bg-green-100 text-green-800">
          {address.slice(0, 6)}...{address.slice(-4)}
        </Badge>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleDisconnect}
          className="flex items-center space-x-1"
        >
          <LogOut className="w-4 h-4" />
          <span>Disconnect</span>
        </Button>
      </div>
    );
  }

  return (
    <Button 
      onClick={handleConnect}
      variant="outline"
      className="flex items-center space-x-2"
    >
      <Wallet className="w-4 h-4" />
      <span>Connect Wallet</span>
    </Button>
  );
};

export default WalletConnect;
