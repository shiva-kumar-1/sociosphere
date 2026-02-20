import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import BackgroundShapes from '../components/BackgroundShapes';
import * as api from '../lib/api';
import { User, Mail, Phone, Shield, Save, Loader2, Check, ArrowUpRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProfilePage({ navigate }: { navigate: (p: string) => void }) {
  const { isDark } = useTheme();
  const { user, isProvider, isCustomer, setAuth } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [upgrading, setUpgrading] = useState(false);

  // We don't have a GET /users/me endpoint, so we decode from token
  // and let the user edit. The actual name/mobile will be whatever
  // they last saved.
  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const res = await api.getCurrentUser();

      setFullName(res.data.fullName || '');
      setMobile(res.data.mobile || '');
      setEmail(res.data.email || '');


    } catch (err) {
      console.error(err);
      toast.error("Failed to load profile");
    }
  };


  const handleSave = async () => {
    if (!fullName.trim()) { toast.error('Name is required'); return; }
    if (!mobile.trim()) { toast.error('Mobile is required'); return; }
    setSaving(true);
    try {
      await api.updateProfile({ fullName, mobile });

      setSaved(true);
      toast.success('Profile updated!');
      setTimeout(() => setSaved(false), 2000);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      toast.error(error.response?.data?.error || 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  const handleUpgrade = async () => {
    if (!confirm('Upgrade to Service Provider?')) return;
    setUpgrading(true);
    try {
      await api.upgradeToProvider();
      // Re-login needed to get new token with updated role
      toast.success('Upgraded! Please sign in again for changes to take effect.');
      // Update local state
      if (user?.token) {
        // The backend only changes the role in DB but the JWT still has old role.
        // We'll update localStorage so UI reflects change, user should re-login ideally.
        localStorage.setItem('role', 'SERVICE_PROVIDER');
        setAuth(user.token, 'SERVICE_PROVIDER');
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      toast.error(error.response?.data?.error || 'Failed to upgrade');
    } finally {
      setUpgrading(false);
    }
  };

  const inputClass = `w-full px-4 py-3 rounded-xl border outline-none transition-all duration-300 text-sm
    ${isDark
      ? 'bg-white/5 border-cyber-border text-white placeholder-gray-500 focus:border-neon-blue focus:shadow-[0_0_15px_rgba(0,212,255,0.3)]'
      : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:shadow-[0_0_15px_rgba(0,100,255,0.15)]'}`;

  const readonlyClass = `w-full px-4 py-3 rounded-xl border text-sm cursor-not-allowed
    ${isDark ? 'bg-white/3 border-cyber-border/50 text-gray-500' : 'bg-gray-50 border-gray-200 text-gray-400'}`;

  return (
    <div className={`min-h-screen ${isDark ? 'bg-cyber-dark' : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'}`}>
      <BackgroundShapes />
      <div className="relative z-10">
        <Header navigate={navigate} currentPath="/profile" />
        <main className="max-w-2xl mx-auto px-4 py-8">
          <motion.div
            className="glass-card rounded-2xl overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Profile header */}
            <div className="h-32 relative bg-gradient-to-br from-neon-blue/20 to-neon-purple/20">
              <div className="absolute -bottom-10 left-6">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-neon-blue to-neon-purple flex items-center justify-center neon-glow-strong shadow-xl">
                  <User size={36} className="text-white" />
                </div>
              </div>
            </div>

            <div className="px-6 pt-14 pb-6 space-y-6">
              <div>
                <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {fullName || 'Your Profile'}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${isProvider ? 'bg-neon-purple/20 text-neon-purple' : 'bg-neon-blue/20 text-neon-blue'
                    }`}>
                    {user?.role === 'SERVICE_PROVIDER' ? 'Service Provider' : 'Customer'}
                  </span>
                </div>
              </div>

              {/* Editable fields */}
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    <User size={14} className="inline mr-1" /> Full Name
                  </label>
                  <input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Enter your full name" className={inputClass} />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    <Phone size={14} className="inline mr-1" /> Mobile
                  </label>
                  <input value={mobile} onChange={e => setMobile(e.target.value)} placeholder="Enter mobile number" className={inputClass} />
                </div>

                {/* Read-only */}
                <div>
                  <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    <Mail size={14} className="inline mr-1" /> Email (read-only)
                  </label>
                  <input value={email} readOnly className={readonlyClass} />

                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    <Shield size={14} className="inline mr-1" /> Role (read-only)
                  </label>
                  <input value={user?.role || ''} readOnly className={readonlyClass} />
                </div>
              </div>

              {/* Save button */}
              <motion.button
                onClick={handleSave}
                disabled={saving}
                className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-neon-blue to-neon-purple
                  hover:shadow-[0_0_25px_rgba(0,212,255,0.4)] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {saving ? <Loader2 size={18} className="animate-spin" /> : saved ? <Check size={18} /> : <Save size={18} />}
                {saved ? 'Saved!' : 'Save Changes'}
              </motion.button>

              {/* Upgrade to Provider */}
              {isCustomer && (
                <motion.button
                  onClick={handleUpgrade}
                  disabled={upgrading}
                  className={`w-full py-3 rounded-xl font-semibold border-2 flex items-center justify-center gap-2 transition-all
                    ${isDark
                      ? 'border-neon-purple/50 text-neon-purple hover:bg-neon-purple/10'
                      : 'border-purple-300 text-purple-600 hover:bg-purple-50'}
                    disabled:opacity-50`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {upgrading ? <Loader2 size={18} className="animate-spin" /> : <ArrowUpRight size={18} />}
                  Upgrade to Service Provider
                </motion.button>
              )}
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
