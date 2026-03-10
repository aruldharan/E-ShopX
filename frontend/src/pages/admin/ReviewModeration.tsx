import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MessageSquare, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../services/api';

const ReviewModeration = () => {
  const queryClient = useQueryClient();

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ['pendingReviews'],
    queryFn: async () => {
      const res = await api.get('/admin/reviews/pending');
      return res.data.reviews;
    },
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => api.put(`/reviews/${id}/approve`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingReviews'] });
      toast.success('Review published to storefront!');
    },
    onError: () => toast.error('Failed to approve review'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/reviews/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingReviews'] });
      toast.info('Review rejected and permanently deleted.');
    },
    onError: () => toast.error('Failed to delete review'),
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <MessageSquare className="text-indigo-500" size={32} />
            Review Moderation Queue
          </h2>
          <p className="text-slate-500 mt-1">Approve or reject customer reviews before they appear publicly.</p>
        </div>
        <div className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-xl border border-indigo-100 font-bold flex items-center gap-2">
          <span>{reviews.length} Pending</span>
        </div>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-2xl p-12 shadow-sm border border-slate-100 flex flex-col items-center justify-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
          <p className="text-slate-400 font-medium">Loading moderation queue...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {reviews.map((review: any) => (
            <div key={review._id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col hover:border-indigo-200 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-sm border border-slate-200">
                    {review.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">{review.name}</h4>
                    <p className="text-xs text-slate-500">{new Date(review.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex gap-1 text-amber-400" title={`Rating: ${review.rating}`}>
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className={`w-5 h-5 ${i < review.rating ? 'fill-current' : 'text-slate-200 fill-current'}`} viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>

              <div className="mb-6 flex-1">
                <div className="inline-block bg-slate-50 rounded-lg px-3 py-1.5 mb-3 border border-slate-100 flex items-center gap-2 w-fit">
                   {review.product?.images?.[0] && (
                     <img src={review.product.images[0]} alt="" className="w-6 h-6 rounded object-cover" />
                   )}
                   <span className="text-sm font-semibold text-slate-700 truncate max-w-[200px]">{review.product?.name || 'Deleted Product'}</span>
                </div>
                <p className="text-slate-700 leading-relaxed italic border-l-4 border-slate-200 pl-4 py-1">"{review.comment}"</p>
              </div>

              <div className="flex gap-3 mt-auto border-t border-slate-50 pt-4">
                <button 
                  onClick={() => deleteMutation.mutate(review._id)}
                  disabled={deleteMutation.isPending || approveMutation.isPending}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 rounded-xl font-bold transition-colors disabled:opacity-50"
                >
                  <XCircle size={18} /> Reject
                </button>
                <button 
                  onClick={() => approveMutation.mutate(review._id)}
                  disabled={deleteMutation.isPending || approveMutation.isPending}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-colors shadow-lg shadow-indigo-500/25 active:scale-95 disabled:opacity-50"
                >
                  <CheckCircle size={18} /> Approve
                </button>
              </div>
            </div>
          ))}

          {reviews.length === 0 && (
            <div className="col-span-full py-24 flex flex-col items-center justify-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
              <div className="w-20 h-20 bg-white rounded-full shadow-sm flex items-center justify-center mb-4 text-slate-300">
                <CheckCircle size={40} />
              </div>
              <h3 className="text-xl font-bold text-slate-900">All caught up!</h3>
              <p className="text-slate-500 mt-2">There are no pending reviews in the moderation queue.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ReviewModeration;
