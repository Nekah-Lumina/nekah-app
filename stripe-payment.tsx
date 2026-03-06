import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CreditCard, Shield, Clock, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface Doctor {
  id: string;
  name: string;
  specialization: string;
  experience: number;
  rating: number;
  imageUrl?: string;
  consultationRate: number;
}

interface StripePaymentProps {
  doctor: Doctor;
  userId: string;
  onPaymentSuccess: (consultationId: string) => void;
  onCancel: () => void;
}

export function StripePayment({ doctor, userId, onPaymentSuccess, onCancel }: StripePaymentProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);

  const processPayment = async () => {
    setIsProcessing(true);
    setPaymentStatus('processing');
    setErrorMessage('');

    try {
      // Step 1: Create payment intent
      const response = await fetch('/api/payment/create-intent', {
        method: 'POST',
        body: JSON.stringify({
          amount: doctor.consultationRate,
          userId,
          consultationId: `consultation_${Date.now()}`
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const paymentIntent = await response.json();

      if (!paymentIntent.clientSecret) {
        throw new Error('Failed to create payment intent');
      }

      setPaymentIntentId(paymentIntent.paymentIntentId);

      // Step 2: Simulate Stripe payment processing
      // In a real implementation, you would use Stripe Elements here
      await new Promise(resolve => setTimeout(resolve, 3000)); // Simulate payment processing

      // Step 3: Confirm payment
      const confirmResponse = await fetch('/api/payment/confirm', {
        method: 'POST',
        body: JSON.stringify({
          paymentIntentId: paymentIntent.paymentIntentId
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const paymentConfirmation = await confirmResponse.json();

      if (paymentConfirmation.success) {
        // Step 4: Create consultation
        const consultationResponse = await fetch('/api/consultations', {
          method: 'POST',
          body: JSON.stringify({
            userId,
            doctorId: doctor.id,
            paymentIntentId: paymentIntent.paymentIntentId
          }),
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const consultation = await consultationResponse.json();

        setPaymentStatus('success');
        setTimeout(() => {
          onPaymentSuccess(consultation.id);
        }, 2000);
      } else {
        throw new Error('Payment confirmation failed');
      }

    } catch (error) {
      console.error('Payment error:', error);
      setPaymentStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Payment processing failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusIcon = () => {
    switch (paymentStatus) {
      case 'processing':
        return <Loader2 className="w-5 h-5 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <CreditCard className="w-5 h-5" />;
    }
  };

  const getStatusMessage = () => {
    switch (paymentStatus) {
      case 'processing':
        return 'Processing your payment securely...';
      case 'success':
        return 'Payment successful! Connecting you to the doctor...';
      case 'error':
        return errorMessage || 'Payment failed. Please try again.';
      default:
        return 'Secure payment powered by Stripe';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 p-4">
      <div className="max-w-md mx-auto space-y-6">
        
        {/* Payment Header */}
        <Card className="card-shadow">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-3">
              {getStatusIcon()}
            </div>
            <CardTitle className="text-xl">Doctor's Eye Consultation</CardTitle>
            <p className="text-sm text-muted-foreground">
              {getStatusMessage()}
            </p>
          </CardHeader>
        </Card>

        {/* Doctor Details */}
        <Card className="card-shadow">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-100 to-purple-100 rounded-full flex items-center justify-center">
                <span className="text-xl font-semibold text-primary">
                  {doctor.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{doctor.name}</h3>
                <p className="text-sm text-muted-foreground">{doctor.specialization}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge variant="secondary" className="text-xs">
                    {doctor.experience} years exp.
                  </Badge>
                  <Badge variant="default" className="text-xs">
                    ⭐ {doctor.rating}/5
                  </Badge>
                </div>
              </div>
            </div>

            <Separator className="my-4" />

            <div className="space-y-3">
              <div className="flex items-center text-sm text-muted-foreground">
                <Clock className="w-4 h-4 mr-2" />
                <span>30-minute consultation session</span>
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Shield className="w-4 h-4 mr-2" />
                <span>Secure, private, and confidential</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Summary */}
        <Card className="card-shadow">
          <CardContent className="p-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Consultation Fee</span>
                <span className="font-semibold">₦{doctor.consultationRate.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Platform Fee</span>
                <span className="font-semibold text-green-600">FREE</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center text-lg font-bold">
                <span>Total</span>
                <span className="text-primary">₦{doctor.consultationRate.toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Actions */}
        <div className="space-y-3">
          {paymentStatus === 'idle' && (
            <>
              <Button
                onClick={processPayment}
                disabled={isProcessing}
                className="w-full h-12 text-lg"
                size="lg"
              >
                <CreditCard className="w-5 h-5 mr-2" />
                Pay ₦{doctor.consultationRate.toLocaleString()} Securely
              </Button>
              <Button
                variant="outline"
                onClick={onCancel}
                className="w-full"
                disabled={isProcessing}
              >
                Cancel
              </Button>
            </>
          )}

          {paymentStatus === 'processing' && (
            <Button disabled className="w-full h-12 text-lg" size="lg">
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Processing Payment...
            </Button>
          )}

          {paymentStatus === 'success' && (
            <Button disabled className="w-full h-12 text-lg bg-green-600" size="lg">
              <CheckCircle className="w-5 h-5 mr-2" />
              Payment Successful!
            </Button>
          )}

          {paymentStatus === 'error' && (
            <div className="space-y-3">
              <Button
                onClick={processPayment}
                className="w-full h-12 text-lg"
                size="lg"
              >
                <CreditCard className="w-5 h-5 mr-2" />
                Try Again
              </Button>
              <Button
                variant="outline"
                onClick={onCancel}
                className="w-full"
              >
                Cancel
              </Button>
            </div>
          )}
        </div>

        {/* Security Notice */}
        <Card className="border border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <Shield className="w-5 h-5 text-green-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-green-800">Secure Payment</p>
                <p className="text-green-700 mt-1">
                  Your payment is processed securely through Stripe. 
                  Your financial information is never stored on our servers.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {paymentIntentId && (
          <p className="text-xs text-center text-muted-foreground">
            Payment ID: {paymentIntentId.slice(-8)}
          </p>
        )}
      </div>
    </div>
  );
}