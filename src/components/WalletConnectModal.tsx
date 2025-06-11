
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { QrCode, Smartphone, Wallet, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { useWeb3Modal } from '@web3modal/wagmi/react'
import { useAccount, useDisconnect } from 'wagmi'

interface WalletConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: (address: string, walletType: string) => void;
  category: 'cold' | 'hot' | 'trading';
}

const WalletConnectModal = ({ isOpen, onClose, onConnect, category }: WalletConnectModalProps) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const { open } = useWeb3Modal()
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()

  const handleConnectWallet = async () => {
    setIsConnecting(true);
    
    try {
      await open();
      
      // Check if connected after modal closes
      if (isConnected && address) {
        onConnect(address, 'WalletConnect');
        toast.success('Wallet connected successfully!');
        onClose();
      }
    } catch (error) {
      console.error('Connection error:', error);
      toast.error('Failed to connect wallet. Please try again.');
    } finally {
      setIsConnecting(false);
    }
  };

  const walletOptions = [
    {
      id: 'walletconnect',
      name: 'Open WalletConnect Modal',
      icon: '🔗',
      description: 'Connect any wallet via QR code',
      supported: true
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Wallet className="w-5 h-5" />
            <span>Connect {category.charAt(0).toUpperCase() + category.slice(1)} Wallet</span>
          </DialogTitle>
          <DialogDescription>
            Use WalletConnect v2 to connect your wallet securely
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* WalletConnect Instructions */}
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="pt-4">
              <div className="flex items-start space-x-2">
                <QrCode className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-semibold mb-1">How to Connect:</p>
                  <ol className="list-decimal list-inside space-y-1 text-xs">
                    <li>Click "Connect Wallet" below</li>
                    <li>Choose your wallet from the modal</li>
                    <li>Scan QR code or use deep link</li>
                    <li>Approve the connection in your wallet</li>
                  </ol>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Current Connection Status */}
          {isConnected && address && (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="pt-4">
                <div className="text-sm text-green-800">
                  <p className="font-semibold">Currently Connected:</p>
                  <p className="text-xs break-all">{address}</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => disconnect()}
                    className="mt-2"
                  >
                    Disconnect
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Wallet Connect Button */}
          <div className="grid grid-cols-1 gap-2">
            <Card 
              className="cursor-pointer hover:shadow-md transition-all hover:border-blue-300"
              onClick={handleConnectWallet}
            >
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">🔗</div>
                    <div>
                      <h3 className="font-semibold text-sm">Connect Wallet</h3>
                      <p className="text-xs text-gray-600">Via WalletConnect v2</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <ExternalLink className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Mobile Instructions */}
          <Card className="border-green-200 bg-green-50">
            <CardContent className="pt-4">
              <div className="flex items-start space-x-2">
                <Smartphone className="w-5 h-5 text-green-600 mt-0.5" />
                <div className="text-sm text-green-800">
                  <p className="font-semibold mb-1">Supported Wallets:</p>
                  <p className="text-xs">
                    MetaMask, Trust Wallet, Rainbow, Coinbase Wallet, Ledger Live, and 300+ other wallets
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Loading State */}
          {isConnecting && (
            <div className="text-center py-4">
              <div className="animate-spin inline-block w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full"></div>
              <p className="text-sm text-gray-600 mt-2">Opening wallet connection...</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WalletConnectModal;
