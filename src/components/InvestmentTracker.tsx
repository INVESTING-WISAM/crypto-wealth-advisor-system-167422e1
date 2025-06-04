
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, TrendingUp, TrendingDown, Target, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";

interface Investment {
  id: string;
  token: string;
  amount: number;
  purchasePrice: number;
  currentPrice: number;
  targetPrice: number;
  stopLoss: number;
  purchaseDate: string;
  capitalWithdrawn: boolean;
}

const InvestmentTracker = ({ portfolioData, currentUser }: { portfolioData: any, currentUser: string }) => {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [newInvestment, setNewInvestment] = useState({
    token: '',
    amount: '',
    purchasePrice: '',
    targetPrice: '',
    stopLoss: ''
  });

  useEffect(() => {
    if (currentUser) {
      const savedInvestments = localStorage.getItem(`investments_${currentUser}`);
      if (savedInvestments) {
        setInvestments(JSON.parse(savedInvestments));
      }
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser && investments.length > 0) {
      localStorage.setItem(`investments_${currentUser}`, JSON.stringify(investments));
    }
  }, [investments, currentUser]);

  const addInvestment = () => {
    if (!newInvestment.token || !newInvestment.amount || !newInvestment.purchasePrice) {
      toast.error("Please fill in all required fields");
      return;
    }

    const investment: Investment = {
      id: Date.now().toString(),
      token: newInvestment.token.toUpperCase(),
      amount: parseFloat(newInvestment.amount),
      purchasePrice: parseFloat(newInvestment.purchasePrice),
      currentPrice: parseFloat(newInvestment.purchasePrice), // Initially same as purchase price
      targetPrice: parseFloat(newInvestment.targetPrice) || 0,
      stopLoss: parseFloat(newInvestment.stopLoss) || 0,
      purchaseDate: new Date().toISOString(),
      capitalWithdrawn: false
    };

    setInvestments([...investments, investment]);
    setNewInvestment({
      token: '',
      amount: '',
      purchasePrice: '',
      targetPrice: '',
      stopLoss: ''
    });
    toast.success("Investment added successfully!");
  };

  const updateCurrentPrice = (id: string, newPrice: string) => {
    const price = parseFloat(newPrice);
    if (isNaN(price)) return;

    setInvestments(investments.map(inv => {
      if (inv.id === id) {
        const updatedInv = { ...inv, currentPrice: price };
        
        // Check for 100% profit alert
        const profitPercentage = ((price - inv.purchasePrice) / inv.purchasePrice) * 100;
        if (profitPercentage >= 100 && !inv.capitalWithdrawn) {
          toast.success(`🎉 ${inv.token} has reached 100% profit! Consider withdrawing your initial capital.`);
        }

        return updatedInv;
      }
      return inv;
    }));
  };

  const withdrawCapital = (id: string) => {
    setInvestments(investments.map(inv => 
      inv.id === id ? { ...inv, capitalWithdrawn: true } : inv
    ));
    toast.success("Capital withdrawal recorded!");
  };

  const removeInvestment = (id: string) => {
    setInvestments(investments.filter(inv => inv.id !== id));
    toast.success("Investment removed!");
  };

  const calculateProfit = (investment: Investment) => {
    const totalValue = investment.amount * investment.currentPrice;
    const totalCost = investment.amount * investment.purchasePrice;
    return totalValue - totalCost;
  };

  const calculateProfitPercentage = (investment: Investment) => {
    return ((investment.currentPrice - investment.purchasePrice) / investment.purchasePrice) * 100;
  };

  const getTotalPortfolioValue = () => {
    return investments.reduce((total, inv) => total + (inv.amount * inv.currentPrice), 0);
  };

  const getTotalInvested = () => {
    return investments.reduce((total, inv) => total + (inv.amount * inv.purchasePrice), 0);
  };

  const getTotalProfit = () => {
    return investments.reduce((total, inv) => total + calculateProfit(inv), 0);
  };

  const getOverallProfitPercentage = () => {
    const totalInvested = getTotalInvested();
    if (totalInvested === 0) return 0;
    return (getTotalProfit() / totalInvested) * 100;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Portfolio Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${getTotalPortfolioValue().toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Invested</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${getTotalInvested().toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Profit/Loss</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getTotalProfit() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${getTotalProfit().toFixed(2)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Overall Profit %</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getOverallProfitPercentage() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {getOverallProfitPercentage().toFixed(2)}%
            </div>
          </CardContent>
        </Card>
      </div>

      {getOverallProfitPercentage() >= 100 && (
        <Alert className="border-green-200 bg-green-50">
          <AlertTriangle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            🎉 Congratulations! Your overall portfolio has reached 100% profit! Consider withdrawing your initial capital from profitable positions.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Add New Investment</CardTitle>
          <CardDescription>Track your crypto investments and set profit targets</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <Label htmlFor="token">Token Symbol</Label>
              <Input
                id="token"
                placeholder="BTC"
                value={newInvestment.token}
                onChange={(e) => setNewInvestment({...newInvestment, token: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                placeholder="0.5"
                value={newInvestment.amount}
                onChange={(e) => setNewInvestment({...newInvestment, amount: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="purchasePrice">Purchase Price ($)</Label>
              <Input
                id="purchasePrice"
                type="number"
                placeholder="45000"
                value={newInvestment.purchasePrice}
                onChange={(e) => setNewInvestment({...newInvestment, purchasePrice: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="targetPrice">Target Price ($)</Label>
              <Input
                id="targetPrice"
                type="number"
                placeholder="90000"
                value={newInvestment.targetPrice}
                onChange={(e) => setNewInvestment({...newInvestment, targetPrice: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="stopLoss">Stop Loss ($)</Label>
              <Input
                id="stopLoss"
                type="number"
                placeholder="40000"
                value={newInvestment.stopLoss}
                onChange={(e) => setNewInvestment({...newInvestment, stopLoss: e.target.value})}
              />
            </div>
          </div>
          <Button onClick={addInvestment} className="w-full">Add Investment</Button>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {investments.map((investment) => {
          const profit = calculateProfit(investment);
          const profitPercentage = calculateProfitPercentage(investment);
          const isProfit = profit >= 0;
          const targetReached = investment.targetPrice > 0 && investment.currentPrice >= investment.targetPrice;
          const stopLossHit = investment.stopLoss > 0 && investment.currentPrice <= investment.stopLoss;
          const canWithdrawCapital = profitPercentage >= 100 && !investment.capitalWithdrawn;

          return (
            <Card key={investment.id} className={`${targetReached ? 'border-green-500' : stopLossHit ? 'border-red-500' : ''}`}>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center space-x-2">
                    <span>{investment.token}</span>
                    {canWithdrawCapital && (
                      <Badge variant="outline" className="bg-green-100 text-green-800">
                        100% Profit - Withdraw Capital!
                      </Badge>
                    )}
                    {investment.capitalWithdrawn && (
                      <Badge variant="outline" className="bg-blue-100 text-blue-800">
                        Capital Withdrawn
                      </Badge>
                    )}
                    {targetReached && <Badge className="bg-green-500">Target Reached</Badge>}
                    {stopLossHit && <Badge variant="destructive">Stop Loss Hit</Badge>}
                  </CardTitle>
                  <Button variant="outline" size="sm" onClick={() => removeInvestment(investment.id)}>
                    Remove
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <Label className="text-sm text-gray-600">Amount</Label>
                    <p className="font-semibold">{investment.amount}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">Purchase Price</Label>
                    <p className="font-semibold">${investment.purchasePrice}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">Current Price</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        type="number"
                        value={investment.currentPrice}
                        onChange={(e) => updateCurrentPrice(investment.id, e.target.value)}
                        className="w-24"
                      />
                      <Button 
                        size="sm" 
                        onClick={() => updateCurrentPrice(investment.id, investment.currentPrice.toString())}
                      >
                        Update
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">Profit/Loss</Label>
                    <p className={`font-semibold ${isProfit ? 'text-green-600' : 'text-red-600'}`}>
                      ${profit.toFixed(2)} ({profitPercentage.toFixed(2)}%)
                    </p>
                  </div>
                </div>

                {investment.targetPrice > 0 && (
                  <div>
                    <Label className="text-sm text-gray-600">Progress to Target</Label>
                    <div className="flex items-center space-x-2 mt-1">
                      <Progress 
                        value={Math.min((investment.currentPrice / investment.targetPrice) * 100, 100)} 
                        className="flex-1"
                      />
                      <span className="text-sm">{((investment.currentPrice / investment.targetPrice) * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                )}

                {canWithdrawCapital && (
                  <Alert className="border-green-200 bg-green-50">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <AlertDescription className="flex items-center justify-between">
                      <span className="text-green-800">This investment has reached 100% profit! You can now withdraw your initial capital.</span>
                      <Button 
                        size="sm" 
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => withdrawCapital(investment.id)}
                      >
                        Withdraw Capital
                      </Button>
                    </AlertDescription>
                  </Alert>
                )}

                {targetReached && (
                  <Alert className="border-green-200 bg-green-50">
                    <Target className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      🎯 Target price reached! Consider taking profits.
                    </AlertDescription>
                  </Alert>
                )}

                {stopLossHit && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      ⚠️ Stop loss triggered! Consider selling to limit losses.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {investments.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500">No investments tracked yet. Add your first investment above!</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default InvestmentTracker;
