import { useEffect } from 'react';
import { logManager } from '../lib/logManager';

export const useModuleHealthDebugger = (moduleName: string) => {
  useEffect(() => {
    const reportError = (event: ErrorEvent | PromiseRejectionEvent, type: string) => {
      const errorReport = {
        module: moduleName,
        type: type,
        timestamp: new Date().toISOString(),
        message: event instanceof ErrorEvent ? event.message : String((event as PromiseRejectionEvent).reason),
      };
      
      logManager.addLog(errorReport);
      console.error(`[HealthDebugger][${moduleName}]`, errorReport);
    };

    const handleConsoleError = (event: ErrorEvent) => reportError(event, 'console');
    const handlePromiseRejection = (event: PromiseRejectionEvent) => reportError(event, 'promise');

    window.addEventListener('error', handleConsoleError);
    window.addEventListener('unhandledrejection', handlePromiseRejection);

    return () => {
      window.removeEventListener('error', handleConsoleError);
      window.removeEventListener('unhandledrejection', handlePromiseRejection);
    };
  }, [moduleName]);
};
