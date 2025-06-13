
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, RefreshCw, DollarSign } from "lucide-react";
import { toast } from "sonner";

interface PortfolioDisplayProps {
  portfolioData: any;
}

// Simplified mock prices without demo labels
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
  const [prices, setPrices] = useState(mockPrices);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

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

  const refreshPrices = () => {
    const updatedPrices = { ...prices };
    Object.keys(updatedPrices).forEach(token => {
      const change = (Math.random() - 0.5) * 2;
      updatedPrices[token] = {
        ...updatedPrices[token],
        change24h: updatedPrices[token].change24h + change
      };
    });
    setPrices(updatedPrices);
    setLastUpdated(new Date());
    toast.success('Portfolio prices refreshed');
  };

  const calculatePortfolioValue = () => {
    if (!portfolioData?.allocation) return 0;
    
    return Object.entries(portfolioData.allocation).reduce((total, [token, details]: [string, any]) => {
      const tokenPrice = prices[token]?.price || 1;
      const tokenAmount = details.amount / tokenPrice;
      return total + (tokenAmount * tokenPrice);
    }, 0);
  };

  const calculatePortfolioChange = () => {
    if (!portfolioData?.allocation) return 0;
    
    return Object.entries(portfolioData.allocation).reduce((totalChange, [token, details]: [string, any]) => {
      const tokenData = prices[token];
      if (!tokenData) return totalChange;
      
      const weight = details.percentage / 100;
      return totalChange + (tokenData.change24h * weight);
    }, 0);
  };

  if (!portfolioData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl text-gray-900">Portfolio Analysis</CardTitle>
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
      {/* Portfolio Summary */}
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

      {/* Excel-style Portfolio Table */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl text-gray-900">Portfolio Holdings</CardTitle>
              <CardDescription>Detailed breakdown of your cryptocurrency positions</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={refreshPrices}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-900">Symbol</th>
                  <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-900">Amount</th>
                  <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-900">Entry Price</th>
                  <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-900">Current Price</th>
                  <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-900">Value</th>
                  <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-900">Average Cost</th>
                  <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-900">P&L</th>
                  <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-900">Allocation</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(portfolioData.allocation).map(([token, details]: [string, any]) => {
                  const tokenData = prices[token];
                  const currentPrice = tokenData?.price || 1;
                  const change24h = tokenData?.change24h || 0;
                  const tokenAmount = details.amount / currentPrice;
                  const currentValue = tokenAmount * currentPrice;
                  const entryPrice = details.amount / tokenAmount; // Calculate entry price from allocation
                  const avgCost = entryPrice; // For simplicity, same as entry price
                  const pnl = currentValue - details.amount;
                  const pnlPercentage = (pnl / details.amount) * 100;

                  return (
                    <tr key={token} className="hover:bg-gray-50">
                      <td className="border border-gray-200 px-4 py-3">
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="font-semibold">{token}</Badge>
                        </div>
                      </td>
                      <td className="border border-gray-200 px-4 py-3 text-sm font-mono">
                        {tokenAmount.toFixed(6)}
                      </td>
                      <td className="border border-gray-200 px-4 py-3 text-sm font-mono">
                        {formatCurrency(entryPrice)}
                      </td>
                      <td className="border border-gray-200 px-4 py-3">
                        <div className="flex flex-col">
                          <span className="text-sm font-mono">{formatCurrency(currentPrice)}</span>
                          <span className={`text-xs ${change24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatPercentage(change24h)}
                          </span>
                        </div>
                      </td>
                      <td className="border border-gray-200 px-4 py-3 text-sm font-mono">
                        {formatCurrency(currentValue)}
                      </td>
                      <td className="border border-gray-200 px-4 py-3 text-sm font-mono">
                        {formatCurrency(avgCost)}
                      </td>
                      <td className="border border-gray-200 px-4 py-3">
                        <div className="flex flex-col">
                          <span className={`text-sm font-mono ${pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrency(pnl)}
                          </span>
                          <span className={`text-xs ${pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatPercentage(pnlPercentage)}
                          </span>
                        </div>
                      </td>
                      <td className="border border-gray-200 px-4 py-3">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium">{details.percentage.toFixed(1)}%</span>
                          <div className="w-12 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-blue-500 rounded-full"
                              style={{ width: `${Math.min(details.percentage, 100)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-gray-100 font-semibold">
                  <td className="border border-gray-200 px-4 py-3">TOTAL</td>
                  <td className="border border-gray-200 px-4 py-3">-</td>
                  <td className="border border-gray-200 px-4 py-3">-</td>
                  <td className="border border-gray-200 px-4 py-3">-</td>
                  <td className="border border-gray-200 px-4 py-3 font-mono">
                    {formatCurrency(portfolioValue)}
                  </td>
                  <td className="border border-gray-200 px-4 py-3">-</td>
                  <td className="border border-gray-200 px-4 py-3">
                    <span className={`font-mono ${portfolioValue - portfolioData.capital >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(portfolioValue - portfolioData.capital)}
                    </span>
                  </td>
                  <td className="border border-gray-200 px-4 py-3">100%</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Strategy Details */}
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
