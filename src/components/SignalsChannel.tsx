
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, TrendingDown, AlertCircle, Crown, Lock, Signal } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";

interface TradingSignal {
  id: string;
  token: string;
  type: 'buy' | 'sell' | 'hold';
  entryPrice: number;
  targetPrice: number;
  stopLoss: number;
  confidence: 'low' | 'medium' | 'high';
  timeframe: '1h' | '4h' | '1d' | '1w';
  reasoning: string;
  timestamp: string;
  status: 'active' | 'hit-tp' | 'hit-sl' | 'cancelled';
  performance?: number;
}

const SignalsChannel = ({ currentUser }: { currentUser: string }) => {
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
  const [signals, setSignals] = useState<TradingSignal[]>([
    {
      id: '1',
      token: 'BTC',
      type: 'buy',
      entryPrice: 43500,
      targetPrice: 48000,
      stopLoss: 41000,
      confidence: 'high',
      timeframe: '4h',
      reasoning: 'Strong support at 43k level, RSI oversold, bullish divergence forming',
      timestamp: '2024-01-25T10:30:00Z',
      status: 'active'
    },
    {
      id: '2',
      token: 'ETH',
      type: 'buy',
      entryPrice: 2850,
      targetPrice: 3200,
      stopLoss: 2700,
      confidence: 'medium',
      timeframe: '1d',
      reasoning: 'Breaking above key resistance, volume confirmation, positive ETF news',
      timestamp: '2024-01-25T08:15:00Z',
      status: 'hit-tp',
      performance: 12.3
    }
  ]);

  const [newSignal, setNewSignal] = useState({
    token: '',
    type: 'buy' as 'buy' | 'sell' | 'hold',
    entryPrice: '',
    targetPrice: '',
    stopLoss: '',
    confidence: 'medium' as 'low' | 'medium' | 'high',
    timeframe: '4h' as '1h' | '4h' | '1d' | '1w',
    reasoning: ''
  });

  useEffect(() => {
    // Check subscription status
    const subscription = localStorage.getItem(`signals_subscription_${currentUser}`);
    if (subscription) {
      const subData = JSON.parse(subscription);
      const now = new Date();
      const expiryDate = new Date(subData.expiryDate);
      setIsSubscribed(now < expiryDate);
    }
  }, [currentUser]);

  const handleSubscribe = () => {
    // Simulate payment processing
    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + 1); // 1 month subscription

    const subscriptionData = {
      userId: currentUser,
      subscriptionDate: new Date().toISOString(),
      expiryDate: expiryDate.toISOString(),
      amount: 5.00
    };

    localStorage.setItem(`signals_subscription_${currentUser}`, JSON.stringify(subscriptionData));
    setIsSubscribed(true);
    toast.success("Successfully subscribed to Premium Signals! $5/month");
  };

  const publishSignal = () => {
    if (!newSignal.token || !newSignal.entryPrice || !newSignal.reasoning) {
      toast.error("Please fill in all required fields");
      return;
    }

    const signal: TradingSignal = {
      id: Date.now().toString(),
      token: newSignal.token.toUpperCase(),
      type: newSignal.type,
      entryPrice: parseFloat(newSignal.entryPrice),
      targetPrice: parseFloat(newSignal.targetPrice),
      stopLoss: parseFloat(newSignal.stopLoss),
      confidence: newSignal.confidence,
      timeframe: newSignal.timeframe,
      reasoning: newSignal.reasoning,
      timestamp: new Date().toISOString(),
      status: 'active'
    };

    setSignals([signal, ...signals]);
    setNewSignal({
      token: '',
      type: 'buy',
      entryPrice: '',
      targetPrice: '',
      stopLoss: '',
      confidence: 'medium',
      timeframe: '4h',
      reasoning: ''
    });

    toast.success("Signal published successfully!");
  };

  const getSignalIcon = (type: string) => {
    switch (type) {
      case 'buy': return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'sell': return <TrendingDown className="w-4 h-4 text-red-600" />;
      default: return <AlertCircle className="w-4 h-4 text-yellow-600" />;
    }
  };

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'hit-tp': return 'bg-green-100 text-green-800';
      case 'hit-sl': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  if (!isSubscribed) {
    return (
      <div className="space-y-6">
        <Card className="border-2 border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mb-4">
              <Crown className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl">Premium Trading Signals</CardTitle>
            <CardDescription className="text-lg">
              Get professional trading signals with detailed analysis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-600 mb-2">$5/month</div>
              <p className="text-gray-600">Cancel anytime</p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Signal className="w-5 h-5 text-green-600" />
                <span>Daily professional trading signals</span>
              </div>
              <div className="flex items-center space-x-3">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <span>Entry, target, and stop-loss levels</span>
              </div>
              <div className="flex items-center space-x-3">
                <AlertCircle className="w-5 h-5 text-green-600" />
                <span>Detailed market analysis and reasoning</span>
              </div>
              <div className="flex items-center space-x-3">
                <Crown className="w-5 h-5 text-green-600" />
                <span>Performance tracking and statistics</span>
              </div>
            </div>

            <Button onClick={handleSubscribe} size="lg" className="w-full bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700">
              Subscribe Now - $5/month
            </Button>

            <div className="bg-yellow-50 p-4 rounded-lg">
              <h4 className="font-semibold text-yellow-800 mb-2">Preview - Latest Signal</h4>
              <div className="bg-white p-3 rounded border">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold">BTC</span>
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <Badge className="bg-green-100 text-green-800">BUY</Badge>
                  </div>
                  <Lock className="w-4 h-4 text-gray-400" />
                </div>
                <div className="text-sm text-gray-600">
                  <p>Entry: $••,•••</p>
                  <p>Target: $••,•••</p>
                  <p>Stop Loss: $••,•••</p>
                  <p className="mt-2 blur-sm">Strong support at key level, bullish momentum building...</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Subscription Status */}
      <Alert className="border-green-200 bg-green-50">
        <Crown className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          Premium Signals Active - Thank you for your subscription! 🎯
        </AlertDescription>
      </Alert>

      {/* Publish New Signal (Admin/Creator) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Signal className="w-5 h-5" />
            <span>Publish New Signal</span>
          </CardTitle>
          <CardDescription>Share professional trading signals with subscribers</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="signalToken">Token</Label>
              <Input
                id="signalToken"
                placeholder="BTC"
                value={newSignal.token}
                onChange={(e) => setNewSignal({ ...newSignal, token: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="signalType">Signal Type</Label>
              <Select value={newSignal.type} onValueChange={(value: any) => setNewSignal({ ...newSignal, type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="buy">Buy</SelectItem>
                  <SelectItem value="sell">Sell</SelectItem>
                  <SelectItem value="hold">Hold</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="confidence">Confidence</Label>
              <Select value={newSignal.confidence} onValueChange={(value: any) => setNewSignal({ ...newSignal, confidence: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="entryPrice">Entry Price</Label>
              <Input
                id="entryPrice"
                type="number"
                placeholder="43500"
                value={newSignal.entryPrice}
                onChange={(e) => setNewSignal({ ...newSignal, entryPrice: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="targetPrice">Target Price</Label>
              <Input
                id="targetPrice"
                type="number"
                placeholder="48000"
                value={newSignal.targetPrice}
                onChange={(e) => setNewSignal({ ...newSignal, targetPrice: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="stopLoss">Stop Loss</Label>
              <Input
                id="stopLoss"
                type="number"
                placeholder="41000"
                value={newSignal.stopLoss}
                onChange={(e) => setNewSignal({ ...newSignal, stopLoss: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="timeframe">Timeframe</Label>
              <Select value={newSignal.timeframe} onValueChange={(value: any) => setNewSignal({ ...newSignal, timeframe: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1h">1 Hour</SelectItem>
                  <SelectItem value="4h">4 Hours</SelectItem>
                  <SelectItem value="1d">1 Day</SelectItem>
                  <SelectItem value="1w">1 Week</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="reasoning">Analysis & Reasoning</Label>
            <Textarea
              id="reasoning"
              placeholder="Provide detailed analysis and reasoning for this signal..."
              value={newSignal.reasoning}
              onChange={(e) => setNewSignal({ ...newSignal, reasoning: e.target.value })}
              rows={3}
            />
          </div>

          <Button onClick={publishSignal} className="w-full">
            <Signal className="w-4 h-4 mr-2" />
            Publish Signal
          </Button>
        </CardContent>
      </Card>

      {/* Signals Feed */}
      <Card>
        <CardHeader>
          <CardTitle>Trading Signals Feed</CardTitle>
          <CardDescription>Professional trading signals with detailed analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {signals.map((signal) => (
              <Card key={signal.id} className="border-l-4 border-l-blue-500">
                <CardContent className="pt-4">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        {getSignalIcon(signal.type)}
                        <span className="font-bold text-lg">{signal.token}</span>
                      </div>
                      <Badge className={`${signal.type === 'buy' ? 'bg-green-100 text-green-800' : signal.type === 'sell' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {signal.type.toUpperCase()}
                      </Badge>
                      <Badge className={getConfidenceColor(signal.confidence)}>
                        {signal.confidence.toUpperCase()}
                      </Badge>
                      <Badge variant="outline">{signal.timeframe}</Badge>
                    </div>
                    <div className="text-right text-sm text-gray-500">
                      <div>{new Date(signal.timestamp).toLocaleDateString()}</div>
                      <div>{new Date(signal.timestamp).toLocaleTimeString()}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center p-3 bg-gray-50 rounded">
                      <div className="text-sm text-gray-600">Entry</div>
                      <div className="font-semibold">${signal.entryPrice.toLocaleString()}</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded">
                      <div className="text-sm text-gray-600">Target</div>
                      <div className="font-semibold text-green-600">${signal.targetPrice.toLocaleString()}</div>
                    </div>
                    <div className="text-center p-3 bg-red-50 rounded">
                      <div className="text-sm text-gray-600">Stop Loss</div>
                      <div className="font-semibold text-red-600">${signal.stopLoss.toLocaleString()}</div>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-3 rounded mb-3">
                    <div className="text-sm font-medium text-blue-800 mb-1">Analysis</div>
                    <p className="text-blue-700">{signal.reasoning}</p>
                  </div>

                  <div className="flex justify-between items-center">
                    <Badge className={getStatusColor(signal.status)}>
                      {signal.status.replace('-', ' ').toUpperCase()}
                    </Badge>
                    {signal.performance && (
                      <div className={`text-sm font-semibold ${signal.performance > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        Performance: {signal.performance > 0 ? '+' : ''}{signal.performance}%
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignalsChannel;
