// services/adminService.ts

export interface AdminSubmission {
  id: string;
  timestamp: string;
  type: 'reforestation' | 'water';
  location: { lat: number; lng: number };
  locationName: string;
  coordinator: string;
  treesRequested?: number;
  fundingGoal?: number;
  status: 'pending' | 'approved' | 'rejected' | 'under_review';
  details: any;
}

export interface SystemLog {
  id: string;
  timestamp: string;
  level: 'info' | 'warning' | 'success' | 'error';
  message: string;
}

const DEFAULT_SUBMISSIONS: AdminSubmission[] = [
  {
    id: 'sub-1',
    timestamp: new Date(Date.now() - 3600000 * 24 * 3).toISOString(), // 3 days ago
    type: 'reforestation',
    location: { lat: 36.175683, lng: 58.465929 },
    locationName: 'روستای سالاریه (Salariyeh Village)',
    coordinator: 'Dr. Rezaei',
    treesRequested: 5000,
    fundingGoal: 25000,
    status: 'approved',
    details: {
      suggestedSpecies: [
        { name: 'پسته وحشی (Wild Pistachio)', reason: 'Drought-tolerant and highly adapted to dry environments' },
        { name: 'بادام کوهی (Mountain Almond)', reason: 'Prevents soil erosion on hillsides with deep roots' }
      ],
      estimatedCost: { totalCost: '$25,000' }
    }
  },
  {
    id: 'sub-2',
    timestamp: new Date(Date.now() - 3600000 * 18).toISOString(), // 18 hours ago
    type: 'reforestation',
    location: { lat: 35.6892, lng: 51.3890 },
    locationName: 'پیشوای ورامین (Varamin Plain)',
    coordinator: 'Eng. Karimi',
    treesRequested: 12000,
    fundingGoal: 60000,
    status: 'pending',
    details: {
      suggestedSpecies: [
        { name: 'سنجد (Elaeagnus)', reason: 'Fixes nitrogen and tolerates salinity' },
        { name: 'اکالیپتوس (Eucalyptus)', reason: 'Rapid growth for windbreaks' }
      ],
      estimatedCost: { totalCost: '$58,500' }
    }
  },
  {
    id: 'sub-3',
    timestamp: new Date(Date.now() - 3600000 * 45).toISOString(), // 45 hours ago
    type: 'water',
    location: { lat: 29.5918, lng: 52.5837 },
    locationName: 'حوالی شیراز (Shiraz Outskirts)',
    coordinator: 'Maryam Alavi',
    status: 'under_review',
    details: {
      estimatedDepth: '80m - 120m',
      aquiferType: 'Fractured Karstic Aquifer',
      estimatedYield: 'High (15-20 Liters/second)',
      waterQuality: 'Freshwater (TDS < 800 mg/L)',
      rechargePotential: 'Moderate'
    }
  },
  {
    id: 'sub-4',
    timestamp: new Date(Date.now() - 3700000 * 5).toISOString(), // ~5 hours ago
    type: 'reforestation',
    location: { lat: 32.6546, lng: 51.6680 },
    locationName: 'کوهپایه‌های صفه (Soofeh Foothills)',
    coordinator: 'Alireza Abbasi',
    treesRequested: 2500,
    fundingGoal: 12500,
    status: 'approved',
    details: {
      suggestedSpecies: [
        { name: 'کاج ایرانی (Persian Pine)', reason: 'Extremely durable evergreen' }
      ],
      estimatedCost: { totalCost: '$12,500' }
    }
  }
];

const DEFAULT_LOGS: SystemLog[] = [
  { id: 'log-1', timestamp: new Date(Date.now() - 600000).toISOString(), level: 'success', message: 'System initialization checked successfully.' },
  { id: 'log-2', timestamp: new Date(Date.now() - 480000).toISOString(), level: 'info', message: 'OpenRouter Model DeepSeek-R1 verified online.' },
  { id: 'log-3', timestamp: new Date(Date.now() - 240000).toISOString(), level: 'info', message: 'Geological database caching sync done.' },
  { id: 'log-4', timestamp: new Date(Date.now() - 5000).toISOString(), level: 'success', message: 'Rate limiter initialized. Limits: 5 requests/min.' }
];

// Helper for safe localStorage access in sandbox/iframe environments
const safeGetItem = (key: string): string | null => {
  try {
    return localStorage.getItem(key);
  } catch (e) {
    console.warn("Storage access denied:", e);
    return null;
  }
};

const safeSetItem = (key: string, value: string) => {
  try {
    localStorage.setItem(key, value);
  } catch (e) {
    console.warn("Storage write denied:", e);
  }
};

const safeRemoveItem = (key: string) => {
  try {
    localStorage.removeItem(key);
  } catch (e) {
    console.warn("Storage removal denied:", e);
  }
};

// Helper to load/save Submissions
export const getSubmissions = (): AdminSubmission[] => {
  try {
    const data = safeGetItem('greenhope_submissions');
    if (!data) {
      safeSetItem('greenhope_submissions', JSON.stringify(DEFAULT_SUBMISSIONS));
      return DEFAULT_SUBMISSIONS;
    }
    return JSON.parse(data);
  } catch (e) {
    return DEFAULT_SUBMISSIONS;
  }
};

export const saveSubmissions = (subs: AdminSubmission[]) => {
  safeSetItem('greenhope_submissions', JSON.stringify(subs));
};

export const addSubmission = (type: 'reforestation' | 'water', location: { lat: number; lng: number }, details: any, coordinator: string = 'Public User') => {
  const subs = getSubmissions();
  
  // Format coordinate into a beautiful mock name
  const locStr = `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`;
  const locationName = type === 'reforestation' 
    ? `Reforestation Site (${locStr})`
    : `Groundwater Exploration (${locStr})`;

  const newSub: AdminSubmission = {
    id: `sub-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    type,
    location,
    locationName,
    coordinator,
    status: 'pending',
    details,
    treesRequested: type === 'reforestation' ? 3000 : undefined,
    fundingGoal: type === 'reforestation' ? 15000 : undefined
  };

  subs.unshift(newSub);
  saveSubmissions(subs);
  addSystemLog('info', `New ${type} inquiry submitted at location [${locStr}].`);
};

export const updateSubmissionStatus = (id: string, status: 'pending' | 'approved' | 'rejected' | 'under_review'): AdminSubmission[] => {
  const subs = getSubmissions();
  const updated = subs.map(s => {
    if (s.id === id) {
      addSystemLog('success', `Submission ${id} status updated to [${status.toUpperCase()}].`);
      return { ...s, status };
    }
    return s;
  });
  saveSubmissions(updated);
  return updated;
};

// Helper to load/save Logs
export const getSystemLogs = (): SystemLog[] => {
  try {
    const data = safeGetItem('greenhope_logs');
    if (!data) {
      safeSetItem('greenhope_logs', JSON.stringify(DEFAULT_LOGS));
      return DEFAULT_LOGS;
    }
    return JSON.parse(data);
  } catch (e) {
    return DEFAULT_LOGS;
  }
};

export const addSystemLog = (level: 'info' | 'warning' | 'success' | 'error', message: string) => {
  const logs = getSystemLogs();
  const newLog: SystemLog = {
    id: `log-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    level,
    message
  };
  logs.unshift(newLog);
  // Keep last 50 logs
  if (logs.length > 50) logs.pop();
  safeSetItem('greenhope_logs', JSON.stringify(logs));
};

export const clearSystemLogs = () => {
  safeSetItem('greenhope_logs', JSON.stringify([]));
};
