import { useTheme } from '../contexts/ThemeContext';
import logo from '../assets/logo.png'; // 👈 change file name if different

export default function Logo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const { isDark } = useTheme();

  const textSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl'
  };

  const imageSizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className="flex items-center gap-2">
      {/* 🔥 Your Image Logo */}
      <img
        src={logo}
        alt="SocioSphere Logo"
        className={`${imageSizes[size]} object-contain`}
      />

      {/* Brand Name */}
      <span
        className={`${textSizes[size]} font-bold bg-gradient-to-r ${isDark
          ? 'from-neon-blue to-neon-purple'
          : 'from-blue-600 to-purple-600'
          } bg-clip-text text-transparent`}
      >
        SocioSphere
      </span>
    </div>
  );
}
