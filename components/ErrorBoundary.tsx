
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { translations } from '../translations';
import { RefreshCcw, AlertTriangle, Share2, Check } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  copied: boolean;
}

/**
 * Robust ErrorBoundary to catch and display UI crashes gracefully.
 */
class ErrorBoundary extends Component<Props, State> {
  // Using constructor ensures super(props) is called and this.state/this.props are correctly bound.
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      copied: false,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, copied: false };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  // handleReload as an arrow function ensures 'this' context for access to inherited setState
  private handleReload = () => {
    this.setState({ hasError: false, error: null, copied: false });
    window.location.reload();
  };

  // handleSendFeedback as an arrow function ensures 'this' context for access to inherited state and setState
  private handleSendFeedback = async () => {
    const { error } = this.state;
    const savedLang = localStorage.getItem('sakinnah_lang');
    const lang: 'ar' | 'en' = (savedLang === 'en' || savedLang === 'ar') ? (savedLang as 'ar' | 'en') : 'ar';
    const t = (translations as any)[lang];

    const errorReport = `
=== SAKINNAH ERROR REPORT ===
Time: ${new Date().toISOString()}
Message: ${error?.message || 'Unknown Error'}
Stack: ${error?.stack || 'No stack trace available'}
Browser: ${navigator.userAgent}
Language: ${lang}
URL: ${window.location.href}
=============================
    `;

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(errorReport);
        this.setState({ copied: true });
        alert(t.reportIssuePrompt || 'Error details copied to clipboard. Please paste them into your report.');
        setTimeout(() => this.setState({ copied: false }), 3000);
      }
    } catch (err) {
      console.error('Failed to copy error report', err);
    }
  };

  public render(): ReactNode {
    const { hasError, error, copied } = this.state;
    const { children } = this.props;

    if (hasError) {
      const savedLang = localStorage.getItem('sakinnah_lang');
      const lang: 'ar' | 'en' = (savedLang === 'en' || savedLang === 'ar') ? (savedLang as 'ar' | 'en') : 'ar';
      const t = (translations as any)[lang];
      const isRTL = lang === 'ar';

      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#FDFCFB] p-8 text-center animate-ios-reveal" dir={isRTL ? 'rtl' : 'ltr'}>
          <div className="w-24 h-24 bg-red-50 rounded-[2.5rem] flex items-center justify-center text-red-500 mb-8 shadow-sm border border-red-100 animate-float">
             <AlertTriangle size={48} />
          </div>
          
          <h1 className="text-2xl font-bold text-ios-azureDeep mb-3 leading-tight">
            {t.errorTitle || 'Something went wrong'}
          </h1>
          
          <p className="text-ios-azure/60 mb-10 max-w-xs mx-auto text-sm font-medium leading-relaxed">
            {t.errorDesc || 'An unexpected error occurred.'}
          </p>

          <div className="w-full max-sm space-y-4">
            <button
              onClick={this.handleReload}
              className="w-full h-14 bg-ios-azure text-white rounded-2xl font-bold shadow-lg shadow-ios-azure/20 flex items-center justify-center gap-3 transition-all active:scale-95"
            >
              <RefreshCcw size={20} />
              {t.reloadApp || 'Reload'}
            </button>
            
            <button
              onClick={this.handleSendFeedback}
              className={`w-full h-14 bg-white border-2 border-ios-slate rounded-2xl font-bold flex items-center justify-center gap-3 transition-all active:scale-95 ${copied ? 'text-emerald-600 border-emerald-100 bg-emerald-50' : 'text-ios-azureDeep'}`}
            >
              {copied ? <Check size={20} /> : <Share2 size={20} />}
              {copied ? (t.feedbackCopied || 'Copied!') : (t.sendFeedback || 'Send Feedback')}
            </button>
          </div>

          {error && (
            <div className="mt-12 w-full max-w-sm">
                <div className="p-4 bg-ios-slate rounded-2xl text-start">
                    <span className="text-[10px] font-black uppercase tracking-widest text-ios-azure/40 mb-2 block">Technical Detail</span>
                    <span className="text-xs font-mono break-all line-clamp-2 opacity-70">
                        {error.message}
                    </span>
                </div>
            </div>
          )}
        </div>
      );
    }

    return children;
  }
}

export default ErrorBoundary;
