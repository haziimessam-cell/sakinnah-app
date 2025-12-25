
import React, { useRef, useEffect } from 'react';
import { Send, Mic, MicOff, CircleStop } from 'lucide-react';
import { Language } from '../types';

interface Props {
  inputText: string;
  setInputText: (text: string) => void;
  onSend: () => void;
  isListening: boolean;
  onToggleMic: () => void;
  isStreaming: boolean;
  language: Language;
  t: any;
  isRTL: boolean;
}

const ChatInput: React.FC<Props> = ({ 
  inputText, setInputText, onSend, isListening, onToggleMic, isStreaming, language, t, isRTL
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [inputText]);

  return (
    <div className="flex items-end gap-2 max-w-4xl mx-auto">
      <div className="flex-1 bg-m3-surfaceVariant rounded-[28px] flex items-end px-2 py-1 min-h-[56px] border border-transparent focus-within:border-m3-primary/30">
        <button onClick={onToggleMic} className={`p-3 rounded-full ${isListening ? 'text-m3-error animate-pulse' : 'text-m3-onSurfaceVariant'}`}>
          {isListening ? <MicOff size={24} /> : <Mic size={24} />}
        </button>
        <textarea
          ref={textareaRef}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={isRTL ? 'رسالة...' : 'Message...'}
          className="flex-1 bg-transparent border-none focus:ring-0 p-3 max-h-[120px] min-h-[48px] resize-none text-m3-onSurface text-base"
          rows={1}
        />
      </div>
      
      <button 
        onClick={onSend} 
        disabled={isStreaming || !inputText.trim()}
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all active:scale-95
          ${inputText.trim() && !isStreaming 
            ? 'bg-m3-primary text-m3-onPrimary' 
            : 'bg-m3-surfaceVariant text-m3-onSurfaceVariant opacity-50'}`}
      >
        {isStreaming ? <CircleStop size={24} className="animate-pulse" /> : <Send size={24} className={isRTL ? 'rotate-180' : ''} />} 
      </button>
    </div>
  );
};

export default ChatInput;
