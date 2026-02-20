import { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';

interface Props {
  length?: number;
  onComplete: (otp: string) => void;
  disabled?: boolean;
}

export default function OTPInput({ length = 6, onComplete, disabled }: Props) {
  const { isDark } = useTheme();
  const [values, setValues] = useState<string[]>(Array(length).fill(''));
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = useCallback((idx: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const v = val.slice(-1);
    const next = [...values];
    next[idx] = v;
    setValues(next);
    if (v && idx < length - 1) {
      refs.current[idx + 1]?.focus();
    }
    if (next.every(c => c !== '')) {
      onComplete(next.join(''));
    }
  }, [values, length, onComplete]);

  const handleKeyDown = useCallback((idx: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !values[idx] && idx > 0) {
      refs.current[idx - 1]?.focus();
    }
  }, [values]);

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    const next = [...values];
    for (let i = 0; i < text.length; i++) {
      next[i] = text[i];
    }
    setValues(next);
    if (next.every(c => c !== '')) {
      onComplete(next.join(''));
    }
    const focusIdx = Math.min(text.length, length - 1);
    refs.current[focusIdx]?.focus();
  }, [values, length, onComplete]);

  useEffect(() => {
    refs.current[0]?.focus();
  }, []);

  return (
    <div className="flex gap-2 justify-center" onPaste={handlePaste}>
      {values.map((v, i) => (
        <motion.input
          key={i}
          ref={(el) => { refs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={v}
          disabled={disabled}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          className={`w-12 h-14 text-center text-xl font-bold rounded-xl border-2 outline-none transition-all duration-300
            ${isDark
              ? 'bg-cyber-dark/50 border-cyber-border text-white focus:border-neon-blue focus:shadow-[0_0_15px_rgba(0,212,255,0.4)]'
              : 'bg-white border-blue-200 text-gray-900 focus:border-blue-500 focus:shadow-[0_0_15px_rgba(0,100,255,0.2)]'
            }
            disabled:opacity-50`}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: i * 0.05 }}
        />
      ))}
    </div>
  );
}
