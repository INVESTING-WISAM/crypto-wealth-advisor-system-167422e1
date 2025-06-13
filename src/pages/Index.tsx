import React, { useState } from "react";
import { Link } from "react-router-dom";
import WalletConnect from "@/components/WalletConnect";
import UserAuth from "@/components/UserAuth";
import PortfolioCalculator from "@/components/PortfolioCalculator";
import PortfolioDisplay from "@/components/PortfolioDisplay";
import TradingWallet from "@/components/TradingWallet";
import { Button } from "@/components/ui/button";
import { useExchangeConnection } from "@/hooks/useExchangeConnection";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart3, 
  TrendingUp, 
  Shield, 
  Users, 
  Globe, 
  Zap,
  ArrowRight,
  Check,
  Star,
  Wallet
} from "lucide-react";

const Index = () => {
  const [portfolioData, setPortfolioData] = useState(null);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [userPlan, setUserPlan] = useState<'basic' | 'professional' | 'enterprise'>('basic');
  const [activeService, setActiveService] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const { connection, isConnected } = useExchangeConnection();

  const handlePortfolioUpdate = (data: any) => {
    setPortfolioData(data);
  };

  const handleLogin = (username: string) => {
    setCurrentUser(username);
    // For demo purposes, assign plan based on username
    if (username.includes('pro')) setUserPlan('professional');
    else if (username.includes('enterprise')) setUserPlan('enterprise');
    else setUserPlan('basic');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setPortfolioData(null);
    setUserPlan('basic');
    setActiveService(null);
  };

  const handleServiceAccess = (service: string) => {
    setActiveService(service);
  };

  const renderUserServices = () => {
    return (
      <div className="space-y-8 mt-8">
        <h2 className="text-3xl font-bold text-center mb-8">Your Services</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Portfolio Calculator - All Plans */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Portfolio Calculator</span>
                <Badge variant="outline">All Plans</Badge>
              </CardTitle>
              <CardDescription>
                Calculate optimal crypto portfolio allocation based on market conditions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => setActiveSection('portfolio')}
                className="w-full"
              >
                Access Portfolio Calculator
              </Button>
            </CardContent>
          </Card>

          {/* Investment Tracker - Premium & Enterprise */}
          {(userPlan === 'premium' || userPlan === 'enterprise') && (
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Investment Tracker</span>
                  <Badge variant="outline">Premium+</Badge>
                </CardTitle>
                <CardDescription>
                  Track your investments with profit alerts and capital withdrawal management
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => setActiveSection('investment')}
                  className="w-full"
                >
                  Access Investment Tracker
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Trading Wallet Tracking - Enterprise Only */}
          {userPlan === 'enterprise' && (
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Trading Wallet Tracking</span>
                  <Badge variant="outline">Enterprise</Badge>
                </CardTitle>
                <CardDescription>
                  Advanced trading wallet with live price tracking and Excel-like portfolio management
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => setActiveSection('trading')}
                  className="w-full"
                >
                  Access Trading Wallet
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Signals Channel - Enterprise Only */}
          {userPlan === 'enterprise' && (
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Signals Channel</span>
                  <Badge variant="outline">Enterprise</Badge>
                </CardTitle>
                <CardDescription>
                  Access exclusive trading signals and market analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => setActiveSection('signals')}
                  className="w-full"
                >
                  Access Signals
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Content Creator - Enterprise Only */}
          {userPlan === 'enterprise' && (
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Content Creator</span>
                  <Badge variant="outline">Enterprise</Badge>
                </CardTitle>
                <CardDescription>
                  Create and manage trading content and educational materials
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => setActiveSection('content')}
                  className="w-full"
                >
                  Access Content Creator
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Wallet Connect - Enterprise Only */}
          {userPlan === 'enterprise' && (
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Wallet Connect</span>
                  <Badge variant="outline">Enterprise</Badge>
                </CardTitle>
                <CardDescription>
                  Connect and manage your crypto wallets securely
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => setActiveSection('wallet')}
                  className="w-full"
                >
                  Connect Wallet
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Plan Upgrade Notice */}
        {userPlan !== 'enterprise' && (
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">Unlock More Features</h3>
                <p className="text-gray-600 mb-4">
                  Upgrade to {userPlan === 'free' ? 'Premium or Enterprise' : 'Enterprise'} to access additional trading tools and services
                </p>
                <Button onClick={() => setActiveSection('auth')}>
                  View Plans
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  const renderMainContent = () => {
    return (
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="text-left">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Professional Cryptocurrency Portfolio Management
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Track, analyze, and optimize your crypto investments with institutional-grade tools. 
              Get real-time insights, performance analytics, and professional trading signals.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Button className="px-8 py-3 text-lg bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium">
                Start Free Trial
              </Button>
              <Button variant="outline" className="px-8 py-3 text-lg border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-medium">
                Watch Demo
              </Button>
            </div>
          </div>
          
          {/* Authentication Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <UserAuth onLogin={handleLogin} />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header Navigation */}
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <img 
                  src="/lovable-uploads/ecab42a0-0304-48a4-b3ce-9c803c04995c.png" 
                  alt="Synfinia Trading" 
                  className="w-10 h-10 object-contain"
                />
                <span className="text-xl font-bold text-gray-900">
                  CryptoSight
                </span>
              </div>
            </div>
            <nav className="hidden md:flex items-center space-x-8">
              <Link to="#features" className="text-gray-600 hover:text-gray-900 font-medium">Features</Link>
              <Link to="#pricing" className="text-gray-600 hover:text-gray-900 font-medium">Pricing</Link>
              <Link to="/signals" className="text-gray-600 hover:text-gray-900 font-medium">Signals</Link>
              <Link to="#support" className="text-gray-600 hover:text-gray-900 font-medium">Support</Link>
            </nav>
            <div className="flex items-center space-x-4">
              {isConnected && (
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  {connection?.exchange} Connected
                </Badge>
              )}
              {currentUser && (
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="capitalize">{userPlan}</Badge>
                  <span className="text-sm text-gray-600">Welcome, {currentUser}</span>
                  <Button variant="outline" size="sm" onClick={handleLogout}>
                    Logout
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {!currentUser ? (
        <>
          {/* Hero Section with Authentication */}
          {renderMainContent()}
          
          {/* Features Section */}
          <section id="features" className="py-20 bg-white">
            <div className="container mx-auto px-4">
              <div className="text-center mb-16">
                <h2 className="text-4xl font-bold text-gray-900 mb-4">
                  Everything you need to manage your crypto portfolio
                </h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  Professional-grade tools and insights to help you make informed investment decisions
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <Card className="border border-gray-200 hover:shadow-lg transition-all duration-300">
                  <CardHeader>
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                      <TrendingUp className="w-6 h-6 text-blue-600" />
                    </div>
                    <CardTitle className="text-xl text-gray-900">Real-time Tracking</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">
                      Monitor your portfolio performance across multiple exchanges and wallets in real-time.
                    </p>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-center"><Check className="w-4 h-4 text-green-500 mr-2" />Multi-exchange support</li>
                      <li className="flex items-center"><Check className="w-4 h-4 text-green-500 mr-2" />Live price updates</li>
                      <li className="flex items-center"><Check className="w-4 h-4 text-green-500 mr-2" />Performance analytics</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border border-gray-200 hover:shadow-lg transition-all duration-300">
                  <CardHeader>
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                      <BarChart3 className="w-6 h-6 text-purple-600" />
                    </div>
                    <CardTitle className="text-xl text-gray-900">Advanced Analytics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">
                      Deep insights into your portfolio allocation, risk metrics, and performance trends.
                    </p>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-center"><Check className="w-4 h-4 text-green-500 mr-2" />Portfolio allocation</li>
                      <li className="flex items-center"><Check className="w-4 h-4 text-green-500 mr-2" />Risk assessment</li>
                      <li className="flex items-center"><Check className="w-4 h-4 text-green-500 mr-2" />Tax reporting</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border border-gray-200 hover:shadow-lg transition-all duration-300">
                  <CardHeader>
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                      <Zap className="w-6 h-6 text-green-600" />
                    </div>
                    <CardTitle className="text-xl text-gray-900">Trading Signals</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">
                      Professional trading signals and market analysis from expert traders and AI algorithms.
                    </p>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-center"><Check className="w-4 h-4 text-green-500 mr-2" />Expert analysis</li>
                      <li className="flex items-center"><Check className="w-4 h-4 text-green-500 mr-2" />AI-powered insights</li>
                      <li className="flex items-center"><Check className="w-4 h-4 text-green-500 mr-2" />Risk management</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border border-gray-200 hover:shadow-lg transition-all duration-300">
                  <CardHeader>
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                      <Shield className="w-6 h-6 text-orange-600" />
                    </div>
                    <CardTitle className="text-xl text-gray-900">Secure & Private</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">
                      Bank-level security with encrypted data and read-only API access to your exchanges.
                    </p>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-center"><Check className="w-4 h-4 text-green-500 mr-2" />256-bit encryption</li>
                      <li className="flex items-center"><Check className="w-4 h-4 text-green-500 mr-2" />Read-only access</li>
                      <li className="flex items-center"><Check className="w-4 h-4 text-green-500 mr-2" />No withdrawals</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border border-gray-200 hover:shadow-lg transition-all duration-300">
                  <CardHeader>
                    <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                      <Globe className="w-6 h-6 text-indigo-600" />
                    </div>
                    <CardTitle className="text-xl text-gray-900">Multi-Exchange</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">
                      Connect multiple exchanges and wallets for a complete view of your crypto holdings.
                    </p>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-center"><Check className="w-4 h-4 text-green-500 mr-2" />Binance, Coinbase, Kraken</li>
                      <li className="flex items-center"><Check className="w-4 h-4 text-green-500 mr-2" />Hardware wallets</li>
                      <li className="flex items-center"><Check className="w-4 h-4 text-green-500 mr-2" />DeFi protocols</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border border-gray-200 hover:shadow-lg transition-all duration-300">
                  <CardHeader>
                    <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                      <Users className="w-6 h-6 text-red-600" />
                    </div>
                    <CardTitle className="text-xl text-gray-900">Expert Support</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">
                      Get help from our team of crypto experts and join our community of traders.
                    </p>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-center"><Check className="w-4 h-4 text-green-500 mr-2" />24/7 support</li>
                      <li className="flex items-center"><Check className="w-4 h-4 text-green-500 mr-2" />Educational resources</li>
                      <li className="flex items-center"><Check className="w-4 h-4 text-green-500 mr-2" />Community access</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

          {/* Pricing Section */}
          <section id="pricing" className="py-20 bg-gray-50">
            <div className="container mx-auto px-4">
              <div className="text-center mb-16">
                <h2 className="text-4xl font-bold text-gray-900 mb-4">
                  Choose your plan
                </h2>
                <p className="text-xl text-gray-600">
                  Start free, upgrade when you need more features
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                <Card className="border border-gray-200 bg-white">
                  <CardHeader className="text-center">
                    <CardTitle className="text-2xl text-gray-900">Basic</CardTitle>
                    <div className="text-4xl font-bold text-gray-900">$0.00</div>
                    <p className="text-gray-600">per month</p>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 mb-6">
                      <li className="flex items-center"><Check className="w-5 h-5 text-green-500 mr-3" />Basic portfolio tracking</li>
                      <li className="flex items-center"><Check className="w-5 h-5 text-green-500 mr-3" />Up to 2 exchanges</li>
                      <li className="flex items-center"><Check className="w-5 h-5 text-green-500 mr-3" />Basic analytics</li>
                      <li className="flex items-center"><Check className="w-5 h-5 text-green-500 mr-3" />Community support</li>
                    </ul>
                    <Button className="w-full bg-gray-600 hover:bg-gray-700 text-white rounded-lg">
                      Get Started
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-2 border-blue-500 bg-white relative">
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center">
                      <Star className="w-4 h-4 mr-1" />
                      Most Popular
                    </span>
                  </div>
                  <CardHeader className="text-center">
                    <CardTitle className="text-2xl text-gray-900">Professional</CardTitle>
                    <div className="text-4xl font-bold text-gray-900">$9.99</div>
                    <p className="text-gray-600">per month</p>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 mb-6">
                      <li className="flex items-center"><Check className="w-5 h-5 text-green-500 mr-3" />Unlimited exchanges</li>
                      <li className="flex items-center"><Check className="w-5 h-5 text-green-500 mr-3" />Advanced analytics</li>
                      <li className="flex items-center"><Check className="w-5 h-5 text-green-500 mr-3" />Basic trading signals</li>
                      <li className="flex items-center"><Check className="w-5 h-5 text-green-500 mr-3" />Tax reporting</li>
                      <li className="flex items-center"><Check className="w-5 h-5 text-green-500 mr-3" />Priority support</li>
                    </ul>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
                      Start Free Trial
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border border-gray-200 bg-white">
                  <CardHeader className="text-center">
                    <CardTitle className="text-2xl text-gray-900">Enterprise</CardTitle>
                    <div className="text-4xl font-bold text-gray-900">$19.99</div>
                    <p className="text-gray-600">per month</p>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 mb-6">
                      <li className="flex items-center"><Check className="w-5 h-5 text-green-500 mr-3" />Everything in Professional</li>
                      <li className="flex items-center"><Check className="w-5 h-5 text-green-500 mr-3" />Premium trading signals</li>
                      <li className="flex items-center"><Check className="w-5 h-5 text-green-500 mr-3" />AI-powered insights</li>
                      <li className="flex items-center"><Check className="w-5 h-5 text-green-500 mr-3" />Trading wallet</li>
                      <li className="flex items-center"><Check className="w-5 h-5 text-green-500 mr-3" />API access</li>
                      <li className="flex items-center"><Check className="w-5 h-5 text-green-500 mr-3" />Custom integrations</li>
                      <li className="flex items-center"><Check className="w-5 h-5 text-green-500 mr-3" />Dedicated support</li>
                    </ul>
                    <Button variant="outline" className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg">
                      Contact Sales
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-20 bg-blue-600">
            <div className="container mx-auto px-4 text-center">
              <h2 className="text-4xl font-bold text-white mb-6">
                Ready to take control of your crypto portfolio?
              </h2>
              <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                Join thousands of investors who trust CryptoSight for their portfolio management needs.
              </p>
              <Button className="px-8 py-3 text-lg bg-white text-blue-600 hover:bg-gray-100 rounded-lg font-medium">
                Start Your Free Trial
              </Button>
            </div>
          </section>

          {/* Footer */}
          <footer className="bg-gray-900 text-white py-12">
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div>
                  <div className="flex items-center space-x-3 mb-4">
                    <img 
                      src="/lovable-uploads/ecab42a0-0304-48a4-b3ce-9c803c04995c.png" 
                      alt="Synfinia Trading" 
                      className="w-8 h-8 object-contain"
                    />
                    <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-orange-400 bg-clip-text text-transparent">
                      Synfinia Trading
                    </span>
                  </div>
                  <p className="text-gray-400">
                    Professional cryptocurrency portfolio management for serious investors.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-4">Product</h3>
                  <ul className="space-y-2 text-gray-400">
                    <li><Link to="#features" className="hover:text-white">Features</Link></li>
                    <li><Link to="#pricing" className="hover:text-white">Pricing</Link></li>
                    <li><Link to="/signals" className="hover:text-white">Trading Signals</Link></li>
                    <li><Link to="#" className="hover:text-white">API</Link></li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-4">Support</h3>
                  <ul className="space-y-2 text-gray-400">
                    <li><Link to="#" className="hover:text-white">Help Center</Link></li>
                    <li><Link to="#" className="hover:text-white">Documentation</Link></li>
                    <li><Link to="#" className="hover:text-white">Contact Us</Link></li>
                    <li><Link to="#" className="hover:text-white">Status</Link></li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-4">Company</h3>
                  <ul className="space-y-2 text-gray-400">
                    <li><Link to="#" className="hover:text-white">About</Link></li>
                    <li><Link to="#" className="hover:text-white">Blog</Link></li>
                    <li><Link to="#" className="hover:text-white">Privacy</Link></li>
                    <li><Link to="#" className="hover:text-white">Terms</Link></li>
                  </ul>
                </div>
              </div>
              <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
                <p>&copy; 2024 Synfinia Trading. All rights reserved.</p>
              </div>
            </div>
          </footer>
        </>
      ) : (
        <>
          {/* Logged in user dashboard */}
          <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
            <div className="container mx-auto px-4 text-center">
              <h1 className="text-5xl font-bold text-gray-900 mb-6">
                Welcome back, {currentUser}!
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                Access your personalized crypto portfolio management dashboard with real-time insights and analytics.
              </p>
              
              {/* Service Access Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-8">
                {/* Portfolio Calculator Service */}
                <Card className="border border-gray-200 hover:shadow-lg transition-all duration-300">
                  <CardHeader className="text-center pb-4">
                    <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <BarChart3 className="w-8 h-8 text-blue-600" />
                    </div>
                    <CardTitle className="text-xl text-gray-900">Portfolio Calculator</CardTitle>
                    <CardDescription>Calculate and optimize your crypto portfolio allocation</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Button 
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg mb-4"
                      onClick={() => handleServiceAccess('portfolio')}
                    >
                      Access Now
                    </Button>
                    <div className="text-sm text-gray-600">
                      Available on: <span className="font-medium">All Plans</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Exchanges Service */}
                <Card className="border border-gray-200 hover:shadow-lg transition-all duration-300">
                  <CardHeader className="text-center pb-4">
                    <div className="w-16 h-16 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <Globe className="w-8 h-8 text-orange-600" />
                    </div>
                    <CardTitle className="text-xl text-gray-900">Exchanges</CardTitle>
                    <CardDescription>Connect and manage multiple cryptocurrency exchanges</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Link to="/connect-exchange">
                      <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white rounded-lg mb-4">
                        Connect Exchange
                      </Button>
                    </Link>
                    <div className="text-sm text-gray-600">
                      Available on: <span className="font-medium">All Plans</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Trading Signals Service */}
                {(userPlan === 'professional' || userPlan === 'enterprise') && (
                  <Card className="border border-gray-200 hover:shadow-lg transition-all duration-300">
                    <CardHeader className="text-center pb-4">
                      <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                        <Zap className="w-8 h-8 text-green-600" />
                      </div>
                      <CardTitle className="text-xl text-gray-900">Trading Signals</CardTitle>
                      <CardDescription>Professional trading signals and market analysis</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <Link to="/signals">
                        <Button className="w-full bg-green-600 hover:bg-green-700 text-white rounded-lg mb-4">
                          View Signals
                        </Button>
                      </Link>
                      <div className="text-sm text-gray-600">
                        Available on: <span className="font-medium">Professional & Enterprise</span>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Trading Wallet Service */}
                {userPlan === 'enterprise' && (
                  <Card className="border border-gray-200 hover:shadow-lg transition-all duration-300">
                    <CardHeader className="text-center pb-4">
                      <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                        <Wallet className="w-8 h-8 text-purple-600" />
                      </div>
                      <CardTitle className="text-xl text-gray-900">Trading Wallet</CardTitle>
                      <CardDescription>Advanced trading tools and wallet management</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <Button 
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-lg mb-4"
                        onClick={() => handleServiceAccess('trading')}
                      >
                        Access Trading
                      </Button>
                      <div className="text-sm text-gray-600">
                        Available on: <span className="font-medium">Enterprise Only</span>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </section>

          {/* Active Service Content */}
          {activeService === 'portfolio' && (
            <section className="py-12 bg-gray-50">
              <div className="container mx-auto px-4">
                <Card className="max-w-4xl mx-auto bg-white shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-2xl text-gray-900">Portfolio Calculator</CardTitle>
                    <CardDescription>Calculate and track your cryptocurrency portfolio performance</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <PortfolioCalculator 
                      onPortfolioUpdate={handlePortfolioUpdate}
                      currentUser={currentUser}
                    />
                  </CardContent>
                </Card>
              </div>
            </section>
          )}

          {/* Portfolio Display */}
          {portfolioData && activeService === 'portfolio' && (
            <section className="py-12 bg-white">
              <div className="container mx-auto px-4">
                <Card className="max-w-6xl mx-auto bg-white shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-2xl text-gray-900">Portfolio Overview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <PortfolioDisplay portfolioData={portfolioData} />
                  </CardContent>
                </Card>
              </div>
            </section>
          )}

          {/* Trading Wallet Section - Enterprise Only */}
          {userPlan === 'enterprise' && activeService === 'trading' && (
            <section className="py-12 bg-white">
              <div className="container mx-auto px-4">
                <Card className="max-w-6xl mx-auto bg-white shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-2xl text-gray-900 flex items-center">
                      <Wallet className="w-6 h-6 mr-2" />
                      Trading Wallet & Centralized Connection
                    </CardTitle>
                    <CardDescription>
                      Connect your centralized wallet and manage trading positions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Wallet Connection</h3>
                        <WalletConnect currentUser={currentUser} />
                      </div>
                      <p className="text-gray-600">Connect your centralized or cold wallet to access trading features</p>
                    </div>
                    <TradingWallet portfolioData={portfolioData} currentUser={currentUser} />
                  </CardContent>
                </Card>
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
};

export default Index;
