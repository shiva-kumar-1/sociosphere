import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  User,
  LogOut,
  Menu,
  X,
  MessageCircle,
  LayoutDashboard,
  Home,
  ClipboardList,
  Briefcase,
  Gavel,
  Info
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import ThemeToggle from "./ThemeToggle";
import { onNotification } from "../lib/socket";
import toast from "react-hot-toast";
import Logo from "../assets/sociosphere-logo.png";

interface Props {
  onSearch?: (q: string) => void;
  searchValue?: string;
  navigate: (path: string) => void;
}

export default function Header({
  onSearch,
  searchValue,
  navigate,
}: Props) {
  const { user, logout, isProvider, isCustomer } = useAuth();
  const { isDark } = useTheme();

  const [menuOpen, setMenuOpen] = useState(false);
  const [dashboardOpen, setDashboardOpen] = useState(false);

  useEffect(() => {
    if (!user) return;

    onNotification((data) => {
      toast.success(data.message || "New notification", {
        duration: 4000,
      });
    });
  }, [user]);

  const handleNav = (path: string) => {
    navigate(path);
    setMenuOpen(false);
  };

  return (
    <>
      {/* HEADER */}
      <header
        className={`sticky top-0 z-50 backdrop-blur-xl border-b transition-colors
        ${isDark
            ? "bg-cyber-dark/80 border-cyber-border text-white"
            : "bg-white/80 border-gray-200 text-gray-900"
          }`}
      >
        <div className="w-full px-4 lg:px-4 py-3 flex items-center justify-between">

          <div className="flex items-center gap-3">
            <button
              onClick={() => setMenuOpen(true)}
              className={`p-2 rounded-xl transition-all duration-300
                ${isDark
                  ? "hover:bg-glass-light hover:neon-glow"
                  : "hover:bg-gray-100"
                }`}
            >
              <Menu size={22} />
            </button>

            <button
              onClick={() => navigate("/home")}
              className="flex items-center gap-3"
            >
              <img
                src={Logo}
                alt="SocioSphere"
                className="h-10 w-10 object-contain"
              />
              <span className="hidden sm:block text-xl font-bold bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent">
                SocioSphere
              </span>
            </button>
          </div>

          {onSearch && (
            <div
              className={`hidden md:flex items-center flex-1 max-w-md mx-4 rounded-xl px-3 py-2 border
              ${isDark ? "glass-card text-white" : "glass-card-light text-gray-900"}`}
            >
              <Search size={18} />
              <input
                type="text"
                placeholder="Search services..."
                value={searchValue || ""}
                onChange={(e) => onSearch(e.target.value)}
                className="ml-2 flex-1 bg-transparent outline-none text-sm"
              />
            </div>
          )}

          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />
            <button
              onClick={() => {
                logout();
                navigate("/");
              }}
              className="p-2 rounded-xl transition-all text-red-400 hover:bg-red-500/10"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* SIDEBAR */}
      {/* SIDEBAR */}
      <AnimatePresence>
        {menuOpen && (
          <>
            {/* OVERLAY */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: isDark ? 0.6 : 0.3 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
              className="fixed inset-0 bg-black z-40"
            />

            {/* SIDEBAR PANEL */}
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ duration: 0.3 }}
              className={`fixed top-0 left-0 h-full w-72 z-50 shadow-2xl border-r
          ${isDark
                  ? "glass-card border-cyber-border text-white"
                  : "glass-card-light border-gray-200 text-gray-900"
                }`}
            >
              <div className="p-6 space-y-4">

                {/* HEADER */}
                <div className="flex justify-between items-center mb-6">
                  <h2 className="font-semibold text-lg">Menu</h2>
                  <button onClick={() => setMenuOpen(false)}>
                    <X size={20} />
                  </button>
                </div>

                {/* 1️⃣ HOME */}
                <SidebarButton
                  icon={<Home size={18} />}
                  label="Home"
                  onClick={() => handleNav("/home")}
                />

                {/* 2️⃣ DASHBOARD */}
                <SidebarButton
                  icon={<LayoutDashboard size={18} />}
                  label="Dashboard"
                  onClick={() => handleNav("/dashboard")}
                />

                {/* 3️⃣ MESSAGES */}
                <SidebarButton
                  icon={<MessageCircle size={18} />}
                  label="Messages"
                  onClick={() => handleNav("/messages")}
                />

                {/* 4️⃣ PROFILE */}
                <SidebarButton
                  icon={<User size={18} />}
                  label="Profile"
                  onClick={() => handleNav("/profile")}
                />

                {/* 5️⃣ ABOUT */}
                <SidebarButton
                  icon={<Info size={18} />}
                  label="About"
                  onClick={() => handleNav("/about")}
                />

                {/* DIVIDER */}
                <div className="border-t border-gray-300/20 my-4" />

                {/* 6️⃣ LOGOUT */}
                <SidebarButton
                  icon={<LogOut size={18} />}
                  label="Logout"
                  onClick={() => {
                    logout();
                    handleNav("/");
                  }}
                  danger
                />

              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function SidebarButton({
  icon,
  label,
  onClick,
  danger,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  const { isDark } = useTheme();

  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 w-full px-3 py-2 rounded-xl transition-all duration-300
        ${danger
          ? "text-red-500 hover:bg-red-100"
          : isDark
            ? "hover:bg-glass-light hover:text-neon-blue hover:neon-glow"
            : "hover:bg-gray-100 hover:text-neon-blue"
        }`}
    >
      {icon}
      {label}
    </button>
  );
}