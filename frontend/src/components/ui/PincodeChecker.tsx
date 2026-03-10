import { useState } from 'react';
import { MapPin, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Mock pincode → city mapping (replace with a real API like Shiprocket/Delhivery in production)
const MOCK_PINCODES: Record<string, { city: string; state: string; days: number }> = {
  '110001': { city: 'New Delhi', state: 'Delhi', days: 1 },
  '400001': { city: 'Mumbai', state: 'Maharashtra', days: 2 },
  '560001': { city: 'Bengaluru', state: 'Karnataka', days: 2 },
  '600001': { city: 'Chennai', state: 'Tamil Nadu', days: 3 },
  '700001': { city: 'Kolkata', state: 'West Bengal', days: 3 },
  '500001': { city: 'Hyderabad', state: 'Telangana', days: 2 },
  '411001': { city: 'Pune', state: 'Maharashtra', days: 2 },
  '380001': { city: 'Ahmedabad', state: 'Gujarat', days: 3 },
  '302001': { city: 'Jaipur', state: 'Rajasthan', days: 4 },
};

interface DeliveryInfo {
  city: string;
  state: string;
  deliverable: boolean;
  days: number;
}

const PincodeChecker = () => {
  const [pincode, setPincode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DeliveryInfo | null>(null);
  const [checked, setChecked] = useState(false);

  const checkDelivery = () => {
    if (pincode.length !== 6 || !/^\d{6}$/.test(pincode)) return;
    setLoading(true);
    setChecked(false);
    setResult(null);
    // Simulate API call
    setTimeout(() => {
      const info = MOCK_PINCODES[pincode];
      if (info) {
        setResult({ ...info, deliverable: true });
      } else {
        // Unknown pincode - simulate a generic 5-day delivery
        const isDeliverable = pincode[0] !== '9'; // just a mock rule
        setResult({
          city: 'Your Location',
          state: '',
          deliverable: isDeliverable,
          days: isDeliverable ? 5 : 0,
        });
      }
      setChecked(true);
      setLoading(false);
    }, 700);
  };

  const getDeliveryDate = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });
  };

  return (
    <div className="border border-slate-100 dark:border-zinc-700 rounded-2xl p-4">
      <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-3 flex items-center gap-2">
        <MapPin size={16} className="text-primary-500" /> Delivery & Check Pincode
      </h4>
      <div className="flex gap-2">
        <input
          type="text"
          maxLength={6}
          placeholder="Enter 6-digit pincode"
          value={pincode}
          onChange={(e) => {
            const v = e.target.value.replace(/\D/, '');
            setPincode(v);
            if (checked) setChecked(false);
          }}
          onKeyDown={(e) => e.key === 'Enter' && checkDelivery()}
          className="flex-1 px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-600 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-400 dark:text-white"
        />
        <button
          onClick={checkDelivery}
          disabled={pincode.length !== 6 || loading}
          className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-bold rounded-xl transition-all disabled:opacity-50 flex items-center gap-1.5"
        >
          {loading ? <Loader2 size={15} className="animate-spin" /> : 'Check'}
        </button>
      </div>

      <AnimatePresence>
        {checked && result && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 overflow-hidden"
          >
            {result.deliverable ? (
              <div className="flex items-start gap-2.5 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-100 dark:border-emerald-800">
                <CheckCircle2 size={18} className="text-emerald-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-emerald-800 dark:text-emerald-300">
                    Delivery available {result.city && `to ${result.city}${result.state ? `, ${result.state}` : ''}`}
                  </p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">
                    Expected by <strong>{getDeliveryDate(result.days)}</strong>
                    {result.days <= 2 && ' ⚡ Fast Delivery!'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-2.5 p-3 bg-rose-50 dark:bg-rose-900/20 rounded-xl border border-rose-100 dark:border-rose-800">
                <XCircle size={18} className="text-rose-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-rose-700 dark:text-rose-300">Delivery not available to this pincode</p>
                  <p className="text-xs text-rose-500 mt-0.5">Try a nearby pincode or contact support.</p>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <p className="text-[10px] text-slate-400 mt-2">
        Free delivery on orders above ₹499 • Returns within 30 days
      </p>
    </div>
  );
};

export default PincodeChecker;
