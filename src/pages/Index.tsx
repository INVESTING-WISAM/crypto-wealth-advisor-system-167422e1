
import React, { useState } from "react";
import WalletConnect from "@/components/WalletConnect";
import PortfolioCalculator from "@/components/PortfolioCalculator";
import PortfolioDisplay from "@/components/PortfolioDisplay";
import { Button } from "@/components/ui/button";
import { useExchangeConnection } from "@/hooks/useExchangeConnection";
import { Badge } from "@/components/ui/badge";

const Index = () => {
  const [portfolioData, setPortfolioData] = useState(null);
  const { connection, isConnected } = useExchangeConnection();

  const handlePortfolioUpdate = (data: any) => {
    setPortfolioData(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-orange-500">
      {/* Navigation Bar */}
      <nav className="bg-white/10 backdrop-blur-md border-b border-white/20 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img 
                src="/lovable-uploads/c10ecf83-27c5-452f-ab68-4f73a28d22fb.png" 
                alt="Synfinia Trading" 
                className="h-10 w-auto"
              />
              <h1 className="text-2xl font-bold text-white">
                Portfolio Tracker
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              {isConnected && (
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  {connection?.exchange} Connected
                </Badge>
              )}
              <WalletConnect />
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-4">
            Professional Trading Platform
          </h2>
          <p className="text-xl text-white/80 mb-8">
            Track your crypto portfolio across multiple wallets and exchanges
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => window.location.href = '/connect-exchange'}
              className="glass-effect px-8 py-3 text-lg bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-700 hover:to-orange-600 text-white border-0 rounded-2xl transition-all duration-300 hover:scale-105"
            >
              Connect Exchange
            </Button>
          </div>
        </header>

        {/* Portfolio Calculator Section */}
        <div className="mb-12">
          <PortfolioCalculator 
            onPortfolioUpdate={handlePortfolioUpdate}
            currentUser="demo-user"
          />
        </div>

        {/* Portfolio Display Section */}
        {portfolioData && (
          <div className="mb-12">
            <PortfolioDisplay portfolioData={portfolioData} />
          </div>
        )}

        {/* Feature Cards */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="card-enhanced glass-effect bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300">
            <h2 className="text-2xl font-semibold text-white mb-4">
              Wallet Balances
            </h2>
            <p className="text-white/70">
              View your combined wallet balances across different chains.
            </p>
          </div>

          <div className="card-enhanced glass-effect bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300">
            <h2 className="text-2xl font-semibold text-white mb-4">
              Exchange Balances
            </h2>
            <p className="text-white/70">
              See your balances on connected exchanges like Binance, Coinbase,
              and Kraken.
            </p>
          </div>

          <div className="card-enhanced glass-effect bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300">
            <h2 className="text-2xl font-semibold text-white mb-4">
              Portfolio Allocation
            </h2>
            <p className="text-white/70">
              Analyze your portfolio allocation by asset and platform.
            </p>
          </div>

          <div className="card-enhanced glass-effect bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300">
            <h2 className="text-2xl font-semibold text-white mb-4">
              Transaction History
            </h2>
            <p className="text-white/70">
              Review your transaction history across all connected accounts.
            </p>
          </div>

          <div className="card-enhanced glass-effect bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300">
            <h2 className="text-2xl font-semibold text-white mb-4">
              Performance Metrics
            </h2>
            <p className="text-white/70">
              Track your portfolio's performance over time with detailed
              metrics.
            </p>
          </div>

          <div className="card-enhanced glass-effect bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300">
            <h2 className="text-2xl font-semibold text-white mb-4">
              Alerts and Notifications
            </h2>
            <p className="text-white/70">
              Set up custom alerts for price movements and portfolio changes.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Index;
