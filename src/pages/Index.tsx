import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, TrendingUp, Wallet, Shield, Bell, Video, Signal } from "lucide-react";
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

const Index = () => {
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [portfolioData, setPortfolioData] = useState<any>(null);

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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-4">
              <Wallet className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">CryptoPortfolio Pro</h1>
            <p className="text-gray-600">Advanced Cryptocurrency Portfolio Management System</p>
          </div>
          <UserAuth onLogin={handleLogin} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Wallet className="w-8 h-8 text-blue-600 mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">CryptoPortfolio Pro</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="text-blue-600">
                {currentUser}
              </Badge>
              <Button variant="outline" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="calculator" className="space-y-6">
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="calculator" className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4" />
              <span>Portfolio Calculator</span>
            </TabsTrigger>
            <TabsTrigger value="portfolio" className="flex items-center space-x-2">
              <Wallet className="w-4 h-4" />
              <span>My Portfolio</span>
            </TabsTrigger>
            <TabsTrigger value="tracker" className="flex items-center space-x-2">
              <Shield className="w-4 h-4" />
              <span>Investment Tracker</span>
            </TabsTrigger>
            <TabsTrigger value="trading" className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4" />
              <span>Trading Wallet</span>
            </TabsTrigger>
            <TabsTrigger value="wallets" className="flex items-center space-x-2">
              <Wallet className="w-4 h-4" />
              <span>Connect Wallets</span>
            </TabsTrigger>
            <TabsTrigger value="content" className="flex items-center space-x-2">
              <Video className="w-4 h-4" />
              <span>Education</span>
            </TabsTrigger>
            <TabsTrigger value="signals" className="flex items-center space-x-2">
              <Signal className="w-4 h-4" />
              <span>Signals</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center space-x-2">
              <Bell className="w-4 h-4" />
              <span>Notifications</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="calculator">
            <PortfolioCalculator 
              onPortfolioUpdate={handlePortfolioUpdate}
              currentUser={currentUser}
            />
          </TabsContent>

          <TabsContent value="portfolio">
            <PortfolioDisplay portfolioData={portfolioData} />
          </TabsContent>

          <TabsContent value="tracker">
            <InvestmentTracker 
              portfolioData={portfolioData}
              currentUser={currentUser}
            />
          </TabsContent>

          <TabsContent value="trading">
            <TradingWallet 
              portfolioData={portfolioData}
              currentUser={currentUser}
            />
          </TabsContent>

          <TabsContent value="wallets">
            <WalletConnect currentUser={currentUser} />
          </TabsContent>

          <TabsContent value="content">
            <ContentCreator currentUser={currentUser} />
          </TabsContent>

          <TabsContent value="signals">
            <SignalsChannel currentUser={currentUser} />
          </TabsContent>

          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="w-5 h-5" />
                  <span>Notifications & Alerts</span>
                </CardTitle>
                <CardDescription>
                  Track your investment plan compliance and receive alerts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Notification system will alert you when you deviate from your investment plan or when market conditions change significantly.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
