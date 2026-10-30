import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface Props { children: React.ReactNode; resetKey?: string; }
interface State { error: Error | null; }

/** Keeps one broken module from white-screening the whole ERP. Resets when the user navigates. */
export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State { return { error }; }

  componentDidUpdate(prev: Props) {
    if (this.state.error && prev.resetKey !== this.props.resetKey) this.setState({ error: null });
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('Module crashed:', error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="surface max-w-xl mx-auto mt-16 p-8 text-center">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
          <AlertTriangle className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-extrabold text-slate-900">This module hit a problem</h2>
        <p className="text-sm text-slate-600 mt-2">
          The rest of RestoERP is unaffected. You can retry, or switch to another module from the sidebar.
        </p>
        <pre className="mt-4 text-left text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 overflow-auto max-h-32 text-rose-700">
          {this.state.error.message}
        </pre>
        <button
          onClick={() => this.setState({ error: null })}
          className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-800 hover:bg-brand-700 text-white text-sm font-bold"
        >
          <RotateCcw className="w-4 h-4" /> Retry
        </button>
      </div>
    );
  }
}
