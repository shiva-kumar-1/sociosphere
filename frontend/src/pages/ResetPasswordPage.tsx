import { useState } from "react";
import * as api from "../lib/api";
import toast from "react-hot-toast";

export default function ResetPasswordPage({
    token,
    navigate
}: {
    token: string;
    navigate: (p: string) => void;
}) {
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleReset = async () => {
        if (!password) return toast.error("Password required");

        setLoading(true);
        try {
            await api.resetPassword(token, password);
            toast.success("Password updated!");
            navigate("/");
        } catch (err: any) {
            toast.error(err.response?.data?.error || "Failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="glass-card p-8 rounded-2xl w-96 space-y-4">
                <h2 className="text-xl font-bold">Reset Password</h2>

                <input
                    type="password"
                    placeholder="New password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full p-3 border rounded-xl"
                />

                <button
                    onClick={handleReset}
                    disabled={loading}
                    className="w-full p-3 bg-green-600 text-white rounded-xl"
                >
                    {loading ? "Updating..." : "Reset Password"}
                </button>
            </div>
        </div>
    );
}
