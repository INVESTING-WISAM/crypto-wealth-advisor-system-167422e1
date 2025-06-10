
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wallet, Eye, Shield, TrendingUp, QrCode } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import WalletConnectModal from "./WalletConnectModal";

interface ConnectedWallet {
  id: string;
  type: 'metamask' | 'trust' | 'ledger' | 'manual' | 'binance-wallet' | string;
  category: 'cold' | 'hot' | 'trading';
  name: string;
  address: string;
  balance?: number;
  status: 'connected' | 'disconnected' | 'syncing';
  lastSync?: string;
  notes?: string;
}

const WalletConnect = ({ currentUser }: { currentUser: string }) => {
  const [connectedWallets, setConnectedWallets] = useState<ConnectedWallet[]>([]);
  const [manualWallet, setManualWallet] = useState({ 
    name: '', 
    address: '', 
    category: 'cold' as 'cold' | 'hot' | 'trading',
    notes: ''
  });

  const [isWalletConnectModalOpen, setIsWalletConnectModalOpen] = useState(false);
  const [connectingCategory, setConnectingCategory] = useState<'cold' | 'hot' | 'trading'>('cold');

  useEffect(() => {
    if (currentUser) {
      const savedWallets = localStorage.getItem(`connected_wallets_${currentUser}`);
      if (savedWallets) {
        setConnectedWallets(JSON.parse(savedWallets));
      }
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`connected_wallets_${currentUser}`, JSON.stringify(connectedWallets));
    }
  }, [connectedWallets, currentUser]);

  const connectMetaMask = async (category: 'cold' | 'hot' | 'trading') => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts.length > 0) {
          const wallet: ConnectedWallet = {
            id: Date.now().toString(),
            type: 'metamask',
            category,
            name: `MetaMask (${category.charAt(0).toUpperCase() + category.slice(1)})`,
            address: accounts[0],
            status: 'connected',
            lastSync: new Date().toISOString()
          };
          setConnectedWallets([...connectedWallets, wallet]);
          toast.success(`MetaMask ${category} wallet connected for read-only tracking!`);
        }
      } catch (error) {
        console.error('MetaMask connection error:', error);
        toast.error('Failed to connect MetaMask wallet. Please make sure MetaMask is unlocked and try again.');
      }
    } else {
      toast.error('MetaMask is not installed. Please install MetaMask extension first.');
    }
  };

  const connectTrustWallet = async (category: 'cold' | 'hot' | 'trading') => {
    try {
      if (typeof window.ethereum !== 'undefined') {
        const isTrustWallet = window.ethereum.isTrust || window.ethereum.isTrustWallet;
        
        if (!isTrustWallet) {
          toast.error('Trust Wallet not detected. Please use Trust Wallet browser or install Trust Wallet extension.');
          return;
        }

        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts.length > 0) {
          const wallet: ConnectedWallet = {
            id: Date.now().toString(),
            type: 'trust',
            category,
            name: `Trust Wallet (${category.charAt(0).toUpperCase() + category.slice(1)})`,
            address: accounts[0],
            status: 'connected',
            lastSync: new Date().toISOString()
          };
          setConnectedWallets([...connectedWallets, wallet]);
          toast.success(`Trust Wallet ${category} wallet connected for read-only tracking!`);
        }
      } else {
        toast.error('Trust Wallet not found. Please use Trust Wallet browser app or install the browser extension.');
      }
    } catch (error) {
      console.error('Trust Wallet connection error:', error);
      toast.error('Failed to connect Trust Wallet. Please make sure Trust Wallet is unlocked and try again.');
    }
  };

  const connectBinanceWallet = async (category: 'cold' | 'hot' | 'trading') => {
    try {
      if (typeof window.BinanceChain !== 'undefined') {
        const accounts = await window.BinanceChain.request({ method: 'eth_requestAccounts' });
        if (accounts.length > 0) {
          const wallet: ConnectedWallet = {
            id: Date.now().toString(),
            type: 'binance-wallet',
            category,
            name: `Binance Wallet (${category.charAt(0).toUpperCase() + category.slice(1)})`,
            address: accounts[0],
            status: 'connected',
            lastSync: new Date().toISOString()
          };
          setConnectedWallets([...connectedWallets, wallet]);
          toast.success(`Binance Wallet ${category} wallet connected for read-only tracking!`);
        }
      } else if (typeof window.ethereum !== 'undefined' && window.ethereum.isBinance) {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts.length > 0) {
          const wallet: ConnectedWallet = {
            id: Date.now().toString(),
            type: 'binance-wallet',
            category,
            name: `Binance Wallet (${category.charAt(0).toUpperCase() + category.slice(1)})`,
            address: accounts[0],
            status: 'connected',
            lastSync: new Date().toISOString()
          };
          setConnectedWallets([...connectedWallets, wallet]);
          toast.success(`Binance Wallet ${category} wallet connected for read-only tracking!`);
        }
      } else {
        toast.error('Binance Wallet not found. Please install Binance Wallet extension or use Binance Wallet browser.');
      }
    } catch (error) {
      console.error('Binance Wallet connection error:', error);
      toast.error('Failed to connect Binance Wallet. Please make sure it is unlocked and try again.');
    }
  };

  const addManualWallet = () => {
    if (!manualWallet.name || !manualWallet.address) {
      toast.error('Please fill in wallet name and address');
      return;
    }

    const wallet: ConnectedWallet = {
      id: Date.now().toString(),
      type: 'manual',
      category: manualWallet.category,
      name: manualWallet.name,
      address: manualWallet.address,
      status: 'connected',
      lastSync: new Date().toISOString(),
      notes: manualWallet.notes
    };

    setConnectedWallets([...connectedWallets, wallet]);
    setManualWallet({ name: '', address: '', category: 'cold', notes: '' });
    toast.success('Wallet added for portfolio tracking!');
  };

  const removeWallet = (id: string) => {
    setConnectedWallets(connectedWallets.filter(w => w.id !== id));
    toast.success('Wallet removed from tracking');
  };

  const syncWallet = (id: string) => {
    setConnectedWallets(connectedWallets.map(wallet => 
      wallet.id === id 
        ? { ...wallet, status: 'syncing' as const, lastSync: new Date().toISOString() }
        : wallet
    ));
    
    setTimeout(() => {
      setConnectedWallets(prev => prev.map(wallet => 
        wallet.id === id 
          ? { ...wallet, status: 'connected' as const }
          : wallet
      ));
      toast.success('Portfolio data synced successfully');
    }, 2000);
  };

  const getWalletsByCategory = (category: 'cold' | 'hot' | 'trading') => {
    return connectedWallets.filter(w => w.category === category);
  };

  const getWalletIcon = (type: string) => {
    switch (type) {
      case 'metamask': return '🦊';
      case 'trust': return '💎';
      case 'ledger': return '🔒';
      case 'binance-wallet': return '🟨';
      default: return '💼';
    }
  };

  const openWalletConnectModal = (category: 'cold' | 'hot' | 'trading') => {
    setConnectingCategory(category);
    setIsWalletConnectModalOpen(true);
  };

  const handleWalletConnectConnection = (address: string, walletType: string) => {
    const wallet: ConnectedWallet = {
      id: Date.now().toString(),
      type: walletType.toLowerCase().replace(' ', '-') as any,
      category: connectingCategory,
      name: `${walletType} (${connectingCategory.charAt(0).toUpperCase() + connectingCategory.slice(1)})`,
      address: address,
      status: 'connected',
      lastSync: new Date().toISOString()
    };
    setConnectedWallets([...connectedWallets, wallet]);
    setIsWalletConnectModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header with Read-Only Notice */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-blue-800">
            <Eye className="w-5 h-5" />
            <span>Portfolio Tracking System</span>
          </CardTitle>
          <CardDescription className="text-blue-700">
            Connect your wallets for <strong>read-only analysis</strong>. 
            This platform tracks your holdings across all accounts to organize your investments and generate reports. 
            No trades are executed through this website.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Overview Stats */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold">{getWalletsByCategory('cold').length}</div>
              <div className="text-sm text-gray-600">Cold Storage</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{getWalletsByCategory('hot').length}</div>
              <div className="text-sm text-gray-600">Hot Wallets</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{getWalletsByCategory('trading').length}</div>
              <div className="text-sm text-gray-600">Trading Accounts</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{connectedWallets.length}</div>
              <div className="text-sm text-gray-600">Total Connected</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Wallet Categories */}
      <Tabs defaultValue="cold" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="cold" className="flex items-center space-x-2">
            <Shield className="w-4 h-4" />
            <span>Cold Storage Wallets</span>
          </TabsTrigger>
          <TabsTrigger value="hot" className="flex items-center space-x-2">
            <Wallet className="w-4 h-4" />
            <span>Hot Wallets</span>
          </TabsTrigger>
          <TabsTrigger value="trading" className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4" />
            <span>Trading Accounts</span>
          </TabsTrigger>
        </TabsList>

        {/* Cold Storage Tab */}
        <TabsContent value="cold" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="w-5 h-5" />
                <span>Cold Storage Wallets</span>
              </CardTitle>
              <CardDescription>
                Connect your hardware wallets and cold storage addresses for portfolio tracking
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="border-green-200 bg-green-50">
                <QrCode className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-700">
                  <strong>Enhanced Connection:</strong> Use WalletConnect v2 for secure mobile wallet connections with QR codes and deep linking support.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="cursor-pointer hover:shadow-md transition-shadow border-blue-200" onClick={() => openWalletConnectModal('cold')}>
                  <CardContent className="pt-6 text-center">
                    <div className="text-4xl mb-2">📱</div>
                    <h3 className="font-semibold">Connect via WalletConnect</h3>
                    <p className="text-sm text-gray-600">Trust Wallet, MetaMask, Ledger & more</p>
                    <div className="mt-2">
                      <Badge variant="outline" className="text-green-600 border-green-300">QR Code Support</Badge>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => connectMetaMask('cold')}>
                  <CardContent className="pt-6 text-center">
                    <div className="text-4xl mb-2">🔒</div>
                    <h3 className="font-semibold">Direct Browser Connection</h3>
                    <p className="text-sm text-gray-600">MetaMask, Browser Wallets</p>
                    <div className="mt-2">
                      <Badge variant="outline">Direct Connection</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Connected Cold Wallets */}
              <div className="space-y-2">
                {getWalletsByCategory('cold').map((wallet) => (
                  <Card key={wallet.id}>
                    <CardContent className="pt-4">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-3">
                          <div className="text-2xl">{getWalletIcon(wallet.type)}</div>
                          <div>
                            <h3 className="font-semibold">{wallet.name}</h3>
                            <p className="text-sm text-gray-600">{wallet.address}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">Read-Only</Badge>
                          <Button variant="outline" size="sm" onClick={() => syncWallet(wallet.id)}>
                            Sync
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => removeWallet(wallet.id)}>
                            Remove
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Hot Wallets Tab */}
        <TabsContent value="hot" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Wallet className="w-5 h-5" />
                <span>Hot Wallets</span>
              </CardTitle>
              <CardDescription>
                Connect your mobile and browser wallets for daily use tracking
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="border-blue-200 bg-blue-50">
                <QrCode className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-700">
                  <strong>Mobile First:</strong> Scan QR codes with your mobile wallet app or use deep links for instant connection.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="cursor-pointer hover:shadow-md transition-shadow border-purple-200" onClick={() => openWalletConnectModal('hot')}>
                  <CardContent className="pt-6 text-center">
                    <div className="text-4xl mb-2">📱</div>
                    <h3 className="font-semibold">Mobile Wallets</h3>
                    <p className="text-sm text-gray-600">Trust, Rainbow, Coinbase & more</p>
                    <div className="mt-2">
                      <Badge variant="outline" className="text-purple-600 border-purple-300">WalletConnect v2</Badge>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => connectMetaMask('hot')}>
                  <CardContent className="pt-6 text-center">
                    <div className="text-4xl mb-2">🦊</div>
                    <h3 className="font-semibold">Browser Extensions</h3>
                    <p className="text-sm text-gray-600">MetaMask, Browser Wallets</p>
                    <div className="mt-2">
                      <Badge variant="outline">Extension</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Connected Hot Wallets */}
              <div className="space-y-2">
                {getWalletsByCategory('hot').map((wallet) => (
                  <Card key={wallet.id}>
                    <CardContent className="pt-4">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-3">
                          <div className="text-2xl">{getWalletIcon(wallet.type)}</div>
                          <div>
                            <h3 className="font-semibold">{wallet.name}</h3>
                            <p className="text-sm text-gray-600">{wallet.address}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">Read-Only</Badge>
                          <Button variant="outline" size="sm" onClick={() => syncWallet(wallet.id)}>
                            Sync
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => removeWallet(wallet.id)}>
                            Remove
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trading Accounts Tab */}
        <TabsContent value="trading" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5" />
                <span>Trading Accounts</span>
              </CardTitle>
              <CardDescription>
                Connect your trading accounts for portfolio analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <AlertDescription>
                  Trading account integrations have been simplified. Use the manual wallet addition feature below to track your trading addresses.
                </AlertDescription>
              </Alert>

              {/* Connected Trading Accounts */}
              <div className="space-y-2">
                {getWalletsByCategory('trading').map((wallet) => (
                  <Card key={wallet.id}>
                    <CardContent className="pt-4">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-3">
                          <div className="text-2xl">{getWalletIcon(wallet.type)}</div>
                          <div>
                            <h3 className="font-semibold">{wallet.name}</h3>
                            <p className="text-sm text-gray-600">{wallet.address}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">Read-Only</Badge>
                          <Button variant="outline" size="sm" onClick={() => syncWallet(wallet.id)}>
                            Sync
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => removeWallet(wallet.id)}>
                            Remove
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Manual Wallet Addition */}
      <Card>
        <CardHeader>
          <CardTitle>Add Manual Wallet Address</CardTitle>
          <CardDescription>
            Add any wallet address manually for read-only portfolio tracking
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <Label>Wallet Name</Label>
              <Input
                placeholder="My Cold Wallet"
                value={manualWallet.name}
                onChange={(e) => setManualWallet({...manualWallet, name: e.target.value})}
              />
            </div>
            <div>
              <Label>Wallet Address</Label>
              <Input
                placeholder="0x..."
                value={manualWallet.address}
                onChange={(e) => setManualWallet({...manualWallet, address: e.target.value})}
              />
            </div>
            <div>
              <Label>Category</Label>
              <select 
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={manualWallet.category}
                onChange={(e) => setManualWallet({...manualWallet, category: e.target.value as any})}
              >
                <option value="cold">Cold Storage</option>
                <option value="hot">Hot Wallet</option>
                <option value="trading">Trading</option>
              </select>
            </div>
            <div>
              <Label>Notes (Optional)</Label>
              <Input
                placeholder="Hardware wallet, etc."
                value={manualWallet.notes}
                onChange={(e) => setManualWallet({...manualWallet, notes: e.target.value})}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={addManualWallet} className="w-full">
                Add Wallet
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* WalletConnect Modal */}
      <WalletConnectModal
        isOpen={isWalletConnectModalOpen}
        onClose={() => setIsWalletConnectModalOpen(false)}
        onConnect={handleWalletConnectConnection}
        category={connectingCategory}
      />
    </div>
  );
};

export default WalletConnect;
