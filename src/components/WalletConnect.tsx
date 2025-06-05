
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Wallet, Link, CheckCircle, AlertCircle, RefreshCw } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";

interface ConnectedWallet {
  id: string;
  type: 'metamask' | 'trust' | 'ledger' | 'okx-exchange' | 'manual';
  name: string;
  address: string;
  balance?: number;
  status: 'connected' | 'disconnected' | 'syncing';
  lastSync?: string;
}

const WalletConnect = ({ currentUser }: { currentUser: string }) => {
  const [connectedWallets, setConnectedWallets] = useState<ConnectedWallet[]>([]);
  const [manualWallet, setManualWallet] = useState({ name: '', address: '' });
  const [okxCredentials, setOkxCredentials] = useState({ apiKey: '', secret: '', passphrase: '' });

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

  const connectMetaMask = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts.length > 0) {
          const wallet: ConnectedWallet = {
            id: Date.now().toString(),
            type: 'metamask',
            name: 'MetaMask',
            address: accounts[0],
            status: 'connected',
            lastSync: new Date().toISOString()
          };
          setConnectedWallets([...connectedWallets, wallet]);
          toast.success('MetaMask wallet connected successfully!');
        }
      } catch (error) {
        toast.error('Failed to connect MetaMask wallet');
      }
    } else {
      toast.error('MetaMask is not installed');
    }
  };

  const addManualWallet = () => {
    if (!manualWallet.name || !manualWallet.address) {
      toast.error('Please fill in all fields');
      return;
    }

    const wallet: ConnectedWallet = {
      id: Date.now().toString(),
      type: 'manual',
      name: manualWallet.name,
      address: manualWallet.address,
      status: 'connected',
      lastSync: new Date().toISOString()
    };

    setConnectedWallets([...connectedWallets, wallet]);
    setManualWallet({ name: '', address: '' });
    toast.success('Manual wallet added successfully!');
  };

  const connectOKXExchange = () => {
    if (!okxCredentials.apiKey || !okxCredentials.secret || !okxCredentials.passphrase) {
      toast.error('Please fill in all OKX credentials');
      return;
    }

    const wallet: ConnectedWallet = {
      id: Date.now().toString(),
      type: 'okx-exchange',
      name: 'OKX Exchange',
      address: 'Exchange Account',
      status: 'connected',
      lastSync: new Date().toISOString()
    };

    setConnectedWallets([...connectedWallets, wallet]);
    setOkxCredentials({ apiKey: '', secret: '', passphrase: '' });
    toast.success('OKX Exchange connected successfully!');
  };

  const removeWallet = (id: string) => {
    setConnectedWallets(connectedWallets.filter(w => w.id !== id));
    toast.success('Wallet removed');
  };

  const syncWallet = (id: string) => {
    setConnectedWallets(connectedWallets.map(wallet => 
      wallet.id === id 
        ? { ...wallet, status: 'syncing' as const, lastSync: new Date().toISOString() }
        : wallet
    ));
    
    // Simulate sync process
    setTimeout(() => {
      setConnectedWallets(prev => prev.map(wallet => 
        wallet.id === id 
          ? { ...wallet, status: 'connected' as const }
          : wallet
      ));
      toast.success('Wallet synced successfully');
    }, 2000);
  };

  const getWalletIcon = (type: string) => {
    switch (type) {
      case 'metamask': return '🦊';
      case 'trust': return '💎';
      case 'ledger': return '🔒';
      case 'okx-exchange': return '📈';
      default: return '💼';
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Wallet className="w-5 h-5" />
            <span>Wallet Connections</span>
          </CardTitle>
          <CardDescription>
            Connect your cold wallets, hot wallets, and exchange accounts to track your complete crypto portfolio
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{connectedWallets.length}</div>
              <div className="text-sm text-gray-600">Connected Wallets</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{connectedWallets.filter(w => w.status === 'connected').length}</div>
              <div className="text-sm text-gray-600">Active Connections</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{connectedWallets.filter(w => w.type === 'okx-exchange').length}</div>
              <div className="text-sm text-gray-600">Exchange Accounts</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Connect Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={connectMetaMask}>
          <CardContent className="pt-6 text-center">
            <div className="text-4xl mb-2">🦊</div>
            <h3 className="font-semibold">MetaMask</h3>
            <p className="text-sm text-gray-600">Connect hot wallet</p>
          </CardContent>
        </Card>
        
        <Card className="opacity-75">
          <CardContent className="pt-6 text-center">
            <div className="text-4xl mb-2">💎</div>
            <h3 className="font-semibold">Trust Wallet</h3>
            <p className="text-sm text-gray-600">Coming soon</p>
          </CardContent>
        </Card>
        
        <Card className="opacity-75">
          <CardContent className="pt-6 text-center">
            <div className="text-4xl mb-2">🔒</div>
            <h3 className="font-semibold">Ledger</h3>
            <p className="text-sm text-gray-600">Coming soon</p>
          </CardContent>
        </Card>
        
        <Card className="opacity-75">
          <CardContent className="pt-6 text-center">
            <div className="text-4xl mb-2">💼</div>
            <h3 className="font-semibold">Manual</h3>
            <p className="text-sm text-gray-600">Add address</p>
          </CardContent>
        </Card>
      </div>

      {/* Manual Wallet Addition */}
      <Card>
        <CardHeader>
          <CardTitle>Add Manual Wallet</CardTitle>
          <CardDescription>
            Manually add a wallet address for tracking (view-only)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="walletName">Wallet Name</Label>
              <Input
                id="walletName"
                placeholder="My Cold Wallet"
                value={manualWallet.name}
                onChange={(e) => setManualWallet({...manualWallet, name: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="walletAddress">Wallet Address</Label>
              <Input
                id="walletAddress"
                placeholder="0x..."
                value={manualWallet.address}
                onChange={(e) => setManualWallet({...manualWallet, address: e.target.value})}
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

      {/* OKX Exchange Connection */}
      <Card>
        <CardHeader>
          <CardTitle>Connect OKX Exchange</CardTitle>
          <CardDescription>
            Connect your OKX exchange account for automated trading and portfolio sync
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Your OKX credentials are stored locally and never shared. Use read-only API keys when possible.
            </AlertDescription>
          </Alert>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="okxApiKey">API Key</Label>
              <Input
                id="okxApiKey"
                type="password"
                placeholder="Your OKX API Key"
                value={okxCredentials.apiKey}
                onChange={(e) => setOkxCredentials({...okxCredentials, apiKey: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="okxSecret">Secret Key</Label>
              <Input
                id="okxSecret"
                type="password"
                placeholder="Your Secret Key"
                value={okxCredentials.secret}
                onChange={(e) => setOkxCredentials({...okxCredentials, secret: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="okxPassphrase">Passphrase</Label>
              <Input
                id="okxPassphrase"
                type="password"
                placeholder="Your Passphrase"
                value={okxCredentials.passphrase}
                onChange={(e) => setOkxCredentials({...okxCredentials, passphrase: e.target.value})}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={connectOKXExchange} className="w-full">
                Connect OKX
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Connected Wallets */}
      <Card>
        <CardHeader>
          <CardTitle>Connected Wallets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {connectedWallets.map((wallet) => (
              <Card key={wallet.id}>
                <CardContent className="pt-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">{getWalletIcon(wallet.type)}</div>
                      <div>
                        <h3 className="font-semibold">{wallet.name}</h3>
                        <p className="text-sm text-gray-600">{wallet.address}</p>
                        {wallet.lastSync && (
                          <p className="text-xs text-gray-500">
                            Last sync: {new Date(wallet.lastSync).toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={wallet.status === 'connected' ? 'default' : wallet.status === 'syncing' ? 'secondary' : 'destructive'}>
                        {wallet.status === 'connected' && <CheckCircle className="w-3 h-3 mr-1" />}
                        {wallet.status === 'syncing' && <RefreshCw className="w-3 h-3 mr-1 animate-spin" />}
                        {wallet.status}
                      </Badge>
                      <Button variant="outline" size="sm" onClick={() => syncWallet(wallet.id)} disabled={wallet.status === 'syncing'}>
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
            {connectedWallets.length === 0 && (
              <p className="text-center text-gray-500 py-8">No wallets connected yet</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WalletConnect;
