import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import BackgroundShapes from '../components/BackgroundShapes';
import * as api from '../lib/api';
import { ClipboardList, Clock, Loader2, Trash2, Check, DollarSign, Gavel, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface ServiceRequest {
  id: string;
  service: { id: string; title: string; category: string; price: number } | null;
  customer: string;
  provider: string;
  requestedSlot: string;
  status: string;
  createdAt: string;
}

interface Bid {
  id: string;
  serviceRequest: { id: string; customer: string; status: string } | null;
  provider: { id: string; fullName: string };
  amount: number;
  message: string;
  createdAt: string;
}

export default function CustomerRequestsPage({ navigate }: { navigate: (p: string) => void }) {
  const { isDark } = useTheme();
  const { isCustomer } = useAuth();
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'requests' | 'bids'>('requests');
  const [accepting, setAccepting] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [reqRes, bidRes] = await Promise.all([
        api.getCustomerRequests(),
        api.getCustomerBids(),
      ]);
      setRequests(reqRes.data);
      setBids(bidRes.data);
    } catch {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm('Cancel this request?')) return;
    try {
      await api.cancelRequest(id);
      toast.success('Request cancelled');
      loadData();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      toast.error(error.response?.data?.error || 'Failed to cancel');
    }
  };

  const handleAcceptBid = async (requestId: string, bidId: string) => {
    setAccepting(bidId);
    try {
      await api.acceptRequest(requestId, bidId);
      toast.success('Bid accepted! A chat channel has been created.');
      loadData();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      toast.error(error.response?.data?.error || 'Failed to accept bid');
    } finally {
      setAccepting(null);
    }
  };

  if (!isCustomer) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-cyber-dark' : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'}`}>
        <BackgroundShapes />
        <div className="relative z-10">
          <Header navigate={navigate} currentPath="/my-requests" />
          <div className="text-center py-20">
            <AlertCircle size={48} className="mx-auto mb-4 text-neon-blue opacity-50" />
            <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Customer access only</p>
          </div>
        </div>
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    PENDING: 'text-yellow-400 bg-yellow-400/10',
    ACCEPTED: 'text-green-400 bg-green-400/10',
    REJECTED: 'text-red-400 bg-red-400/10',
    RESPONDED: 'text-blue-400 bg-blue-400/10',
  };

  // Group bids by service request
  const getBidsForRequest = (requestId: string) => {
    return bids.filter(b => b.serviceRequest?.id === requestId);
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-cyber-dark' : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'}`}>
      <BackgroundShapes />
      <div className="relative z-10">
        <Header navigate={navigate} currentPath="/my-requests" />
        <main className="max-w-4xl mx-auto px-4 py-6">
          <h1 className={`text-2xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            My Requests
          </h1>

          {/* Tabs */}
          <div className={`flex rounded-xl p-1 mb-6 max-w-sm ${isDark ? 'bg-white/5' : 'bg-gray-100'}`}>
            {[
              { key: 'requests' as const, label: 'Requests', icon: ClipboardList },
              { key: 'bids' as const, label: 'Bids', icon: Gavel },
            ].map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-all
                  ${tab === t.key
                    ? 'bg-gradient-to-r from-neon-blue to-neon-purple text-white shadow-lg'
                    : (isDark ? 'text-gray-400' : 'text-gray-500')}`}
              >
                <t.icon size={14} /> {t.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <motion.div className="w-12 h-12 rounded-full border-2 border-neon-blue border-t-transparent" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} />
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={tab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                {tab === 'requests' ? (
                  requests.length === 0 ? (
                    <div className="text-center py-16">
                      <ClipboardList size={48} className="mx-auto mb-4 opacity-30" />
                      <p className={isDark ? 'text-gray-500' : 'text-gray-400'}>No requests yet</p>
                      <button onClick={() => navigate('/home')} className="mt-3 text-sm text-neon-blue hover:underline">
                        Browse services →
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {requests.map((r, i) => {
                        const requestBids = getBidsForRequest(r.id);
                        return (
                          <motion.div
                            key={r.id}
                            className="glass-card rounded-2xl p-5 space-y-3"
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                          >
                            <div className="flex items-start justify-between flex-wrap gap-2">
                              <div>
                                <p className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                  {r.service?.title || 'Service'}
                                </p>
                                {r.service && (
                                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                    {r.service.category} • ₹{r.service.price}
                                  </p>
                                )}
                              </div>
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[r.status] || ''}`}>
                                {r.status}
                              </span>
                            </div>

                            <div className="flex items-center gap-3 text-sm">
                              <span className={`flex items-center gap-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                <Clock size={14} /> {r.requestedSlot}
                              </span>
                              <span className={`text-xs ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                                {new Date(r.createdAt).toLocaleDateString()}
                              </span>
                            </div>

                            {/* Bids for this request */}
                            {requestBids.length > 0 && r.status === 'PENDING' && (
                              <div className="space-y-2 pt-2">
                                <p className={`text-xs font-semibold ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                  Bids Received ({requestBids.length})
                                </p>
                                {requestBids.map(bid => (
                                  <div key={bid.id} className={`flex items-center justify-between p-3 rounded-xl border ${isDark ? 'border-cyber-border' : 'border-gray-100'}`}>
                                    <div>
                                      <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                        {bid.provider?.fullName || 'Provider'}
                                      </p>
                                      <div className="flex items-center gap-2">
                                        <span className={`flex items-center gap-0.5 text-sm font-bold ${isDark ? 'text-neon-green' : 'text-green-600'}`}>
                                          <DollarSign size={12} />₹{bid.amount}
                                        </span>
                                        {bid.message && (
                                          <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                            — {bid.message}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                    <motion.button
                                      onClick={() => handleAcceptBid(r.id, bid.id)}
                                      disabled={accepting === bid.id}
                                      className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-green-500 to-emerald-600 disabled:opacity-50 flex items-center gap-1"
                                      whileTap={{ scale: 0.95 }}
                                    >
                                      {accepting === bid.id ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                                      Accept
                                    </motion.button>
                                  </div>
                                ))}
                              </div>
                            )}

                            {r.status === 'PENDING' && (
                              <motion.button
                                onClick={() => handleCancel(r.id)}
                                className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 transition-colors pt-1"
                                whileTap={{ scale: 0.95 }}
                              >
                                <Trash2 size={12} /> Cancel Request
                              </motion.button>
                            )}
                          </motion.div>
                        );
                      })}
                    </div>
                  )
                ) : (
                  // All Bids tab
                  bids.length === 0 ? (
                    <div className="text-center py-16">
                      <Gavel size={48} className="mx-auto mb-4 opacity-30" />
                      <p className={isDark ? 'text-gray-500' : 'text-gray-400'}>No bids received yet</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {bids.map((b, i) => (
                        <motion.div
                          key={b.id}
                          className="glass-card rounded-2xl p-5"
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05 }}
                        >
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <div>
                              <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {b.provider?.fullName || 'Provider'}
                              </p>
                              <span className={`text-lg font-bold ${isDark ? 'text-neon-green' : 'text-green-600'}`}>₹{b.amount}</span>
                              {b.message && <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{b.message}</p>}
                            </div>
                            <div className="flex items-center gap-2">
                              {b.serviceRequest?.status === 'PENDING' && (
                                <motion.button
                                  onClick={() => handleAcceptBid(b.serviceRequest!.id, b.id)}
                                  disabled={accepting === b.id}
                                  className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-green-500 to-emerald-600 disabled:opacity-50 flex items-center gap-1"
                                  whileTap={{ scale: 0.95 }}
                                >
                                  {accepting === b.id ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                                  Accept
                                </motion.button>
                              )}
                              <span className={`text-xs ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                                {new Date(b.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </main>
      </div>
    </div>
  );
}
