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
// Fix: Extending Component<Props, State> directly ensures that TypeScript correctly identifies inherited properties like state, setState, and props.
export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    // Fix: Initializing state within the constructor is the standard pattern for React class components to ensure state is defined.
    this.state = {
      hasError: false,
      error: null,
    };
  }

  // Static method to catch error and update state for rendering.
  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  // Lifecycle method for side effects like error logging.
  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  // Handle reload by resetting state and refreshing the page context.
  private handleReload = () => {
    // Fix: Using this.setState, which is correctly identified as a member of the React Component base class.
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render(): ReactNode {
    // Fix: this.state is now correctly resolved due to proper generic extension from Component.
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
            {/* Fix: Safely check for the error object in state before rendering its properties. */}
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

    // Fix: this.props.children is now correctly identified via Component<Props, State> extension.
    return this.props.children;
  }
}
