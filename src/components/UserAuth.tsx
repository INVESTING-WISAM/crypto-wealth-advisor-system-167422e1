
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle, Eye, EyeOff, Mail, Lock, User, Settings } from "lucide-react";
import { toast } from "sonner";

interface UserAuthProps {
  onLogin: (email: string) => void;
}

interface UserProfile {
  email: string;
  password: string;
  plan: 'basic' | 'professional' | 'enterprise';
  recoveryCode?: string;
  registeredAt: string;
  paymentInfo?: {
    cardNumber?: string;
    expiryDate?: string;
    savedCard: boolean;
  };
}

const UserAuth: React.FC<UserAuthProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [recoveryCode, setRecoveryCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [passwordValidation, setPasswordValidation] = useState({
    hasLower: false,
    hasUpper: false,
    hasDigit: false,
    hasSpecial: false,
    minLength: false,
    noWhitespace: true
  });

  const specialChars = "!#$%&'()*+,-./:;<=>?@[\\]^_`{|}~";

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

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

  const generateRecoveryCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const sendVerificationCode = (email: string, purpose: 'registration' | 'password-reset') => {
    const code = generateRecoveryCode();
    console.log(`Verification code for ${email} (${purpose}): ${code}`);
    // Store the code temporarily (in real app, this would be sent via email service)
    localStorage.setItem(`verification_${email}`, JSON.stringify({
      code,
      purpose,
      timestamp: Date.now(),
      expires: Date.now() + 10 * 60 * 1000 // 10 minutes
    }));
    return code;
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const pwd = e.target.value;
    setPassword(pwd);
    validatePassword(pwd);
  };

  const handleRegister = () => {
    if (!email.trim() || !validateEmail(email)) {
      toast.error("Please enter a valid email address");
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

    // Check if email already exists
    const existingUsers = JSON.parse(localStorage.getItem('registeredUsers') || '{}');
    if (existingUsers[email]) {
      toast.error("An account with this email already exists");
      return;
    }

    // Send verification code
    const code = sendVerificationCode(email, 'registration');
    setVerificationCode('');
    setIsCodeSent(true);
    setIsVerifying(true);
    toast.success(`Verification code sent to ${email}. Please check your email.`);
  };

  const verifyRegistration = () => {
    const storedVerification = JSON.parse(localStorage.getItem(`verification_${email}`) || '{}');
    
    if (!storedVerification.code || storedVerification.purpose !== 'registration') {
      toast.error("No verification code found. Please request a new one.");
      return;
    }

    if (Date.now() > storedVerification.expires) {
      toast.error("Verification code has expired. Please request a new one.");
      localStorage.removeItem(`verification_${email}`);
      return;
    }

    if (verificationCode !== storedVerification.code) {
      toast.error("Invalid verification code. Please try again.");
      return;
    }

    // Register user
    const existingUsers = JSON.parse(localStorage.getItem('registeredUsers') || '{}');
    const recoveryCode = generateRecoveryCode();
    
    existingUsers[email] = {
      email,
      password: password, // In production, this should be hashed
      plan: 'basic',
      recoveryCode,
      registeredAt: new Date().toISOString(),
      paymentInfo: { savedCard: false }
    };
    
    localStorage.setItem('registeredUsers', JSON.stringify(existingUsers));
    localStorage.removeItem(`verification_${email}`);
    
    toast.success(`Registration successful! Your recovery code is: ${recoveryCode}. Please save it securely.`);
    setIsRegistering(false);
    setIsVerifying(false);
    setIsCodeSent(false);
    setPassword('');
    setConfirmPassword('');
    setVerificationCode('');
  };

  const handleLogin = () => {
    if (!email.trim() || !validateEmail(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (!password) {
      toast.error("Please enter your password");
      return;
    }

    const existingUsers = JSON.parse(localStorage.getItem('registeredUsers') || '{}');
    if (!existingUsers[email] || existingUsers[email].password !== password) {
      toast.error("Invalid email or password");
      return;
    }

    onLogin(email);
  };

  const handleForgotPassword = () => {
    if (!email.trim() || !validateEmail(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    const existingUsers = JSON.parse(localStorage.getItem('registeredUsers') || '{}');
    if (!existingUsers[email]) {
      toast.error("No account found with this email address");
      return;
    }

    const code = sendVerificationCode(email, 'password-reset');
    setVerificationCode('');
    setIsCodeSent(true);
    setIsVerifying(true);
    toast.success(`Password reset code sent to ${email}. Please check your email.`);
  };

  const verifyPasswordReset = () => {
    const storedVerification = JSON.parse(localStorage.getItem(`verification_${email}`) || '{}');
    
    if (!storedVerification.code || storedVerification.purpose !== 'password-reset') {
      toast.error("No verification code found. Please request a new one.");
      return;
    }

    if (Date.now() > storedVerification.expires) {
      toast.error("Verification code has expired. Please request a new one.");
      localStorage.removeItem(`verification_${email}`);
      return;
    }

    if (verificationCode !== storedVerification.code) {
      toast.error("Invalid verification code. Please try again.");
      return;
    }

    if (!validatePassword(newPassword)) {
      toast.error("New password does not meet security requirements");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      toast.error("New passwords do not match");
      return;
    }

    // Update password
    const existingUsers = JSON.parse(localStorage.getItem('registeredUsers') || '{}');
    existingUsers[email].password = newPassword;
    localStorage.setItem('registeredUsers', JSON.stringify(existingUsers));
    localStorage.removeItem(`verification_${email}`);
    
    toast.success("Password reset successfully! You can now login with your new password.");
    setShowForgotPassword(false);
    setIsVerifying(false);
    setIsCodeSent(false);
    setNewPassword('');
    setConfirmNewPassword('');
    setVerificationCode('');
  };

  const ValidationItem = ({ valid, text }: { valid: boolean; text: string }) => (
    <div className={`flex items-center space-x-2 text-sm ${valid ? 'text-green-600' : 'text-red-600'}`}>
      {valid ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
      <span>{text}</span>
    </div>
  );

  if (showForgotPassword) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Lock className="w-5 h-5 mr-2" />
            Reset Password
          </CardTitle>
          <CardDescription>
            {!isCodeSent 
              ? "Enter your email address to receive a verification code"
              : "Enter the verification code sent to your email and create a new password"
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isCodeSent ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="resetEmail">Email Address</Label>
                <Input
                  id="resetEmail"
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="flex space-x-2">
                <Button onClick={handleForgotPassword} className="flex-1">
                  Send Reset Code
                </Button>
                <Button variant="outline" onClick={() => setShowForgotPassword(false)}>
                  Cancel
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="verificationCode">Verification Code</Label>
                <Input
                  id="verificationCode"
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  maxLength={6}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      validatePassword(e.target.value);
                    }}
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
              
              {newPassword && (
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
                <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
                <Input
                  id="confirmNewPassword"
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                />
              </div>
              <div className="flex space-x-2">
                <Button onClick={verifyPasswordReset} className="flex-1">
                  Reset Password
                </Button>
                <Button variant="outline" onClick={() => {
                  setShowForgotPassword(false);
                  setIsCodeSent(false);
                  setIsVerifying(false);
                }}>
                  Cancel
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    );
  }

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
              <Label htmlFor="loginEmail">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="loginEmail"
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="loginPassword">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="loginPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
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
            <div className="flex justify-between items-center">
              <Button variant="link" className="p-0 h-auto text-sm" onClick={() => setShowForgotPassword(true)}>
                Forgot password?
              </Button>
            </div>
            <Button onClick={handleLogin} className="w-full">
              Sign In
            </Button>
          </TabsContent>

          <TabsContent value="register" className="space-y-4">
            {!isVerifying ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="registerEmail">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="registerEmail"
                      type="email"
                      placeholder="Enter your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="registerPassword">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="registerPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a strong password"
                      value={password}
                      onChange={handlePasswordChange}
                      className="pl-10 pr-10"
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
              </>
            ) : (
              <div className="space-y-4">
                <Alert>
                  <Mail className="h-4 w-4" />
                  <AlertDescription>
                    We've sent a verification code to <strong>{email}</strong>. Please enter the 6-digit code below to complete your registration.
                  </AlertDescription>
                </Alert>
                <div className="space-y-2">
                  <Label htmlFor="verificationCode">Verification Code</Label>
                  <Input
                    id="verificationCode"
                    type="text"
                    placeholder="Enter 6-digit code"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    maxLength={6}
                  />
                </div>
                <div className="flex space-x-2">
                  <Button onClick={verifyRegistration} className="flex-1">
                    Verify & Complete Registration
                  </Button>
                  <Button variant="outline" onClick={() => {
                    setIsVerifying(false);
                    setIsCodeSent(false);
                  }}>
                    Back
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default UserAuth;
