type LogEntry = {
  module: string;
  type: string;
  timestamp: string;
  message: string;
  componentStack?: string;
};

class LogManager {
  private logs: LogEntry[] = [];
  private listeners: (() => void)[] = [];

  addLog(log: LogEntry) {
    this.logs.push(log);
    this.listeners.forEach(listener => listener());
  }

  getLogsForModule(moduleName: string): LogEntry[] {
    return this.logs.filter(log => log.module === moduleName);
  }

  subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }
}

export const logManager = new LogManager();
