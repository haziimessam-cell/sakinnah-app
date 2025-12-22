
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { translations } from '../translations';
import { RefreshCcw, AlertTriangle } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Robust ErrorBoundary to catch and display UI crashes gracefully.
 */
// Fix: Use React.Component to ensure proper inheritance and access to state/props/setState
export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    // Fix: Initialize state property from React.Component
    this.state = {
      hasError: false,
      error: null,
    };
  }

  // Static method to catch error and update state
  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  // Lifecycle method for side effects like logging
  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  // Fix: Use this.setState inherited from React.Component
  private handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render(): ReactNode {
    // Fix: Access state property inherited from React.Component
    if (this.state.hasError) {
      const savedLang = localStorage.getItem('sakinnah_lang');
      const lang: 'ar' | 'en' = (savedLang === 'en' || savedLang === 'ar') ? (savedLang as 'ar' | 'en') : 'ar';
      const t = (translations as any)[lang];

      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-slate-900 p-6 text-center animate-fadeIn">
          <div className="w-24 h-24 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center text-red-500 mb-6 shadow-sm">
             <AlertTriangle size={48} />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">{t.errorTitle || 'Error'}</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-xs mx-auto leading-relaxed">
            {t.errorDesc || 'An unexpected error occurred.'}
            <br />
            {this.state.error && (
               <span className="text-xs opacity-70 mt-2 block font-mono bg-gray-200 dark:bg-slate-800 p-2 rounded max-w-full overflow-hidden text-ellipsis">
                 {this.state.error.message}
               </span>
            )}
          </p>
          <button
            onClick={this.handleReload}
            className="px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold shadow-lg flex items-center gap-2 transition-all active:scale-95"
          >
            <RefreshCcw size={18} />
            {t.reloadApp || 'Reload'}
          </button>
        </div>
      );
    }

    // Fix: Access props property inherited from React.Component
    return this.props.children;
  }
}
