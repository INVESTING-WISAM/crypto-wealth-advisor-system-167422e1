
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Calculator, TrendingUp, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface PortfolioCalculatorProps {
  onPortfolioUpdate: (data: any) => void;
  currentUser: string;
}

const PortfolioCalculator: React.FC<PortfolioCalculatorProps> = ({ onPortfolioUpdate, currentUser }) => {
  const [capital, setCapital] = useState<number>(0);
  const [marketCondition, setMarketCondition] = useState<string>('');
  const [isAltcoinSeason, setIsAltcoinSeason] = useState<boolean>(false);
  const [participateInAirdrop, setParticipateInAirdrop] = useState<boolean>(false);
  const [calculatedPortfolio, setCalculatedPortfolio] = useState<any>(null);

  const calculateMaxTokens = (capital: number): number => {
    if (capital >= 500 && capital <= 2000) return 4;
    if (capital <= 10000) return 4 + Math.floor((capital - 2000) / 1000);
    if (capital <= 20000) return 12 + Math.floor((capital - 10000) / 2000);
    if (capital <= 39000) return 17 + Math.floor((capital - 20000) / 3000);
    return 25; // For capitals above $39,000
  };

  const calculateAllocation = () => {
    if (capital < 500) {
      toast.error("Minimum capital required is $500");
      return;
    }

    if (!marketCondition) {
      toast.error("Please select market condition");
      return;
    }

    const maxTokens = calculateMaxTokens(capital);
    let allocation: any = {};

    if (capital >= 50000) {
      // Special allocation for wallets above $50,000
      if (!isAltcoinSeason) {
        allocation.BTC = { percentage: 30, amount: capital * 0.3, weeks: 60 };
      }
      allocation.ETH = { percentage: 10, amount: capital * 0.1, weeks: 65 };
      allocation.CORE = { percentage: 10, amount: capital * 0.1, weeks: 70 };
      allocation.SOL = { percentage: 10, amount: capital * 0.1, weeks: 65 };
      
      // Medium-risk tokens (30%)
      const mediumRiskTokens = ['ADA', 'DOT', 'LINK'];
      const mediumRiskPerToken = 10;
      mediumRiskTokens.forEach(token => {
        allocation[token] = { 
          percentage: mediumRiskPerToken, 
          amount: capital * (mediumRiskPerToken / 100), 
          weeks: 85 
        };
      });

      // High-risk token (10%)
      if (participateInAirdrop) {
        allocation.UNI = { percentage: 10, amount: capital * 0.1, weeks: 100 };
      }
    } else {
      // Standard allocation for smaller wallets
      let remainingPercentage = 100;
      let remainingCapital = capital;

      if (!isAltcoinSeason) {
        // Always include BTC unless it's altcoin season
        const btcPercentage = Math.min(40, remainingPercentage);
        allocation.BTC = { 
          percentage: btcPercentage, 
          amount: capital * (btcPercentage / 100), 
          weeks: 60 
        };
        remainingPercentage -= btcPercentage;
        remainingCapital -= allocation.BTC.amount;
      }

      // ETH allocation
      const ethPercentage = Math.min(25, remainingPercentage);
      allocation.ETH = { 
        percentage: ethPercentage, 
        amount: capital * (ethPercentage / 100), 
        weeks: 65 
      };
      remainingPercentage -= ethPercentage;
      remainingCapital -= allocation.ETH.amount;

      // Additional tokens based on maxTokens
      const additionalTokens = ['SOL', 'CORE', 'ADA', 'DOT', 'LINK', 'UNI'];
      const tokensToAdd = Math.min(maxTokens - Object.keys(allocation).length, additionalTokens.length);
      
      if (tokensToAdd > 0) {
        const percentagePerToken = remainingPercentage / tokensToAdd;
        
        for (let i = 0; i < tokensToAdd; i++) {
          const token = additionalTokens[i];
          let weeks = 85; // Default for top-30 tokens
          
          if (token === 'SOL') weeks = 65;
          else if (token === 'CORE') weeks = 70;
          else if (['UNI'].includes(token)) weeks = 100; // High-risk tokens
          
          allocation[token] = {
            percentage: percentagePerToken,
            amount: capital * (percentagePerToken / 100),
            weeks: weeks
          };
        }
      }
    }

    const portfolioData = {
      capital,
      maxTokens,
      marketCondition,
      isAltcoinSeason,
      participateInAirdrop,
      allocation,
      createdAt: new Date().toISOString(),
      user: currentUser
    };

    setCalculatedPortfolio(portfolioData);
    onPortfolioUpdate(portfolioData);
    toast.success("Portfolio calculated successfully!");
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calculator className="w-5 h-5" />
            <span>Portfolio Calculator</span>
          </CardTitle>
          <CardDescription>
            Calculate your optimal cryptocurrency portfolio allocation based on your capital and market conditions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="capital">Investment Capital ($)</Label>
              <Input
                id="capital"
                type="number"
                placeholder="Enter your capital"
                value={capital || ''}
                onChange={(e) => setCapital(Number(e.target.value))}
                min="500"
              />
              {capital > 0 && capital < 500 && (
                <p className="text-sm text-red-600">Minimum capital required: $500</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="market">Market Condition</Label>
              <Select value={marketCondition} onValueChange={setMarketCondition}>
                <SelectTrigger>
                  <SelectValue placeholder="Select market condition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bull">Bull Market</SelectItem>
                  <SelectItem value="bear">Bear Market</SelectItem>
                  <SelectItem value="sideways">Sideways Market</SelectItem>
                  <SelectItem value="volatile">Highly Volatile</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="altcoin-season">Altcoin Season</Label>
                <p className="text-sm text-gray-600">Skip BTC allocation and focus on top-30 tokens</p>
              </div>
              <Switch
                id="altcoin-season"
                checked={isAltcoinSeason}
                onCheckedChange={setIsAltcoinSeason}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="airdrop">Participate in Airdrops/Presales</Label>
                <p className="text-sm text-gray-600">Include high-risk tokens for potential airdrops</p>
              </div>
              <Switch
                id="airdrop"
                checked={participateInAirdrop}
                onCheckedChange={setParticipateInAirdrop}
              />
            </div>
          </div>

          {capital >= 500 && (
            <Alert>
              <TrendingUp className="h-4 w-4" />
              <AlertDescription>
                <strong>Maximum tokens for ${formatCurrency(capital)}:</strong> {calculateMaxTokens(capital)} tokens
                <br />
                <span className="text-sm text-gray-600">
                  Capital range: $500-$2K (4 tokens) → $2K-$10K (+1 per $1K) → $10K-$20K (+1 per $2K) → $20K-$39K (+1 per $3K) → $50K+ (fixed allocation)
                </span>
              </AlertDescription>
            </Alert>
          )}

          <Button 
            onClick={calculateAllocation} 
            className="w-full" 
            disabled={capital < 500 || !marketCondition}
          >
            Calculate Portfolio Allocation
          </Button>
        </CardContent>
      </Card>

      {calculatedPortfolio && (
        <Card>
          <CardHeader>
            <CardTitle>Calculated Portfolio Allocation</CardTitle>
            <CardDescription>
              Your personalized cryptocurrency investment strategy
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(calculatedPortfolio.allocation).map(([token, details]: [string, any]) => (
                <div key={token} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline" className="font-semibold">{token}</Badge>
                    <span className="font-bold">{details.percentage.toFixed(1)}%</span>
                  </div>
                  <p className="text-lg font-semibold text-blue-600 mb-1">
                    {formatCurrency(details.amount)}
                  </p>
                  <p className="text-sm text-gray-600">
                    DCA over {details.weeks} weeks
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatCurrency(details.amount / details.weeks)}/week
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold mb-2">Investment Strategy Summary</h4>
              <ul className="text-sm space-y-1">
                <li>• Total Capital: {formatCurrency(calculatedPortfolio.capital)}</li>
                <li>• Max Tokens: {calculatedPortfolio.maxTokens}</li>
                <li>• Market Condition: {calculatedPortfolio.marketCondition}</li>
                <li>• Altcoin Season: {calculatedPortfolio.isAltcoinSeason ? 'Yes' : 'No'}</li>
                <li>• Airdrop Participation: {calculatedPortfolio.participateInAirdrop ? 'Yes' : 'No'}</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PortfolioCalculator;
