
import React, { useState } from "react";
import { Link } from "react-router-dom";
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
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-800 relative overflow-x-hidden">
      {/* Navigation Bar */}
      <nav className="bg-white/10 backdrop-blur-md border-b border-white/20 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">💼</span>
              </div>
              <h1 className="text-2xl font-bold text-white">
                CryptoPortfolio Pro
              </h1>
              <span className="text-sm text-purple-200">Professional Trading Platform</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/signals">
                <Button variant="outline" className="bg-white/20 text-white border-white/30 hover:bg-white/30">
                  Signals
                </Button>
              </Link>
              {isConnected && (
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  {connection?.exchange} Connected
                </Badge>
              )}
              <WalletConnect currentUser="demo-user" />
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 relative z-10 max-w-7xl">
        <header className="text-center mb-12">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-4">
            Advanced Cryptocurrency Portfolio Management System
          </h2>
          <p className="text-xl text-purple-100 mb-8">
            Sign in to access your personalized crypto portfolio management system
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => window.location.href = '/connect-exchange'}
              className="px-8 py-3 text-lg bg-white/20 backdrop-blur-sm text-white border border-white/30 hover:bg-white/30"
            >
              Connect Exchange
            </Button>
            <Link to="/signals">
              <Button variant="outline" className="px-8 py-3 text-lg bg-white/10 text-white border-white/30 hover:bg-white/20">
                View Trading Signals
              </Button>
            </Link>
          </div>
        </header>

        {/* Portfolio Calculator Section */}
        <div className="mb-12 bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
          <PortfolioCalculator 
            onPortfolioUpdate={handlePortfolioUpdate}
            currentUser="demo-user"
          />
        </div>

        {/* Portfolio Display Section */}
        {portfolioData && (
          <div className="mb-12 bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
            <PortfolioDisplay portfolioData={portfolioData} />
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-white/10 backdrop-blur-md rounded-full p-2 border border-white/20">
            <div className="flex space-x-2 overflow-x-auto">
              <Button className="bg-purple-600 text-white rounded-full px-6 py-2 whitespace-nowrap">Calculator</Button>
              <Button variant="ghost" className="text-white hover:bg-white/20 rounded-full px-6 py-2 whitespace-nowrap">Portfolio</Button>
              <Button variant="ghost" className="text-white hover:bg-white/20 rounded-full px-6 py-2 whitespace-nowrap">Tracker</Button>
              <Button variant="ghost" className="text-white hover:bg-white/20 rounded-full px-6 py-2 whitespace-nowrap">Trading</Button>
              <Button variant="ghost" className="text-white hover:bg-white/20 rounded-full px-6 py-2 whitespace-nowrap">Wallets</Button>
              <Button variant="ghost" className="text-white hover:bg-white/20 rounded-full px-6 py-2 whitespace-nowrap">Education</Button>
              <Link to="/signals">
                <Button variant="ghost" className="text-white hover:bg-white/20 rounded-full px-6 py-2 whitespace-nowrap">Signals</Button>
              </Link>
              <Button variant="ghost" className="text-white hover:bg-white/20 rounded-full px-6 py-2 whitespace-nowrap">Alerts</Button>
            </div>
          </div>
        </div>

        {/* Main Feature Sections */}
        <section className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 mb-12">
          {/* Investment Planning */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 hover:bg-white/20 transition-all duration-300">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                <span className="text-2xl">📊</span>
              </div>
              <h2 className="text-2xl font-semibold text-white">Investment Planning</h2>
            </div>
            <p className="text-purple-100 mb-6">
              Create personalized investment strategies based on your risk tolerance and financial goals.
            </p>
            <ul className="text-purple-200 space-y-2 text-sm mb-6">
              <li>• Risk assessment tools</li>
              <li>• Goal-based planning</li>
              <li>• Asset allocation strategies</li>
              <li>• Performance tracking</li>
            </ul>
            <Button className="w-full bg-white text-gray-900 hover:bg-gray-100 transition-colors duration-200 rounded-lg px-4 py-2 font-medium">
              Start Planning
            </Button>
          </div>

          {/* Trading Wallet */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 hover:bg-white/20 transition-all duration-300">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                <span className="text-2xl">💼</span>
              </div>
              <h2 className="text-2xl font-semibold text-white">Trading Wallet</h2>
            </div>
            <p className="text-purple-100 mb-6">
              Secure wallet integration for seamless trading across multiple exchanges and platforms.
            </p>
            <ul className="text-purple-200 space-y-2 text-sm mb-6">
              <li>• Multi-wallet support</li>
              <li>• Real-time balances</li>
              <li>• Transaction history</li>
              <li>• Security features</li>
            </ul>
            <Button className="w-full bg-white text-gray-900 hover:bg-gray-100 transition-colors duration-200 rounded-lg px-4 py-2 font-medium">
              Connect Wallet
            </Button>
          </div>

          {/* Signals Channel */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 hover:bg-white/20 transition-all duration-300">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                <span className="text-2xl">📡</span>
              </div>
              <h2 className="text-2xl font-semibold text-white">Trading Signals</h2>
            </div>
            <p className="text-purple-100 mb-6">
              Professional trading signals and market analysis from expert traders and AI algorithms.
            </p>
            <ul className="text-purple-200 space-y-2 text-sm mb-6">
              <li>• Real-time signals</li>
              <li>• Technical analysis</li>
              <li>• Risk management</li>
              <li>• Performance metrics</li>
            </ul>
            <Link to="/signals">
              <Button className="w-full bg-white text-gray-900 hover:bg-gray-100 transition-colors duration-200 rounded-lg px-4 py-2 font-medium">
                View Signals
              </Button>
            </Link>
          </div>

          {/* Content Creator */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 hover:bg-white/20 transition-all duration-300">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mr-4">
                <span className="text-2xl">🎨</span>
              </div>
              <h2 className="text-2xl font-semibold text-white">Content Creator</h2>
            </div>
            <p className="text-purple-100 mb-6">
              Create and share trading content, educational materials, and market insights with the community.
            </p>
            <ul className="text-purple-200 space-y-2 text-sm mb-6">
              <li>• Content creation tools</li>
              <li>• Community sharing</li>
              <li>• Educational resources</li>
              <li>• Monetization options</li>
            </ul>
            <Button className="w-full bg-white text-gray-900 hover:bg-gray-100 transition-colors duration-200 rounded-lg px-4 py-2 font-medium">
              Create Content
            </Button>
          </div>

          {/* Category Manager */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 hover:bg-white/20 transition-all duration-300">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mr-4">
                <span className="text-2xl">📂</span>
              </div>
              <h2 className="text-2xl font-semibold text-white">Category Manager</h2>
            </div>
            <p className="text-purple-100 mb-6">
              Organize and manage your trading strategies, portfolios, and investments by custom categories.
            </p>
            <ul className="text-purple-200 space-y-2 text-sm mb-6">
              <li>• Custom categories</li>
              <li>• Portfolio organization</li>
              <li>• Strategy grouping</li>
              <li>• Performance comparison</li>
            </ul>
            <Button className="w-full bg-white text-gray-900 hover:bg-gray-100 transition-colors duration-200 rounded-lg px-4 py-2 font-medium">
              Manage Categories
            </Button>
          </div>

          {/* Investment Tracker */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 hover:bg-white/20 transition-all duration-300">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mr-4">
                <span className="text-2xl">📈</span>
              </div>
              <h2 className="text-2xl font-semibold text-white">Investment Tracker</h2>
            </div>
            <p className="text-purple-100 mb-6">
              Track your investments across all platforms with detailed analytics and performance insights.
            </p>
            <ul className="text-purple-200 space-y-2 text-sm mb-6">
              <li>• Multi-platform tracking</li>
              <li>• Performance analytics</li>
              <li>• Profit/loss calculations</li>
              <li>• Tax reporting</li>
            </ul>
            <Button className="w-full bg-white text-gray-900 hover:bg-gray-100 transition-colors duration-200 rounded-lg px-4 py-2 font-medium">
              Track Investments
            </Button>
          </div>
        </section>

        {/* Additional Feature Cards */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-12">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 hover:bg-white/20 transition-all duration-300">
            <h2 className="text-2xl font-semibold text-white mb-4">
              Wallet Balances
            </h2>
            <p className="text-purple-100 mb-4">
              View your combined wallet balances across different chains.
            </p>
            <Button className="w-full bg-white text-gray-900 hover:bg-gray-100 transition-colors duration-200 rounded-lg px-4 py-2 font-medium">
              View Balances
            </Button>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 hover:bg-white/20 transition-all duration-300">
            <h2 className="text-2xl font-semibold text-white mb-4">
              Exchange Balances
            </h2>
            <p className="text-purple-100 mb-4">
              See your balances on connected exchanges like Binance, Coinbase,
              and Kraken.
            </p>
            <Button className="w-full bg-white text-gray-900 hover:bg-gray-100 transition-colors duration-200 rounded-lg px-4 py-2 font-medium">
              Connect Exchange
            </Button>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 hover:bg-white/20 transition-all duration-300">
            <h2 className="text-2xl font-semibold text-white mb-4">
              Portfolio Allocation
            </h2>
            <p className="text-purple-100 mb-4">
              Analyze your portfolio allocation by asset and platform.
            </p>
            <Button className="w-full bg-white text-gray-900 hover:bg-gray-100 transition-colors duration-200 rounded-lg px-4 py-2 font-medium">
              Analyze Portfolio
            </Button>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 hover:bg-white/20 transition-all duration-300">
            <h2 className="text-2xl font-semibold text-white mb-4">
              Transaction History
            </h2>
            <p className="text-purple-100 mb-4">
              Review your transaction history across all connected accounts.
            </p>
            <Button className="w-full bg-white text-gray-900 hover:bg-gray-100 transition-colors duration-200 rounded-lg px-4 py-2 font-medium">
              View History
            </Button>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 hover:bg-white/20 transition-all duration-300">
            <h2 className="text-2xl font-semibold text-white mb-4">
              Performance Metrics
            </h2>
            <p className="text-purple-100 mb-4">
              Track your portfolio's performance over time with detailed
              metrics.
            </p>
            <Button className="w-full bg-white text-gray-900 hover:bg-gray-100 transition-colors duration-200 rounded-lg px-4 py-2 font-medium">
              View Metrics
            </Button>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 hover:bg-white/20 transition-all duration-300">
            <h2 className="text-2xl font-semibold text-white mb-4">
              Alerts and Notifications
            </h2>
            <p className="text-purple-100 mb-4">
              Set up custom alerts for price movements and portfolio changes.
            </p>
            <Button className="w-full bg-white text-gray-900 hover:bg-gray-100 transition-colors duration-200 rounded-lg px-4 py-2 font-medium">
              Setup Alerts
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Index;
