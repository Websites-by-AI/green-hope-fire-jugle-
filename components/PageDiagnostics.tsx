import React, { useState, useEffect } from 'react';
import { logManager } from '../src/lib/logManager';
import { Bug, AlertTriangle, RefreshCw, Clipboard } from 'lucide-react';

interface Props {
  moduleName: string;
}

interface AnalysisResult {
    summary: string;
    insights: string;
    recommendations: string;
    improvementPrompt: string;
}

export const PageDiagnostics: React.FC<Props> = ({ moduleName }) => {
  const [logs, setLogs] = useState(logManager.getLogsForModule(moduleName));
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsub = logManager.subscribe(() => {
      setLogs(logManager.getLogsForModule(moduleName));
    });
    return unsub;
  }, [moduleName]);

  const runDiagnostics = async () => {
    setLoading(true);
    try {
        const response = await fetch('/api/optimize-module', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ moduleName, logs, deepAnalyze: true })
        });
        const data = await response.json();
        setAnalysis(data.analysis);
    } catch (error) {
        console.error('Failed to run diagnostics:', error);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="mt-8 border-t pt-4">
      <button 
        onClick={() => setShowDiagnostics(!showDiagnostics)}
        className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-indigo-600 transition"
      >
        <Bug className="w-4 h-4" />
        {showDiagnostics ? 'Hide Diagnostics' : `View Page Diagnostics (${logs.length})`}
      </button>

      {showDiagnostics && (
        <div className="mt-4 p-4 bg-slate-50 border rounded-xl space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-sm text-slate-900">Health Report for {moduleName}</h3>
          </div>
          
          {logs.length === 0 ? (
            <p className="text-xs text-slate-500">No issues detected.</p>
          ) : (
            logs.map((log: any, i: number) => (
              <div key={i} className="flex gap-2 text-[10px] text-slate-700 bg-white p-2 rounded border border-slate-100">
                <AlertTriangle className="w-3 h-3 text-rose-500 shrink-0" />
                <span className="font-mono truncate">{log.message}</span>
              </div>
            ))
          )}
          
          <button 
            onClick={runDiagnostics}
            disabled={loading || logs.length === 0}
            className="flex items-center gap-2 w-full justify-center text-[10px] font-bold bg-indigo-600 text-white p-2 rounded hover:bg-indigo-700 disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Analyzing...' : 'Run AI Diagnostic Analysis'}
          </button>

          {analysis && (
            <div className="mt-4 p-4 bg-white border border-indigo-100 rounded-lg space-y-2 text-xs text-slate-700">
                <p><strong>Summary:</strong> {analysis.summary}</p>
                <p><strong>Insights:</strong> {analysis.insights}</p>
                <p><strong>Recommendations:</strong> {analysis.recommendations}</p>
                <div className="mt-2 p-2 bg-indigo-50 rounded border border-indigo-100">
                    <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-indigo-800">Improvement Prompt:</span>
                        <button 
                            onClick={() => navigator.clipboard.writeText(analysis.improvementPrompt)}
                            className="text-[10px] bg-indigo-200 text-indigo-800 px-2 py-0.5 rounded font-bold"
                        >
                            Copy
                        </button>
                    </div>
                    <p className="italic font-mono text-[10px]">{analysis.improvementPrompt}</p>
                </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
