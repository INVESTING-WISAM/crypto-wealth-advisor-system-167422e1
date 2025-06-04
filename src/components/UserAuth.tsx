
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

interface UserAuthProps {
  onLogin: (username: string) => void;
}

const UserAuth: React.FC<UserAuthProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState({
    hasLower: false,
    hasUpper: false,
    hasDigit: false,
    hasSpecial: false,
    minLength: false,
    noWhitespace: true
  });

  const specialChars = "!#$%&'()*+,-./:;<=>?@[\\]^_`{|}~";

  const validatePassword = (pwd: string) => {
    const validation = {
      hasLower: /[a-z]/.test(pwd),
      hasUpper: /[A-Z]/.test(pwd),
      hasDigit: /\d/.test(pwd),
      hasSpecial: specialChars.split('').some(char => pwd.includes(char)),
      minLength: pwd.length >= 8,
      noWhitespace: !/\s/.test(pwd)
    };
    setPasswordValidation(validation);
    return Object.values(validation).every(Boolean);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const pwd = e.target.value;
    setPassword(pwd);
    validatePassword(pwd);
  };

  const handleRegister = () => {
    if (!username.trim()) {
      toast.error("Username is required");
      return;
    }

    if (!validatePassword(password)) {
      toast.error("Password does not meet security requirements");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    // Check if username already exists
    const existingUsers = JSON.parse(localStorage.getItem('registeredUsers') || '{}');
    if (existingUsers[username]) {
      toast.error("Username already exists");
      return;
    }

    // Register user
    existingUsers[username] = {
      password: password, // In production, this should be hashed
      registeredAt: new Date().toISOString()
    };
    localStorage.setItem('registeredUsers', JSON.stringify(existingUsers));
    
    toast.success("Registration successful! Please log in.");
    setIsRegistering(false);
    setPassword('');
    setConfirmPassword('');
  };

  const handleLogin = () => {
    if (!username.trim() || !password) {
      toast.error("Please enter both username and password");
      return;
    }

    const existingUsers = JSON.parse(localStorage.getItem('registeredUsers') || '{}');
    if (!existingUsers[username] || existingUsers[username].password !== password) {
      toast.error("Invalid username or password");
      return;
    }

    onLogin(username);
  };

  const ValidationItem = ({ valid, text }: { valid: boolean; text: string }) => (
    <div className={`flex items-center space-x-2 text-sm ${valid ? 'text-green-600' : 'text-red-600'}`}>
      {valid ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
      <span>{text}</span>
    </div>
  );

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Welcome to CryptoPortfolio Pro</CardTitle>
        <CardDescription>
          Sign in to access your personalized crypto portfolio management system
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={isRegistering ? "register" : "login"} onValueChange={(value) => setIsRegistering(value === "register")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="loginUsername">Username</Label>
              <Input
                id="loginUsername"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="loginPassword">Password</Label>
              <div className="relative">
                <Input
                  id="loginPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <Button onClick={handleLogin} className="w-full">
              Sign In
            </Button>
          </TabsContent>

          <TabsContent value="register" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="registerUsername">Username</Label>
              <Input
                id="registerUsername"
                type="text"
                placeholder="Choose a unique username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="registerPassword">Password</Label>
              <div className="relative">
                <Input
                  id="registerPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
                  value={password}
                  onChange={handlePasswordChange}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            
            {password && (
              <div className="space-y-2 p-3 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-sm">Password Requirements:</h4>
                <ValidationItem valid={passwordValidation.minLength} text="At least 8 characters" />
                <ValidationItem valid={passwordValidation.hasLower} text="One lowercase letter" />
                <ValidationItem valid={passwordValidation.hasUpper} text="One uppercase letter" />
                <ValidationItem valid={passwordValidation.hasDigit} text="One digit" />
                <ValidationItem valid={passwordValidation.hasSpecial} text="One special character" />
                <ValidationItem valid={passwordValidation.noWhitespace} text="No whitespace characters" />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <Button onClick={handleRegister} className="w-full">
              Create Account
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default UserAuth;
