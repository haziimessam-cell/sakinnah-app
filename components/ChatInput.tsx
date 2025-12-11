

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
  inputText, 
  setInputText, 
  onSend, 
  isListening, 
  onToggleMic, 
  isStreaming, 
  language,
  t,
  isRTL
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'; // Reset height
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`; // Set new height capped at 120px
    }
  }, [inputText]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="bg-white/40 backdrop-blur-md p-3 border-t border-white/20 pb-safe transition-all duration-300">
      <div className="flex items-end gap-2 max-w-4xl mx-auto">
        <button 
          onClick={onToggleMic} 
          className={`p-3 rounded-full transition-all duration-300 flex-shrink-0 h-12 w-12 flex items-center justify-center shadow-sm ${
            isListening 
              ? 'bg-red-500 text-white animate-pulse' 
              : 'bg-white/60 text-gray-500 hover:bg-white border border-white/40'
          }`}
        >
          {isListening ? <MicOff size={20} /> : <Mic size={20} />}
        </button>
        
        <div className="flex-1 bg-white/60 backdrop-blur-md rounded-[1.5rem] border border-white/40 focus-within:border-primary-400 focus-within:ring-2 focus-within:ring-primary-100 transition-all shadow-inner relative overflow-hidden">
          <textarea
            ref={textareaRef}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isListening ? t.inputListening : t.inputPlaceholder}
            className="w-full bg-transparent border-none focus:ring-0 p-3.5 max-h-[120px] min-h-[48px] resize-none text-gray-800 placeholder-gray-500 block leading-relaxed"
            rows={1}
            style={{ overflowY: inputText.length > 100 ? 'auto' : 'hidden' }}
          />
        </div>
        
        <button 
          onClick={() => onSend()} 
          disabled={(isStreaming) || (!inputText.trim() && !isStreaming)} 
          className={`p-3 rounded-full flex items-center justify-center transition-all h-12 w-12 flex-shrink-0 shadow-lg border border-white/20 transform active:scale-90 duration-200 ${
            inputText.trim() && !isStreaming 
              ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white hover:shadow-primary-500/30' 
              : 'bg-gray-200/50 text-gray-400 cursor-not-allowed'
          }`}
        >
          {isStreaming ? (
            <CircleStop size={20} className="animate-pulse text-primary-600" />
          ) : (
            <Send size={20} className={isRTL && inputText.trim() ? 'mr-0.5' : 'ml-0.5'} />
          )} 
        </button>
      </div>
    </div>
  );
};

export default ChatInput;
