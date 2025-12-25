
import React, { useState } from 'react';
import { User, Language } from '../types';
import { translations } from '../translations';
import { ArrowLeft, ArrowRight, UserPlus, Copy, Check, Users, ShieldCheck, X } from 'lucide-react';
import { triggerHaptic, triggerSuccessHaptic } from '../services/hapticService';

interface Props {
  user: User;
  language: Language;
  onBack: () => void;
  onUpdateUser: (user: User) => void;
}

const PartnerManager: React.FC<Props> = ({ user, language, onBack, onUpdateUser }) => {
  const t = translations[language] as any;
  const isRTL = language === 'ar';
  
  const [partnerIdInput, setPartnerIdInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle');

  const handleCopyId = () => {
    navigator.clipboard.writeText(user.id);
    setCopied(true);
    triggerHaptic();
    setTimeout(() => setCopied(false), 2000);
  };

  const handleInvite = () => {
    if (!partnerIdInput.trim()) return;
    setStatus('sending');
    triggerHaptic();
    
    // Simulate API call
    setTimeout(() => {
      setStatus('sent');
      triggerSuccessHaptic();
      // In a real app, we'd send a notification via realtimeService
    }, 1500);
  };

  const handleAcceptInvite = () => {
    const updatedUser = { 
      ...user, 
      partnerId: user.pendingInviteFrom || 'PARTNER_123',
      partnerName: 'Partner Name', // In real app, fetch from ID
      pendingInviteFrom: undefined 
    };
    onUpdateUser(updatedUser);
    localStorage.setItem('sakinnah_user', JSON.stringify(updatedUser));
    triggerSuccessHaptic();
  };

  return (
    <div className="h-full bg-m3-background flex flex-col animate-m3-fade-in">
      <header className="px-6 py-6 bg-white border-b border-m3-outline/5 flex items-center gap-4">
        <button onClick={onBack} className="p-2 hover:bg-m3-surfaceVariant rounded-xl transition-all">
          {isRTL ? <ArrowRight size={22} /> : <ArrowLeft size={22} />}
        </button>
        <h1 className="text-xl font-title font-bold text-m3-onSurface">{t.partnerManager}</h1>
      </header>

      <main className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
        {/* User's own ID Card */}
        <div className="bg-white p-6 rounded-[2rem] border border-m3-outline/10 shadow-sm space-y-4">
          <div className="flex items-center gap-3 text-m3-primary">
            <ShieldCheck size={20} />
            <h3 className="font-bold text-sm uppercase tracking-widest">{t.yourId}</h3>
          </div>
          <div className="flex items-center justify-between bg-m3-surfaceVariant/30 p-4 rounded-2xl border border-m3-outline/5">
            <code className="text-lg font-mono font-bold text-m3-onSurface">{user.id}</code>
            <button onClick={handleCopyId} className="p-2 text-m3-primary bg-white rounded-xl shadow-sm">
              {copied ? <Check size={18} /> : <Copy size={18} />}
            </button>
          </div>
          <p className="text-xs text-m3-onSurfaceVariant/60 italic">
            {isRTL ? 'شارك هذا الرمز مع شريكك ليتمكن من دعوتك.' : 'Share this code with your partner so they can invite you.'}
          </p>
        </div>

        {/* Pending Invite Section */}
        {user.pendingInviteFrom && (
          <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-[2rem] space-y-4 animate-bounce-short">
            <div className="flex items-center gap-2 text-indigo-700 font-bold text-sm">
              <Users size={18} />
              {t.pendingInvite}
            </div>
            <p className="text-sm text-indigo-900">{isRTL ? 'لديك دعوة معلقة لتكون شريكاً.' : 'You have a pending invitation to be a partner.'}</p>
            <div className="flex gap-2">
              <button onClick={handleAcceptInvite} className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold text-xs shadow-md">
                {t.acceptInvite}
              </button>
              <button className="px-4 py-3 bg-white border border-indigo-100 text-indigo-600 rounded-xl font-bold text-xs">
                {t.declineInvite}
              </button>
            </div>
          </div>
        )}

        {/* Invitation Form */}
        {!user.partnerId ? (
          <div className="bg-white p-6 rounded-[2rem] border border-m3-outline/10 shadow-sm space-y-6">
            <div className="flex items-center gap-3 text-m3-onSurface">
              <UserPlus size={20} />
              <h3 className="font-bold text-sm uppercase tracking-widest">{t.invitePartner}</h3>
            </div>
            <input 
              type="text" 
              value={partnerIdInput}
              onChange={(e) => setPartnerIdInput(e.target.value)}
              placeholder={t.partnerIdPlaceholder}
              className="w-full bg-m3-surface border-2 border-m3-outline/20 rounded-2xl py-4 px-6 focus:border-m3-primary outline-none transition-all font-medium"
            />
            <button 
              onClick={handleInvite}
              disabled={status !== 'idle' || !partnerIdInput.trim()}
              className="w-full py-4 bg-m3-primary text-white rounded-[1.5rem] font-bold shadow-lg shadow-m3-primary/20 flex items-center justify-center gap-3 active:scale-95 transition-all disabled:opacity-50"
            >
              {status === 'sending' ? (
                <div className="w-5 h-5 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
              ) : status === 'sent' ? (
                <><Check size={20} /> {t.inviteSent}</>
              ) : (
                <>{t.sendInvite}</>
              )}
            </button>
          </div>
        ) : (
          <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-[2rem] flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-600 text-white rounded-2xl flex items-center justify-center text-xl">
                {user.partnerName?.[0] || 'P'}
              </div>
              <div>
                <h3 className="font-bold text-emerald-900">{user.partnerName}</h3>
                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{t.linkedPartner}</p>
              </div>
            </div>
            <button 
              onClick={() => {
                if(confirm(isRTL ? 'هل تريد إلغاء الربط؟' : 'Unlink partner?')) {
                  const updated = {...user, partnerId: undefined, partnerName: undefined};
                  onUpdateUser(updated);
                  localStorage.setItem('sakinnah_user', JSON.stringify(updated));
                }
              }}
              className="p-2 text-emerald-200 hover:text-red-500"
            >
              <X size={20} />
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default PartnerManager;
