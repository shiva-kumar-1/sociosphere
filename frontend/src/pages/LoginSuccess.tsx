import { useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";

export default function LoginSuccess() {
    const { setAuth } = useAuth();

    useEffect(() => {
        const hash = window.location.hash;
        const query = hash.split("?")[1];

        if (!query) {
            window.location.hash = "/";
            return;
        }

        const params = new URLSearchParams(query);
        const token = params.get("token");

        if (token) {
            const decoded = JSON.parse(atob(token.split(".")[1]));
            setAuth(token, decoded.role);
            window.location.hash = "/home";
        } else {
            window.location.hash = "/";
        }
    }, []);

    return (
        <div className="min-h-screen flex items-center justify-center">
            Logging in...
        </div>
    );
}
