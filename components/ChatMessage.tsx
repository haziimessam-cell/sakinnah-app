
import React, { memo } from 'react';
import { Message, Role, Language } from '../types';
import { Play, Volume2, Copy, Bookmark } from 'lucide-react';

interface Props {
  msg: Message;
  language: Language;
  isStreaming: boolean;
  isSpeaking: boolean;
  onSpeak: () => void;
  onCopy: () => void;
  onBookmark: () => void;
}

const ChatMessage: React.FC<Props> = memo(({ msg, language, isStreaming, isSpeaking, onSpeak, onCopy, onBookmark }) => {
  const isUser = msg.role === Role.USER;

  const renderMessageText = (text: string) => {
    return text.split('\n').map((line, i) => (
      <div key={i} className={line.trim() === '' ? 'h-2' : 'mb-1'}>
        {line.split(/(\*\*.*?\*\*)/).map((part, j) => {
          if (part.startsWith('**') && part.endsWith('**')) return <strong key={j} className="font-bold">{part.slice(2, -2)}</strong>;
          return part;
        })}
      </div>
    ));
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-m3-slide-up group`}>
      <div className={`max-w-[85%] px-4 py-3 shadow-sm text-base leading-relaxed relative flex flex-col
          ${isUser 
            ? 'bg-m3-primaryContainer text-m3-onPrimaryContainer rounded-[20px] rounded-br-[4px]' 
            : 'bg-m3-secondaryContainer text-m3-onSecondaryContainer rounded-[20px] rounded-bl-[4px]'}`}>
        
        <div className="text-[15px]">
          {isUser ? msg.text : renderMessageText(msg.text)}
        </div>
        
        <div className={`flex items-center gap-2 mt-2 pt-1 border-t border-black/5 opacity-60 ${isUser ? 'justify-end' : 'justify-start'}`}>
            <span className="text-[10px] font-medium">
              {msg.timestamp.toLocaleTimeString(language === 'ar' ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
            </span>
            {!isUser && !isStreaming && (
              <div className="flex items-center gap-1">
                  <button onClick={onSpeak} className="p-1 hover:bg-black/5 rounded-full transition-colors">
                    {isSpeaking ? <Volume2 size={14} className="animate-pulse" /> : <Play size={14} />}
                  </button>
                  <button onClick={onCopy} className="p-1 hover:bg-black/5 rounded-full transition-colors"><Copy size={14} /></button>
              </div>
            )}
        </div>
      </div>
    </div>
  );
});

export default ChatMessage;
