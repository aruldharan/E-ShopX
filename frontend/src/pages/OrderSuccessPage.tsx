import { Link, useParams } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const OrderSuccessPage = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="min-h-screen flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center max-w-md px-4"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <CheckCircle size={48} className="text-green-500" />
        </motion.div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Order Placed!</h1>
        <p className="text-gray-500 mb-6">
          Your order <span className="font-semibold text-gray-700">#{id?.slice(-8).toUpperCase()}</span> has been placed successfully. You'll receive a confirmation soon.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to={`/orders/${id}`} className="btn-primary">Track Order</Link>
          <Link to="/shop" className="btn-outline">Continue Shopping</Link>
        </div>
      </motion.div>
    </div>
  );
};

export default OrderSuccessPage;
