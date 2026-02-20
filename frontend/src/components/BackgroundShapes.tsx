import { motion } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';

export default function BackgroundShapes() {
  const { isDark } = useTheme();
  const baseOpacity = isDark ? 0.15 : 0.08;

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 500, height: 500, top: '-10%', left: '-10%',
          background: `radial-gradient(circle, rgba(0,212,255,${baseOpacity}) 0%, transparent 70%)`,
        }}
        animate={{ x: [0, 30, 0], y: [0, 20, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 400, height: 400, bottom: '-5%', right: '-5%',
          background: `radial-gradient(circle, rgba(123,47,247,${baseOpacity}) 0%, transparent 70%)`,
        }}
        animate={{ x: [0, -20, 0], y: [0, -30, 0], scale: [1, 1.15, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 300, height: 300, top: '40%', left: '50%',
          background: `radial-gradient(circle, rgba(0,255,136,${baseOpacity * 0.5}) 0%, transparent 70%)`,
        }}
        animate={{ x: [0, 40, 0], y: [0, -20, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 200, height: 200, top: '20%', right: '20%',
          background: `radial-gradient(circle, rgba(255,45,170,${baseOpacity * 0.4}) 0%, transparent 70%)`,
        }}
        animate={{ x: [0, -25, 0], y: [0, 25, 0], scale: [1, 1.2, 1] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />
      {/* Geometric lines */}
      <svg className="absolute inset-0 w-full h-full" style={{ opacity: baseOpacity * 0.3 }}>
        <motion.line
          x1="10%" y1="20%" x2="40%" y2="80%"
          stroke={isDark ? '#00d4ff' : '#0066cc'} strokeWidth="0.5"
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.line
          x1="60%" y1="10%" x2="90%" y2="70%"
          stroke={isDark ? '#7b2ff7' : '#6600cc'} strokeWidth="0.5"
          animate={{ opacity: [0.5, 0.2, 0.5] }}
          transition={{ duration: 10, repeat: Infinity }}
        />
      </svg>
    </div>
  );
}
