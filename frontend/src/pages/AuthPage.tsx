import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import BackgroundShapes from '../components/BackgroundShapes';
import Logo from '../components/Logo';
import ThemeToggle from '../components/ThemeToggle';
import OTPInput from '../components/OTPInput';
import * as api from '../lib/api';
import { User, Briefcase, Mail, Lock, Phone, UserCircle, ArrowLeft, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { Eye, EyeOff } from "lucide-react";

type AuthMode = 'signup' | 'signin';
type Role = 'CUSTOMER' | 'SERVICE_PROVIDER';
type Step = 'form' | 'otp';

interface FormData {
  fullName: string;
  email: string;
  mobile: string;
  password: string;
  confirmPassword: string;
}

export default function AuthPage({ onAuth }: { onAuth: () => void }) {
  const { isDark } = useTheme();
  const { setAuth } = useAuth();
  const [role, setRole] = useState<Role>('CUSTOMER');
  const [mode, setMode] = useState<AuthMode>('signin');
  const [step, setStep] = useState<Step>('form');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [form, setForm] = useState<FormData>({
    fullName: '', email: '', mobile: '', password: '', confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 768;

  const startCountdown = () => {
    setCountdown(300); // 5 min = backend OTP_EXPIRY
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  const validate = () => {
    if (mode === 'signup') {
      if (!form.fullName.trim()) { toast.error('Full name is required'); return false; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { toast.error('Invalid email'); return false; }
      if (!/^\d{10}$/.test(form.mobile)) { toast.error('Mobile must be 10 digits'); return false; }
      if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return false; }
      if (form.password !== form.confirmPassword) { toast.error('Passwords do not match'); return false; }
    } else {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { toast.error('Invalid email'); return false; }
      if (!form.password) { toast.error('Password required'); return false; }
    }
    return true;
  };

  const handleSendOTP = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      if (mode === 'signup') {
        const purpose = role === 'SERVICE_PROVIDER' ? 'PROVIDER_SIGNUP' : 'CUSTOMER_SIGNUP';
        await api.sendOTP(form.email, purpose);
        toast.success('OTP sent to your email');
      } else {
        await api.login(form.email, form.password);
        toast.success('OTP sent for login verification');
      }
      setStep('otp');
      startCountdown();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      toast.error(error.response?.data?.error || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0) return;
    setLoading(true);
    try {
      if (mode === 'signup') {
        const purpose = role === 'SERVICE_PROVIDER' ? 'PROVIDER_SIGNUP' : 'CUSTOMER_SIGNUP';
        await api.sendOTP(form.email, purpose);
      } else {
        await api.login(form.email, form.password);
      }
      toast.success('OTP resent');
      startCountdown();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      toast.error(error.response?.data?.error || 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleOTPComplete = async (otp: string) => {
    setLoading(true);
    try {
      if (mode === 'signup') {
        const purpose = role === 'SERVICE_PROVIDER' ? 'PROVIDER_SIGNUP' : 'CUSTOMER_SIGNUP';
        await api.verifyOTP(form.email, otp, purpose);
        await api.signup({
          fullName: form.fullName,
          email: form.email,
          mobile: form.mobile,
          password: form.password,
          role,
        });
        toast.success('Signup successful! Please sign in.');
        setMode('signin');
        setStep('form');
      } else {
        const res = await api.verifyLoginOTP(form.email, otp);
        setAuth(res.data.token, res.data.role);
        toast.success('Welcome to SocioSphere!');
        onAuth();
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      toast.error(error.response?.data?.error || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const updateForm = (field: keyof FormData, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const inputClass = `w-full pl-10 pr-4 py-3 rounded-xl border outline-none transition-all duration-300 text-sm
    ${isDark
      ? 'bg-white/5 border-cyber-border text-white placeholder-gray-500 focus:border-neon-blue focus:shadow-[0_0_15px_rgba(0,212,255,0.3)]'
      : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:shadow-[0_0_15px_rgba(0,100,255,0.15)]'}`;

  const iconClass = `absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-neon-blue/50' : 'text-blue-400'}`;
  const handleGoogleLogin = (selectedRole: Role) => {
    window.location.href =
      `http://localhost:5000/api/auth/google?role=${selectedRole}`;
  };

  const renderForm = () => (
    <motion.div
      key={`${mode}-${role}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-4"
    >
      {mode === 'signup' && (
        <>
          <div className="relative">
            <UserCircle size={18} className={iconClass} />
            <input placeholder="Full Name" value={form.fullName} onChange={e => updateForm('fullName', e.target.value)} className={inputClass} />
          </div>
          <div className="relative">
            <Phone size={18} className={iconClass} />
            <input placeholder="Mobile (10 digits)" value={form.mobile} onChange={e => updateForm('mobile', e.target.value)} className={inputClass} />
          </div>
        </>
      )}
      <div className="relative">
        <Mail size={18} className={iconClass} />
        <input type="email" placeholder="Email" value={form.email} onChange={e => updateForm('email', e.target.value)} className={inputClass} />
      </div>
      <div className="relative">
        <Lock size={18} className={iconClass} />

        <input
          type={showPassword ? "text" : "password"}
          placeholder="Password"
          value={form.password}
          onChange={e => updateForm('password', e.target.value)}
          className={`${inputClass} pr-10`}
        />

        <button
          type="button"
          onClick={() => setShowPassword(prev => !prev)}
          className="absolute right-3 top-1/2 -translate-y-1/2"
        >
          {showPassword ? (
            <Eye size={18} className={isDark ? "text-neon-blue" : "text-blue-600"} />
          ) : (
            <EyeOff size={18} className={isDark ? "text-neon-blue" : "text-blue-600"} />
          )}

        </button>
      </div>

      {mode === 'signin' && (
        <div className="text-right">
          <button
            type="button"
            onClick={() => window.location.hash = '/forgot-password'}
            className={`text-sm mt-2 ${isDark
              ? 'text-neon-blue hover:text-neon-blue/80'
              : 'text-blue-600 hover:text-blue-500'
              }`}
          >
            Forgot Password?
          </button>
        </div>
      )}

      {mode === 'signup' && (
        <div className="relative">
          <Lock size={18} className={iconClass} />

          <input
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm Password"
            value={form.confirmPassword}
            onChange={e => updateForm('confirmPassword', e.target.value)}
            className={`${inputClass} pr-10`}
          />

          <button
            type="button"
            onClick={() => setShowConfirmPassword(prev => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2"
          >
            {showConfirmPassword ? (
              <Eye size={18} className={isDark ? "text-neon-blue" : "text-blue-600"} />
            ) : (
              <EyeOff size={18} className={isDark ? "text-neon-blue" : "text-blue-600"} />
            )}

          </button>
        </div>

      )}
      {/* Main Submit Button */}
      <motion.button
        onClick={handleSendOTP}
        disabled={loading}
        className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-neon-blue to-neon-purple
    hover:shadow-[0_0_25px_rgba(0,212,255,0.4)] transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {loading && <Loader2 size={18} className="animate-spin" />}
        {mode === 'signup' ? 'Send OTP & Continue' : 'Sign In'}
      </motion.button>

      {/* Divider */}
      <div className="flex items-center gap-3 my-4">
        <div className="flex-1 h-px bg-gray-300/20"></div>
        <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          OR
        </span>
        <div className="flex-1 h-px bg-gray-300/20"></div>
      </div>

      {/* Google Login Button */}
      <motion.button
        type="button"
        onClick={() => handleGoogleLogin(role)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`w-full py-3 rounded-xl font-semibold border 
    flex items-center justify-center gap-3 transition-all
    ${isDark
            ? 'border-white/10 bg-white/5 text-white hover:bg-white/10'
            : 'border-gray-200 bg-white text-gray-700 hover:shadow-lg'
          }`}
      >
        <img
          src="https://developers.google.com/identity/images/g-logo.png"
          alt="google"
          className="w-5 h-5"
        />
        Continue with Google as {role === 'CUSTOMER' ? 'Customer' : 'Provider'}
      </motion.button>

      <p className={`text-center text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
        {mode === 'signup' ? 'Already have an account?' : "Don't have an account?"}
        <button
          onClick={() => { setMode(mode === 'signup' ? 'signin' : 'signup'); setStep('form'); }}
          className={`ml-1 font-semibold ${isDark ? 'text-neon-blue hover:text-neon-blue/80' : 'text-blue-600 hover:text-blue-500'}`}
        >
          {mode === 'signup' ? 'Sign In' : 'Sign Up'}
        </button>
      </p>
    </motion.div>
  );

  const renderOTP = () => (
    <motion.div
      key="otp"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <button onClick={() => setStep('form')} className={`flex items-center gap-1 text-sm ${isDark ? 'text-neon-blue' : 'text-blue-600'}`}>
        <ArrowLeft size={16} /> Back
      </button>
      <div className="text-center space-y-2">
        <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Enter OTP</h3>
        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          Sent to <span className="font-medium">{form.email}</span>
        </p>
      </div>
      <OTPInput onComplete={handleOTPComplete} disabled={loading} />
      <div className="text-center space-y-2">
        {countdown > 0 && (
          <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            Expires in <span className="font-mono font-bold text-neon-blue">{formatTime(countdown)}</span>
          </p>
        )}
        <button
          onClick={handleResendOTP}
          disabled={countdown > 0 || loading}
          className={`text-sm font-medium ${countdown > 0 ? 'opacity-40 cursor-not-allowed' : ''} ${isDark ? 'text-neon-blue' : 'text-blue-600'}`}
        >
          Resend OTP
        </button>
      </div>
      {loading && (
        <div className="flex justify-center">
          <Loader2 size={24} className="animate-spin text-neon-blue" />
        </div>
      )}
    </motion.div>
  );

  const roleCard = (r: Role, Icon: typeof User, label: string, desc: string) => (
    <motion.div
      className={`glass-card rounded-2xl p-6 md:p-8 cursor-pointer transition-all duration-300 relative overflow-hidden
        ${role === r ? 'neon-glow-strong ring-2 ring-neon-blue/50' : 'hover:neon-glow'}`}
      onClick={() => { setRole(r); setStep('form'); }}
      whileHover={{ scale: 1.01 }}
      layout
    >
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-3 rounded-xl ${role === r
          ? 'bg-gradient-to-br from-neon-blue to-neon-purple'
          : (isDark ? 'bg-white/10' : 'bg-blue-50')}`}>
          <Icon size={24} className={role === r ? 'text-white' : (isDark ? 'text-neon-blue' : 'text-blue-600')} />
        </div>
        <div>
          <h3 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>{label}</h3>
          <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{desc}</p>
        </div>
      </div>
      <AnimatePresence mode="wait">
        {role === r && (step === 'form' ? renderForm() : renderOTP())}
      </AnimatePresence>
    </motion.div>
  );

  return (
    <div className={`min-h-screen relative ${isDark ? 'bg-cyber-dark text-white' : 'bg-gradient-to-br from-blue-50 via-white to-purple-50 text-gray-900'}`}>
      <BackgroundShapes />
      <div className="relative z-10 min-h-screen flex flex-col">
        <div className="flex items-center justify-between p-4 md:p-6">
          <Logo size="md" />
          <ThemeToggle />
        </div>

        <div className="flex-1 flex items-center justify-center p-4 md:p-8">
          {/* Desktop: side-by-side */}
          <div className={`w-full max-w-5xl ${isDesktop ? 'hidden md:grid md:grid-cols-2 gap-6' : 'hidden'}`}>
            {roleCard('CUSTOMER', User, 'Customer', 'Find and book services')}
            {roleCard('SERVICE_PROVIDER', Briefcase, 'Service Provider', 'Offer your services')}
          </div>

          {/* Mobile: tabs */}
          <div className="w-full max-w-md md:hidden space-y-4">
            <div className={`flex rounded-xl p-1 ${isDark ? 'bg-white/5' : 'bg-gray-100'}`}>
              {(['CUSTOMER', 'SERVICE_PROVIDER'] as Role[]).map(r => (
                <button
                  key={r}
                  onClick={() => { setRole(r); setStep('form'); }}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all
                    ${role === r
                      ? 'bg-gradient-to-r from-neon-blue to-neon-purple text-white shadow-lg'
                      : (isDark ? 'text-gray-400' : 'text-gray-500')}`}
                >
                  {r === 'CUSTOMER' ? 'Customer' : 'Provider'}
                </button>
              ))}
            </div>
            <div className="glass-card rounded-2xl p-6">
              <AnimatePresence mode="wait">
                {step === 'form' ? renderForm() : renderOTP()}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
