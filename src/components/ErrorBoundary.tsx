import { Component, type ErrorInfo, type PropsWithChildren } from 'react';
import { AlertTriangle, RefreshCw, RotateCw, MessageSquareWarning } from 'lucide-react';

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<PropsWithChildren, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      const reportSubject = encodeURIComponent('AusTeen Money — bug report');
      const reportBody = encodeURIComponent(
        `Error: ${this.state.error?.message ?? 'Unknown'}\n\nPage: ${typeof window !== 'undefined' ? window.location.href : ''}`
      );

      return (
        <div className="min-h-[400px] flex items-center justify-center p-6 w-full">
          <div className="glass-card max-w-md w-full p-8 rounded-xl flex flex-col items-center text-center animate-scale-in">
            <div className="w-16 h-16 rounded-full bg-danger/10 flex items-center justify-center mb-6">
              <AlertTriangle className="w-8 h-8 text-danger" />
            </div>
            
            <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
            <p className="text-muted-foreground mb-8 text-sm">
              We encountered an unexpected error while loading this section.
              {this.state.error && (
                <span className="block mt-2 font-mono text-xs opacity-75 break-words">
                  {this.state.error.message}
                </span>
              )}
            </p>
            
            <div className="flex flex-wrap items-center justify-center gap-2.5">
              <button
                onClick={this.handleRetry}
                className="btn-dynamic flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>
              <button
                onClick={this.handleReload}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-card border border-border text-foreground text-sm font-medium hover:border-primary/40 transition-all"
              >
                <RotateCw className="w-4 h-4" />
                Reload page
              </button>
              <a
                href={`mailto:?subject=${reportSubject}&body=${reportBody}`}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
              >
                <MessageSquareWarning className="w-4 h-4" />
                Report issue
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
