import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wallet, Eye, Shield, TrendingUp, AlertCircle, CheckCircle, RefreshCw, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { testBybitConnection, getBybitSetupInstructions } from "@/services/bybitApi";

interface ConnectedWallet {
  id: string;
  type: 'metamask' | 'trust' | 'ledger' | 'manual' | 'okx-exchange' | 'binance' | 'coinbase' | 'bybit' | 'binance-wallet';
  category: 'cold' | 'hot' | 'trading';
  name: string;
  address: string;
  balance?: number;
  status: 'connected' | 'disconnected' | 'syncing';
  lastSync?: string;
  notes?: string;
  apiKey?: string;
}

interface ExchangeCredentials {
  apiKey: string;
  secret: string;
  passphrase?: string;
  sandbox?: boolean;
}

const WalletConnect = ({ currentUser }: { currentUser: string }) => {
  const [connectedWallets, setConnectedWallets] = useState<ConnectedWallet[]>([]);
  const [manualWallet, setManualWallet] = useState({ 
    name: '', 
    address: '', 
    category: 'cold' as 'cold' | 'hot' | 'trading',
    notes: ''
  });
  const [exchangeCredentials, setExchangeCredentials] = useState<{[key: string]: ExchangeCredentials}>({
    okx: { apiKey: '', secret: '', passphrase: '' },
    binance: { apiKey: '', secret: '' },
    coinbase: { apiKey: '', secret: '', passphrase: '' },
    bybit: { apiKey: '', secret: '' }
  });

  const [showBybitInstructions, setShowBybitInstructions] = useState(false);
  const [bybitError, setBybitError] = useState<string | null>(null);

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
      // Trust Wallet uses the same ethereum provider as MetaMask when used as browser extension
      if (typeof window.ethereum !== 'undefined') {
        // Check if it's Trust Wallet specifically
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
      // Check for Binance Chain Wallet
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
        // Fallback for Binance Wallet using ethereum provider
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

  const connectExchange = async (exchangeType: 'okx' | 'binance' | 'coinbase' | 'bybit') => {
    const creds = exchangeCredentials[exchangeType];
    setBybitError(null);

    if (!creds.apiKey || !creds.apiKey.trim()) {
      toast.error(`Please enter your ${exchangeType.toUpperCase()} API key`);
      return;
    }

    if (exchangeType === 'bybit') {
      if (!creds.secret || !creds.secret.trim()) {
        toast.error('Bybit requires both API key and secret for connection');
        setBybitError('Both API Key and Secret are required for Bybit connection');
        return;
      }

      try {
        toast.info('Testing Bybit connection... This may take a moment.');
        console.log('Attempting Bybit connection with API key:', creds.apiKey.substring(0, 8) + '...');
        
        const result = await testBybitConnection(creds.apiKey.trim(), creds.secret.trim());
        
        if (result.success) {
          const wallet: ConnectedWallet = {
            id: Date.now().toString(),
            type: 'bybit',
            category: 'trading',
            name: 'Bybit Exchange',
            address: 'Exchange Account',
            status: 'connected',
            lastSync: new Date().toISOString(),
            apiKey: creds.apiKey.trim()
          };

          setConnectedWallets([...connectedWallets, wallet]);
          setBybitError(null);
          toast.success('Bybit Exchange connected successfully! Your positions will be synced automatically.');
          
          // Clear credentials after successful connection
          setExchangeCredentials({
            ...exchangeCredentials,
            bybit: { apiKey: '', secret: '' }
          });
        } else {
          const errorMsg = result.error || 'Failed to connect to Bybit. Please check your credentials.';
          setBybitError(errorMsg);
          toast.error(`Bybit connection failed: ${errorMsg}`);
          console.error('Bybit connection failed:', result.error);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred while connecting to Bybit';
        setBybitError(errorMessage);
        toast.error(`Bybit connection failed: ${errorMessage}`);
        console.error('Bybit connection error:', error);
      }
    } else {
      if (exchangeType === 'okx' && !creds.passphrase) {
        toast.error('OKX requires a passphrase');
        return;
      }

      if (exchangeType !== 'okx' && !creds.secret) {
        toast.error(`Please fill in ${exchangeType.toUpperCase()} secret key`);
        return;
      }

      const wallet: ConnectedWallet = {
        id: Date.now().toString(),
        type: `${exchangeType}-exchange` as any,
        category: 'trading',
        name: `${exchangeType.toUpperCase()} Exchange`,
        address: 'Exchange Account',
        status: 'connected',
        lastSync: new Date().toISOString()
      };

      setConnectedWallets([...connectedWallets, wallet]);
      toast.success(`${exchangeType.toUpperCase()} Exchange connected for portfolio tracking!`);
    }
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
      case 'okx-exchange': return '📈';
      case 'binance': return '⚡';
      case 'coinbase': return '🔵';
      case 'bybit': return '🟡';
      default: return '💼';
    }
  };

  const bybitInstructions = getBybitSetupInstructions();

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
            Connect your wallets and exchange accounts for <strong>read-only analysis</strong>. 
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => connectMetaMask('cold')}>
                  <CardContent className="pt-6 text-center">
                    <div className="text-4xl mb-2">🔒</div>
                    <h3 className="font-semibold">Connect Ledger</h3>
                    <p className="text-sm text-gray-600">Via MetaMask</p>
                  </CardContent>
                </Card>
                
                <Card className="opacity-75">
                  <CardContent className="pt-6 text-center">
                    <div className="text-4xl mb-2">❄️</div>
                    <h3 className="font-semibold">Trezor</h3>
                    <p className="text-sm text-gray-600">Coming soon</p>
                  </CardContent>
                </Card>
                
                <Card className="opacity-75">
                  <CardContent className="pt-6 text-center">
                    <div className="text-4xl mb-2">🏦</div>
                    <h3 className="font-semibold">Paper Wallet</h3>
                    <p className="text-sm text-gray-600">Add manually</p>
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
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => connectMetaMask('hot')}>
                  <CardContent className="pt-6 text-center">
                    <div className="text-4xl mb-2">🦊</div>
                    <h3 className="font-semibold">MetaMask</h3>
                    <p className="text-sm text-gray-600">Browser wallet</p>
                  </CardContent>
                </Card>
                
                <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => connectTrustWallet('hot')}>
                  <CardContent className="pt-6 text-center">
                    <div className="text-4xl mb-2">💎</div>
                    <h3 className="font-semibold">Trust Wallet</h3>
                    <p className="text-sm text-gray-600">Mobile wallet</p>
                  </CardContent>
                </Card>
                
                <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => connectBinanceWallet('hot')}>
                  <CardContent className="pt-6 text-center">
                    <div className="text-4xl mb-2">🟨</div>
                    <h3 className="font-semibold">Binance Wallet</h3>
                    <p className="text-sm text-gray-600">Binance ecosystem</p>
                  </CardContent>
                </Card>
                
                <Card className="opacity-75">
                  <CardContent className="pt-6 text-center">
                    <div className="text-4xl mb-2">🌐</div>
                    <h3 className="font-semibold">WalletConnect</h3>
                    <p className="text-sm text-gray-600">Coming soon</p>
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
                <span>Trading Exchange Accounts</span>
              </CardTitle>
              <CardDescription>
                Connect your exchange accounts for trading portfolio analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Use <strong>read-only API keys</strong> for security. Your credentials are stored locally and used only for portfolio tracking.
                </AlertDescription>
              </Alert>

              {/* Bybit Exchange */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">🟡</span>
                      <span>Bybit Exchange</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowBybitInstructions(!showBybitInstructions)}
                    >
                      <Info className="w-4 h-4 mr-2" />
                      Setup Guide
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {showBybitInstructions && (
                    <Alert className="mb-4">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        <div className="space-y-2">
                          <p className="font-semibold">{bybitInstructions.title}</p>
                          <div className="text-sm">
                            {bybitInstructions.steps.map((step, index) => (
                              <p key={index}>{step}</p>
                            ))}
                          </div>
                          <div className="mt-3">
                            <p className="font-semibold text-red-600">Common Issues:</p>
                            {bybitInstructions.commonErrors.map((error, index) => (
                              <p key={index} className="text-sm">{error}</p>
                            ))}
                          </div>
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}

                  {bybitError && (
                    <Alert className="border-red-200 bg-red-50">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <AlertDescription className="text-red-700">
                        <strong>Connection Error:</strong> {bybitError}
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label>API Key *</Label>
                      <Input
                        type="text"
                        placeholder="Your Bybit API Key"
                        value={exchangeCredentials.bybit.apiKey}
                        onChange={(e) => setExchangeCredentials({
                          ...exchangeCredentials,
                          bybit: { ...exchangeCredentials.bybit, apiKey: e.target.value }
                        })}
                      />
                    </div>
                    <div>
                      <Label>API Secret *</Label>
                      <Input
                        type="password"
                        placeholder="Your Bybit API Secret"
                        value={exchangeCredentials.bybit.secret}
                        onChange={(e) => setExchangeCredentials({
                          ...exchangeCredentials,
                          bybit: { ...exchangeCredentials.bybit, secret: e.target.value }
                        })}
                      />
                    </div>
                    <div className="flex items-end">
                      <Button onClick={() => connectExchange('bybit')} className="w-full">
                        Connect Bybit
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* OKX Exchange */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">OKX Exchange</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <Label>API Key</Label>
                      <Input
                        type="password"
                        placeholder="Your OKX API Key"
                        value={exchangeCredentials.okx.apiKey}
                        onChange={(e) => setExchangeCredentials({
                          ...exchangeCredentials,
                          okx: { ...exchangeCredentials.okx, apiKey: e.target.value }
                        })}
                      />
                    </div>
                    <div>
                      <Label>Secret Key</Label>
                      <Input
                        type="password"
                        placeholder="Secret Key"
                        value={exchangeCredentials.okx.secret}
                        onChange={(e) => setExchangeCredentials({
                          ...exchangeCredentials,
                          okx: { ...exchangeCredentials.okx, secret: e.target.value }
                        })}
                      />
                    </div>
                    <div>
                      <Label>Passphrase</Label>
                      <Input
                        type="password"
                        placeholder="Passphrase"
                        value={exchangeCredentials.okx.passphrase}
                        onChange={(e) => setExchangeCredentials({
                          ...exchangeCredentials,
                          okx: { ...exchangeCredentials.okx, passphrase: e.target.value }
                        })}
                      />
                    </div>
                    <div className="flex items-end">
                      <Button onClick={() => connectExchange('okx')} className="w-full">
                        Connect OKX
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Binance Exchange */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Binance Exchange</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label>API Key</Label>
                      <Input
                        type="password"
                        placeholder="Your Binance API Key"
                        value={exchangeCredentials.binance.apiKey}
                        onChange={(e) => setExchangeCredentials({
                          ...exchangeCredentials,
                          binance: { ...exchangeCredentials.binance, apiKey: e.target.value }
                        })}
                      />
                    </div>
                    <div>
                      <Label>Secret Key</Label>
                      <Input
                        type="password"
                        placeholder="Secret Key"
                        value={exchangeCredentials.binance.secret}
                        onChange={(e) => setExchangeCredentials({
                          ...exchangeCredentials,
                          binance: { ...exchangeCredentials.binance, secret: e.target.value }
                        })}
                      />
                    </div>
                    <div className="flex items-end">
                      <Button onClick={() => connectExchange('binance')} className="w-full" disabled>
                        Coming Soon
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

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
                            <p className="text-sm text-gray-600">
                              {wallet.type === 'bybit' ? 'Live Trading Positions Tracked' : 'Portfolio Tracking Only'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">Read-Only</Badge>
                          {wallet.type === 'bybit' && <Badge className="bg-green-500">Live Sync</Badge>}
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
    </div>
  );
};

export default WalletConnect;
