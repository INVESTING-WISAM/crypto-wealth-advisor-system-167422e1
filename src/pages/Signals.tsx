
import React from 'react';
import { useNavigate } from 'react-router-dom';
import SignalsChannel from '@/components/SignalsChannel';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const Signals = () => {
  const navigate = useNavigate();

  const handleBackToDashboard = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Trading Signals</h1>
              <p className="text-gray-600">Professional trading signals and market analysis</p>
            </div>
            <Button 
              onClick={handleBackToDashboard}
              variant="outline"
              className="bg-white text-gray-900 border-gray-300 hover:bg-gray-100 rounded-lg px-6 py-2 font-medium flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </Button>
          </div>
        </div>
        <SignalsChannel currentUser="demo-user" />
      </div>
    </div>
  );
};

export default Signals;
