
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

  const handleConnect = () => {
    const connector = connectors.find(c => c.name === 'MetaMask') || connectors[0];
    if (connector) {
      connect({ connector });
    }
  };

  const handleDisconnect = () => {
    disconnect();
  };

  if (isConnected && address) {
    return (
      <div className="flex items-center space-x-3 p-3 bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
            <Wallet className="w-4 h-4 text-green-600" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-900">Connected</span>
            <span className="text-xs text-gray-500">{address.slice(0, 6)}...{address.slice(-4)}</span>
          </div>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleDisconnect}
          className="text-gray-600 hover:text-gray-900 border-gray-200"
        >
          <LogOut className="w-4 h-4 mr-1" />
          Disconnect
        </Button>
      </div>
    );
  }

  return (
    <Button 
      onClick={handleConnect}
      className="flex items-center space-x-2 px-6 py-3 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 rounded-lg shadow-sm transition-all duration-200"
      variant="outline"
    >
      <Wallet className="w-5 h-5" />
      <span className="font-medium">Connect Wallet</span>
    </Button>
  );
};

export default WalletConnect;
