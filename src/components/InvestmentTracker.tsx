import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, CheckCircle, AlertTriangle, Calendar, Target, TrendingUp } from "lucide-react";
import { toast } from "sonner";

interface InvestmentTrackerProps {
  portfolioData: any;
  currentUser: string;
}

interface InvestmentProgress {
  weeksPassed: number;
  totalInvested: number;
  lastInvestment: string | null;
  targetReached: boolean;
  currentValue?: number;
  profitPercentage?: number;
  capitalWithdrawn?: boolean;
}

const InvestmentTracker: React.FC<InvestmentTrackerProps> = ({ portfolioData, currentUser }) => {
  const [investmentProgress, setInvestmentProgress] = useState<Record<string, InvestmentProgress>>({});
  const [notifications, setNotifications] = useState<any[]>([]);

  // Mock current prices for profit calculation
  const mockPrices: { [key: string]: number } = {
    BTC: 43500,
    ETH: 2650,
    SOL: 98,
    CORE: 1.25,
    ADA: 0.52,
    DOT: 7.85,
    LINK: 15.40,
    UNI: 6.80
  };

  useEffect(() => {
    if (portfolioData && currentUser) {
      loadInvestmentProgress();
      checkCompliance();
    }
  }, [portfolioData, currentUser]);

  const loadInvestmentProgress = () => {
    const savedProgress = localStorage.getItem(`investment_progress_${currentUser}`);
    if (savedProgress) {
      setInvestmentProgress(JSON.parse(savedProgress));
    } else {
      // Initialize progress tracking
      const initialProgress: Record<string, InvestmentProgress> = {};
      if (portfolioData?.allocation) {
        Object.keys(portfolioData.allocation).forEach(token => {
          initialProgress[token] = {
            weeksPassed: 0,
            totalInvested: 0,
            lastInvestment: null,
            targetReached: false,
            currentValue: 0,
            profitPercentage: 0,
            capitalWithdrawn: false
          };
        });
        setInvestmentProgress(initialProgress);
        saveInvestmentProgress(initialProgress);
      }
    }
  };

  const saveInvestmentProgress = (progress: Record<string, InvestmentProgress>) => {
    localStorage.setItem(`investment_progress_${currentUser}`, JSON.stringify(progress));
  };

  const checkCompliance = () => {
    if (!portfolioData?.allocation) return;

    const newNotifications: any[] = [];
    const currentDate = new Date();
    const portfolioCreatedDate = new Date(portfolioData.createdAt);
    const weeksSinceCreation = Math.floor((currentDate.getTime() - portfolioCreatedDate.getTime()) / (1000 * 60 * 60 * 24 * 7));

    Object.entries(portfolioData.allocation).forEach(([token, details]: [string, any]) => {
      const progress = investmentProgress[token];
      if (!progress) return;

      const expectedWeeks = Math.min(weeksSinceCreation, details.weeks);
      const expectedInvestment = (details.amount / details.weeks) * expectedWeeks;
      const actualInvestment = progress.totalInvested;
      const compliance = expectedInvestment > 0 ? (actualInvestment / expectedInvestment) * 100 : 0;

      if (compliance < 80) {
        newNotifications.push({
          type: 'warning',
          token,
          message: `${token} investment is ${compliance.toFixed(1)}% of target. Consider catching up.`,
          compliance
        });
      } else if (compliance > 120) {
        newNotifications.push({
          type: 'info',
          token,
          message: `${token} investment is ahead of schedule (${compliance.toFixed(1)}% of target).`,
          compliance
        });
      }

      // Check for missed weeks
      const daysSinceLastInvestment = progress.lastInvestment ? 
        Math.floor((currentDate.getTime() - new Date(progress.lastInvestment).getTime()) / (1000 * 60 * 60 * 24)) : 0;
      
      if (daysSinceLastInvestment > 10 && progress.weeksPassed < details.weeks) {
        newNotifications.push({
          type: 'alert',
          token,
          message: `No ${token} investment recorded for ${daysSinceLastInvestment} days. Stay on track!`,
          compliance
        });
      }

      // Check for 100% profit milestone
      if (progress.profitPercentage && progress.profitPercentage >= 100 && !progress.capitalWithdrawn) {
        newNotifications.push({
          type: 'success',
          token,
          message: `🎉 ${token} has reached 100% profit! You can now withdraw your initial capital.`,
          compliance
        });
      }
    });

    setNotifications(newNotifications);
  };

  const calculateCurrentValue = (token: string, totalInvested: number): number => {
    const tokenDetails = portfolioData.allocation[token];
    if (!tokenDetails) return totalInvested;
    
    const currentPrice = mockPrices[token] || 1;
    const averageBuyPrice = currentPrice * 0.85; // Assume average buy price is 15% lower
    const tokensOwned = totalInvested / averageBuyPrice;
    return tokensOwned * currentPrice;
  };

  const recordInvestment = (token: string, amount: number) => {
    const updatedProgress = { ...investmentProgress };
    if (!updatedProgress[token]) {
      updatedProgress[token] = {
        weeksPassed: 0,
        totalInvested: 0,
        lastInvestment: null,
        targetReached: false,
        currentValue: 0,
        profitPercentage: 0,
        capitalWithdrawn: false
      };
    }

    updatedProgress[token].totalInvested += amount;
    updatedProgress[token].lastInvestment = new Date().toISOString();
    updatedProgress[token].weeksPassed += 1;

    // Calculate current value and profit percentage
    const currentValue = calculateCurrentValue(token, updatedProgress[token].totalInvested);
    updatedProgress[token].currentValue = currentValue;
    updatedProgress[token].profitPercentage = updatedProgress[token].totalInvested > 0 ? 
      ((currentValue - updatedProgress[token].totalInvested) / updatedProgress[token].totalInvested) * 100 : 0;

    const tokenDetails = portfolioData.allocation[token];
    if (updatedProgress[token].totalInvested >= tokenDetails.amount) {
      updatedProgress[token].targetReached = true;
      toast.success(`🎉 ${token} investment target reached!`);
    }

    // Check for 100% profit milestone
    if (updatedProgress[token].profitPercentage && updatedProgress[token].profitPercentage >= 100) {
      toast.success(`🚀 ${token} has reached 100% profit! Consider withdrawing your capital.`);
    }

    setInvestmentProgress(updatedProgress);
    saveInvestmentProgress(updatedProgress);
    checkCompliance();
    toast.success(`Investment of $${amount} recorded for ${token}`);
  };

  const withdrawCapital = (token: string) => {
    const updatedProgress = { ...investmentProgress };
    if (updatedProgress[token] && updatedProgress[token].profitPercentage && updatedProgress[token].profitPercentage >= 100) {
      updatedProgress[token].capitalWithdrawn = true;
      setInvestmentProgress(updatedProgress);
      saveInvestmentProgress(updatedProgress);
      toast.success(`🎉 Capital withdrawn from ${token}! Let your profits ride.`);
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

  const calculateOverallProgress = () => {
    if (!portfolioData?.allocation) return 0;
    
    const totalTarget = Object.values(portfolioData.allocation).reduce((sum: number, details: any) => sum + details.amount, 0);
    const totalInvested = Object.values(investmentProgress).reduce((sum: number, progress: InvestmentProgress) => sum + (progress?.totalInvested || 0), 0);
    
    return totalTarget > 0 ? (totalInvested / totalTarget) * 100 : 0;
  };

  const calculateOverallProfit = () => {
    const totalInvested = Object.values(investmentProgress).reduce((sum: number, progress: InvestmentProgress) => sum + (progress?.totalInvested || 0), 0);
    const totalCurrentValue = Object.values(investmentProgress).reduce((sum: number, progress: InvestmentProgress) => sum + (progress?.currentValue || 0), 0);
    
    return totalInvested > 0 ? ((totalCurrentValue - totalInvested) / totalInvested) * 100 : 0;
  };

  if (!portfolioData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="w-5 h-5" />
            <span>Investment Tracker</span>
          </CardTitle>
          <CardDescription>
            No portfolio data available. Please calculate your portfolio first.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const overallProgress = calculateOverallProgress();
  const overallProfit = calculateOverallProfit();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="w-5 h-5" />
            <span>Investment Plan Compliance</span>
          </CardTitle>
          <CardDescription>
            Track your dollar-cost averaging progress and stay on target
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Investment Progress</span>
                <span className="text-sm text-gray-600">{overallProgress.toFixed(1)}%</span>
              </div>
              <Progress value={overallProgress} className="h-3" />
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Overall Profit</span>
                <span className={`text-sm font-bold ${overallProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {overallProfit >= 0 ? '+' : ''}{overallProfit.toFixed(1)}%
                </span>
              </div>
              <Progress value={Math.min(Math.max(overallProfit, 0), 200)} className="h-3" />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {Object.entries(portfolioData.allocation).map(([token, details]: [string, any]) => {
              const progress = investmentProgress[token] || {
                weeksPassed: 0,
                totalInvested: 0,
                lastInvestment: null,
                targetReached: false,
                currentValue: 0,
                profitPercentage: 0,
                capitalWithdrawn: false
              };

              const progressPercentage = (progress.totalInvested / details.amount) * 100;
              const weeklyTarget = details.amount / details.weeks;
              const remainingAmount = details.amount - progress.totalInvested;
              const remainingWeeks = details.weeks - progress.weeksPassed;
              const profitPercentage = progress.profitPercentage || 0;

              return (
                <div key={token} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Badge variant={progress.targetReached ? "default" : "outline"}>
                        {token}
                      </Badge>
                      {progress.targetReached && <CheckCircle className="w-4 h-4 text-green-600" />}
                      {profitPercentage >= 100 && (
                        <Badge variant="default" className="bg-green-600">
                          100%+ Profit!
                        </Badge>
                      )}
                      {progress.capitalWithdrawn && (
                        <Badge variant="outline" className="border-green-600 text-green-600">
                          Capital Withdrawn
                        </Badge>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        onClick={() => recordInvestment(token, weeklyTarget)}
                        disabled={progress.targetReached}
                      >
                        Record Investment
                      </Button>
                      {profitPercentage >= 100 && !progress.capitalWithdrawn && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="border-green-600 text-green-600 hover:bg-green-50"
                          onClick={() => withdrawCapital(token)}
                        >
                          <TrendingUp className="w-4 h-4 mr-1" />
                          Withdraw Capital
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress: {formatCurrency(progress.totalInvested)} / {formatCurrency(details.amount)}</span>
                      <span>{progressPercentage.toFixed(1)}%</span>
                    </div>
                    <Progress value={Math.min(progressPercentage, 100)} className="h-2" />
                    
                    {progress.currentValue && progress.currentValue > 0 && (
                      <div className="flex justify-between text-sm">
                        <span>Current Value: {formatCurrency(progress.currentValue)}</span>
                        <span className={`font-bold ${profitPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {profitPercentage >= 0 ? '+' : ''}{profitPercentage.toFixed(1)}%
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Weekly Target</p>
                      <p className="font-medium">{formatCurrency(weeklyTarget)}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Weeks Completed</p>
                      <p className="font-medium">{progress.weeksPassed} / {details.weeks}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Remaining Amount</p>
                      <p className="font-medium">{formatCurrency(Math.max(0, remainingAmount))}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Remaining Weeks</p>
                      <p className="font-medium">{Math.max(0, remainingWeeks)}</p>
                    </div>
                  </div>

                  {progress.lastInvestment && (
                    <div className="text-xs text-gray-500">
                      Last investment: {new Date(progress.lastInvestment).toLocaleDateString()}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {notifications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5" />
              <span>Compliance Alerts</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {notifications.map((notification, index) => (
              <Alert key={index} className={
                notification.type === 'warning' ? 'border-yellow-200 bg-yellow-50' :
                notification.type === 'alert' ? 'border-red-200 bg-red-50' :
                notification.type === 'success' ? 'border-green-200 bg-green-50' :
                'border-blue-200 bg-blue-50'
              }>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>{notification.token}:</strong> {notification.message}
                </AlertDescription>
              </Alert>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="w-5 h-5" />
            <span>Investment Schedule</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-600 space-y-2">
            <p>• <strong>BTC:</strong> Invest weekly for 60 weeks (1.15 years)</p>
            <p>• <strong>ETH/SOL:</strong> Invest weekly for 65 weeks (1.25 years)</p>
            <p>• <strong>CORE:</strong> Invest weekly for 70 weeks (1.35 years)</p>
            <p>• <strong>Top-30 tokens:</strong> Invest weekly for 85 weeks (1.63 years)</p>
            <p>• <strong>High-risk tokens:</strong> Invest weekly for 100 weeks (1.92 years)</p>
            <p className="mt-4 p-2 bg-green-50 border border-green-200 rounded">
              <strong>💡 Pro Tip:</strong> Once any token reaches 100% profit, you can withdraw your initial capital and let the profits continue growing!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InvestmentTracker;
