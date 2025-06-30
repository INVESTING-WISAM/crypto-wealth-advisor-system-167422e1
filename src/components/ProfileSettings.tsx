
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  User, 
  Mail, 
  Shield, 
  CreditCard, 
  Key, 
  Eye, 
  EyeOff,
  AlertCircle,
  CheckCircle,
  Settings
} from "lucide-react";
import { toast } from "sonner";

interface ProfileSettingsProps {
  currentUser: string;
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

const ProfileSettings: React.FC<ProfileSettingsProps> = ({ currentUser }) => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [showRecoveryCode, setShowRecoveryCode] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    saveCard: false
  });
  const [passwordValidation, setPasswordValidation] = useState({
    hasLower: false,
    hasUpper: false,
    hasDigit: false,
    hasSpecial: false,
    minLength: false,
    noWhitespace: true
  });

  const specialChars = "!#$%&'()*+,-./:;<=>?@[\\]^_`{|}~";

  useEffect(() => {
    // Load user profile from localStorage
    const existingUsers = JSON.parse(localStorage.getItem('registeredUsers') || '{}');
    if (existingUsers[currentUser]) {
      setUserProfile(existingUsers[currentUser]);
      if (existingUsers[currentUser].paymentInfo) {
        setPaymentDetails({
          cardNumber: existingUsers[currentUser].paymentInfo.cardNumber || '',
          expiryDate: existingUsers[currentUser].paymentInfo.expiryDate || '',
          saveCard: existingUsers[currentUser].paymentInfo.savedCard || false
        });
      }
    }
  }, [currentUser]);

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

  const handlePasswordReset = () => {
    if (!currentPassword) {
      toast.error("Please enter your current password");
      return;
    }

    if (currentPassword !== userProfile?.password) {
      toast.error("Current password is incorrect");
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
    existingUsers[currentUser].password = newPassword;
    localStorage.setItem('registeredUsers', JSON.stringify(existingUsers));
    
    setUserProfile(prev => prev ? { ...prev, password: newPassword } : null);
    setIsChangingPassword(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
    
    toast.success("Password updated successfully!");
  };

  const handlePaymentSave = () => {
    if (!paymentDetails.cardNumber || !paymentDetails.expiryDate) {
      toast.error("Please fill in all payment details");
      return;
    }

    const existingUsers = JSON.parse(localStorage.getItem('registeredUsers') || '{}');
    existingUsers[currentUser].paymentInfo = {
      cardNumber: paymentDetails.saveCard ? paymentDetails.cardNumber : '',
      expiryDate: paymentDetails.saveCard ? paymentDetails.expiryDate : '',
      savedCard: paymentDetails.saveCard
    };
    localStorage.setItem('registeredUsers', JSON.stringify(existingUsers));
    
    setUserProfile(prev => prev ? { 
      ...prev, 
      paymentInfo: {
        cardNumber: paymentDetails.saveCard ? paymentDetails.cardNumber : '',
        expiryDate: paymentDetails.saveCard ? paymentDetails.expiryDate : '',
        savedCard: paymentDetails.saveCard
      }
    } : null);
    
    toast.success(paymentDetails.saveCard ? "Payment information saved!" : "Payment processed (not saved)");
    
    if (!paymentDetails.saveCard) {
      setPaymentDetails({ cardNumber: '', expiryDate: '', saveCard: false });
    }
  };

  const handleDeletePaymentInfo = () => {
    const existingUsers = JSON.parse(localStorage.getItem('registeredUsers') || '{}');
    existingUsers[currentUser].paymentInfo = { savedCard: false };
    localStorage.setItem('registeredUsers', JSON.stringify(existingUsers));
    
    setUserProfile(prev => prev ? { 
      ...prev, 
      paymentInfo: { savedCard: false }
    } : null);
    setPaymentDetails({ cardNumber: '', expiryDate: '', saveCard: false });
    
    toast.success("Payment information deleted!");
  };

  const ValidationItem = ({ valid, text }: { valid: boolean; text: string }) => (
    <div className={`flex items-center space-x-2 text-sm ${valid ? 'text-green-600' : 'text-red-600'}`}>
      {valid ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
      <span>{text}</span>
    </div>
  );

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'basic': return 'bg-gray-100 text-gray-800';
      case 'professional': return 'bg-blue-100 text-blue-800';
      case 'enterprise': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!userProfile) {
    return <div>Loading profile...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="w-5 h-5 mr-2" />
            Profile Settings
          </CardTitle>
          <CardDescription>
            Manage your account information and security settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Profile Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Account Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center">
                  <Mail className="w-4 h-4 mr-2" />
                  Email Address
                </Label>
                <Input value={userProfile.email} disabled className="bg-gray-50" />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  Current Plan
                </Label>
                <div>
                  <Badge className={`${getPlanColor(userProfile.plan)} capitalize`}>
                    {userProfile.plan}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Member Since</Label>
              <Input 
                value={new Date(userProfile.registeredAt).toLocaleDateString()} 
                disabled 
                className="bg-gray-50" 
              />
            </div>
          </div>

          <Separator />

          {/* Recovery Code Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center">
              <Key className="w-5 h-5 mr-2" />
              Recovery Code
            </h3>
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                Your recovery code can be used to access your account if you forget your password. Keep it safe and secure.
              </AlertDescription>
            </Alert>
            <div className="flex items-center space-x-2">
              <Input
                type={showRecoveryCode ? "text" : "password"}
                value={userProfile.recoveryCode || "Not set"}
                disabled
                className="bg-gray-50"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowRecoveryCode(!showRecoveryCode)}
              >
                {showRecoveryCode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <Separator />

          {/* Password Reset Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              Password & Security
            </h3>
            {!isChangingPassword ? (
              <Button onClick={() => setIsChangingPassword(true)}>
                Change Password
              </Button>
            ) : (
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showPasswords ? "text" : "password"}
                      placeholder="Enter current password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showPasswords ? "text" : "password"}
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
                      onClick={() => setShowPasswords(!showPasswords)}
                    >
                      {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                {newPassword && (
                  <div className="space-y-2 p-3 bg-white rounded-lg">
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
                  <Button onClick={handlePasswordReset}>
                    Update Password
                  </Button>
                  <Button variant="outline" onClick={() => {
                    setIsChangingPassword(false);
                    setCurrentPassword('');
                    setNewPassword('');
                    setConfirmNewPassword('');
                  }}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Payment Information Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center">
              <CreditCard className="w-5 h-5 mr-2" />
              Payment Information
            </h3>
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <Input
                    id="cardNumber"
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    value={paymentDetails.cardNumber}
                    onChange={(e) => setPaymentDetails(prev => ({ ...prev, cardNumber: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expiryDate">Expiry Date</Label>
                  <Input
                    id="expiryDate"
                    type="text"
                    placeholder="MM/YY"
                    value={paymentDetails.expiryDate}
                    onChange={(e) => setPaymentDetails(prev => ({ ...prev, expiryDate: e.target.value }))}
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="saveCard"
                  checked={paymentDetails.saveCard}
                  onChange={(e) => setPaymentDetails(prev => ({ ...prev, saveCard: e.target.checked }))}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="saveCard">Save payment information for future use</Label>
              </div>
              <div className="flex space-x-2">
                <Button onClick={handlePaymentSave}>
                  {paymentDetails.saveCard ? 'Save Payment Info' : 'Process Payment'}
                </Button>
                {userProfile.paymentInfo?.savedCard && (
                  <Button variant="destructive" onClick={handleDeletePaymentInfo}>
                    Delete Saved Info
                  </Button>
                )}
              </div>
              {userProfile.paymentInfo?.savedCard && (
                <Alert>
                  <CreditCard className="h-4 w-4" />
                  <AlertDescription>
                    You have saved payment information on file. Card ending in ****{userProfile.paymentInfo.cardNumber?.slice(-4)}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileSettings;
