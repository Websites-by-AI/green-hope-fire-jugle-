import React, { Component, ErrorInfo } from 'react';
import { logManager } from '../src/lib/logManager';

interface Props {
  moduleName: string;
  children: React.ReactNode;
}

export class ModuleErrorBoundary extends Component<Props, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logManager.addLog({
      module: this.props.moduleName,
      type: 'lifecycle',
      timestamp: new Date().toISOString(),
      message: error.message,
      componentStack: errorInfo.componentStack || undefined
    });
    console.error(`[HealthDebugger][${this.props.moduleName}][render]`, {
      message: error.message,
      componentStack: errorInfo.componentStack || undefined
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl my-4 text-xs font-mono">
          <strong>[ModuleErrorBoundary]</strong> Failure in <span className="font-bold">{this.props.moduleName}</span>.
        </div>
      );
    }
    return this.props.children;
  }
}
