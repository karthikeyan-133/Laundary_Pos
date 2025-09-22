import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const Signup = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  // Additional settings fields
  const [businessName, setBusinessName] = useState('');
  const [businessAddress, setBusinessAddress] = useState('');
  const [businessPhone, setBusinessPhone] = useState('');
  const [taxRate, setTaxRate] = useState('5.00');
  const [currency, setCurrency] = useState('AED');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setIsLoading(true);
    setError('');

    try {
      // Combine admin credentials and business settings in a single request
      const response = await fetch('http://localhost:3005/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          email,
          password,
          business_name: businessName,
          business_address: businessAddress,
          business_phone: businessPhone,
          tax_rate: parseFloat(taxRate),
          currency: currency,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Use the auth context login function
        login(data.token, data.admin);
        // Redirect to the main page (which defaults to sales/pos)
        navigate('/', { replace: true });
      } else {
        setError(data.error || 'Signup failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Signup error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
      <div className="w-full max-w-2xl">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">TallyPrime POS - Admin Setup</CardTitle>
            <CardDescription className="text-center">
              Create your admin account and configure business settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Admin Username *</Label>
                    <Input
                      id="username"
                      type="text"
                      placeholder="Enter admin username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Admin Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter admin email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">Password *</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password *</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirm password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>
                
                <div className="border-t border-gray-200 pt-4 mt-6">
                  <h3 className="text-lg font-medium mb-4">Business Settings</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="businessName">Business Name *</Label>
                    <Input
                      id="businessName"
                      type="text"
                      placeholder="Enter business name"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="businessPhone">Business Phone</Label>
                      <Input
                        id="businessPhone"
                        type="text"
                        placeholder="Enter business phone"
                        value={businessPhone}
                        onChange={(e) => setBusinessPhone(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="currency">Currency</Label>
                      <Input
                        id="currency"
                        type="text"
                        placeholder="Enter currency code"
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2 mt-4">
                    <Label htmlFor="businessAddress">Business Address</Label>
                    <Input
                      id="businessAddress"
                      type="text"
                      placeholder="Enter business address"
                      value={businessAddress}
                      onChange={(e) => setBusinessAddress(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2 mt-4">
                    <Label htmlFor="taxRate">Tax Rate (%)</Label>
                    <Input
                      id="taxRate"
                      type="number"
                      step="0.01"
                      placeholder="Enter tax rate"
                      value={taxRate}
                      onChange={(e) => setTaxRate(e.target.value)}
                    />
                  </div>
                </div>
                
                <Button type="submit" className="w-full mt-6" disabled={isLoading}>
                  {isLoading ? 'Creating Account...' : 'Create Admin Account & Save Settings'}
                </Button>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col">
            <div className="text-sm text-gray-500 text-center">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-600 hover:underline">
                Sign in
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Signup;