import { useState } from "react";
import * as api from "../lib/api";
import toast from "react-hot-toast";

export default function ForgotPasswordPage({ navigate }: { navigate: (p: string) => void }) {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!email) return toast.error("Email required");

        setLoading(true);
        try {
            await api.forgotPassword(email);
            toast.success("Reset link sent to email");
        } catch (err: any) {
            toast.error(err.response?.data?.error || "Failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="glass-card p-8 rounded-2xl w-96 space-y-4">
                <h2 className="text-xl font-bold">Forgot Password</h2>

                <input
                    type="email"
                    placeholder="Enter email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full p-3 border rounded-xl"
                />

                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="w-full p-3 bg-blue-600 text-white rounded-xl"
                >
                    {loading ? "Sending..." : "Send Reset Link"}
                </button>

                <button
                    onClick={() => navigate("/")}
                    className="text-sm text-gray-500"
                >
                    Back to Login
                </button>
            </div>
        </div>
    );
}
