import { useEffect, useState } from "react";
import * as api from "../lib/api";
import Header from "../components/Header";
import { useAuth } from "../contexts/AuthContext";
import toast from "react-hot-toast";
import GlobalSymbolsBackground from "../components/GlobalSymbolsBackground";
import { useTheme } from "../contexts/ThemeContext";

interface Provider {
    id: string;
    fullName: string;
    email: string;
    mobile?: string;
}

export default function AdminDashboardPage({ navigate }: { navigate: (p: string) => void }) {
    const { user } = useAuth();
    const { isDark } = useTheme(); // ✅ add this
    const [providers, setProviders] = useState<Provider[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProviders();
    }, []);

    const fetchProviders = async () => {
        try {
            const res = await api.getPendingProviders();
            setProviders(res.data);
        } catch (err) {
            toast.error("Failed to load providers");
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (id: string) => {
        try {
            await api.verifyProvider(id);
            toast.success("Provider verified");
            fetchProviders();
        } catch {
            toast.error("Verification failed");
        }
    };

    if (user?.role !== "ADMIN") {
        return <div className="p-10 text-red-500">Access denied</div>;
    }
    return (
        <div className="min-h-screen relative">
            {/* 🔥 GLOBAL SYMBOL BACKGROUND */}
            <GlobalSymbolsBackground category="Other" />

            <div className="relative z-10">
                <Header navigate={navigate} currentPath="/admin" />

                <div className="max-w-6xl mx-auto p-6">
                    <h1 className={`text-3xl font-bold mb-6 ${isDark ? "text-white" : "text-gray-900"
                        }`}>
                        Admin Dashboard
                    </h1>

                    {loading && (
                        <p className={isDark ? "text-gray-400" : "text-gray-600"}>
                            Loading...
                        </p>
                    )}

                    {!loading && providers.length === 0 && (
                        <p className={isDark ? "text-gray-400" : "text-gray-600"}>
                            No pending providers
                        </p>
                    )}

                    <div className="grid gap-4">
                        {providers.map((p) => (
                            <div
                                key={p.id}
                                className={`glass-card rounded-2xl p-5 flex justify-between items-center ${isDark ? "" : "bg-white/80 backdrop-blur-lg"
                                    }`}
                            >
                                <div>
                                    <p className={`font-semibold ${isDark ? "text-white" : "text-gray-900"
                                        }`}>
                                        {p.fullName}
                                    </p>
                                    <p className="text-sm text-gray-400">{p.email}</p>
                                    <p className="text-sm text-gray-400">{p.mobile}</p>
                                </div>

                                <button
                                    onClick={() => handleVerify(p.id)}
                                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-neon-blue to-neon-purple text-white hover:opacity-90 transition-all"
                                >
                                    Verify
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

}
