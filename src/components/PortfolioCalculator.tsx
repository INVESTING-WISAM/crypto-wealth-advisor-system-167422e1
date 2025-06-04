
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Calculator, TrendingUp, AlertTriangle } from "lucide-react";
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

  const calculateTokenAllocation = () => {
    if (capital < 500) {
      toast.error("Minimum capital requirement is $500");
      return null;
    }

    let maxTokens = 0;
    let allocation: any = {};

    // Calculate maximum number of tokens based on capital
    if (capital >= 500 && capital <= 2000) {
      maxTokens = 4; // BTC, ETH, and two others
    } else if (capital <= 10000) {
      maxTokens = 4 + Math.floor((capital - 2000) / 1000);
    } else if (capital <= 20000) {
      maxTokens = 12 + Math.floor((capital - 10000) / 2000); // 12 from previous calculation
    } else if (capital <= 39000) {
      maxTokens = 17 + Math.floor((capital - 20000) / 3000); // 17 from previous calculation
    } else {
      maxTokens = 23; // Maximum calculated from previous formulas
    }

    // Special allocation for wallets above $50,000
    if (capital >= 50000) {
      if (isAltcoinSeason) {
        // Skip BTC allocation in altcoin season, use only top-30 tokens
        allocation = {
          ETH: { percentage: 20, amount: capital * 0.20, weeks: 65 },
          CORE: { percentage: 15, amount: capital * 0.15, weeks: 70 },
          SOL: { percentage: 15, amount: capital * 0.15, weeks: 65 },
          "Top-30 Tokens": { percentage: 40, amount: capital * 0.40, weeks: 85 },
          "High-Risk Tokens": { percentage: 10, amount: capital * 0.10, weeks: 100 }
        };
      } else {
        allocation = {
          BTC: { percentage: 30, amount: capital * 0.30, weeks: 60 },
          ETH: { percentage: 10, amount: capital * 0.10, weeks: 65 },
          CORE: { percentage: 10, amount: capital * 0.10, weeks: 70 },
          SOL: { percentage: 10, amount: capital * 0.10, weeks: 65 },
          "Medium-Risk Tokens": { percentage: 30, amount: capital * 0.30, weeks: 85 },
          "High-Risk Tokens": { percentage: 10, amount: capital * 0.10, weeks: 100 }
        };
      }

      if (participateInAirdrop) {
        // Adjust for airdrop participation
        const airdropAllocation = capital * 0.05; // 5% for airdrops
        allocation["Airdrop/Presale"] = { 
          percentage: 5, 
          amount: airdropAllocation, 
          weeks: 100 
        };
        // Reduce other allocations proportionally
        Object.keys(allocation).forEach(key => {
          if (key !== "Airdrop/Presale") {
            allocation[key].amount *= 0.95;
            allocation[key].percentage *= 0.95;
          }
        });
      }
    } else {
      // For smaller portfolios, use simpler allocation
      const baseTokens = ["BTC", "ETH"];
      const additionalTokens = ["SOL", "CORE", "ADA", "DOT", "LINK", "UNI"];
      
      let tokens = [...baseTokens];
      const remainingSlots = maxTokens - 2;
      
      for (let i = 0; i < remainingSlots && i < additionalTokens.length; i++) {
        tokens.push(additionalTokens[i]);
      }

      // Equal allocation for smaller portfolios
      const percentagePerToken = 100 / tokens.length;
      tokens.forEach(token => {
        const weeks = token === "BTC" ? 60 : 
                     token === "ETH" || token === "SOL" ? 65 :
                     token === "CORE" ? 70 :
                     maxTokens <= 4 ? 85 : 100;
        
        allocation[token] = {
          percentage: percentagePerToken,
          amount: capital * (percentagePerToken / 100),
          weeks: weeks
        };
      });
    }

    return {
      capital,
      maxTokens,
      allocation,
      marketCondition,
      isAltcoinSeason,
      participateInAirdrop,
      createdAt: new Date().toISOString()
    };
  };

  const handleCalculate = () => {
    if (!marketCondition) {
      toast.error("Please select market conditions");
      return;
    }

    const portfolio = calculateTokenAllocation();
    if (portfolio) {
      setCalculatedPortfolio(portfolio);
      onPortfolioUpdate(portfolio);
      toast.success("Portfolio calculated successfully!");
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calculator className="w-5 h-5" />
            <span>Portfolio Allocation Calculator</span>
          </CardTitle>
          <CardDescription>
            Enter your investment capital and market conditions to generate your personalized crypto portfolio
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="capital">Investment Capital ($)</Label>
              <Input
                id="capital"
                type="number"
                placeholder="Enter your capital (minimum $500)"
                value={capital || ''}
                onChange={(e) => setCapital(Number(e.target.value))}
                min="500"
              />
              {capital > 0 && capital < 500 && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Minimum capital requirement is $500
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <div className="space-y-2">
              <Label>Market Conditions</Label>
              <Select value={marketCondition} onValueChange={setMarketCondition}>
                <SelectTrigger>
                  <SelectValue placeholder="Select market condition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bull">Bull Market</SelectItem>
                  <SelectItem value="bear">Bear Market</SelectItem>
                  <SelectItem value="sideways">Sideways/Consolidation</SelectItem>
                  <SelectItem value="volatile">High Volatility</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="altcoin-season"
                checked={isAltcoinSeason}
                onCheckedChange={(checked) => setIsAltcoinSeason(checked as boolean)}
              />
              <Label htmlFor="altcoin-season">
                Altcoin Season (Skip BTC allocation for portfolios > $50k)
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="participate-airdrop"
                checked={participateInAirdrop}
                onCheckedChange={(checked) => setParticipateInAirdrop(checked as boolean)}
              />
              <Label htmlFor="participate-airdrop">
                Participate in Telegram Airdrops/Presales (High-risk allocation)
              </Label>
            </div>
          </div>

          <Button onClick={handleCalculate} className="w-full">
            Calculate Portfolio Allocation
          </Button>
        </CardContent>
      </Card>

      {calculatedPortfolio && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5" />
              <span>Your Calculated Portfolio</span>
            </CardTitle>
            <CardDescription>
              Based on capital of {formatCurrency(calculatedPortfolio.capital)} - Maximum {calculatedPortfolio.maxTokens} tokens
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(calculatedPortfolio.allocation).map(([token, details]: [string, any]) => (
                <div key={token} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Badge variant="outline">{token}</Badge>
                    <div>
                      <p className="font-medium">{details.percentage.toFixed(1)}%</p>
                      <p className="text-sm text-gray-600">{formatCurrency(details.amount)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">DCA Strategy</p>
                    <p className="text-sm text-gray-600">{details.weeks} weeks</p>
                    <p className="text-xs text-gray-500">
                      {formatCurrency(details.amount / details.weeks)}/week
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Investment Strategy Summary</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Market Condition: {calculatedPortfolio.marketCondition}</li>
                <li>• Altcoin Season: {calculatedPortfolio.isAltcoinSeason ? 'Yes' : 'No'}</li>
                <li>• Airdrop Participation: {calculatedPortfolio.participateInAirdrop ? 'Yes' : 'No'}</li>
                <li>• Total Investment Period: Up to 100 weeks (depending on token)</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PortfolioCalculator;
