
import React from 'react';
import SignalsChannel from '@/components/SignalsChannel';

const Signals = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Trading Signals</h1>
          <p className="text-gray-600">Professional trading signals and market analysis</p>
        </div>
        <SignalsChannel currentUser="demo-user" />
      </div>
    </div>
  );
};

export default Signals;
