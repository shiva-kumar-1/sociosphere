import { motion } from 'framer-motion';
import { getCategoryKey, CATEGORY_SYMBOLS } from '../lib/categories';
import { useTheme } from '../contexts/ThemeContext';

interface Props {
  category: string;
  count?: number;
}

export default function CategorySymbols({ category, count = 6 }: Props) {
  const { isDark } = useTheme();
  const key = getCategoryKey(category);
  const symbols = CATEGORY_SYMBOLS[key] || CATEGORY_SYMBOLS['Other'];

  const positions = Array.from({ length: count }, (_, i) => ({
    left: `${10 + (i * 17) % 80}%`,
    top: `${5 + (i * 23) % 85}%`,
    size: 28 + (i % 3) * 12,
    delay: i * 0.5,
    duration: 8 + (i % 4) * 3,
    rotation: i % 2 === 0 ? 15 : -15,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {positions.map((pos, i) => (
        <motion.svg
          key={i}
          className="absolute"
          style={{ left: pos.left, top: pos.top }}
          width={pos.size}
          height={pos.size}
          viewBox="0 0 24 24"
          fill="none"
          stroke={isDark ? 'rgba(0,212,255,0.12)' : 'rgba(0,100,200,0.08)'}
          strokeWidth="1"
          initial={{ opacity: 0, rotate: 0, scale: 0.8 }}
          animate={{
            opacity: [0.3, 0.6, 0.3],
            rotate: [0, pos.rotation, 0],
            scale: [0.8, 1, 0.8],
          }}
          transition={{
            duration: pos.duration,
            repeat: Infinity,
            delay: pos.delay,
            ease: 'easeInOut',
          }}
        >
          <path d={symbols[i % symbols.length]} />
        </motion.svg>
      ))}
    </div>
  );
}
