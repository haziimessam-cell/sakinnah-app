
import React from 'react';
import { Language, User, ViewStateName } from '../types';
import { translations } from '../translations';
import { Heart, MessageSquareText, Map, Wind, Scale, ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';

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
    { id: 'MEDIATOR', title: t.rel_tool_mediator, icon: <Scale size={24} />, color: 'bg-rose-500', desc: t.rel_hub_desc },
    { id: 'EMPATHY_TRANSLATOR', title: t.rel_tool_translator, icon: <MessageSquareText size={24} />, color: 'bg-indigo-500', desc: t.rel_translator_placeholder },
    { id: 'ATTACHMENT_MAPPER', title: t.rel_tool_mapper, icon: <Map size={24} />, color: 'bg-amber-500', desc: t.rel_mapper_desc },
    { id: 'CO_REGULATOR', title: t.rel_tool_regulator, icon: <Wind size={24} />, color: 'bg-teal-500', desc: t.rel_regulator_desc },
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
            {t.rel_hub_title}
          </h1>
          <p className="text-[10px] font-bold text-rose-400 uppercase tracking-widest">{t.cat_relationships_title}</p>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
        <div className="bg-white/60 rounded-[2.5rem] p-8 border border-rose-100 shadow-sm mb-6 relative overflow-hidden group">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-rose-500/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>
          <Sparkles className="text-rose-400 mb-4" size={32} />
          <h2 className="text-2xl font-black text-rose-900 mb-2">{isRTL ? 'مرحباً في مختبر الألفة' : 'Welcome to Intimacy Lab'}</h2>
          <p className="text-sm text-rose-700/70 leading-relaxed font-medium">{t.rel_hub_desc}</p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {tools.map((tool) => (
            <button 
              key={tool.id}
              onClick={() => onSelectTool(tool.id as ViewStateName)}
              className="bg-white/80 backdrop-blur-md p-6 rounded-[2rem] border border-rose-50 shadow-sm hover:shadow-md transition-all flex items-center gap-5 group active:scale-95 text-start"
            >
              <div className={`w-14 h-14 ${tool.color} rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-500`}>
                {tool.icon}
              </div>
              <div className="flex-1">
                <h3 className="font-black text-gray-800 text-lg">{tool.title}</h3>
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
