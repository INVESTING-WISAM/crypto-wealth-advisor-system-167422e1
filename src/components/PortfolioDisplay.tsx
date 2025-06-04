
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Wallet, TrendingUp, TrendingDown, RefreshCw, DollarSign } from "lucide-react";
import { toast } from "sonner";

interface PortfolioDisplayProps {
  portfolioData: any;
}

// Mock price data - In production, this would connect to a real API like CoinGecko or CoinMarketCap
const mockPrices: { [key: string]: { price: number; change24h: number } } = {
  BTC: { price: 43500, change24h: 2.5 },
  ETH: { price: 2650, change24h: 1.8 },
  SOL: { price: 98, change24h: -0.5 },
  CORE: { price: 1.25, change24h: 5.2 },
  ADA: { price: 0.52, change24h: 3.1 },
  DOT: { price: 7.85, change24h: -1.2 },
  LINK: { price: 15.40, change24h: 0.8 },
  UNI: { price: 6.80, change24h: 2.2 }
};

const PortfolioDisplay: React.FC<PortfolioDisplayProps> = ({ portfolioData }) => {
  const [currentPrices, setCurrentPrices] = useState(mockPrices);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    // Simulate price updates every 30 seconds
    const interval = setInterval(() => {
      updatePrices();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const updatePrices = () => {
    setIsLoading(true);
    
    // Simulate API call with random price fluctuations
    setTimeout(() => {
      const updatedPrices = { ...currentPrices };
      Object.keys(updatedPrices).forEach(token => {
        const randomChange = (Math.random() - 0.5) * 0.1; // ±5% max change
        updatedPrices[token].price *= (1 + randomChange);
        updatedPrices[token].change24h = (Math.random() - 0.5) * 10; // ±5% daily change
      });
      
      setCurrentPrices(updatedPrices);
      setLastUpdated(new Date());
      setIsLoading(false);
      toast.success("Prices updated");
    }, 1000);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatPercentage = (percentage: number) => {
    const sign = percentage >= 0 ? '+' : '';
    return `${sign}${percentage.toFixed(2)}%`;
  };

  const calculatePortfolioValue = () => {
    if (!portfolioData?.allocation) return 0;
    
    return Object.entries(portfolioData.allocation).reduce((total, [token, details]: [string, any]) => {
      const tokenPrice = currentPrices[token]?.price || 1;
      const tokenAmount = details.amount / tokenPrice;
      return total + (tokenAmount * tokenPrice);
    }, 0);
  };

  const calculatePortfolioChange = () => {
    if (!portfolioData?.allocation) return 0;
    
    return Object.entries(portfolioData.allocation).reduce((totalChange, [token, details]: [string, any]) => {
      const tokenData = currentPrices[token];
      if (!tokenData) return totalChange;
      
      const weight = details.percentage / 100;
      return totalChange + (tokenData.change24h * weight);
    }, 0);
  };

  if (!portfolioData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Wallet className="w-5 h-5" />
            <span>My Portfolio</span>
          </CardTitle>
          <CardDescription>
            No portfolio data available. Please calculate your portfolio first.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const portfolioValue = calculatePortfolioValue();
  const portfolioChange = calculatePortfolioChange();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Wallet className="w-5 h-5" />
              <span>Portfolio Overview</span>
            </div>
            <Button variant="outline" size="sm" onClick={updatePrices} disabled={isLoading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh Prices
            </Button>
          </CardTitle>
          <CardDescription>
            Last updated: {lastUpdated.toLocaleTimeString()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600">Total Portfolio Value</p>
              <p className="text-2xl font-bold text-blue-600">{formatCurrency(portfolioValue)}</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Initial Investment</p>
              <p className="text-2xl font-bold">{formatCurrency(portfolioData.capital)}</p>
            </div>
            <div className={`text-center p-4 rounded-lg ${portfolioChange >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
              <p className="text-sm text-gray-600">24h Change</p>
              <p className={`text-2xl font-bold flex items-center justify-center ${portfolioChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {portfolioChange >= 0 ? <TrendingUp className="w-5 h-5 mr-1" /> : <TrendingDown className="w-5 h-5 mr-1" />}
                {formatPercentage(portfolioChange)}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Token Allocation</h3>
            {Object.entries(portfolioData.allocation).map(([token, details]: [string, any]) => {
              const tokenData = currentPrices[token];
              const currentPrice = tokenData?.price || 1;
              const change24h = tokenData?.change24h || 0;
              const tokenAmount = details.amount / currentPrice;
              const currentValue = tokenAmount * currentPrice;

              return (
                <div key={token} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <Badge variant="outline" className="font-semibold">{token}</Badge>
                      <div>
                        <p className="font-medium">{details.percentage.toFixed(1)}%</p>
                        <p className="text-sm text-gray-600">{formatCurrency(currentValue)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(currentPrice)}</p>
                      <p className={`text-sm ${change24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatPercentage(change24h)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Amount: {tokenAmount.toFixed(6)} {token}</span>
                      <span>DCA: {details.weeks} weeks ({formatCurrency(details.amount / details.weeks)}/week)</span>
                    </div>
                    <Progress value={details.percentage} className="h-2" />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <DollarSign className="w-5 h-5" />
            <span>Investment Strategy Details</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">Strategy Parameters</h4>
              <ul className="text-sm space-y-1">
                <li>• Maximum Tokens: {portfolioData.maxTokens}</li>
                <li>• Market Condition: {portfolioData.marketCondition}</li>
                <li>• Altcoin Season: {portfolioData.isAltcoinSeason ? 'Yes' : 'No'}</li>
                <li>• Airdrop Participation: {portfolioData.participateInAirdrop ? 'Yes' : 'No'}</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">DCA Schedule</h4>
              <ul className="text-sm space-y-1">
                <li>• BTC: 60 weeks</li>
                <li>• ETH/SOL: 65 weeks</li>
                <li>• CORE: 70 weeks</li>
                <li>• Top-30 tokens: 85 weeks</li>
                <li>• Others: 100 weeks</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PortfolioDisplay;
