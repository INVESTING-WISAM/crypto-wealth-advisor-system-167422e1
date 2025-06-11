
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useForm } from 'react-hook-form';
import { toast } from '@/hooks/use-toast';

interface ExchangeConnectionForm {
  exchange: string;
  apiKey: string;
  secret: string;
  passphrase?: string;
}

const ConnectExchange = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'success' | 'error' | null>(null);
  const navigate = useNavigate();
  
  const form = useForm<ExchangeConnectionForm>({
    defaultValues: {
      exchange: '',
      apiKey: '',
      secret: '',
      passphrase: ''
    }
  });

  const selectedExchange = form.watch('exchange');

  const onSubmit = async (data: ExchangeConnectionForm) => {
    setIsLoading(true);
    setConnectionStatus(null);

    try {
      const response = await fetch('https://secure-api-se59.onrender.com/connect-api', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        // Store connection status locally
        localStorage.setItem('exchangeConnection', JSON.stringify({
          exchange: data.exchange,
          connected: true,
          connectedAt: new Date().toISOString()
        }));
        
        setConnectionStatus('success');
        toast({
          title: "Exchange Connected",
          description: `Successfully connected to ${data.exchange}`,
        });

        // Redirect to portfolio after 2 seconds
        setTimeout(() => {
          navigate('/');
        }, 2000);
      } else {
        throw new Error('Connection failed');
      }
    } catch (error) {
      setConnectionStatus('error');
      toast({
        title: "Connection Failed",
        description: "Failed to connect to exchange. Please check your credentials.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-center mb-2">Connect Exchange</h1>
          <p className="text-muted-foreground text-center">
            Connect your exchange account to track your portfolio and balances
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Exchange Connection</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="exchange"
                  rules={{ required: "Please select an exchange" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Exchange</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select an exchange" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="bybit">Bybit</SelectItem>
                          <SelectItem value="okx">OKX</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="apiKey"
                  rules={{ required: "API Key is required" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>API Key</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter your API key" 
                          type="password"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="secret"
                  rules={{ required: "Secret is required" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Secret</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter your secret key" 
                          type="password"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {selectedExchange === 'okx' && (
                  <FormField
                    control={form.control}
                    name="passphrase"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Passphrase (Optional)</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter passphrase if required" 
                            type="password"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {connectionStatus === 'success' && (
                  <Alert>
                    <AlertDescription>
                      ✅ Successfully connected to {selectedExchange}! Redirecting to portfolio...
                    </AlertDescription>
                  </Alert>
                )}

                {connectionStatus === 'error' && (
                  <Alert variant="destructive">
                    <AlertDescription>
                      ❌ Failed to connect. Please check your credentials and try again.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex gap-4">
                  <Button 
                    type="submit" 
                    disabled={isLoading}
                    className="flex-1"
                  >
                    {isLoading ? 'Connecting...' : 'Connect Exchange'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => navigate('/')}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        <div className="mt-8 p-4 bg-muted rounded-lg">
          <h3 className="font-semibold mb-2">Security Notice</h3>
          <p className="text-sm text-muted-foreground">
            Your API credentials are sent securely to our server and are not stored in your browser. 
            Make sure to only use API keys with read-only permissions for maximum security.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ConnectExchange;
