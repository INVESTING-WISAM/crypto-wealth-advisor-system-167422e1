
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
    <div className="min-h-screen bg-white">
      {/* Navigation Bar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img 
                src="/lovable-uploads/c10ecf83-27c5-452f-ab68-4f73a28d22fb.png" 
                alt="Synfinia Trading" 
                className="h-10 w-auto"
              />
              <h1 className="text-2xl font-bold text-gray-900">
                Synfinia Trading Platform
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/signals">
                <Button variant="outline">Trading Signals</Button>
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

      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
            Professional Trading Platform
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Track your crypto portfolio across multiple wallets and exchanges
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => window.location.href = '/connect-exchange'}
              className="px-8 py-3 text-lg"
            >
              Connect Exchange
            </Button>
            <Link to="/signals">
              <Button variant="outline" className="px-8 py-3 text-lg">
                View Trading Signals
              </Button>
            </Link>
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

        {/* Main Feature Sections */}
        <section className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 mb-12">
          {/* Investment Planning */}
          <div className="bg-white border border-gray-200 rounded-lg p-8 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                <span className="text-2xl">📊</span>
              </div>
              <h2 className="text-2xl font-semibold text-gray-900">Investment Planning</h2>
            </div>
            <p className="text-gray-600 mb-6">
              Create personalized investment strategies based on your risk tolerance and financial goals.
            </p>
            <ul className="text-gray-500 space-y-2 text-sm mb-6">
              <li>• Risk assessment tools</li>
              <li>• Goal-based planning</li>
              <li>• Asset allocation strategies</li>
              <li>• Performance tracking</li>
            </ul>
            <Button className="w-full" variant="outline">
              Start Planning
            </Button>
          </div>

          {/* Trading Wallet */}
          <div className="bg-white border border-gray-200 rounded-lg p-8 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                <span className="text-2xl">💼</span>
              </div>
              <h2 className="text-2xl font-semibold text-gray-900">Trading Wallet</h2>
            </div>
            <p className="text-gray-600 mb-6">
              Secure wallet integration for seamless trading across multiple exchanges and platforms.
            </p>
            <ul className="text-gray-500 space-y-2 text-sm mb-6">
              <li>• Multi-wallet support</li>
              <li>• Real-time balances</li>
              <li>• Transaction history</li>
              <li>• Security features</li>
            </ul>
            <Button className="w-full" variant="outline">
              Connect Wallet
            </Button>
          </div>

          {/* Signals Channel */}
          <div className="bg-white border border-gray-200 rounded-lg p-8 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                <span className="text-2xl">📡</span>
              </div>
              <h2 className="text-2xl font-semibold text-gray-900">Trading Signals</h2>
            </div>
            <p className="text-gray-600 mb-6">
              Professional trading signals and market analysis from expert traders and AI algorithms.
            </p>
            <ul className="text-gray-500 space-y-2 text-sm mb-6">
              <li>• Real-time signals</li>
              <li>• Technical analysis</li>
              <li>• Risk management</li>
              <li>• Performance metrics</li>
            </ul>
            <Link to="/signals">
              <Button className="w-full" variant="outline">
                View Signals
              </Button>
            </Link>
          </div>

          {/* Content Creator */}
          <div className="bg-white border border-gray-200 rounded-lg p-8 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mr-4">
                <span className="text-2xl">🎨</span>
              </div>
              <h2 className="text-2xl font-semibold text-gray-900">Content Creator</h2>
            </div>
            <p className="text-gray-600 mb-6">
              Create and share trading content, educational materials, and market insights with the community.
            </p>
            <ul className="text-gray-500 space-y-2 text-sm mb-6">
              <li>• Content creation tools</li>
              <li>• Community sharing</li>
              <li>• Educational resources</li>
              <li>• Monetization options</li>
            </ul>
            <Button className="w-full" variant="outline">
              Create Content
            </Button>
          </div>

          {/* Category Manager */}
          <div className="bg-white border border-gray-200 rounded-lg p-8 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mr-4">
                <span className="text-2xl">📂</span>
              </div>
              <h2 className="text-2xl font-semibold text-gray-900">Category Manager</h2>
            </div>
            <p className="text-gray-600 mb-6">
              Organize and manage your trading strategies, portfolios, and investments by custom categories.
            </p>
            <ul className="text-gray-500 space-y-2 text-sm mb-6">
              <li>• Custom categories</li>
              <li>• Portfolio organization</li>
              <li>• Strategy grouping</li>
              <li>• Performance comparison</li>
            </ul>
            <Button className="w-full" variant="outline">
              Manage Categories
            </Button>
          </div>

          {/* Investment Tracker */}
          <div className="bg-white border border-gray-200 rounded-lg p-8 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mr-4">
                <span className="text-2xl">📈</span>
              </div>
              <h2 className="text-2xl font-semibold text-gray-900">Investment Tracker</h2>
            </div>
            <p className="text-gray-600 mb-6">
              Track your investments across all platforms with detailed analytics and performance insights.
            </p>
            <ul className="text-gray-500 space-y-2 text-sm mb-6">
              <li>• Multi-platform tracking</li>
              <li>• Performance analytics</li>
              <li>• Profit/loss calculations</li>
              <li>• Tax reporting</li>
            </ul>
            <Button className="w-full" variant="outline">
              Track Investments
            </Button>
          </div>
        </section>

        {/* Additional Feature Cards */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Wallet Balances
            </h2>
            <p className="text-gray-600">
              View your combined wallet balances across different chains.
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Exchange Balances
            </h2>
            <p className="text-gray-600">
              See your balances on connected exchanges like Binance, Coinbase,
              and Kraken.
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Portfolio Allocation
            </h2>
            <p className="text-gray-600">
              Analyze your portfolio allocation by asset and platform.
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Transaction History
            </h2>
            <p className="text-gray-600">
              Review your transaction history across all connected accounts.
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Performance Metrics
            </h2>
            <p className="text-gray-600">
              Track your portfolio's performance over time with detailed
              metrics.
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Alerts and Notifications
            </h2>
            <p className="text-gray-600">
              Set up custom alerts for price movements and portfolio changes.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Index;
