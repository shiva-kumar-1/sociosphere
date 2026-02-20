import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import BackgroundShapes from '../components/BackgroundShapes';
import * as api from '../lib/api';
import { getSocket } from '../lib/socket';
import { MessageCircle, Send, ArrowLeft, Loader2, User } from 'lucide-react';
import toast from 'react-hot-toast';

interface Channel {
  id: string;
  participants: { id: string; fullName: string; email: string; role: string }[];
  serviceRequest: { id: string } | string | null;
  lastMessage: string;
  lastMessageAt: string;
}

interface Message {
  id: string;
  channel: string;
  sender: { id: string; fullName: string; role: string };
  text: string;
  readBy: string[];
  createdAt: string;
}

export default function MessagesPage({ navigate }: { navigate: (p: string) => void }) {
  const { isDark } = useTheme();
  const { user } = useAuth();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [msgLoading, setMsgLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [typingUser, setTypingUser] = useState('');
  const [requestDetails, setRequestDetails] = useState<any>(null);


  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    loadChannels();
  }, []);

  const loadChannels = async () => {
    try {
      const res = await api.getMyChannels();
      setChannels(res.data);
    } catch {
      toast.error('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = useCallback(async (channel: Channel) => {
    setSelectedChannel(channel);
    setMsgLoading(true);
    // 🔥 Load Service Request Details
    if (channel.serviceRequest) {
      try {
        const requestId =
          typeof channel.serviceRequest === "string"
            ? channel.serviceRequest
            : channel.serviceRequest.id;
        const res = await api.getServiceRequestById(requestId);
        setRequestDetails(res.data);

      } catch {
        console.log("Failed to load request");
      }
    }

    try {
      const res = await api.getChannelMessages(channel.id);
      setMessages(res.data);
      await api.markAsRead(channel.id);

      // Join socket room
      const socket = getSocket();
      if (socket) {
        socket.emit('join-channel', channel.id);
        socket.emit('mark-read', { channelId: channel.id });
      }
    } catch {
      toast.error('Failed to load messages');
    } finally {
      setMsgLoading(false);
    }
  }, []);

  // Socket listeners
  useEffect(() => {
    const socket = getSocket();
    if (!socket || !selectedChannel) return;

    const handleNewMessage = (data: { channelId: string; sender: { id: string; fullName: string; role: string }; text: string; createdAt: string }) => {
      if (data.channelId === selectedChannel.id) {
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          channel: data.channelId,
          sender: { id: data.sender.id, fullName: data.sender.fullName, role: data.sender.role },
          text: data.text,
          readBy: [],
          createdAt: data.createdAt,
        }]);
      }
    };

    const handleTyping = (data: { user: string }) => {
      setTypingUser(data.user);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => setTypingUser(''), 3000);
    };

    const handleStopTyping = () => setTypingUser('');

    socket.on('new-message', handleNewMessage);
    socket.on('typing', handleTyping);
    socket.on('stop-typing', handleStopTyping);

    return () => {
      socket.off('new-message', handleNewMessage);
      socket.off('typing', handleTyping);
      socket.off('stop-typing', handleStopTyping);
    };
  }, [selectedChannel]);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!text.trim() || !selectedChannel) return;
    setSending(true);
    try {
      await api.sendMessage(selectedChannel.id, text.trim());
      const socket = getSocket();
      if (socket) {
        socket.emit('send-message', { channelId: selectedChannel.id, text: text.trim() });
        socket.emit('stop-typing', { channelId: selectedChannel.id });
      }
      setText('');
      // Reload messages to get server-saved version
      const res = await api.getChannelMessages(selectedChannel.id);
      setMessages(res.data);
    } catch {
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };
  const handleRequestPayment = async () => {
    try {
      await api.requestPayment(requestDetails.id);
      toast.success("Payment requested");
      setRequestDetails({
        ...requestDetails,
        paymentStatus: "PAYMENT_REQUESTED"
      });
    } catch {
      toast.error("Failed to request payment");
    }
  };

  const handleProceedToPay = async () => {
    try {
      const res = await api.createPayment(requestDetails.id);

      await api.confirmPayment(res.data.paymentId);

      toast.success("Payment successful 🎉");

      setRequestDetails({
        ...requestDetails,
        paymentStatus: "PAID_PENDING_VERIFICATION"
      });
    } catch {
      toast.error("Payment failed");
    }
  };

  const handleVerifyPayment = async () => {
    try {
      await api.verifyPayment(requestDetails.id);
      toast.success("Payment verified ✅");

      setRequestDetails({
        ...requestDetails,
        paymentStatus: "PAID"
      });
    } catch {
      toast.error("Verification failed");
    }
  };

  const handleTyping = () => {
    const socket = getSocket();
    if (socket && selectedChannel) {
      socket.emit('typing', { channelId: selectedChannel.id });
    }
  };

  const getOtherParticipant = (ch: Channel) => {
    return ch.participants.find(p => p.id !== user?.id) || ch.participants[0];
  };

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-cyber-dark' : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'}`}>
      <BackgroundShapes />
      <div className="relative z-10 flex flex-col h-screen">
        <Header navigate={navigate} currentPath="/messages" />

        <div className="flex-1 flex overflow-hidden max-w-6xl mx-auto w-full">
          {/* Channel List */}
          <div className={`${selectedChannel ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-80 border-r ${isDark ? 'border-cyber-border' : 'border-gray-200'}`}>
            <div className="p-4">
              <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Messages</h2>
            </div>
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex justify-center py-10">
                  <Loader2 size={24} className="animate-spin text-neon-blue" />
                </div>
              ) : channels.length === 0 ? (
                <div className="text-center py-16 px-4">
                  <MessageCircle size={40} className="mx-auto mb-3 opacity-30" />
                  <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    No conversations yet. Accept a bid to start chatting!
                  </p>
                </div>
              ) : (
                channels.map(ch => {
                  const other = getOtherParticipant(ch);
                  return (
                    <motion.button
                      key={ch.id}
                      onClick={() => loadMessages(ch)}
                      className={`w-full p-4 text-left border-b transition-all ${selectedChannel?.id === ch.id
                        ? (isDark ? 'bg-neon-blue/10 border-cyber-border' : 'bg-blue-50 border-blue-100')
                        : (isDark ? 'border-cyber-border/50 hover:bg-white/5' : 'border-gray-100 hover:bg-gray-50')
                        }`}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neon-blue to-neon-purple flex items-center justify-center shrink-0">
                          <User size={16} className="text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`font-semibold text-sm truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {other?.fullName || 'User'}
                          </p>
                          <p className={`text-xs truncate ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                            {ch.lastMessage || 'No messages yet'}
                          </p>
                        </div>
                        <span className={`text-[10px] shrink-0 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                          {ch.lastMessageAt ? formatTime(ch.lastMessageAt) : ''}
                        </span>
                      </div>
                    </motion.button>
                  );
                })
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className={`${selectedChannel ? 'flex' : 'hidden md:flex'} flex-col flex-1`}>
            {selectedChannel ? (
              <>
                {/* Chat Header */}
                <div className={`flex items-center gap-3 p-4 border-b ${isDark ? 'border-cyber-border' : 'border-gray-200'}`}>
                  <button onClick={() => setSelectedChannel(null)} className="md:hidden">
                    <ArrowLeft size={20} className={isDark ? 'text-neon-blue' : 'text-blue-600'} />
                  </button>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-neon-blue to-neon-purple flex items-center justify-center">
                    <User size={14} className="text-white" />
                  </div>
                  <div>
                    <p className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {getOtherParticipant(selectedChannel)?.fullName || 'User'}
                    </p>
                    <AnimatePresence>
                      {typingUser && (
                        <motion.p
                          className="text-xs text-neon-blue"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          {typingUser} is typing...
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
                {/* 💰 PAYMENT SECTION */}
                {requestDetails && (
                  <div className="px-4 py-3 border-b border-gray-200 dark:border-cyber-border">

                    {user?.role === "SERVICE_PROVIDER" &&
                      requestDetails.paymentStatus === "NONE" && (
                        <button
                          onClick={handleRequestPayment}
                          className="w-full py-2 rounded-xl bg-yellow-500 text-white"
                        >
                          Request Payment
                        </button>
                      )}

                    {user?.role === "CUSTOMER" &&
                      requestDetails.paymentStatus === "PAYMENT_REQUESTED" && (
                        <button
                          onClick={handleProceedToPay}
                          className="w-full py-2 rounded-xl bg-green-500 text-white"
                        >
                          Proceed to Pay
                        </button>
                      )}

                    {user?.role === "SERVICE_PROVIDER" &&
                      requestDetails.paymentStatus === "PAID_PENDING_VERIFICATION" && (
                        <button
                          onClick={handleVerifyPayment}
                          className="w-full py-2 rounded-xl bg-blue-600 text-white"
                        >
                          Verify Payment
                        </button>
                      )}

                    {requestDetails.paymentStatus === "PAID" && (
                      <div className="text-center text-green-600 font-semibold">
                        ✅ Payment Completed
                      </div>
                    )}
                  </div>
                )}

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {msgLoading ? (
                    <div className="flex justify-center py-10">
                      <Loader2 size={24} className="animate-spin text-neon-blue" />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="text-center py-10">
                      <p className={`text-sm ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                        No messages yet. Say hello!
                      </p>
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isMine = msg.sender.id === user?.id;
                      return (
                        <motion.div
                          key={msg.id}
                          className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                        >
                          <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl ${isMine
                            ? 'bg-gradient-to-r from-neon-blue to-neon-purple text-white rounded-br-sm'
                            : (isDark ? 'bg-white/10 text-white rounded-bl-sm' : 'bg-gray-100 text-gray-900 rounded-bl-sm')
                            }`}>
                            {!isMine && (
                              <p className="text-[10px] font-semibold mb-0.5 opacity-70">{msg.sender.fullName}</p>
                            )}
                            <p className="text-sm leading-relaxed">{msg.text}</p>
                            <p className={`text-[10px] mt-1 ${isMine ? 'text-white/60' : (isDark ? 'text-gray-500' : 'text-gray-400')}`}>
                              {formatTime(msg.createdAt)}
                            </p>
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className={`p-4 border-t ${isDark ? 'border-cyber-border' : 'border-gray-200'}`}>
                  <div className="flex gap-2">
                    <input
                      value={text}
                      onChange={(e) => { setText(e.target.value); handleTyping(); }}
                      onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                      placeholder="Type a message..."
                      className={`flex-1 px-4 py-2.5 rounded-xl border outline-none text-sm transition-all
                        ${isDark
                          ? 'bg-white/5 border-cyber-border text-white placeholder-gray-500 focus:border-neon-blue'
                          : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-500'}`}
                    />
                    <motion.button
                      onClick={handleSend}
                      disabled={!text.trim() || sending}
                      className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-neon-blue to-neon-purple text-white disabled:opacity-40 transition-all"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                    </motion.button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageCircle size={48} className={`mx-auto mb-4 ${isDark ? 'text-gray-700' : 'text-gray-300'}`} />
                  <p className={`text-lg font-medium ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    Select a conversation
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
