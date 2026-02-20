import CategorySymbols from "./CategorySymbols";
import { useTheme } from "../contexts/ThemeContext";

interface Props {
    category: string;
}

export default function ServiceBackground({ category }: Props) {
    const { isDark } = useTheme();

    return (
        <div className="w-full h-full relative overflow-hidden">
            {/* Gradient Base */}
            <div
                className={`absolute inset-0 ${isDark
                    ? "bg-gradient-to-br from-cyan-900/40 to-purple-900/40"
                    : "bg-gradient-to-br from-blue-100 to-purple-100"
                    }`}
            />

            {/* Floating Symbols */}
            <CategorySymbols category={category} count={8} />

            {/* Dark overlay for readability */}
            <div className="absolute inset-0 bg-black/30" />
        </div>
    );
}
