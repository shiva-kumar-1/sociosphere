import { motion } from 'framer-motion';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export default function ThemeToggle() {
  const { theme, setTheme, isDark } = useTheme();
  const next = () => {
    const order = ['dark', 'light', 'system'] as const;
    const idx = order.indexOf(theme);
    setTheme(order[(idx + 1) % 3]);
  };

  return (
    <motion.button
      onClick={next}
      className={`p-2 rounded-xl transition-colors ${isDark ? 'hover:bg-white/10 text-neon-blue' : 'hover:bg-gray-100 text-blue-600'}`}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      title={`Theme: ${theme}`}
    >
      {theme === 'dark' && <Moon size={20} />}
      {theme === 'light' && <Sun size={20} />}
      {theme === 'system' && <Monitor size={20} />}
    </motion.button>
  );
}
