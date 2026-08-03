import type { PropsWithChildren } from 'react';
import { Component } from 'react';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends Component<PropsWithChildren, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false,
    message: '',
  };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error) {
    console.error('ORINOKO UI error boundary caught an error', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="mx-auto max-w-xl px-4 py-16">
          <Alert type="error">
            <div>
              <p className="font-semibold">Unexpected application error</p>
              <p className="mt-1">{this.state.message}</p>
            </div>
          </Alert>
          <Button className="mt-4" onClick={() => window.location.reload()}>
            Reload app
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

