
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { QrCode, Smartphone, Wallet, ExternalLink, Copy, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { connectWallet, initializeWalletConnect } from "@/services/walletConnectService";

interface WalletConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: (address: string, walletType: string) => void;
  category: 'cold' | 'hot' | 'trading';
}

const WalletConnectModal = ({ isOpen, onClose, onConnect, category }: WalletConnectModalProps) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionUri, setConnectionUri] = useState<string>('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      initializeWalletConnect();
    }
  }, [isOpen]);

  const handleConnect = async (walletType: string) => {
    setIsConnecting(true);
    
    try {
      const result = await connectWallet(walletType);
      
      if (result.success && result.address) {
        onConnect(result.address, walletType);
        toast.success(`${walletType} connected successfully!`);
        onClose();
      } else {
        toast.error(result.error || 'Failed to connect wallet');
      }
    } catch (error) {
      console.error('Connection error:', error);
      toast.error('Failed to connect wallet. Please try again.');
    } finally {
      setIsConnecting(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success('Copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const walletOptions = [
    {
      id: 'trust',
      name: 'Trust Wallet',
      icon: '💎',
      description: 'Mobile crypto wallet',
      deepLink: 'trust://wc',
      supported: true
    },
    {
      id: 'metamask',
      name: 'MetaMask',
      icon: '🦊',
      description: 'Browser extension wallet',
      deepLink: 'metamask://wc',
      supported: true
    },
    {
      id: 'rainbow',
      name: 'Rainbow Wallet',
      icon: '🌈',
      description: 'iOS & Android wallet',
      deepLink: 'rainbow://wc',
      supported: true
    },
    {
      id: 'ledger',
      name: 'Ledger Live',
      icon: '🔒',
      description: 'Hardware wallet via Ledger Live',
      deepLink: 'ledgerlive://wc',
      supported: true
    },
    {
      id: 'coinbase',
      name: 'Coinbase Wallet',
      icon: '🔵',
      description: 'Coinbase mobile wallet',
      deepLink: 'cbwallet://wc',
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
            Choose your preferred wallet to connect via WalletConnect
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
                    <li>Click on your preferred wallet below</li>
                    <li>A QR code will appear or your wallet app will open</li>
                    <li>Scan the QR code with your mobile wallet</li>
                    <li>Approve the connection in your wallet</li>
                  </ol>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Wallet Options */}
          <div className="grid grid-cols-1 gap-2">
            {walletOptions.map((wallet) => (
              <Card 
                key={wallet.id}
                className={`cursor-pointer hover:shadow-md transition-all ${
                  !wallet.supported ? 'opacity-50' : 'hover:border-blue-300'
                }`}
                onClick={() => wallet.supported && handleConnect(wallet.name)}
              >
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">{wallet.icon}</div>
                      <div>
                        <h3 className="font-semibold text-sm">{wallet.name}</h3>
                        <p className="text-xs text-gray-600">{wallet.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {wallet.supported ? (
                        <ExternalLink className="w-4 h-4 text-gray-400" />
                      ) : (
                        <span className="text-xs text-gray-500">Soon</span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Mobile Instructions */}
          <Card className="border-green-200 bg-green-50">
            <CardContent className="pt-4">
              <div className="flex items-start space-x-2">
                <Smartphone className="w-5 h-5 text-green-600 mt-0.5" />
                <div className="text-sm text-green-800">
                  <p className="font-semibold mb-1">Mobile Users:</p>
                  <p className="text-xs">
                    Make sure your wallet app is installed and updated to the latest version for the best experience.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Loading State */}
          {isConnecting && (
            <div className="text-center py-4">
              <div className="animate-spin inline-block w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full"></div>
              <p className="text-sm text-gray-600 mt-2">Connecting to wallet...</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WalletConnectModal;
