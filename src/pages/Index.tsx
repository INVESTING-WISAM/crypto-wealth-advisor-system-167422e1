
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, TrendingUp, Wallet, Shield, Bell, Video, Signal, Crown } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import UserAuth from "@/components/UserAuth";
import PortfolioCalculator from "@/components/PortfolioCalculator";
import PortfolioDisplay from "@/components/PortfolioDisplay";
import InvestmentTracker from "@/components/InvestmentTracker";
import TradingWallet from "@/components/TradingWallet";
import ContentCreator from "@/components/ContentCreator";
import SignalsChannel from "@/components/SignalsChannel";
import WalletConnect from "@/components/WalletConnect";
import { useAdminAccess } from "@/hooks/useAdminAccess";

const Index = () => {
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [portfolioData, setPortfolioData] = useState<any>(null);
  const { isAdmin } = useAdminAccess(currentUser);

  useEffect(() => {
    // Check if user is logged in
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setCurrentUser(savedUser);
      // Load user's portfolio data
      const savedPortfolio = localStorage.getItem(`portfolio_${savedUser}`);
      if (savedPortfolio) {
        setPortfolioData(JSON.parse(savedPortfolio));
      }
    }
  }, []);

  const handleLogin = (username: string) => {
    setCurrentUser(username);
    localStorage.setItem('currentUser', username);
    toast.success(`Welcome back, ${username}!`);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setPortfolioData(null);
    localStorage.removeItem('currentUser');
    toast.info("Logged out successfully");
  };

  const handlePortfolioUpdate = (data: any) => {
    setPortfolioData(data);
    if (currentUser) {
      localStorage.setItem(`portfolio_${currentUser}`, JSON.stringify(data));
      toast.success("Portfolio updated successfully!");
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md animate-fade-in">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 gradient-primary rounded-2xl mb-6 shadow-xl">
              <Wallet className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3">
              CryptoPortfolio Pro
            </h1>
            <p className="text-gray-600 text-lg">Advanced Cryptocurrency Portfolio Management System</p>
          </div>
          <div className="card-enhanced p-8">
            <UserAuth onLogin={handleLogin} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <header className="header-professional text-white shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mr-4">
                <Wallet className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">CryptoPortfolio Pro</h1>
                <p className="text-white/80 text-sm">Professional Trading Platform</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {isAdmin && (
                <Badge className="bg-yellow-500 text-white px-3 py-1">
                  <Crown className="w-4 h-4 mr-1" />
                  Admin
                </Badge>
              )}
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30 px-4 py-2">
                {currentUser}
              </Badge>
              <Button 
                variant="outline" 
                onClick={handleLogout}
                className="bg-white/20 border-white/30 text-white hover:bg-white/30"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-slide-up">
        <div className="tabs-modern">
          <Tabs defaultValue="calculator" className="space-y-8">
            <div className="bg-white rounded-xl shadow-lg p-2">
              <TabsList className="grid w-full grid-cols-8 bg-gray-50 rounded-lg p-1">
                <TabsTrigger value="calculator" className="tab-trigger-modern flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4" />
                  <span className="hidden sm:inline">Calculator</span>
                </TabsTrigger>
                <TabsTrigger value="portfolio" className="tab-trigger-modern flex items-center space-x-2">
                  <Wallet className="w-4 h-4" />
                  <span className="hidden sm:inline">Portfolio</span>
                </TabsTrigger>
                <TabsTrigger value="tracker" className="tab-trigger-modern flex items-center space-x-2">
                  <Shield className="w-4 h-4" />
                  <span className="hidden sm:inline">Tracker</span>
                </TabsTrigger>
                <TabsTrigger value="trading" className="tab-trigger-modern flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4" />
                  <span className="hidden sm:inline">Trading</span>
                </TabsTrigger>
                <TabsTrigger value="wallets" className="tab-trigger-modern flex items-center space-x-2">
                  <Wallet className="w-4 h-4" />
                  <span className="hidden sm:inline">Wallets</span>
                </TabsTrigger>
                <TabsTrigger value="content" className="tab-trigger-modern flex items-center space-x-2">
                  <Video className="w-4 h-4" />
                  <span className="hidden sm:inline">Education</span>
                </TabsTrigger>
                <TabsTrigger value="signals" className="tab-trigger-modern flex items-center space-x-2">
                  <Signal className="w-4 h-4" />
                  <span className="hidden sm:inline">Signals</span>
                </TabsTrigger>
                <TabsTrigger value="notifications" className="tab-trigger-modern flex items-center space-x-2">
                  <Bell className="w-4 h-4" />
                  <span className="hidden sm:inline">Alerts</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="calculator" className="animate-fade-in">
              <PortfolioCalculator 
                onPortfolioUpdate={handlePortfolioUpdate}
                currentUser={currentUser}
              />
            </TabsContent>

            <TabsContent value="portfolio" className="animate-fade-in">
              <PortfolioDisplay portfolioData={portfolioData} />
            </TabsContent>

            <TabsContent value="tracker" className="animate-fade-in">
              <InvestmentTracker 
                portfolioData={portfolioData}
                currentUser={currentUser}
              />
            </TabsContent>

            <TabsContent value="trading" className="animate-fade-in">
              <TradingWallet 
                portfolioData={portfolioData}
                currentUser={currentUser}
              />
            </TabsContent>

            <TabsContent value="wallets" className="animate-fade-in">
              <WalletConnect currentUser={currentUser} />
            </TabsContent>

            <TabsContent value="content" className="animate-fade-in">
              <ContentCreator currentUser={currentUser} />
            </TabsContent>

            <TabsContent value="signals" className="animate-fade-in">
              <SignalsChannel currentUser={currentUser} />
            </TabsContent>

            <TabsContent value="notifications" className="animate-fade-in">
              <div className="card-enhanced">
                <Card className="border-0 shadow-none">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-2xl">
                      <Bell className="w-6 h-6 text-indigo-600" />
                      <span>Notifications & Alerts</span>
                    </CardTitle>
                    <CardDescription className="text-lg">
                      Track your investment plan compliance and receive alerts
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Alert className="status-info border-2">
                      <AlertCircle className="h-5 w-5" />
                      <AlertDescription className="text-base">
                        Notification system will alert you when you deviate from your investment plan or when market conditions change significantly.
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Index;
