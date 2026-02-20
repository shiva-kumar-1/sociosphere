import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import BackgroundShapes from '../components/BackgroundShapes';
import CategorySymbols from '../components/CategorySymbols';
import * as api from '../lib/api';
import { CATEGORY_LIST } from '../lib/categories';
import {
  Plus, X, Loader2, Trash2, Edit3, Save, Package, ClipboardList,
  Gavel, Clock, MapPin, Check, AlertCircle, ChevronDown
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Service {
  id: string;
  title: string;
  category: string;
  description: string;
  price: number;
  slots: string[];
  location?: { coordinates: number[] };
  createdAt: string;
}

interface ServiceRequest {
  id: string;
  service: string;
  customer: { id: string; fullName: string; email: string };
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

type Tab = 'services' | 'requests' | 'bids';

export default function DashboardPage({ navigate }: { navigate: (p: string) => void }) {
  const { isDark } = useTheme();
  const { isProvider } = useAuth();
  const [tab, setTab] = useState<Tab>('services');
  const [services, setServices] = useState<Service[]>([]);
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      if (tab === 'services') {
        const res = await api.getAllServices();
        setServices(res.data);
      } else if (tab === 'requests') {
        const res = await api.getProviderRequests();
        setRequests(res.data);
      } else {
        const res = await api.getCustomerBids();
        setBids(res.data);
      }
    } catch {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => { load(); }, [load]);

  if (!isProvider) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-cyber-dark' : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'}`}>
        <BackgroundShapes />
        <div className="relative z-10">
          <Header navigate={navigate} currentPath="/dashboard" />
          <div className="text-center py-20">
            <AlertCircle size={48} className="mx-auto mb-4 text-neon-blue opacity-50" />
            <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Provider access only</p>
            <p className={`text-sm mt-2 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
              Upgrade your account to access the dashboard
            </p>
          </div>
        </div>
      </div>
    );
  }

  const tabs: { key: Tab; label: string; icon: typeof Package }[] = [
    { key: 'services', label: 'My Services', icon: Package },
    { key: 'requests', label: 'Requests', icon: ClipboardList },
    { key: 'bids', label: 'Bids Received', icon: Gavel },
  ];

  return (
    <div className={`min-h-screen ${isDark ? 'bg-cyber-dark' : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'}`}>
      <BackgroundShapes />
      <div className="relative z-10">
        <Header navigate={navigate} currentPath="/dashboard" />
        <main className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Dashboard</h1>
            {tab === 'services' && (
              <motion.button
                onClick={() => setShowCreate(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-white bg-gradient-to-r from-neon-blue to-neon-purple hover:shadow-[0_0_25px_rgba(0,212,255,0.4)] transition-all text-sm"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Plus size={16} /> Create Service
              </motion.button>
            )}
          </div>

          {/* Tabs */}
          <div className={`flex rounded-xl p-1 mb-6 ${isDark ? 'bg-white/5' : 'bg-gray-100'}`}>
            {tabs.map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all
                  ${tab === t.key
                    ? 'bg-gradient-to-r from-neon-blue to-neon-purple text-white shadow-lg'
                    : (isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900')}`}
              >
                <t.icon size={16} />
                <span className="hidden sm:inline">{t.label}</span>
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
                {tab === 'services' && <ServicesTab services={services} navigate={navigate} reload={load} isDark={isDark} />}
                {tab === 'requests' && <RequestsTab requests={requests} isDark={isDark} reload={load} />}
                {tab === 'bids' && <BidsTab bids={bids} isDark={isDark} reload={load} />}
              </motion.div>
            </AnimatePresence>
          )}
        </main>
      </div>

      {/* Create Service Modal */}
      <AnimatePresence>
        {showCreate && <CreateServiceModal onClose={() => setShowCreate(false)} onCreated={() => { setShowCreate(false); load(); }} isDark={isDark} />}
      </AnimatePresence>
    </div>
  );
}

/* ===== SERVICES TAB ===== */
function ServicesTab({
  services,
  navigate,
  reload,
  isDark
}: {
  services: Service[];
  navigate: (p: string) => void;
  reload: () => void;
  isDark: boolean;
}) {
  const { user } = useAuth();

  const [editingService, setEditingService] = useState<Service | null>(null);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
    slots: [] as string[]
  });

  const myServices = services.filter((s: any) => {
    const pid =
      typeof s.provider === "string"
        ? s.provider
        : s.provider?.id;
    return pid === user?.id;
  });

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this service?")) return;
    try {
      await api.deleteService(id);
      toast.success("Service deleted");
      reload();
    } catch {
      toast.error("Failed to delete");
    }
  };

  if (myServices.length === 0) {
    return (
      <div className="text-center py-16">
        <Package size={48} className="mx-auto mb-4 opacity-30" />
        <p className={isDark ? "text-gray-500" : "text-gray-400"}>
          No services created yet
        </p>
      </div>
    );
  }

  return (
    <>
      {/* GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {myServices.map((s, i) => (
          <motion.div
            key={s.id}
            className="glass-card rounded-2xl p-4 space-y-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <h3 className="font-bold text-white">{s.title}</h3>
            <p className="text-sm text-gray-400 line-clamp-2">
              {s.description}
            </p>
            <div className="flex justify-between">
              <span className="text-green-400 font-bold">
                ₹{s.price}
              </span>
              <span className="text-xs text-gray-400">
                {s.slots.length} slots
              </span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => navigate(`/service/${s.id}`)}
                className="flex-1 text-xs border rounded py-2"
              >
                View
              </button>

              <button
                onClick={() => {
                  setEditingService(s);
                  setEditForm({
                    title: s.title,
                    description: s.description,
                    price: String(s.price),
                    category: s.category,
                    slots: [...s.slots]
                  });
                }}
                className="text-xs border border-blue-500 text-blue-400 px-3 rounded"
              >
                Edit
              </button>

              <button
                onClick={() => handleDelete(s.id)}
                className="text-xs border border-red-500 text-red-400 px-3 rounded"
              >
                Delete
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ===== EDIT MODAL (OUTSIDE GRID) ===== */}
      <AnimatePresence>
        {editingService && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setEditingService(null)}
          >
            <motion.div
              className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl p-6 bg-cyber-dark border border-cyber-border"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">
                  Edit Service
                </h2>
                <button
                  onClick={() => setEditingService(null)}
                  className="text-gray-400 hover:text-white transition"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Form */}
              <div className="space-y-4">

                {/* Title */}
                <input
                  value={editForm.title}
                  onChange={(e) =>
                    setEditForm({ ...editForm, title: e.target.value })
                  }
                  placeholder="Service Title"
                  className="w-full px-4 py-2.5 rounded-xl border border-cyber-border bg-white/5 text-white focus:border-neon-blue focus:ring-1 focus:ring-neon-blue outline-none transition"
                />

                {/* Description */}
                <textarea
                  value={editForm.description}
                  onChange={(e) =>
                    setEditForm({ ...editForm, description: e.target.value })
                  }
                  placeholder="Description"
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl border border-cyber-border bg-white/5 text-white focus:border-neon-blue focus:ring-1 focus:ring-neon-blue outline-none resize-none transition"
                />

                {/* Price */}
                <input
                  type="number"
                  value={editForm.price}
                  onChange={(e) =>
                    setEditForm({ ...editForm, price: e.target.value })
                  }
                  placeholder="Price (₹)"
                  className="w-full px-4 py-2.5 rounded-xl border border-cyber-border bg-white/5 text-white focus:border-neon-blue focus:ring-1 focus:ring-neon-blue outline-none transition"
                />

                {/* Category */}
                <select
                  value={editForm.category}
                  onChange={(e) =>
                    setEditForm({ ...editForm, category: e.target.value })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-cyber-border bg-white/5 text-white focus:border-neon-blue focus:ring-1 focus:ring-neon-blue outline-none transition"
                >
                  {CATEGORY_LIST.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>

                {/* Slots */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">
                    Time Slots
                  </label>

                  {editForm.slots.map((slot, index) => (
                    <input
                      key={index}
                      value={slot}
                      onChange={(e) => {
                        const newSlots = [...editForm.slots];
                        newSlots[index] = e.target.value;
                        setEditForm({ ...editForm, slots: newSlots });
                      }}
                      placeholder={`Slot ${index + 1}`}
                      className="w-full px-4 py-2.5 rounded-xl border border-cyber-border bg-white/5 text-white focus:border-neon-blue focus:ring-1 focus:ring-neon-blue outline-none transition"
                    />
                  ))}
                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    onClick={() => setEditingService(null)}
                    className="px-4 py-2 text-gray-400 hover:text-white transition"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={async () => {
                      try {
                        await api.updateService(editingService.id, {
                          ...editForm,
                          price: Number(editForm.price),
                        });

                        toast.success("Service updated!");
                        setEditingService(null);
                        reload();
                      } catch {
                        toast.error("Update failed");
                      }
                    }}
                    className="px-6 py-2 rounded-xl font-semibold text-white bg-gradient-to-r from-neon-blue to-neon-purple hover:shadow-[0_0_20px_rgba(0,212,255,0.4)] transition-all"
                  >
                    Save Changes
                  </button>
                </div>

              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </>
  );
}

/* ===== REQUESTS TAB ===== */
function RequestsTab({ requests, isDark, reload }: {
  requests: ServiceRequest[]; isDark: boolean; reload: () => void;
}) {
  const [bidding, setBidding] = useState<string | null>(null);
  const [bidAmount, setBidAmount] = useState('');
  const [bidMessage, setBidMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handlePlaceBid = async (requestId: string) => {
    if (!bidAmount || Number(bidAmount) <= 0) {
      toast.error('Enter a valid bid amount');
      return;
    }
    setSubmitting(true);
    try {
      await api.placeBid(requestId, Number(bidAmount), bidMessage);
      toast.success('Bid placed!');
      setBidding(null);
      setBidAmount('');
      setBidMessage('');
      reload();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      toast.error(error.response?.data?.error || 'Failed to place bid');
    } finally {
      setSubmitting(false);
    }
  };

  if (requests.length === 0) {
    return (
      <div className="text-center py-16">
        <ClipboardList size={48} className="mx-auto mb-4 opacity-30" />
        <p className={isDark ? 'text-gray-500' : 'text-gray-400'}>No requests received yet</p>
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    PENDING: 'text-yellow-400 bg-yellow-400/10',
    ACCEPTED: 'text-green-400 bg-green-400/10',
    REJECTED: 'text-red-400 bg-red-400/10',
    RESPONDED: 'text-blue-400 bg-blue-400/10',
  };

  return (
    <div className="space-y-4">
      {requests.map((r, i) => (
        <motion.div
          key={r.id}
          className="glass-card rounded-2xl p-5 space-y-3"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
        >
          <div className="flex items-start justify-between flex-wrap gap-2">
            <div>
              <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                From: {r.customer?.fullName || 'Unknown'}
              </p>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{r.customer?.email}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[r.status] || 'text-gray-400 bg-gray-400/10'}`}>
              {r.status}
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className={`flex items-center gap-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              <Clock size={14} /> {r.requestedSlot}
            </span>
            <span className={`text-xs ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
              {new Date(r.createdAt).toLocaleDateString()}
            </span>
          </div>

          {r.status === 'PENDING' && (
            <>
              {bidding === r.id ? (
                <motion.div
                  className="space-y-3 pt-2"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                >
                  <input
                    type="number"
                    placeholder="Bid Amount (₹)"
                    value={bidAmount}
                    onChange={e => setBidAmount(e.target.value)}
                    className={`w-full px-4 py-2.5 rounded-xl border outline-none text-sm transition-all
                      ${isDark ? 'bg-white/5 border-cyber-border text-white focus:border-neon-blue' : 'bg-white border-gray-200 text-gray-900 focus:border-blue-500'}`}
                  />
                  <textarea
                    placeholder="Message (optional)"
                    value={bidMessage}
                    onChange={e => setBidMessage(e.target.value)}
                    rows={2}
                    className={`w-full px-4 py-2.5 rounded-xl border outline-none text-sm transition-all resize-none
                      ${isDark ? 'bg-white/5 border-cyber-border text-white focus:border-neon-blue' : 'bg-white border-gray-200 text-gray-900 focus:border-blue-500'}`}
                  />
                  <div className="flex gap-2">
                    <motion.button
                      onClick={() => handlePlaceBid(r.id)}
                      disabled={submitting}
                      className="flex-1 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-neon-blue to-neon-purple disabled:opacity-50 flex items-center justify-center gap-1"
                      whileTap={{ scale: 0.98 }}
                    >
                      {submitting ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                      Submit Bid
                    </motion.button>
                    <button
                      onClick={() => { setBidding(null); setBidAmount(''); setBidMessage(''); }}
                      className={`px-4 py-2 rounded-xl text-sm border ${isDark ? 'border-cyber-border text-gray-400' : 'border-gray-200 text-gray-500'}`}
                    >
                      Cancel
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.button
                  onClick={() => setBidding(r.id)}
                  className={`w-full py-2 rounded-xl text-sm font-medium border transition-all ${isDark ? 'border-neon-blue/30 text-neon-blue hover:bg-neon-blue/10' : 'border-blue-300 text-blue-600 hover:bg-blue-50'}`}
                  whileTap={{ scale: 0.98 }}
                >
                  <Gavel size={14} className="inline mr-1" /> Place Bid
                </motion.button>
              )}
            </>
          )}
        </motion.div>
      ))}
    </div>
  );
}

/* ===== BIDS TAB ===== */
function BidsTab({ bids, isDark, reload }: {
  bids: Bid[]; isDark: boolean; reload: () => void;
}) {
  const handleWithdraw = async (id: string) => {
    if (!confirm('Withdraw this bid?')) return;
    try {
      await api.withdrawBid(id);
      toast.success('Bid withdrawn');
      reload();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      toast.error(error.response?.data?.error || 'Failed to withdraw');
    }
  };

  if (bids.length === 0) {
    return (
      <div className="text-center py-16">
        <Gavel size={48} className="mx-auto mb-4 opacity-30" />
        <p className={isDark ? 'text-gray-500' : 'text-gray-400'}>No bids placed yet</p>
      </div>
    );
  }

  return (
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
              <span className={`text-lg font-bold ${isDark ? 'text-neon-green' : 'text-green-600'}`}>₹{b.amount}</span>
              {b.message && <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{b.message}</p>}
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                {new Date(b.createdAt).toLocaleDateString()}
              </span>
              {b.serviceRequest?.status === 'PENDING' && (
                <motion.button
                  onClick={() => handleWithdraw(b.id)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all"
                  whileTap={{ scale: 0.95 }}
                >
                  Withdraw
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

/* ===== CREATE SERVICE MODAL ===== */
function CreateServiceModal({ onClose, onCreated, isDark }: {
  onClose: () => void;
  onCreated: () => void;
  isDark: boolean;
}) {
  const [form, setForm] = useState({
    title: '',
    category: CATEGORY_LIST[0],
    description: '',
    price: '',
    slots: [''],
    lat: '',
    lng: '',
  });

  const [images, setImages] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const updateField = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const updateSlot = (idx: number, value: string) => {
    const next = [...form.slots];
    next[idx] = value;
    setForm(prev => ({ ...prev, slots: next }));
  };

  const addSlot = () => setForm(prev => ({ ...prev, slots: [...prev.slots, ''] }));

  const removeSlot = (idx: number) => {
    if (form.slots.length <= 1) return;
    setForm(prev => ({
      ...prev,
      slots: prev.slots.filter((_, i) => i !== idx),
    }));
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation not supported');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm(prev => ({
          ...prev,
          lat: pos.coords.latitude.toString(),
          lng: pos.coords.longitude.toString(),
        }));
        toast.success('Location captured');
      },
      () => toast.error('Location access denied')
    );
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) {
      toast.error('Title required');
      return;
    }

    if (!form.price || Number(form.price) <= 0) {
      toast.error('Valid price required');
      return;
    }

    const validSlots = form.slots.filter(s => s.trim());
    if (validSlots.length === 0) {
      toast.error('At least one slot required');
      return;
    }

    if (!form.lat || !form.lng) {
      toast.error('Location required');
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();

      formData.append('title', form.title);
      formData.append('category', form.category);
      formData.append('description', form.description);
      formData.append('price', form.price);
      formData.append('location[lat]', form.lat);
      formData.append('location[lng]', form.lng);



      validSlots.forEach(slot => {
        formData.append('slots', slot);
      });

      images.forEach(img => {
        formData.append('images', img);
      });

      await api.createService(formData);

      toast.success('Service created!');
      onCreated();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      toast.error(error.response?.data?.error || 'Failed to create service');
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = `w-full px-4 py-2.5 rounded-xl border outline-none text-sm transition-all
    ${isDark
      ? 'bg-white/5 border-cyber-border text-white focus:border-neon-blue'
      : 'bg-white border-gray-200 text-gray-900 focus:border-blue-500'}`;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        className={`w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl p-6 ${isDark ? 'bg-cyber-dark border border-cyber-border' : 'bg-white border border-gray-200'
          }`}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Create Service</h2>
          <button onClick={onClose}><X size={20} /></button>
        </div>

        <div className="space-y-4">

          <input
            placeholder="Service Title"
            value={form.title}
            onChange={e => updateField('title', e.target.value)}
            className={inputClass}
          />

          {/* Category */}
          <select
            value={form.category}
            onChange={e => updateField('category', e.target.value)}
            className={inputClass}
          >
            {CATEGORY_LIST.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <textarea
            placeholder="Description"
            value={form.description}
            onChange={e => updateField('description', e.target.value)}
            rows={3}
            className={`${inputClass} resize-none`}
          />

          <input
            type="number"
            placeholder="Price (₹)"
            value={form.price}
            onChange={e => updateField('price', e.target.value)}
            className={inputClass}
          />

          {/* Slots */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Time Slots</label>
            {form.slots.map((slot, idx) => (
              <div key={idx} className="flex gap-2">
                <input
                  placeholder={`Slot ${idx + 1}`}
                  value={slot}
                  onChange={e => updateSlot(idx, e.target.value)}
                  className={`${inputClass} flex-1`}
                />
                {form.slots.length > 1 && (
                  <button onClick={() => removeSlot(idx)}>
                    <X size={16} />
                  </button>
                )}
              </div>
            ))}
            <button onClick={addSlot} className="text-sm text-blue-500">
              + Add Slot
            </button>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Location</label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder="Latitude"
                value={form.lat}
                onChange={e => updateField('lat', e.target.value)}
                className={inputClass}
              />
              <input
                type="number"
                placeholder="Longitude"
                value={form.lng}
                onChange={e => updateField('lng', e.target.value)}
                className={inputClass}
              />
            </div>
            <button onClick={handleGetLocation} className="text-sm text-blue-500">
              Use Current Location
            </button>
          </div>

          {/* Images */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Upload Images (Max 5)</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => {
                const files = e.target.files ? Array.from(e.target.files) : [];
                if (files.length > 5) {
                  toast.error("Maximum 5 images allowed");
                  return;
                }
                setImages(files);
              }}
              className={inputClass}
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-neon-blue to-neon-purple"
          >
            {submitting ? "Creating..." : "Create Service"}
          </button>

        </div>
      </motion.div>
    </motion.div>
  );
}
