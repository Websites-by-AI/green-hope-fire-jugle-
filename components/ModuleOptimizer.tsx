
import React, { useState } from 'react';
import { useLanguage } from '../types';
import { getSystemLogs } from '../services/adminService';

interface Props {
  moduleName: string;
  subModules: string[];
}

export const ModuleOptimizer: React.FC<Props> = ({ moduleName, subModules }) => {
  const { language } = useLanguage();
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [showAllLogs, setShowAllLogs] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const logs = getSystemLogs().filter(log => log.message.includes(moduleName));
  const displayedLogs = showAllLogs ? logs : logs.slice(0, 5);
  // const errorCount = logs.filter(l => l.level === 'error').length;

  const deepAnalyze = async () => {
    setIsOptimizing(true);
    setAnalysisResult(null);
    try {
      const response = await fetch('/api/optimize-module', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moduleName, logs, deepAnalyze: true })
      });
      const data = await response.json();
      setAnalysisResult(data.analysis);
    } finally {
      setIsOptimizing(false);
    }
  };

  const optimize = async () => {
    setIsOptimizing(true);
    setAnalysisResult(null);
    try {
      const response = await fetch('/api/optimize-module', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moduleName, logs })
      });
      const data = await response.json();
      setAnalysisResult(data.analysis);
    } finally {
      setIsOptimizing(false);
    }
  };

  return (
    <div className="p-6 border-t border-slate-200 mt-10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-black text-lg">
            {language === 'fa' ? 'بهبود عملکرد و لاگ تغییرات' : 'Module Optimization & Change Log'}
        </h3>
        {logs.length > 5 && (
            <button 
                onClick={() => setShowAllLogs(!showAllLogs)}
                className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 uppercase"
            >
                {showAllLogs ? (language === 'fa' ? 'نمایش کمتر' : 'Show Less') : (language === 'fa' ? 'همه لاگ‌ها' : 'Show All')}
            </button>
        )}
      </div>

      <div className="text-xs text-slate-500 mb-4 font-mono space-y-1">
        {displayedLogs.length > 0 ? (
            displayedLogs.map(log => (
                <div key={log.id} className="border-b pb-1">
                     <span className="opacity-70">[{new Date(log.timestamp).toLocaleTimeString()}]</span> {log.message}
                </div>
            ))
        ) : (
            <div>{language === 'fa' ? 'لاگ فعالی یافت نشد.' : 'No active logs found.'}</div>
        )}
      </div>
      <div className="flex gap-2 mb-4 flex-wrap">
        {subModules.map(sm => (
            <button key={sm} className="px-3 py-1 bg-slate-100 rounded-lg text-[10px] uppercase font-bold hover:bg-slate-200">
                {sm}
            </button>
        ))}
      </div>
       <div className="flex gap-3">
          <button
            onClick={optimize}
            disabled={isOptimizing}
            className="px-4 py-2 bg-slate-900 text-white rounded-lg font-black text-[10px] hover:bg-slate-800 disabled:opacity-50"
          >
            {isOptimizing ? 'Analyzing...' : (language === 'fa' ? 'بهینه‌سازی سریع' : 'Fast Optimize')}
          </button>
          <button
            onClick={deepAnalyze}
            disabled={isOptimizing}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-black text-[10px] hover:bg-indigo-700 disabled:opacity-50"
          >
            {isOptimizing ? 'Analyzing...' : (language === 'fa' ? 'تحلیل عمیق هوشمند' : 'Deep AI Analysis')}
          </button>
      </div>

      {analysisResult && (
        <div className="mt-6 p-4 bg-white border-2 border-indigo-100 rounded-xl animate-fade-in">
            <div className="flex justify-between items-center mb-3">
                <h4 className="font-bold text-sm text-indigo-900">{language === 'fa' ? 'خروجی تحلیلی هوشمند' : 'AI Analysis Output'}</h4>
                <div className="flex gap-2">
                    <button 
                        onClick={() => navigator.clipboard.writeText(`Summary: ${analysisResult.summary}\nInsights: ${analysisResult.insights}\nRecommendations: ${analysisResult.recommendations}`)}
                        className="text-[9px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold hover:bg-slate-200"
                    >
                        {language === 'fa' ? 'کپی نتایج' : 'Copy Results'}
                    </button>
                    <span 
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                            analysisResult.isDemo ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-700'
                        }`}
                    >
                        {analysisResult.isDemo ? (language === 'fa' ? 'نسخه دمو' : 'DEMO ANALYSIS') : 'LIVE AI API'}
                    </span>
                </div>
            </div>
            <div className="space-y-3 text-xs text-slate-700">
                <p><strong>Summary:</strong> {analysisResult.summary}</p>
                {analysisResult.insights && <p><strong>Insights:</strong> {analysisResult.insights}</p>}
                {analysisResult.recommendations && <p><strong>Recommendations:</strong> {analysisResult.recommendations}</p>}
                {analysisResult.improvementPrompt && (
                    <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                             <p className="font-bold text-slate-800 text-[10px] uppercase">Improvement & Development Prompt:</p>
                             <button 
                                onClick={() => navigator.clipboard.writeText(analysisResult.improvementPrompt)}
                                className="text-[10px] bg-slate-200 text-slate-700 px-2 py-1 rounded-md font-bold hover:bg-slate-300"
                             >
                                {language === 'fa' ? 'کپی‌کردن' : 'Copy'}
                             </button>
                        </div>
                        <p className="italic font-mono text-[10px] text-slate-600">{analysisResult.improvementPrompt}</p>
                    </div>
                )}
            </div>
        </div>
      )}
    </div>
  );
};
