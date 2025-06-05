import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, TrendingUp, Target, Wallet, RefreshCw, Wifi, WifiOff } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { useLivePrices } from "@/hooks/useLivePrices";

interface TradingPosition {
  id: string;
  token: string;
  entryPrice: number;
  amount: number;
  takeProfit: number;
  stopLoss: number;
  currentPrice: number;
  allocationType: 'btc' | 'eth' | 'sol' | 'fast-recovery' | 'other';
  status: 'active' | 'tp-hit' | 'sl-hit';
  dateOpened: string;
}

interface InvestmentPosition {
  id: string;
  token: string;
  amount: number;
  entryPrice: number;
  currentPrice: number;
  investmentTP: number;
  status: 'active' | 'tp-hit';
  dateCreated: string;
  originTradingId: string;
}

const TradingWallet = ({ portfolioData, currentUser }: { portfolioData: any, currentUser: string }) => {
  const [tradingPositions, setTradingPositions] = useState<TradingPosition[]>([]);
  const [investmentPositions, setInvestmentPositions] = useState<InvestmentPosition[]>([]);
  const [walletBalance, setWalletBalance] = useState<number>(10000); // Starting balance
  const [newPosition, setNewPosition] = useState({
    token: '',
    entryPrice: '',
    takeProfit: '',
    stopLoss: '',
    allocationType: 'other' as 'btc' | 'eth' | 'sol' | 'fast-recovery' | 'other'
  });

  // Get all unique tokens from positions for price tracking
  const allTokens = Array.from(new Set([
    ...tradingPositions.map(p => p.token),
    ...investmentPositions.map(p => p.token),
    'BTC', 'ETH', 'SOL', 'CORE' // Always include major tokens
  ]));

  const { prices, isLoading: pricesLoading, lastUpdated, error: pricesError, updatePrices } = useLivePrices(allTokens);

  const getAllocationPercentage = (type: string) => {
    switch (type) {
      case 'btc': return 20;
      case 'eth':
      case 'sol': return 10;
      case 'fast-recovery': return 8;
      default: return 5;
    }
  };

  useEffect(() => {
    if (currentUser) {
      const savedTradingPositions = localStorage.getItem(`trading_positions_${currentUser}`);
      const savedInvestmentPositions = localStorage.getItem(`investment_positions_${currentUser}`);
      const savedBalance = localStorage.getItem(`trading_balance_${currentUser}`);
      
      if (savedTradingPositions) {
        setTradingPositions(JSON.parse(savedTradingPositions));
      }
      if (savedInvestmentPositions) {
        setInvestmentPositions(JSON.parse(savedInvestmentPositions));
      }
      if (savedBalance) {
        setWalletBalance(parseFloat(savedBalance));
      }
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`trading_positions_${currentUser}`, JSON.stringify(tradingPositions));
      localStorage.setItem(`investment_positions_${currentUser}`, JSON.stringify(investmentPositions));
      localStorage.setItem(`trading_balance_${currentUser}`, walletBalance.toString());
    }
  }, [tradingPositions, investmentPositions, walletBalance, currentUser]);

  const openPosition = () => {
    if (!newPosition.token || !newPosition.entryPrice || !newPosition.takeProfit || !newPosition.stopLoss) {
      toast.error("Please fill in all fields");
      return;
    }

    const entryPrice = parseFloat(newPosition.entryPrice);
    const allocPercentage = getAllocationPercentage(newPosition.allocationType);
    const positionSize = (walletBalance * allocPercentage) / 100;
    const amount = positionSize / entryPrice;

    if (positionSize > walletBalance) {
      toast.error("Insufficient balance for this position");
      return;
    }

    const currentPrice = prices[newPosition.token.toUpperCase()]?.price || entryPrice;

    const position: TradingPosition = {
      id: Date.now().toString(),
      token: newPosition.token.toUpperCase(),
      entryPrice: entryPrice,
      amount: amount,
      takeProfit: parseFloat(newPosition.takeProfit),
      stopLoss: parseFloat(newPosition.stopLoss),
      currentPrice: currentPrice,
      allocationType: newPosition.allocationType,
      status: 'active',
      dateOpened: new Date().toISOString()
    };

    setTradingPositions([...tradingPositions, position]);
    setWalletBalance(walletBalance - positionSize);
    
    setNewPosition({
      token: '',
      entryPrice: '',
      takeProfit: '',
      stopLoss: '',
      allocationType: 'other'
    });

    toast.success(`Position opened: ${position.token} with ${allocPercentage}% allocation`);
  };

  // Update positions with live prices
  useEffect(() => {
    if (Object.keys(prices).length === 0) return;

    // Update trading positions
    setTradingPositions(prev => prev.map(pos => {
      if (pos.status !== 'active') return pos;
      
      const livePrice = prices[pos.token]?.price;
      if (!livePrice) return pos;

      const updatedPos = { ...pos, currentPrice: livePrice };

      // Check for TP or SL hit
      if (livePrice >= pos.takeProfit && pos.status === 'active') {
        updatedPos.status = 'tp-hit';
        handleTPHit(updatedPos);
        toast.success(`🎯 Take Profit hit for ${pos.token} at $${livePrice.toFixed(2)}!`);
      } else if (livePrice <= pos.stopLoss && pos.status === 'active') {
        updatedPos.status = 'sl-hit';
        handleSLHit(updatedPos);
        toast.error(`🛑 Stop Loss hit for ${pos.token} at $${livePrice.toFixed(2)}!`);
      }

      return updatedPos;
    }));

    // Update investment positions
    setInvestmentPositions(prev => prev.map(pos => {
      if (pos.status !== 'active') return pos;
      
      const livePrice = prices[pos.token]?.price;
      if (!livePrice) return pos;

      const updatedPos = { ...pos, currentPrice: livePrice };

      if (livePrice >= pos.investmentTP && pos.status === 'active') {
        updatedPos.status = 'tp-hit';
        toast.success(`🎯 Investment TP hit for ${pos.token} at $${livePrice.toFixed(2)}!`);
      }

      return updatedPos;
    }));
  }, [prices]);

  const handleTPHit = (position: TradingPosition) => {
    const totalValue = position.amount * position.takeProfit;
    const profit = totalValue - (position.amount * position.entryPrice);
    
    // 30% stays in trading wallet
    const tradingProfit = profit * 0.3;
    setWalletBalance(prev => prev + totalValue - (profit * 0.7));
    
    // 70% goes to investment wallet as tokens
    const investmentTokens = (profit * 0.7) / position.takeProfit;
    const investmentTP = position.takeProfit * 2; // 2x from TP price

    const investmentPosition: InvestmentPosition = {
      id: Date.now().toString(),
      token: position.token,
      amount: investmentTokens,
      entryPrice: position.takeProfit,
      currentPrice: position.takeProfit,
      investmentTP: investmentTP,
      status: 'active',
      dateCreated: new Date().toISOString(),
      originTradingId: position.id
    };

    setInvestmentPositions(prev => [...prev, investmentPosition]);
    toast.success(`70% of profit moved to Investment Wallet as ${position.token} tokens`);
  };

  const handleSLHit = (position: TradingPosition) => {
    const totalValue = position.amount * position.stopLoss;
    setWalletBalance(prev => prev + totalValue);
  };

  const updateInvestmentPrice = (id: string, newPrice: string) => {
    const price = parseFloat(newPrice);
    if (isNaN(price)) return;

    setInvestmentPositions(investmentPositions.map(pos => {
      if (pos.id === id && pos.status === 'active') {
        const updatedPos = { ...pos, currentPrice: price };
        
        if (price >= pos.investmentTP) {
          updatedPos.status = 'tp-hit';
          toast.success(`🎯 Investment TP hit for ${pos.token}! Time to take profits!`);
        }
        
        return updatedPos;
      }
      return pos;
    }));
  };

  const closePosition = (id: string, type: 'trading' | 'investment') => {
    if (type === 'trading') {
      const position = tradingPositions.find(p => p.id === id);
      if (position) {
        const totalValue = position.amount * position.currentPrice;
        setWalletBalance(prev => prev + totalValue);
        setTradingPositions(prev => prev.filter(p => p.id !== id));
        toast.success("Trading position closed");
      }
    } else {
      setInvestmentPositions(prev => prev.filter(p => p.id !== id));
      toast.success("Investment position closed");
    }
  };

  const calculatePnL = (position: TradingPosition) => {
    const currentValue = position.amount * position.currentPrice;
    const entryValue = position.amount * position.entryPrice;
    return currentValue - entryValue;
  };

  const calculateInvestmentPnL = (position: InvestmentPosition) => {
    const currentValue = position.amount * position.currentPrice;
    const entryValue = position.amount * position.entryPrice;
    return currentValue - entryValue;
  };

  return (
    <div className="space-y-6">
      {/* Live Price Status */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {pricesError ? (
                <WifiOff className="w-5 h-5 text-red-500" />
              ) : (
                <Wifi className="w-5 h-5 text-green-500" />
              )}
              <span className="text-sm">
                {pricesError ? 'Price feed disconnected' : 'Live prices from OKX'}
              </span>
              {lastUpdated && (
                <span className="text-xs text-gray-500">
                  Last updated: {lastUpdated.toLocaleTimeString()}
                </span>
              )}
            </div>
            <Button variant="outline" size="sm" onClick={updatePrices} disabled={pricesLoading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${pricesLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
          {pricesError && (
            <Alert className="mt-2">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {pricesError}. Using last known prices.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Wallet Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Wallet className="w-4 h-4 mr-2" />
              Trading Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${walletBalance.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Trading Positions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tradingPositions.filter(p => p.status === 'active').length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Investment Positions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{investmentPositions.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Open New Position */}
      <Card>
        <CardHeader>
          <CardTitle>Open New Trading Position</CardTitle>
          <CardDescription>
            Allocation rules: BTC (20%), ETH/SOL (10%), Fast Recovery (8%), Others (5%)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <Label htmlFor="token">Token</Label>
              <Input
                id="token"
                placeholder="BTC"
                value={newPosition.token}
                onChange={(e) => setNewPosition({...newPosition, token: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="allocationType">Type</Label>
              <Select value={newPosition.allocationType} onValueChange={(value: any) => setNewPosition({...newPosition, allocationType: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="btc">BTC (20%)</SelectItem>
                  <SelectItem value="eth">ETH (10%)</SelectItem>
                  <SelectItem value="sol">SOL (10%)</SelectItem>
                  <SelectItem value="fast-recovery">Fast Recovery (8%)</SelectItem>
                  <SelectItem value="other">Other (5%)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="entryPrice">Entry Price</Label>
              <Input
                id="entryPrice"
                type="number"
                placeholder="45000"
                value={newPosition.entryPrice}
                onChange={(e) => setNewPosition({...newPosition, entryPrice: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="takeProfit">Take Profit</Label>
              <Input
                id="takeProfit"
                type="number"
                placeholder="50000"
                value={newPosition.takeProfit}
                onChange={(e) => setNewPosition({...newPosition, takeProfit: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="stopLoss">Stop Loss</Label>
              <Input
                id="stopLoss"
                type="number"
                placeholder="42000"
                value={newPosition.stopLoss}
                onChange={(e) => setNewPosition({...newPosition, stopLoss: e.target.value})}
              />
            </div>
          </div>
          <Button onClick={openPosition} className="w-full">
            Open Position ({getAllocationPercentage(newPosition.allocationType)}% = ${(walletBalance * getAllocationPercentage(newPosition.allocationType) / 100).toFixed(2)})
          </Button>
        </CardContent>
      </Card>

      {/* Trading Positions */}
      <Card>
        <CardHeader>
          <CardTitle>Trading Positions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {tradingPositions.map((position) => {
              const pnl = calculatePnL(position);
              const pnlPercentage = (pnl / (position.amount * position.entryPrice)) * 100;
              const isLivePriceAvailable = prices[position.token]?.price;
              
              return (
                <Card key={position.id} className={`${position.status === 'tp-hit' ? 'border-green-500' : position.status === 'sl-hit' ? 'border-red-500' : ''}`}>
                  <CardContent className="pt-4">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold">{position.token}</h3>
                        <Badge variant="outline">
                          {getAllocationPercentage(position.allocationType)}%
                        </Badge>
                        {isLivePriceAvailable && <Badge variant="outline" className="bg-green-100">Live</Badge>}
                        {position.status === 'tp-hit' && <Badge className="bg-green-500">TP Hit</Badge>}
                        {position.status === 'sl-hit' && <Badge variant="destructive">SL Hit</Badge>}
                      </div>
                      <Button variant="outline" size="sm" onClick={() => closePosition(position.id, 'trading')}>
                        Close
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                      <div>
                        <Label className="text-gray-600">Entry Price</Label>
                        <p className="font-semibold">${position.entryPrice}</p>
                      </div>
                      <div>
                        <Label className="text-gray-600">Current Price</Label>
                        <p className="font-semibold">
                          ${position.currentPrice.toFixed(2)}
                          {isLivePriceAvailable && (
                            <span className="text-xs text-green-600 ml-1">●</span>
                          )}
                        </p>
                      </div>
                      <div>
                        <Label className="text-gray-600">Take Profit</Label>
                        <p className="font-semibold">${position.takeProfit}</p>
                      </div>
                      <div>
                        <Label className="text-gray-600">Stop Loss</Label>
                        <p className="font-semibold">${position.stopLoss}</p>
                      </div>
                      <div>
                        <Label className="text-gray-600">P&L</Label>
                        <p className={`font-semibold ${pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          ${pnl.toFixed(2)} ({pnlPercentage.toFixed(2)}%)
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            {tradingPositions.length === 0 && (
              <p className="text-center text-gray-500 py-4">No trading positions yet</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Investment Positions */}
      <Card>
        <CardHeader>
          <CardTitle>Investment Wallet (70% Profit Positions)</CardTitle>
          <CardDescription>
            These are tokens from trading profits with 2x take profit targets
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {investmentPositions.map((position) => {
              const pnl = calculateInvestmentPnL(position);
              const pnlPercentage = (pnl / (position.amount * position.entryPrice)) * 100;
              
              return (
                <Card key={position.id} className={position.status === 'tp-hit' ? 'border-green-500' : ''}>
                  <CardContent className="pt-4">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold">{position.token}</h3>
                        <Badge variant="outline" className="bg-blue-100">Investment</Badge>
                        {position.status === 'tp-hit' && <Badge className="bg-green-500">TP Hit - Take Profits!</Badge>}
                      </div>
                      <Button variant="outline" size="sm" onClick={() => closePosition(position.id, 'investment')}>
                        Close
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                      <div>
                        <Label className="text-gray-600">Amount</Label>
                        <p className="font-semibold">{position.amount.toFixed(6)}</p>
                      </div>
                      <div>
                        <Label className="text-gray-600">Entry Price</Label>
                        <p className="font-semibold">${position.entryPrice}</p>
                      </div>
                      <div>
                        <Label className="text-gray-600">Current Price</Label>
                        <p className="font-semibold">
                          ${position.currentPrice.toFixed(2)}
                          {isLivePriceAvailable && (
                            <span className="text-xs text-green-600 ml-1">●</span>
                          )}
                        </p>
                      </div>
                      <div>
                        <Label className="text-gray-600">Investment TP</Label>
                        <p className="font-semibold">${position.investmentTP}</p>
                      </div>
                      <div>
                        <Label className="text-gray-600">P&L</Label>
                        <p className={`font-semibold ${pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          ${pnl.toFixed(2)} ({pnlPercentage.toFixed(2)}%)
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            {investmentPositions.length === 0 && (
              <p className="text-center text-gray-500 py-4">No investment positions yet</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TradingWallet;
