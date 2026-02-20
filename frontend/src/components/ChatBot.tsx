import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";
import * as api from "../lib/api";
import toast from "react-hot-toast";
import { useTheme } from "../contexts/ThemeContext";

interface Message {
    sender: "user" | "bot";
    text: string;
}

export default function ChatBot() {
    const { isDark } = useTheme();

    const [open, setOpen] = useState(false);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { sender: "bot", text: "Hi 👋 How can I help you today?" },
    ]);

    const sendMessage = async () => {
        if (!input.trim()) return;

        const userMessage = { sender: "user" as const, text: input };
        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setLoading(true);

        try {
            const res = await api.sendChatMessage(userMessage.text);
            const botReply =
                res.data?.reply || "Sorry, I couldn't understand that.";

            setMessages((prev) => [
                ...prev,
                { sender: "bot", text: botReply },
            ]);
        } catch {
            toast.error("Chatbot error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* Floating Button */}
            <motion.button
                onClick={() => setOpen(!open)}
                className="fixed bottom-6 right-6 z-50 p-4 rounded-full 
                   bg-gradient-to-r from-neon-blue to-neon-purple 
                   text-white shadow-lg"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
            >
                {open ? <X size={20} /> : <MessageCircle size={20} />}
            </motion.button>

            {/* Chat Window */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 40 }}
                        transition={{ duration: 0.25 }}
                        className={`fixed bottom-24 right-6 w-80 h-[480px] 
              rounded-2xl shadow-2xl flex flex-col z-50 border
              ${isDark
                                ? "glass-card border-cyber-border text-white"
                                : "glass-card-light border-gray-200 text-gray-900"
                            }`}
                    >
                        {/* Header */}
                        <div
                            className={`p-4 border-b font-semibold
                ${isDark
                                    ? "border-cyber-border text-white"
                                    : "border-gray-200 text-gray-900"
                                }`}
                        >
                            AI Assistant
                        </div>

                        {/* Messages */}
                        <div className="flex-1 p-3 overflow-y-auto space-y-3 text-sm">
                            {messages.map((msg, index) => (
                                <div
                                    key={index}
                                    className={`px-4 py-2 rounded-2xl max-w-[80%]
                  ${msg.sender === "user"
                                            ? "ml-auto bg-gradient-to-r from-neon-blue to-neon-purple text-white"
                                            : isDark
                                                ? "bg-white/10 text-gray-200 border border-cyber-border"
                                                : "bg-gray-100 text-gray-800 border border-gray-200"
                                        }`}
                                >
                                    {msg.text}
                                </div>
                            ))}

                            {loading && (
                                <div
                                    className={`flex items-center gap-2
                    ${isDark ? "text-gray-400" : "text-gray-500"}`}
                                >
                                    <Loader2 size={14} className="animate-spin" />
                                    Thinking...
                                </div>
                            )}
                        </div>

                        {/* Input */}
                        <div
                            className={`p-3 border-t flex gap-2
                ${isDark ? "border-cyber-border" : "border-gray-200"}`}
                        >
                            <input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                                placeholder="Type your message..."
                                className={`flex-1 px-3 py-2 rounded-xl border outline-none
                  ${isDark
                                        ? "bg-white/5 border-cyber-border text-white focus:border-neon-blue"
                                        : "bg-gray-100 border-gray-300 text-gray-900 focus:border-neon-blue"
                                    }`}
                            />

                            <button
                                onClick={sendMessage}
                                disabled={loading}
                                className="p-2 rounded-xl 
                           bg-gradient-to-r from-neon-blue to-neon-purple 
                           text-white"
                            >
                                <Send size={16} />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}