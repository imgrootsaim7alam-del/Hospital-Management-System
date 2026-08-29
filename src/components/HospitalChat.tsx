import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  Send, 
  Users, 
  Stethoscope, 
  Activity, 
  Building2, 
  UserCheck, 
  ShieldAlert,
  Bot,
  X,
  Minimize2,
  Maximize2,
  Sparkles,
  Clock,
  CheckCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '../context/NavigationContext';
import { messagesService } from '../services/firestoreService';
import { ChatMessage, UserRole } from '../types';

interface HospitalChatProps {
  embedded?: boolean;
}

export const HospitalChat: React.FC<HospitalChatProps> = ({ embedded = false }) => {
  const { profile, user } = useAuth();
  const { isChatOpen, setIsChatOpen } = useNavigation();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [activeChannel, setActiveChannel] = useState<'general' | 'consultation' | 'nursing' | 'emergency'>('general');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Subscribe to channel messages in real-time
  useEffect(() => {
    const unsubscribe = messagesService.subscribeMessages(activeChannel, (liveMsgs) => {
      setMessages(liveMsgs);
    });
    return () => unsubscribe();
  }, [activeChannel]);

  // Auto scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isSending) return;

    const senderName = profile?.name || user?.displayName || 'Hospital User';
    const senderRole: UserRole = profile?.role || 'Patient';
    const senderId = profile?.uid || user?.uid || `usr_${Date.now()}`;
    const textToSend = inputText.trim();

    setInputText('');
    setIsSending(true);

    try {
      await messagesService.sendMessage({
        senderId,
        senderName,
        senderRole,
        text: textToSend,
        channel: activeChannel,
      });
    } catch (error) {
      console.error('Failed to send message to Firestore:', error);
      // Revert text on failure
      setInputText(textToSend);
    } finally {
      setIsSending(false);
    }
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'Doctor':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-950 text-sky-300 border border-sky-800">Doctor</span>;
      case 'Nurse':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">Nurse</span>;
      case 'Receptionist':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-800">Reception</span>;
      case 'Admin':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-800">Admin</span>;
      default:
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800">Patient</span>;
    }
  };

  const channels = [
    { id: 'general', name: 'General Hospital', icon: Users, desc: 'Public staff & patient notices' },
    { id: 'consultation', name: 'Doctor Consultation', icon: Stethoscope, desc: 'Medical advice & questions' },
    { id: 'nursing', name: 'Nursing Station', icon: Activity, desc: 'Ward vitals & care handover' },
    { id: 'emergency', name: 'Emergency Alerts', icon: ShieldAlert, desc: 'Priority CCU / ICU alerts' },
  ] as const;

  const chatContent = (
    <div className="flex flex-col h-full bg-slate-950 text-white rounded-2xl border border-slate-800 shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-950 text-emerald-400 rounded-xl border border-emerald-800">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              ShebaCare Real-Time Hospital Chat
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Synced with Cloud Firestore database • Instant Realtime Delivery
            </p>
          </div>
        </div>
        {!embedded && (
          <button 
            onClick={() => setIsChatOpen(false)}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Channel Switcher */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 p-2 bg-slate-950/80 border-b border-slate-800/80">
        {channels.map((ch) => {
          const Icon = ch.icon;
          const isActive = activeChannel === ch.id;
          return (
            <button
              key={ch.id}
              onClick={() => setActiveChannel(ch.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                isActive 
                  ? 'bg-emerald-600 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="truncate">{ch.name}</span>
            </button>
          );
        })}
      </div>

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 min-h-[260px] max-h-[420px]">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center text-slate-500">
            <MessageSquare className="w-8 h-8 mb-2 opacity-30 text-emerald-400" />
            <p className="text-xs">No messages in this channel yet.</p>
            <p className="text-[11px] text-slate-600 mt-0.5">Be the first to post a message or inquiry!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = (profile?.uid && msg.senderId === profile.uid) || msg.senderName === profile?.name;
            const timeStr = msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

            return (
              <div 
                key={msg.messageId || msg.id || Math.random().toString()} 
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-center gap-1.5 mb-1 px-1">
                  <span className="text-xs font-bold text-slate-300">{msg.senderName}</span>
                  {getRoleBadge(msg.senderRole)}
                  <span className="text-[10px] text-slate-500 ml-1">{timeStr}</span>
                </div>
                <div 
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm leading-relaxed shadow-sm ${
                    isMe 
                      ? 'bg-emerald-600 text-white rounded-tr-none' 
                      : 'bg-slate-900 text-slate-100 border border-slate-800 rounded-tl-none'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSendMessage} className="p-3 bg-slate-900/90 border-t border-slate-800 flex gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={`Type message in #${channels.find(c => c.id === activeChannel)?.name}...`}
          className="flex-1 bg-slate-950 border border-slate-800 text-white rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder-slate-500"
        />
        <button
          type="submit"
          disabled={!inputText.trim() || isSending}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
        >
          {isSending ? (
            <span className="animate-spin text-xs">...</span>
          ) : (
            <>
              <Send className="w-3.5 h-3.5" />
              <span>Send</span>
            </>
          )}
        </button>
      </form>
    </div>
  );

  if (embedded) {
    return chatContent;
  }

  return (
    <>
      {/* Floating Chat Trigger Button */}
      <div className="fixed bottom-6 right-6 z-40">
        {!isChatOpen && (
          <button
            onClick={() => setIsChatOpen(true)}
            className="flex items-center gap-2.5 px-4 py-3 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-sm rounded-full shadow-2xl shadow-emerald-900/50 hover:scale-105 transition-all duration-200 cursor-pointer border border-emerald-400/30"
          >
            <MessageSquare className="w-5 h-5" />
            <span>Hospital Live Chat</span>
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
            </span>
          </button>
        )}
      </div>

      {/* Floating Chat Window Modal */}
      {isChatOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[95vw] sm:w-[460px] h-[520px]">
          {chatContent}
        </div>
      )}
    </>
  );
};

export default HospitalChat;
