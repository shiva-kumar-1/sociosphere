import { motion } from "framer-motion";
import {
    Wrench,
    Camera,
    Paintbrush,
    Sparkles,
    Briefcase,
    Home
} from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";

const icons = [Wrench, Camera, Paintbrush, Sparkles, Briefcase, Home];

export default function BackgroundSymbols() {
    const { isDark } = useTheme();

    return (
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
            {icons.map((Icon, index) => (
                <motion.div
                    key={index}
                    initial={{ opacity: 0 }}
                    animate={{
                        opacity: isDark ? 0.08 : 0.05,
                        y: [0, -30, 0],
                    }}
                    transition={{
                        duration: 8 + index * 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                    className="absolute"
                    style={{
                        top: `${10 + index * 12}%`,
                        left: `${5 + index * 15}%`,
                    }}
                >
                    <Icon
                        size={120}
                        className={`${isDark ? "text-neon-blue" : "text-blue-400"
                            }`}
                    />
                </motion.div>
            ))}
        </div>
    );
}