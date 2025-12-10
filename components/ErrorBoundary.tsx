
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { translations } from '../translations';
import { RefreshCcw, AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      // Default to Arabic/English fallback based on common sense since we can't easily access context here without hooks
      // But we can check localStorage for language preference
      const lang = localStorage.getItem('sakinnah_lang') === 'en' ? 'en' : 'ar';
      const t = translations[lang];

      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6 text-center animate-fadeIn">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center text-red-500 mb-6 shadow-sm">
             <AlertTriangle size={48} />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">{t.errorTitle}</h1>
          <p className="text-gray-500 mb-8 max-w-xs mx-auto leading-relaxed">{t.errorDesc}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold shadow-lg flex items-center gap-2 transition-all active:scale-95"
          >
            <RefreshCcw size={18} />
            {t.reloadApp}
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
