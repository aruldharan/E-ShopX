import { useState } from 'react';
import { CreditCard, Loader2 } from 'lucide-react';
import api from '../../services/api';
import { toast } from 'react-toastify';

interface RazorpayButtonProps {
  amount: number;      // Total in INR
  orderId?: string;    // Your platform order ID (optional, sent as receipt)
  onSuccess: (paymentId: string) => void;
  disabled?: boolean;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (document.getElementById('razorpay-checkout-js')) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.id = 'razorpay-checkout-js';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const RazorpayButton = ({ amount, orderId, onSuccess, disabled }: RazorpayButtonProps) => {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    if (amount <= 0) {
      toast.error('Invalid order amount');
      return;
    }

    setLoading(true);

    try {
      // 1. Load Razorpay script
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        toast.error('Failed to load payment gateway. Check your internet connection.');
        setLoading(false);
        return;
      }

      // 2. Create Razorpay order on backend
      const { data } = await api.post('/payment/create-order', {
        amount,
        receipt: orderId || `receipt_${Date.now()}`,
      });

      if (!data.success) {
        throw new Error(data.message || 'Failed to create payment order');
      }

      // 3. Open Razorpay checkout
      const options = {
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        name: 'ShopX',
        description: 'Order Payment',
        order_id: data.orderId,
        handler: async (response: any) => {
          try {
            // 4. Verify payment on backend
            const verifyRes = await api.post('/payment/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verifyRes.data.success) {
              toast.success('✅ Payment successful!');
              onSuccess(response.razorpay_payment_id);
            } else {
              toast.error('Payment verification failed. Contact support.');
            }
          } catch {
            toast.error('Payment verification failed. Contact support.');
          }
        },
        prefill: {
          name: '',
          email: '',
          contact: '',
        },
        theme: {
          color: '#6366f1',
        },
        modal: {
          ondismiss: () => {
            toast.info('Payment cancelled');
            setLoading(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (response: any) => {
        toast.error(`Payment failed: ${response.error.description}`);
        setLoading(false);
      });
      rzp.open();
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Payment initiation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePayment}
      disabled={disabled || loading}
      className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold py-4 rounded-2xl shadow-lg shadow-indigo-500/30 transition-all hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
    >
      {loading ? (
        <>
          <Loader2 size={20} className="animate-spin" />
          Initiating Payment...
        </>
      ) : (
        <>
          <CreditCard size={20} />
          Pay ₹{amount.toLocaleString()} with Razorpay
        </>
      )}
    </button>
  );
};

export default RazorpayButton;
