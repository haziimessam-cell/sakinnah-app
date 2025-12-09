import React from 'react';

interface Props {
  onAccept: () => void;
  title: string;
  content: string;
  buttonText: string;
}

const DisclaimerModal: React.FC<Props> = ({ onAccept, title, content, buttonText }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl animate-[fadeIn_0.3s_ease-out]">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">{title}</h2>
          <p className="text-gray-600 leading-relaxed text-sm mb-6 whitespace-pre-line">
            {content}
          </p>
          <button
            onClick={onAccept}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-6 rounded-xl transition-all active:scale-95 shadow-lg shadow-primary-500/30"
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DisclaimerModal;