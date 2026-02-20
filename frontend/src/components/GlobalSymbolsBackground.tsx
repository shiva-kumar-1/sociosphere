import CategorySymbols from "./CategorySymbols";
import { useTheme } from "../contexts/ThemeContext";

interface Props {
    category?: string; // optional, default = mixed
}

export default function GlobalSymbolsBackground({ category = "Other" }: Props) {
    const { isDark } = useTheme();

    return (
        <div className="fixed inset-0 -z-10 overflow-hidden">

            {/* Base Background */}
            <div
                className={`absolute inset-0 ${isDark
                        ? "bg-cyber-dark"
                        : "bg-gradient-to-br from-blue-50 via-white to-purple-50"
                    }`}
            />

            {/* Large animated symbols */}
            <div className="opacity-70">
                <CategorySymbols category={category} count={18} />
            </div>

            {/* Soft overlay */}
            <div className="absolute inset-0 bg-black/10" />
        </div>
    );
}
