
import React from 'react';
import { Language } from '../types';
import { translations } from '../translations';

const MOODS = [
  { emoji: '😊', key: 'mood_happy', color: 'bg-green-100 text-green-600 border-green-200 hover:bg-green-200' },
  { emoji: '😐', key: 'mood_normal', color: 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200' },
  { emoji: '😔', key: 'mood_sad', color: 'bg-blue-100 text-blue-600 border-blue-200 hover:bg-blue-200' },
  { emoji: '😠', key: 'mood_angry', color: 'bg-red-100 text-red-600 border-red-200 hover:bg-red-200' },
  { emoji: '😰', key: 'mood_anxious', color: 'bg-orange-100 text-orange-600 border-orange-200 hover:bg-orange-200' },
];

interface Props {
  onSelect: (mood: string) => void;
  language: Language;
}

const MoodTracker: React.FC<Props> = ({ onSelect, language }) => {
  const t = translations[language] as any;
  return (
    <div className="w-full animate-fadeIn">
      <div className="flex gap-3 justify-center">
        {MOODS.map((mood, i) => (
          <button
            key={mood.key}
            onClick={() => {
                if (navigator.vibrate) navigator.vibrate(15);
                onSelect(t[mood.key]);
            }}
            style={{ animationDelay: `${i * 80}ms` }}
            className={`flex flex-col items-center justify-center w-16 h-20 p-2 rounded-2xl border ${mood.color} transition-all active:scale-90 animate-scaleIn opacity-0 shadow-sm`}
          >
            <span className="text-3xl mb-1 filter drop-shadow-sm transform hover:scale-110 transition-transform">{mood.emoji}</span>
            <span className="text-[10px] font-bold">{t[mood.key]}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default MoodTracker;
