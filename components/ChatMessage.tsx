import React, { memo } from 'react';
import { Message, Role, Language } from '../types';
import { Play, Volume2, Copy, Check, Bookmark } from 'lucide-react';

interface Props {
  msg: Message;
  language: Language;
  isStreaming: boolean;
  isSpeaking: boolean;
  copiedId: string | null;
  onSpeak: (text: string) => void;
  onCopy: (text: string, id: string) => void;
  onBookmark: (msg: Message) => void;
}

// MEMOIZED COMPONENT: Prevents re-rendering of old messages when typing
const ChatMessage: React.FC<Props> = memo(({ msg, language, isStreaming, isSpeaking, copiedId, onSpeak, onCopy, onBookmark }) => {
  
  const renderMessageText = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, i) => {
      let content = line.split(/(\*\*.*?\*\*)/).map((part, j) => {
        if (part.startsWith('**') && part.endsWith('**')) return <strong key={j} className="font-bold text-gray-900">{part.slice(2, -2)}</strong>;
        return part;
      });
      if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
        return <div key={i} className="flex items-start gap-2 my-1"><span className="text-primary-500 mt-1.5 text-[8px] flex-shrink-0">●</span><span className="flex-1">{content}</span></div>;
      }
      return <div key={i} className={`min-h-[1.2em] ${line.trim() === '' ? 'h-2' : ''}`}>{content}</div>;
    });
  };

  return (
    <div className={`flex ${msg.role === Role.USER ? 'justify-start' : 'justify-end'} animate-slideUp group transform-gpu`}>
      <div className={`max-w-[85%] rounded-[1.5rem] px-5 py-3.5 shadow-sm text-sm md:text-base leading-relaxed relative border backdrop-blur-md ${msg.role === Role.USER ? 'bg-primary-600/90 text-white rounded-br-none border-primary-500/50' : 'bg-white/80 text-gray-800 rounded-bl-none border-white/60'}`}>
        {msg.role === Role.MODEL ? renderMessageText(msg.text) : msg.text}
        
        <div className="flex items-center justify-between mt-1 gap-2 border-t border-white/10 pt-1.5 opacity-80 hover:opacity-100 transition-opacity">
            <div className={`text-[10px] ${msg.role === Role.USER ? 'text-blue-100' : 'text-gray-400'}`}>
              {msg.timestamp.toLocaleTimeString(language === 'ar' ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
            </div>
            {msg.role === Role.MODEL && !isStreaming && (
              <div className="flex items-center gap-1">
                  <button onClick={() => onSpeak(msg.text)} className="p-1.5 hover:bg-black/5 rounded-full text-gray-500 hover:text-primary-600 transition-colors">{isSpeaking ? <Volume2 size={12} className="animate-pulse" /> : <Play size={12} />}</button>
                  <button onClick={() => onCopy(msg.text, msg.id)} className="p-1.5 hover:bg-black/5 rounded-full text-gray-500 hover:text-primary-600 transition-colors">{copiedId === msg.id ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}</button>
                  <button onClick={() => onBookmark(msg)} className={`p-1.5 hover:bg-black/5 rounded-full transition-colors ${msg.isBookmarked ? 'text-yellow-500' : 'text-gray-500 hover:text-yellow-500'}`}><Bookmark size={12} fill={msg.isBookmarked ? "currentColor" : "none"} /></button>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}, (prev, next) => {
    // Custom comparison function for React.memo
    // Only re-render if text changes (streaming) or bookmark/copy state changes
    return (
        prev.msg.text === next.msg.text && 
        prev.msg.isBookmarked === next.msg.isBookmarked &&
        prev.isSpeaking === next.isSpeaking &&
        prev.copiedId === next.copiedId
    );
});

export default ChatMessage;