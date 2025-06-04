
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TrendingUp, AlertTriangle, Target, Wallet } from "lucide-react";
import { toast } from "sonner";

interface TradingWalletProps {
  currentUser: string;
  portfolioData: any;
}

interface Trade {
  id: string;
  token: string;
  amount: number;
  entryPrice: number;
  currentPrice: number;
  quantity: number;
  stopLoss: number;
  takeProfit: number;
  profitPercentage: number;
  status: 'active' | 'tp_hit' | 'sl_hit';
  createdAt: string;
  isFastRecovery: boolean;
}

interface InvestmentWalletPosition {
  id: string;
  token: string;
  amount: number;
  entryPrice: number;
  currentPrice: number;
  quantity: number;
  investmentTakeProfit: number;
  profitPercentage: number;
  status: 'active' | 'tp_hit';
  createdAt: string;
  originalTradeId: string;
}

const TradingWallet: React.FC<TradingWalletProps> = ({ currentUser, portfolioData }) => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [investmentPositions, setInvestmentPositions] = useState<InvestmentWalletPosition[]>([]);
  const [newTrade, setNewTrade] = useState({
    token: '',
    amount: 0,
    entryPrice: 0,
    stopLoss: 0,
    takeProfit: 0,
    isFastRecovery: false
  });

  // Mock current prices
  const mockPrices: { [key: string]: number } = {
    BTC: 43500,
    ETH: 2650,
    SOL: 98,
    CORE: 1.25,
    ADA: 0.52,
    DOT: 7.85,
    LINK: 15.40,
    UNI: 6.80,
    AVAX: 38.50,
    MATIC: 0.85
  };

  useEffect(() => {
    loadTradingData();
    const interval = setInterval(updatePricesAndCheckAlerts, 5000);
    return () => clearInterval(interval);
  }, [currentUser]);

  const loadTradingData = () => {
    const savedTrades = localStorage.getItem(`trading_trades_${currentUser}`);
    const savedInvestments = localStorage.getItem(`investment_positions_${currentUser}`);
    
    if (savedTrades) {
      setTrades(JSON.parse(savedTrades));
    }
    if (savedInvestments) {
      setInvestmentPositions(JSON.parse(savedInvestments));
    }
  };

  const saveTradingData = (newTrades: Trade[], newInvestments: InvestmentWalletPosition[]) => {
    localStorage.setItem(`trading_trades_${currentUser}`, JSON.stringify(newTrades));
    localStorage.setItem(`investment_positions_${currentUser}`, JSON.stringify(newInvestments));
  };

  const calculateTradingPercentage = (token: string, isFastRecovery: boolean): number => {
    if (token === 'BTC') return 20;
    if (token === 'ETH' || token === 'SOL') return 10;
    if (isFastRecovery) return 8;
    return 5;
  };

  const getTotalWalletValue = (): number => {
    if (!portfolioData?.allocation) return 0;
    return Object.values(portfolioData.allocation).reduce((sum: number, details: any) => sum + (details?.amount || 0), 0);
  };

  const updatePricesAndCheckAlerts = () => {
    const updatedTrades = trades.map(trade => {
      const currentPrice = mockPrices[trade.token] || trade.currentPrice;
      const profitPercentage = ((currentPrice - trade.entryPrice) / trade.entryPrice) * 100;
      
      // Check for TP/SL hits
      if (trade.status === 'active') {
        if (currentPrice >= trade.takeProfit) {
          toast.success(`🎉 Take Profit hit for ${trade.token}! Moving 70% to investment wallet.`);
          handleTakeProfitHit(trade, currentPrice);
          return { ...trade, status: 'tp_hit' as const, currentPrice, profitPercentage };
        } else if (currentPrice <= trade.stopLoss) {
          toast.error(`🛑 Stop Loss hit for ${trade.token}!`);
          return { ...trade, status: 'sl_hit' as const, currentPrice, profitPercentage };
        }
      }
      
      return { ...trade, currentPrice, profitPercentage };
    });

    const updatedInvestments = investmentPositions.map(position => {
      const currentPrice = mockPrices[position.token] || position.currentPrice;
      const profitPercentage = ((currentPrice - position.entryPrice) / position.entryPrice) * 100;
      
      if (position.status === 'active' && currentPrice >= position.investmentTakeProfit) {
        toast.success(`🚀 Investment Take Profit hit for ${position.token}!`);
        return { ...position, status: 'tp_hit' as const, currentPrice, profitPercentage };
      }
      
      return { ...position, currentPrice, profitPercentage };
    });

    setTrades(updatedTrades);
    setInvestmentPositions(updatedInvestments);
    saveTradingData(updatedTrades, updatedInvestments);
  };

  const handleTakeProfitHit = (trade: Trade, currentPrice: number) => {
    const totalValue = trade.quantity * currentPrice;
    const profit = totalValue - trade.amount;
    const tokensToInvestment = (profit * 0.7) / currentPrice;
    
    const investmentPosition: InvestmentWalletPosition = {
      id: `inv_${Date.now()}`,
      token: trade.token,
      amount: profit * 0.7,
      entryPrice: currentPrice,
      currentPrice: currentPrice,
      quantity: tokensToInvestment,
      investmentTakeProfit: currentPrice * 2, // 100% profit target
      profitPercentage: 0,
      status: 'active',
      createdAt: new Date().toISOString(),
      originalTradeId: trade.id
    };

    setInvestmentPositions(prev => [...prev, investmentPosition]);
  };

  const executeTrade = () => {
    if (!newTrade.token || newTrade.amount <= 0 || newTrade.entryPrice <= 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    const totalWallet = getTotalWalletValue();
    const tradingPercentage = calculateTradingPercentage(newTrade.token, newTrade.isFastRecovery);
    const maxTradeAmount = (totalWallet * tradingPercentage) / 100;

    if (newTrade.amount > maxTradeAmount) {
      toast.error(`Trade amount exceeds ${tradingPercentage}% limit ($${maxTradeAmount.toFixed(2)})`);
      return;
    }

    const quantity = newTrade.amount / newTrade.entryPrice;
    const currentPrice = mockPrices[newTrade.token] || newTrade.entryPrice;

    const trade: Trade = {
      id: `trade_${Date.now()}`,
      token: newTrade.token,
      amount: newTrade.amount,
      entryPrice: newTrade.entryPrice,
      currentPrice: currentPrice,
      quantity: quantity,
      stopLoss: newTrade.stopLoss,
      takeProfit: newTrade.takeProfit,
      profitPercentage: 0,
      status: 'active',
      createdAt: new Date().toISOString(),
      isFastRecovery: newTrade.isFastRecovery
    };

    setTrades(prev => [...prev, trade]);
    saveTradingData([...trades, trade], investmentPositions);
    
    setNewTrade({
      token: '',
      amount: 0,
      entryPrice: 0,
      stopLoss: 0,
      takeProfit: 0,
      isFastRecovery: false
    });

    toast.success(`Trade executed for ${newTrade.token}`);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const activeTrades = trades.filter(trade => trade.status === 'active');
  const activeInvestments = investmentPositions.filter(pos => pos.status === 'active');

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5" />
            <span>Trading Wallet</span>
          </CardTitle>
          <CardDescription>
            Execute trades with automatic profit allocation to investment wallet
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="token">Token Symbol</Label>
              <Input
                id="token"
                value={newTrade.token}
                onChange={(e) => setNewTrade({...newTrade, token: e.target.value.toUpperCase()})}
                placeholder="BTC, ETH, etc."
              />
            </div>
            <div>
              <Label htmlFor="amount">Trade Amount ($)</Label>
              <Input
                id="amount"
                type="number"
                value={newTrade.amount || ''}
                onChange={(e) => setNewTrade({...newTrade, amount: Number(e.target.value)})}
                placeholder="1000"
              />
            </div>
            <div>
              <Label htmlFor="entryPrice">Entry Price ($)</Label>
              <Input
                id="entryPrice"
                type="number"
                value={newTrade.entryPrice || ''}
                onChange={(e) => setNewTrade({...newTrade, entryPrice: Number(e.target.value)})}
                placeholder="43500"
              />
            </div>
            <div>
              <Label htmlFor="stopLoss">Stop Loss ($)</Label>
              <Input
                id="stopLoss"
                type="number"
                value={newTrade.stopLoss || ''}
                onChange={(e) => setNewTrade({...newTrade, stopLoss: Number(e.target.value)})}
                placeholder="40000"
              />
            </div>
            <div>
              <Label htmlFor="takeProfit">Take Profit ($)</Label>
              <Input
                id="takeProfit"
                type="number"
                value={newTrade.takeProfit || ''}
                onChange={(e) => setNewTrade({...newTrade, takeProfit: Number(e.target.value)})}
                placeholder="50000"
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="fastRecovery"
                checked={newTrade.isFastRecovery}
                onChange={(e) => setNewTrade({...newTrade, isFastRecovery: e.target.checked})}
              />
              <Label htmlFor="fastRecovery">Fast Recovery Token (Top 50)</Label>
            </div>
          </div>

          <div className="text-sm text-gray-600">
            <p>Trading Allocation Rules:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>BTC: 20% of total wallet</li>
              <li>ETH/SOL: 10% of total wallet each</li>
              <li>Fast Recovery (Top 50): 8% of total wallet</li>
              <li>Other tokens: 5% of total wallet</li>
            </ul>
          </div>

          <Button onClick={executeTrade} className="w-full">
            Execute Trade
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5" />
              <span>Active Trades</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activeTrades.length === 0 ? (
              <p className="text-gray-500">No active trades</p>
            ) : (
              <div className="space-y-3">
                {activeTrades.map(trade => (
                  <div key={trade.id} className="p-3 border rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <Badge variant="outline">{trade.token}</Badge>
                      {trade.isFastRecovery && (
                        <Badge variant="default" className="bg-blue-600">Fast Recovery</Badge>
                      )}
                      <span className={`text-sm font-bold ${trade.profitPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {trade.profitPercentage >= 0 ? '+' : ''}{trade.profitPercentage.toFixed(1)}%
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>Amount: {formatCurrency(trade.amount)}</div>
                      <div>Quantity: {trade.quantity.toFixed(6)}</div>
                      <div>Entry: {formatCurrency(trade.entryPrice)}</div>
                      <div>Current: {formatCurrency(trade.currentPrice)}</div>
                      <div>SL: {formatCurrency(trade.stopLoss)}</div>
                      <div>TP: {formatCurrency(trade.takeProfit)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Wallet className="w-5 h-5" />
              <span>Investment Wallet</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activeInvestments.length === 0 ? (
              <p className="text-gray-500">No investment positions</p>
            ) : (
              <div className="space-y-3">
                {activeInvestments.map(position => (
                  <div key={position.id} className="p-3 border rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <Badge variant="outline">{position.token}</Badge>
                      <span className={`text-sm font-bold ${position.profitPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {position.profitPercentage >= 0 ? '+' : ''}{position.profitPercentage.toFixed(1)}%
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>Amount: {formatCurrency(position.amount)}</div>
                      <div>Quantity: {position.quantity.toFixed(6)}</div>
                      <div>Entry: {formatCurrency(position.entryPrice)}</div>
                      <div>Current: {formatCurrency(position.currentPrice)}</div>
                      <div>Target: {formatCurrency(position.investmentTakeProfit)}</div>
                      <div>Progress: {((position.currentPrice / position.investmentTakeProfit) * 100).toFixed(1)}%</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Trading Rules & Strategy</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-600 space-y-2">
            <p><strong>Profit Management:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>When TP is hit, 70% of profit goes to Investment Wallet as tokens</li>
              <li>Investment Wallet has separate TP (usually 100% profit)</li>
              <li>Investment positions are long-term holds until TP is reached</li>
              <li>Alerts are sent for both trading and investment TP/SL hits</li>
            </ul>
            <p className="mt-4 p-2 bg-blue-50 border border-blue-200 rounded">
              <strong>💡 Strategy:</strong> This system separates short-term trading profits from long-term investment growth, maximizing compound returns.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TradingWallet;
