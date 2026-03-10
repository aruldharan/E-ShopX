import { motion, AnimatePresence } from 'framer-motion';
import { X, Ruler } from 'lucide-react';

interface SizeChartModalProps {
  onClose: () => void;
}

const clothingSizes = [
  { size: 'XS', chest: '32-33"', waist: '24-25"', hip: '34-35"', shoulder: '14"', metric: 'UK 4 / EU 32' },
  { size: 'S',  chest: '34-35"', waist: '26-27"', hip: '36-37"', shoulder: '14.5"', metric: 'UK 6 / EU 34' },
  { size: 'M',  chest: '36-38"', waist: '28-30"', hip: '38-40"', shoulder: '15.5"', metric: 'UK 8-10 / EU 36-38' },
  { size: 'L',  chest: '40-42"', waist: '32-34"', hip: '42-44"', shoulder: '16.5"', metric: 'UK 12-14 / EU 40-42' },
  { size: 'XL', chest: '44-46"', waist: '36-38"', hip: '46-48"', shoulder: '17.5"', metric: 'UK 16 / EU 44' },
  { size: 'XXL',chest: '48-50"', waist: '40-42"', hip: '50-52"', shoulder: '18.5"', metric: 'UK 18 / EU 46' },
];

const footwearSizes = [
  { uk: 'UK 5', eu: 'EU 38', us: 'US 6',   cm: '23.5' },
  { uk: 'UK 6', eu: 'EU 39', us: 'US 7',   cm: '24.5' },
  { uk: 'UK 7', eu: 'EU 40', us: 'US 8',   cm: '25.5' },
  { uk: 'UK 8', eu: 'EU 41', us: 'US 9',   cm: '26.5' },
  { uk: 'UK 9', eu: 'EU 42', us: 'US 10',  cm: '27.5' },
  { uk: 'UK 10',eu: 'EU 43', us: 'US 11',  cm: '28.5' },
  { uk: 'UK 11',eu: 'EU 44', us: 'US 12',  cm: '29.5' },
];

const SizeChartModal = ({ onClose }: SizeChartModalProps) => {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ type: 'spring', damping: 25 }}
          className="bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-zinc-700">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-primary-100 rounded-xl flex items-center justify-center">
                <Ruler size={18} className="text-primary-600" />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">Size Guide</h2>
                <p className="text-xs text-slate-500">Measurements in inches & cm</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          <div className="overflow-y-auto p-6 space-y-8">
            {/* How to Measure */}
            <div className="bg-primary-50 dark:bg-zinc-800 rounded-2xl p-4 border border-primary-100 dark:border-zinc-700">
              <h3 className="font-bold text-primary-800 dark:text-primary-300 mb-2 text-sm">📏 How to Measure</h3>
              <ul className="text-xs text-primary-700 dark:text-slate-300 space-y-1">
                <li><strong>Chest:</strong> Measure around the fullest part of your chest, keeping tape parallel to the ground.</li>
                <li><strong>Waist:</strong> Measure around the natural waistline, keeping tape comfortably loose.</li>
                <li><strong>Hip:</strong> Measure around the fullest part of the hips, about 8" below the waistline.</li>
              </ul>
            </div>

            {/* Clothing Size Chart */}
            <div>
              <h3 className="font-bold text-slate-800 dark:text-white mb-3">👕 Clothing Sizes</h3>
              <div className="overflow-x-auto rounded-2xl border border-slate-100 dark:border-zinc-700">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-zinc-800">
                      {['Size', 'Chest', 'Waist', 'Hip', 'Shoulder', 'Int\'l Equiv.'].map((h) => (
                        <th key={h} className="text-left px-4 py-3 font-bold text-slate-600 dark:text-slate-300 text-xs uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-zinc-700">
                    {clothingSizes.map((row, i) => (
                      <tr key={row.size} className={i % 2 === 0 ? 'bg-white dark:bg-zinc-900' : 'bg-slate-50/50 dark:bg-zinc-800/50'}>
                        <td className="px-4 py-3 font-extrabold text-primary-600">{row.size}</td>
                        <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{row.chest}</td>
                        <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{row.waist}</td>
                        <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{row.hip}</td>
                        <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{row.shoulder}</td>
                        <td className="px-4 py-3 text-slate-500 dark:text-slate-400 text-xs">{row.metric}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footwear Size Chart */}
            <div>
              <h3 className="font-bold text-slate-800 dark:text-white mb-3">👟 Footwear Sizes</h3>
              <div className="overflow-x-auto rounded-2xl border border-slate-100 dark:border-zinc-700">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-zinc-800">
                      {['UK', 'EU', 'US', 'Foot Length (cm)'].map((h) => (
                        <th key={h} className="text-left px-4 py-3 font-bold text-slate-600 dark:text-slate-300 text-xs uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-zinc-700">
                    {footwearSizes.map((row, i) => (
                      <tr key={row.uk} className={i % 2 === 0 ? 'bg-white dark:bg-zinc-900' : 'bg-slate-50/50 dark:bg-zinc-800/50'}>
                        <td className="px-4 py-3 font-extrabold text-primary-600">{row.uk}</td>
                        <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{row.eu}</td>
                        <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{row.us}</td>
                        <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{row.cm} cm</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <p className="text-xs text-center text-slate-400">
              Sizes may vary slightly between brands. When in doubt, go one size up for a comfortable fit.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SizeChartModal;
