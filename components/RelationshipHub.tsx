
import React from 'react';
import { User, Language, ViewStateName } from '../types';
import { translations } from '../translations';
import { Heart, MessageSquareText, Map, Scale, ArrowLeft, ArrowRight, Sparkles, Users, UserPlus } from 'lucide-react';

interface Props {
  user: User;
  language: Language;
  onBack: () => void;
  onSelectTool: (view: ViewStateName) => void;
}

const RelationshipHub: React.FC<Props> = ({ user, language, onBack, onSelectTool }) => {
  const t = translations[language] as any;
  const isRTL = language === 'ar';

  const tools = [
    { id: 'MEDIATOR', title: t.RELATIONSHIPS, icon: <Scale size={24} />, color: 'bg-rose-500', desc: t.RELATIONSHIPS_DESC },
    { id: 'EMPATHY_TRANSLATOR', title: t.RELATIONSHIPS, icon: <MessageSquareText size={24} />, color: 'bg-indigo-500', desc: t.RELATIONSHIPS_DESC },
  ];

  return (
    <div className="h-full bg-rose-50/20 flex flex-col pt-safe pb-safe animate-fadeIn overflow-hidden">
      <header className="px-6 py-6 flex items-center gap-4 border-b border-rose-100 bg-white/80 backdrop-blur-xl">
        <button onClick={onBack} className="p-2.5 bg-rose-50 rounded-xl text-rose-600 active:scale-90 transition-all">
          {isRTL ? <ArrowRight size={22} /> : <ArrowLeft size={22} />}
        </button>
        <div>
          <h1 className="text-xl font-black text-rose-900 flex items-center gap-2">
            <Heart size={20} className="fill-rose-500 text-rose-500" />
            {t.RELATIONSHIPS}
          </h1>
          <p className="text-[10px] font-bold text-rose-400 uppercase tracking-widest">{isRTL ? 'مختبر العلاقات' : 'Relationship Lab'}</p>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar pb-24">
        {/* Partner Feature Section */}
        <div className="bg-white p-6 rounded-[2.5rem] border border-rose-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-m3-primary/10 text-m3-primary rounded-2xl flex items-center justify-center">
                <Users size={24} />
              </div>
              <div>
                <h3 className="font-bold text-m3-onSurface">{t.partnerManager}</h3>
                <p className="text-xs text-m3-onSurfaceVariant/60">{user.partnerId ? t.linkedPartner : t.invitePartner}</p>
              </div>
            </div>
            <button 
              onClick={() => onSelectTool('PARTNER_MANAGER')}
              className="px-4 py-2 bg-m3-primaryContainer text-m3-primary rounded-full text-xs font-bold active:scale-95 transition-all"
            >
              {user.partnerId ? t.back : t.invitePartner}
            </button>
          </div>

          {user.partnerId && (
            <button 
              onClick={() => onSelectTool('JOINT_SESSION')}
              className="w-full py-4 bg-m3-primary text-white rounded-[1.5rem] font-bold shadow-lg shadow-m3-primary/20 flex items-center justify-center gap-3 active:scale-95 transition-all"
            >
              <Sparkles size={20} />
              <span>{t.startJointSession}</span>
            </button>
          )}
        </div>

        <div className="bg-white/60 rounded-[2.5rem] p-8 border border-rose-100 shadow-sm mb-6 relative overflow-hidden group">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-rose-500/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>
          <Sparkles className="text-rose-400 mb-4" size={32} />
          <h2 className="text-2xl font-black text-rose-900 mb-2">{isRTL ? 'حلول ذكية للعلاقات' : 'Smart Relationship Solutions'}</h2>
          <p className="text-sm text-rose-700/70 leading-relaxed font-medium">{t.RELATIONSHIPS_DESC}</p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {tools.map((tool, idx) => (
            <button 
              key={idx}
              onClick={() => onSelectTool(tool.id as ViewStateName)}
              className="bg-white/80 backdrop-blur-md p-6 rounded-[2rem] border border-rose-50 shadow-sm hover:shadow-md transition-all flex items-center gap-5 group active:scale-95 text-start"
            >
              <div className={`w-14 h-14 ${tool.color} rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-500`}>
                {tool.icon}
              </div>
              <div className="flex-1">
                <h3 className="font-black text-gray-800 text-lg">{tool.id === 'MEDIATOR' ? (isRTL ? 'الوسيط الذكي' : 'AI Mediator') : (isRTL ? 'مترجم التعاطف' : 'Empathy Translator')}</h3>
                <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider line-clamp-1">{tool.desc}</p>
              </div>
              <ArrowRight size={20} className="text-rose-200 group-hover:text-rose-500 group-hover:translate-x-1 transition-all" />
            </button>
          ))}
        </div>
      </main>
    </div>
  );
};

export default RelationshipHub;
