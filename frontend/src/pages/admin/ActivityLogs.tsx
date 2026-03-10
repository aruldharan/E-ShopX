import { useQuery } from '@tanstack/react-query';
import { Activity, Search, ShieldAlert, FileText, CheckCircle, Trash2, Edit, ShoppingBag, User } from 'lucide-react';
import api from '../../services/api';
import { useState } from 'react';

const ActivityLogs = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['staffLogs'],
    queryFn: async () => {
      const res = await api.get('/admin/logs');
      return res.data.logs;
    },
  });

  const getActionIcon = (action: string) => {
    const act = action.toLowerCase();
    if (act.includes('delete') || act.includes('remove')) return <Trash2 size={16} className="text-rose-500" />;
    if (act.includes('update') || act.includes('edit')) return <Edit size={16} className="text-indigo-500" />;
    if (act.includes('create') || act.includes('add')) return <CheckCircle size={16} className="text-emerald-500" />;
    if (act.includes('status') || act.includes('order')) return <ShoppingBag size={16} className="text-amber-500" />;
    if (act.includes('role') || act.includes('user')) return <User size={16} className="text-purple-500" />;
    return <FileText size={16} className="text-slate-500" />;
  };

  const filteredLogs = logs.filter((log: any) => 
    log.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    log.action.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <ShieldAlert className="text-primary-600" size={32} />
            Security & Audit Logs
          </h2>
          <p className="text-slate-500 mt-1">Track staff activity, modifications, and system events.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search events by user or action..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary-500/20 transition-all font-medium text-slate-700"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="p-12 flex flex-col items-center justify-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
            <p className="text-slate-400 font-medium">Fetching secure logs...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50/50 border-b border-slate-100">
                <tr>
                  <th className="text-left px-8 py-5 text-slate-500 font-bold uppercase tracking-wider text-xs">Timestamp</th>
                  <th className="text-left px-8 py-5 text-slate-500 font-bold uppercase tracking-wider text-xs">Staff Member</th>
                  <th className="text-left px-8 py-5 text-slate-500 font-bold uppercase tracking-wider text-xs">Action Performed</th>
                  <th className="text-left px-8 py-5 text-slate-500 font-bold uppercase tracking-wider text-xs">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredLogs.map((log: any) => (
                  <tr key={log._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-4 whitespace-nowrap text-slate-500 font-mono text-xs">
                      {new Date(log.createdAt).toLocaleString(undefined, { 
                        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit'
                      })}
                    </td>
                    <td className="px-8 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center font-bold text-slate-600 text-xs">
                          {log.user?.name?.charAt(0) || '?'}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{log.user?.name || 'Unknown User'}</p>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-primary-600">{log.user?.role || 'Removed'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-4">
                      <div className="flex items-center gap-2">
                        {getActionIcon(log.action)}
                        <span className="font-bold text-slate-700">{log.action}</span>
                      </div>
                    </td>
                    <td className="px-8 py-4 text-slate-600">
                      <div className="max-w-md truncate" title={log.details}>
                        {log.targetModel && <span className="mr-2 px-2 py-0.5 bg-slate-100 rounded text-xs font-mono">{log.targetModel}</span>}
                        {log.details || 'No additional details provided.'}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredLogs.length === 0 && (
              <div className="text-center py-20">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Activity size={32} className="text-slate-300" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">No logs found</h3>
                <p className="text-slate-500 mt-2 px-6 max-w-sm mx-auto">No activity matches your search criteria, or no logs have been recorded yet.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityLogs;
