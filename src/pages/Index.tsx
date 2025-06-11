import React from "react";
import WalletConnect from "@/components/WalletConnect";
import { Button } from "@/components/ui/button";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
            Portfolio Tracker
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Track your crypto portfolio across multiple wallets and exchanges
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <WalletConnect />
            <Button 
              onClick={() => window.location.href = '/connect-exchange'}
              variant="outline"
              className="px-8 py-3 text-lg"
            >
              Connect Exchange
            </Button>
          </div>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Wallet Balances
            </h2>
            <p className="text-gray-600">
              View your combined wallet balances across different chains.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Exchange Balances
            </h2>
            <p className="text-gray-600">
              See your balances on connected exchanges like Binance, Coinbase,
              and Kraken.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Portfolio Allocation
            </h2>
            <p className="text-gray-600">
              Analyze your portfolio allocation by asset and platform.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Transaction History
            </h2>
            <p className="text-gray-600">
              Review your transaction history across all connected accounts.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Performance Metrics
            </h2>
            <p className="text-gray-600">
              Track your portfolio's performance over time with detailed
              metrics.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
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
