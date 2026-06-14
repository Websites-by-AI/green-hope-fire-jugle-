import React, { useState, useEffect } from 'react';
import { 
  getSubmissions, 
  updateSubmissionStatus, 
  getSystemLogs, 
  addSystemLog, 
  clearSystemLogs,
  AdminSubmission, 
  SystemLog 
} from '../services/adminService';
import { useLanguage } from '../types';
import { useToast } from './Toast';

interface AdminPanelProps {
  onBackToApp: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onBackToApp }) => {
  const { t, language } = useLanguage();
  const { addToast } = useToast();

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return localStorage.getItem('greenhope_admin_authenticated') === 'true';
    } catch (e) {
      console.warn("Storage access denied:", e);
      return false;
    }
  });
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  // Administrative State
  const [submissions, setSubmissions] = useState<AdminSubmission[]>([]);
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [activeTab, setActiveTab] = useState<'submissions' | 'logs' | 'settings'>('submissions');
  const [selectedSub, setSelectedSub] = useState<AdminSubmission | null>(null);

  // Settings Toggles
  const [modelType, setModelType] = useState('deepseek-r1');
  const [groundingEnabled, setGroundingEnabled] = useState(true);
  const [offlineFallback, setOfflineFallback] = useState(false);
  const [maxReforestationPerCall, setMaxReforestationPerCall] = useState(10);

  // Load Admin Data
  useEffect(() => {
    if (isAuthenticated) {
      setSubmissions(getSubmissions());
      setLogs(getSystemLogs());
    }
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    // Exact requested user input credentials
    const trimmedUser = username.trim().toLowerCase();
    const trimmedPass = password.trim();

    if (trimmedUser === 'alan' && trimmedPass === 'admin') {
      try {
        localStorage.setItem('greenhope_admin_authenticated', 'true');
      } catch (e) {
        console.warn("Storage write denied:", e);
      }
      setIsAuthenticated(true);
      addToast('Welcome back, Admin Alan!', 'success');
      addSystemLog('success', 'Admin Alan logged in successfully from secure portal.');
    } else {
      setAuthError('Incomplete or incorrect administrative credentials. Check instructions.');
      addToast('Authentication failed.', 'error');
      addSystemLog('error', `Failed login attempt with username: "${username}"`);
    }
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem('greenhope_admin_authenticated');
    } catch (e) {
      console.warn("Storage removal denied:", e);
    }
    setIsAuthenticated(false);
    setUsername('');
    setPassword('');
    addToast('You have logged out safely.', 'info');
  };

  const handleStatusChange = (id: string, nextStatus: 'pending' | 'approved' | 'rejected' | 'under_review') => {
    const updated = updateSubmissionStatus(id, nextStatus);
    setSubmissions(updated);
    setLogs(getSystemLogs());
    addToast(`Status updated to ${nextStatus.replace('_', ' ')}`, 'success');
    if (selectedSub && selectedSub.id === id) {
      setSelectedSub(prev => prev ? { ...prev, status: nextStatus } : null);
    }
  };

  const handleSaveSettings = () => {
    addSystemLog('success', `Global settings updated. Active Model: ${modelType}. Grounding: ${groundingEnabled}.`);
    addToast('Administrative configurations successfully applied!', 'success');
  };

  const handleClearTerminal = () => {
    clearSystemLogs();
    setLogs([]);
    addToast('Logs terminal cleared.', 'info');
  };

  // Render Login Card
  if (!isAuthenticated) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 animate-fade-in">
        <div className="max-w-md w-full space-y-8 bg-slate-800/80 p-8 rounded-2xl border border-white/10 shadow-2xl backdrop-blur-xl relative">
          
          <button 
            onClick={onBackToApp}
            className="absolute top-4 left-4 text-slate-400 hover:text-white flex items-center text-xs gap-1 transition"
          >
            <i className="fa-solid fa-arrow-left"></i>
            {language === 'fa' ? 'بازگشت به سایت' : 'Back to App'}
          </button>

          <div className="text-center pt-4">
            <div className="mx-auto h-12 w-12 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-400 mb-4 border border-emerald-500/20">
              <i className="fa-solid fa-user-shield text-2xl"></i>
            </div>
            <h2 className="text-3xl font-extrabold text-white tracking-tight">
              Alan's Admin Portal
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              Enter secure administrative credentials for GreenHope Initiative.
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleLogin}>
            <div className="rounded-md shadow-sm space-y-4">
              <div>
                <label className="block text-xs text-slate-400 font-medium mb-1 uppercase tracking-wider">
                  Admin Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <i className="fa-solid fa-user text-sm"></i>
                  </div>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="appearance-none relative block w-full pl-10 pr-3 py-2.5 border border-slate-700 placeholder-slate-500 text-slate-200 bg-slate-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 sm:text-sm"
                    placeholder="e.g. alan"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-400 font-medium mb-1 uppercase tracking-wider">
                  Admin Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <i className="fa-solid fa-lock text-sm"></i>
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="appearance-none relative block w-full pl-10 pr-3 py-2.5 border border-slate-700 placeholder-slate-500 text-slate-200 bg-slate-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 sm:text-sm"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            {authError && (
              <div className="p-3 bg-red-900/30 border border-red-500/50 rounded-lg flex gap-2 items-start text-red-200 text-xs">
                <i className="fa-solid fa-triangle-exclamation mt-0.5"></i>
                <span>{authError}</span>
              </div>
            )}

            <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4 text-center">
              <span className="text-xs text-slate-400 block mb-1 uppercase tracking-wide">🔧 TEST CREDENTIALS</span>
              <p className="font-mono text-sm text-emerald-400">
                Username: <b className="underline text-white">alan</b> &nbsp;|&nbsp; Password: <b className="underline text-white">admin</b>
              </p>
            </div>

            <button
              type="submit"
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-lg text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors shadow-lg shadow-emerald-600/20"
            >
              Verify & Unlock Panel
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Calculate Metrics
  const totalSubmissions = submissions.length;
  const pendingCount = submissions.filter(s => s.status === 'pending').length;
  const reforestationCount = submissions.filter(s => s.type === 'reforestation').length;
  const approvedGoalSum = submissions
    .filter(s => s.status === 'approved' && s.fundingGoal)
    .reduce((sum, item) => sum + (item.fundingGoal || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in text-slate-200">
      
      {/* Admin Title Banner */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest text-emerald-400 font-mono bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 mb-2 inline-block">
            Administrative Shield Active
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <i className="fa-solid fa-toolbox text-emerald-400"></i>
            Alan's Admin Dashboard
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            System performance monitor, analytical submissions list, and global API parameters configuration.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToApp}
            className="px-4 py-2 border border-slate-700 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white font-medium text-sm transition flex items-center gap-2"
          >
            <i className="fa-solid fa-arrow-left"></i>
            Exit to Map Planner
          </button>
          
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600/80 hover:bg-red-700 text-white font-semibold text-sm rounded-lg transition flex items-center gap-2 shadow-lg shadow-red-900/10"
          >
            <i className="fa-solid fa-right-from-bracket"></i>
            Logout Address
          </button>
        </div>
      </div>

      {/* Corporate Dashboard Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <div className="bg-slate-800/40 border border-white/5 p-5 rounded-2xl flex items-center gap-4">
          <div className="h-12 w-12 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-xl flex items-center justify-center text-xl">
            <i className="fa-solid fa-layer-group"></i>
          </div>
          <div>
            <span className="text-xs text-slate-400 block font-medium uppercase font-sans">Total Requests</span>
            <span className="text-2xl font-bold text-white font-mono">{totalSubmissions}</span>
          </div>
        </div>

        <div className="bg-slate-800/40 border border-white/5 p-5 rounded-2xl flex items-center gap-4">
          <div className="h-12 w-12 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-xl flex items-center justify-center text-xl">
            <i className="fa-solid fa-hourglass-half"></i>
          </div>
          <div>
            <span className="text-xs text-slate-400 block font-medium uppercase font-sans">Pending Action</span>
            <span className="text-2xl font-bold text-white font-mono">{pendingCount}</span>
          </div>
        </div>

        <div className="bg-slate-800/40 border border-white/5 p-5 rounded-2xl flex items-center gap-4">
          <div className="h-12 w-12 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl flex items-center justify-center text-xl">
            <i className="fa-solid fa-tree"></i>
          </div>
          <div>
            <span className="text-xs text-slate-400 block font-medium uppercase font-sans">Tree Initiatives</span>
            <span className="text-2xl font-bold text-white font-mono">{reforestationCount}</span>
          </div>
        </div>

        <div className="bg-slate-800/40 border border-white/5 p-5 rounded-2xl flex items-center gap-4">
          <div className="h-12 w-12 bg-teal-500/10 text-teal-400 border border-teal-500/20 rounded-xl flex items-center justify-center text-xl">
            <i className="fa-solid fa-hand-holding-dollar"></i>
          </div>
          <div>
            <span className="text-xs text-slate-400 block font-medium uppercase font-sans">Approved Goals</span>
            <span className="text-2xl font-bold text-white font-mono">${approvedGoalSum.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Main Panel Modules Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Navigation & Submissions / Settings Controller */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Sub Navigation */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-1 flex">
            <button
              onClick={() => setActiveTab('submissions')}
              className={`flex-1 py-2.5 text-center font-medium text-sm rounded-lg transition ${activeTab === 'submissions' ? 'bg-slate-800 text-emerald-400 shadow' : 'text-slate-400 hover:text-white'}`}
            >
              <i className="fa-solid fa-file-invoice mr-2"></i>
              Query Submissions ({submissions.length})
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              className={`flex-1 py-2.5 text-center font-medium text-sm rounded-lg transition ${activeTab === 'logs' ? 'bg-slate-800 text-emerald-400 shadow' : 'text-slate-400 hover:text-white'}`}
            >
              <i className="fa-solid fa-terminal mr-2"></i>
              System Logs ({logs.length})
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex-1 py-2.5 text-center font-medium text-sm rounded-lg transition ${activeTab === 'settings' ? 'bg-slate-800 text-emerald-400 shadow' : 'text-slate-400 hover:text-white'}`}
            >
              <i className="fa-solid fa-sliders-h mr-2"></i>
              Configurations
            </button>
          </div>

          {/* Module: Query Submissions List */}
          {activeTab === 'submissions' && (
            <div className="bg-slate-800/20 border border-white/5 rounded-2xl overflow-hidden shadow-xl">
              <div className="p-6 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h3 className="font-bold text-lg text-white">Inquiries Directory</h3>
                <span className="text-xs text-slate-400 font-mono">Dynamic client-side cache from localStorage</span>
              </div>

              <div className="p-6">
                {submissions.length === 0 ? (
                  <div className="text-center py-12">
                    <i className="fa-solid fa-folder-open text-slate-600 text-4xl mb-3"></i>
                    <p className="text-slate-400">No active enquiries found in memory. Run some analyses on the homepage first!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {submissions.map((sub) => (
                      <div 
                        key={sub.id} 
                        onClick={() => setSelectedSub(sub)}
                        className={`p-4 rounded-xl border transition-all cursor-pointer ${selectedSub?.id === sub.id ? 'bg-slate-800/80 border-emerald-500/50 shadow-md transform scale-[1.01]' : 'bg-slate-900/60 border-white/5 hover:border-slate-700'}`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase ${sub.type === 'reforestation' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'}`}>
                              <i className={`fa-solid ${sub.type === 'reforestation' ? 'fa-tree' : 'fa-water'} mr-1`}></i>
                              {sub.type}
                            </span>
                            <h4 className="font-bold text-white text-sm truncate max-w-xs">{sub.locationName}</h4>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <span className="text-xs text-slate-500 font-mono">{new Date(sub.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold capitalize ${
                              sub.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                              sub.status === 'under_review' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                              sub.status === 'rejected' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                              'bg-slate-700/50 text-slate-400 border border-slate-600'
                            }`}>
                              {sub.status.replace('_', ' ')}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 gap-4 pt-1">
                          <div>
                            <span className="text-slate-500">Contact:</span> <b className="text-slate-300">{sub.coordinator}</b>
                          </div>
                          {sub.treesRequested && (
                            <div>
                              <span className="text-slate-500">Goal:</span> <b className="text-emerald-400 font-mono">{sub.treesRequested.toLocaleString()} Trees</b>
                            </div>
                          )}
                          <div className="text-slate-500 font-mono text-[10px] sm:text-right">
                            ID: {sub.id}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Module: System Logs Visualizer */}
          {activeTab === 'logs' && (
            <div className="bg-slate-800/20 border border-white/5 rounded-2xl overflow-hidden shadow-xl space-y-4 p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-lg text-white">Console Logs Terminal</h3>
                  <p className="text-xs text-slate-400">Captured administrative events & rate limiting trackers</p>
                </div>
                <button
                  onClick={handleClearTerminal}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-rose-300 rounded-lg transition flex items-center gap-1.5"
                >
                  <i className="fa-solid fa-trash-can"></i>
                  Clear Terminal
                </button>
              </div>

              <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 font-mono text-xs overflow-y-auto max-h-[420px] shadow-inner space-y-2.5 antialiased">
                {logs.length === 0 ? (
                  <div className="text-center py-12 text-slate-600 italic">
                    Console terminal ready. No recent operational messages logged.
                  </div>
                ) : (
                  logs.map((log) => (
                    <div key={log.id} className="flex items-start gap-2 border-b border-white/5 pb-1 select-text">
                      <span className="text-slate-600 text-[11px] shrink-0">{new Date(log.timestamp).toLocaleTimeString()}</span>
                      
                      <span className={`uppercase font-bold shrink-0 text-[10px] px-1 rounded ${
                        log.level === 'success' ? 'text-emerald-400 bg-emerald-500/10' :
                        log.level === 'warning' ? 'text-amber-400 bg-amber-500/10' :
                        log.level === 'error' ? 'text-rose-400 bg-rose-500/10' :
                        'text-sky-400 bg-sky-500/10'
                      }`}>
                        [{log.level}]
                      </span>

                      <span className={`${
                        log.level === 'error' ? 'text-rose-200' :
                        log.level === 'success' ? 'text-emerald-200' :
                        'text-slate-300'
                      } break-all`}>
                        {log.message}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Module: System Config Form */}
          {activeTab === 'settings' && (
            <div className="bg-slate-800/20 border border-white/5 rounded-2xl p-6 shadow-xl space-y-6">
              <div>
                <h3 className="font-bold text-lg text-white">Global AI Strategy Configurations</h3>
                <p className="text-xs text-slate-400">Instruct current application execution behaviors on client triggers.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                <div>
                  <label className="block text-xs text-slate-400 font-bold mb-2 uppercase tracking-wide">
                    Default Active Model
                  </label>
                  <select 
                    value={modelType}
                    onChange={(e) => setModelType(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 focus:border-emerald-500 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none"
                  >
                    <option value="deepseek-r1">DeepSeek R1 (DeepSeek-R1-0528) [Active]</option>
                    <option value="gemini-2.0-pro">Gemini 2.0 Pro Experimental</option>
                    <option value="gemini-2.5-flash">Gemini 2.5 Flash Enterprise</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-slate-400 font-bold mb-2 uppercase tracking-wide">
                    Simulation Offline Mode
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setOfflineFallback(!offlineFallback)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${offlineFallback ? 'bg-red-600' : 'bg-slate-700'}`}
                    >
                      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${offlineFallback ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                    <span className="text-xs text-slate-300">Force localized cache callback</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-slate-400 font-bold mb-2 uppercase tracking-wide">
                    Google Search Grounding (Live Data)
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setGroundingEnabled(!groundingEnabled)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${groundingEnabled ? 'bg-emerald-500' : 'bg-slate-700'}`}
                    >
                      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${groundingEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                    <span className="text-xs text-slate-300">Connect to regional data feeds</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-slate-400 font-bold mb-2 uppercase tracking-wide">
                    Max Submissions cached per session
                  </label>
                  <input 
                    type="number"
                    value={maxReforestationPerCall}
                    onChange={(e) => setMaxReforestationPerCall(Math.max(1, parseInt(e.target.value) || 12))}
                    className="w-full bg-slate-900 border border-slate-700 focus:border-emerald-500 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end">
                <button
                  onClick={handleSaveSettings}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-sm transition shadow-md shadow-emerald-900/10 flex items-center gap-1.5"
                >
                  <i className="fa-solid fa-floppy-disk"></i>
                  Save Settings
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Right Side: Detailed Submission View panel */}
        <div className="space-y-6">
          <div className="bg-slate-800/20 border border-white/5 rounded-2xl p-6 shadow-xl space-y-6">
            <h3 className="font-bold text-lg text-white pb-3 border-b border-white/5 flex items-center justify-between">
              <span>Inquiry Inspector</span>
              <i className="fa-solid fa-binoculars text-emerald-400 text-sm"></i>
            </h3>

            {selectedSub ? (
              <div className="space-y-6 animate-fade-in select-text">
                <div>
                  <span className="text-slate-500 text-xs block mb-1">LOCATION & COORDINATE</span>
                  <p className="font-bold text-white text-base">{selectedSub.locationName}</p>
                  <code className="text-[10px] text-emerald-400 font-mono mt-1 block">
                    Lat: {selectedSub.location.lat.toFixed(6)}, Lng: {selectedSub.location.lng.toFixed(6)}
                  </code>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-slate-500 text-xs block mb-0.5">CONTACT COORDINATOR</span>
                    <span className="font-medium text-white text-sm">{selectedSub.coordinator}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-xs block mb-0.5">SUBMISSION TIME</span>
                    <span className="font-medium text-slate-300 text-xs block">{new Date(selectedSub.timestamp).toLocaleString()}</span>
                  </div>
                </div>

                <hr className="border-slate-800" />

                {/* Sub-Details Section */}
                <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-800 space-y-3.5">
                  <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase block">Inquiry Metadata Payload</span>
                  
                  {selectedSub.type === 'reforestation' ? (
                    <div className="space-y-3 font-sans text-xs">
                      {selectedSub.details?.suggestedSpecies && (
                        <div>
                          <strong className="text-emerald-400 block mb-1">Suggested Tree Species:</strong>
                          <ul className="list-disc list-inside space-y-1 text-slate-300">
                            {selectedSub.details.suggestedSpecies.map((sp: any, i: number) => (
                              <li key={i} className="truncate">
                                <b className="text-white">{sp.name}</b>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {selectedSub.details?.estimatedCost && (
                        <div className="flex justify-between items-center bg-slate-950 p-2 rounded">
                          <span className="text-[10px] uppercase text-slate-500 font-sans">Total Estimated Cost</span>
                          <span className="font-bold text-emerald-300 font-mono">{selectedSub.details.estimatedCost.totalCost}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between border-b border-white/5 pb-1">
                        <span className="text-slate-400">Estimated Depth:</span>
                        <span className="text-white font-medium">{selectedSub.details?.estimatedDepth}</span>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-1">
                        <span className="text-slate-400">Aquifer Type:</span>
                        <span className="text-white font-medium truncate max-w-[150px]">{selectedSub.details?.aquiferType}</span>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-1">
                        <span className="text-slate-400">Estimated Yield:</span>
                        <span className="text-emerald-400 font-bold">{selectedSub.details?.estimatedYield}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Water Quality:</span>
                        <span className="text-blue-300 font-medium">{selectedSub.details?.waterQuality}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Status Modifier Actions */}
                <div className="pt-2">
                  <span className="text-slate-500 text-xs block mb-2 uppercase tracking-wide">Status Modifier Action</span>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => handleStatusChange(selectedSub.id, 'approved')}
                      disabled={selectedSub.status === 'approved'}
                      className="py-1.5 px-2 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-white border border-emerald-500/20 rounded-lg text-xs font-bold transition disabled:opacity-50 disabled:bg-emerald-500/5 disabled:hover:text-emerald-400 disabled:cursor-not-allowed"
                    >
                      <i className="fa-solid fa-check mr-1"></i> Approve
                    </button>
                    <button
                      onClick={() => handleStatusChange(selectedSub.id, 'under_review')}
                      disabled={selectedSub.status === 'under_review'}
                      className="py-1.5 px-2 bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-white border border-amber-500/20 rounded-lg text-xs font-bold transition disabled:opacity-50 disabled:bg-amber-500/5 disabled:hover:text-amber-400 disabled:cursor-not-allowed"
                    >
                      <i className="fa-solid fa-magnifying-glass mr-1"></i> Review
                    </button>
                    <button
                      onClick={() => handleStatusChange(selectedSub.id, 'rejected')}
                      disabled={selectedSub.status === 'rejected'}
                      className="py-1.5 px-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 rounded-lg text-xs font-bold transition disabled:opacity-50 disabled:bg-red-500/5 disabled:hover:text-red-555 disabled:cursor-not-allowed"
                    >
                      <i className="fa-solid fa-xmark mr-1"></i> Reject
                    </button>
                  </div>
                </div>

              </div>
            ) : (
              <div className="text-center py-12 text-slate-500 font-sans italic text-sm">
                <i className="fa-solid fa-fingerprint text-3xl mb-2 text-slate-600 block"></i>
                Select an entry from the list to inspect geological payloads, status, or modify approval registers.
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

export default AdminPanel;
