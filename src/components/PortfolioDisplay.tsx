
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, RefreshCw, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { useSecurePrices } from "@/hooks/useSecurePrices";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table";

interface PortfolioDisplayProps {
  portfolioData: any;
}

const PortfolioDisplay: React.FC<PortfolioDisplayProps> = ({ portfolioData }) => {
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Get all tokens from portfolio allocation for price tracking
  const portfolioTokens = portfolioData?.allocation ? Object.keys(portfolioData.allocation) : [];
  
  const { prices, isLoading, lastUpdated: apiLastUpdated, error, updatePrices } = useSecurePrices(portfolioTokens);

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
    updatePrices();
    setLastUpdated(new Date());
    toast.success('Portfolio prices refreshed from Secure API');
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

      {/* Portfolio Table */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl text-gray-900">Portfolio Holdings</CardTitle>
              <CardDescription>Live prices from Secure API - Last updated: {apiLastUpdated?.toLocaleTimeString() || 'Never'}</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={refreshPrices} disabled={isLoading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Symbol</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Entry Price</TableHead>
                <TableHead>Current Price</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Average Cost</TableHead>
                <TableHead>P&L</TableHead>
                <TableHead>Allocation</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.entries(portfolioData.allocation).map(([token, details]: [string, any]) => {
                const tokenData = prices[token];
                const currentPrice = tokenData?.price || 1;
                const change24h = tokenData?.change24h || 0;
                const tokenAmount = details.amount / currentPrice;
                const currentValue = tokenAmount * currentPrice;
                const entryPrice = details.amount / tokenAmount;
                const avgCost = entryPrice;
                const pnl = currentValue - details.amount;
                const pnlPercentage = (pnl / details.amount) * 100;

                return (
                  <TableRow key={token}>
                    <TableCell>
                      <Badge variant="outline" className="font-semibold">{token}</Badge>
                    </TableCell>
                    <TableCell className="font-mono">
                      {tokenAmount.toFixed(6)}
                    </TableCell>
                    <TableCell className="font-mono">
                      {formatCurrency(entryPrice)}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-mono">{formatCurrency(currentPrice)}</span>
                        <span className={`text-xs ${change24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatPercentage(change24h)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono">
                      {formatCurrency(currentValue)}
                    </TableCell>
                    <TableCell className="font-mono">
                      {formatCurrency(avgCost)}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className={`font-mono ${pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(pnl)}
                        </span>
                        <span className={`text-xs ${pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatPercentage(pnlPercentage)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">{details.percentage.toFixed(1)}%</span>
                        <div className="w-12 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-500 rounded-full"
                            style={{ width: `${Math.min(details.percentage, 100)}%` }}
                          />
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell className="font-semibold">TOTAL</TableCell>
                <TableCell>-</TableCell>
                <TableCell>-</TableCell>
                <TableCell>-</TableCell>
                <TableCell className="font-mono font-semibold">
                  {formatCurrency(portfolioValue)}
                </TableCell>
                <TableCell>-</TableCell>
                <TableCell>
                  <span className={`font-mono font-semibold ${portfolioValue - portfolioData.capital >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(portfolioValue - portfolioData.capital)}
                  </span>
                </TableCell>
                <TableCell className="font-semibold">100%</TableCell>
              </TableRow>
            </TableFooter>
          </Table>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">
                Error fetching live prices: {error}. Showing fallback data.
              </p>
            </div>
          )}
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
