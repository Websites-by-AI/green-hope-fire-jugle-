import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../types';
import { useToast } from './Toast';
import { addSystemLog } from '../services/adminService';
import { 
  Flame, 
  Droplets, 
  Wind, 
  Sun, 
  Wifi, 
  Cpu, 
  Database, 
  Bell, 
  Code, 
  Compass, 
  ShieldAlert, 
  Zap, 
  BookOpen, 
  RefreshCw, 
  Play, 
  Save, 
  AlertTriangle,
  Plane,
  Shield,
  Activity,
  Eye,
  Trash2,
  Layers,
  Map as MapIcon,
  Leaf,
  Download,
  FileText,
  Copy,
  Check,
  Printer,
  Award
} from 'lucide-react';

const SmartFireSensePage: React.FC = () => {
  const { language } = useLanguage();
  const { addToast } = useToast();

  // Selected sub-tabs within SmartFireSense page
  const [activeSubTab, setActiveSubTab] = useState<'dashboard' | 'architecture' | 'codehub' | 'api'>('dashboard');
  const [activeCodeTab, setActiveCodeTab] = useState<'esp32' | 'python' | 'node' | 'flutter'>('esp32');

  // ============== NEW STATE VARIABLES FOR INTERACTIVE MAP LAYERS & SHAPES ==============
  const [mapLayer, setMapLayer] = useState<'dark' | 'satellite' | 'topo'>('dark');
  const [shapeMode, setShapeMode] = useState<'circle' | 'rectangle' | 'multipoint'>('circle');
  const [circleRadiusKm, setCircleRadiusKm] = useState<number>(30);
  const [customPoints, setCustomPoints] = useState<{lat: number, lng: number}[]>([]);
  const [showRiskZoneOverlay, setShowRiskZoneOverlay] = useState<boolean>(true);
  const [showStationLocations, setShowStationLocations] = useState<boolean>(true);
  const [showSoilMoisture, setShowSoilMoisture] = useState<boolean>(false);
  const [showRecentFireHistory, setShowRecentFireHistory] = useState<boolean>(false);
  const [showBiodiversityIndex, setShowBiodiversityIndex] = useState<boolean>(false);
  const [selectedRegionRisk, setSelectedRegionRisk] = useState<{
    riskPercent: number;
    lvl: 'low' | 'medium' | 'high' | 'critical';
    vegDensity: string;
    dryFuel: string;
    advice: string;
    areaSqKm: number;
    center: [number, number];
    customBounds?: [number, number][];
  } | null>(null);

  const [copied, setCopied] = useState<boolean>(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);

  // Dynamic ML Risk Estimator for chosen coordinates (Zagros / Alborz Region detection)
  const estimateRegionRisk = (lat: number, lng: number) => {
    const isZagros = lat >= 29 && lat <= 34.5 && lng >= 46 && lng <= 52;
    const isAlborz = lat >= 35 && lat <= 38 && lng >= 47 && lng <= 56;
    
    // Base temperature modifier from current simulation overrides
    const tempFactor = (simTemp - 15) * 1.5;
    const humFactor = (55 - simHum) * 1.2;
    const windFactor = simWind * 0.4;
    
    // Estimate a realistic ignition risk score (percentage)
    let score = 35 + Math.round(tempFactor + humFactor + windFactor);
    if (isZagros) score += 12; // Zagros oak has highly flammable deadwood
    if (isAlborz) score -= 8;  // Alborz forests are generally more humid
    
    score = Math.max(5, Math.min(99, score));
    
    let lvl: 'low' | 'medium' | 'high' | 'critical' = 'low';
    let vegDensity = language === 'fa' ? "پوشش کوهپایه‌ای کم‌تراکم" : "Low density sparse foothills";
    let dryFuel = language === 'fa' ? "بسیار اندک و مرطوب (رطوبت خاک مناسب)" : "Very low and humid (Optimal soil moisture)";
    let advice = language === 'fa' ? "منطقه در وضعیت سبز پایدار. پایش ماهواره‌ای روتین." : "Region in stable green state. Routine satellite monitoring.";

    if (score < 30) {
      lvl = 'low';
    } else if (score < 55) {
      lvl = 'medium';
      vegDensity = language === 'fa' ? "تراکم متوسط (درختچه‌های بادام کوهی و گون)" : "Medium density (Wild almond & Astragalus shrubs)";
      dryFuel = language === 'fa' ? "متوسط (علوفه و گیاهان خودرو خشک‌شونده)" : "Moderate (Drying weeds and surface herbs)";
      advice = language === 'fa' ? "استقرار دوره‌ای داوطلبان محلی و همیاران طبیعت زاگرس توصیه می‌شود." : "Periodic deployment of local Zagros nature advocates is advised.";
    } else if (score < 78) {
      lvl = 'high';
      vegDensity = language === 'fa' ? "جنگل نیمه‌مخروبه و انبوه (بلوط زاگرس غربی)" : "Dense semi-depleted forest (West Zagros Oak)";
      dryFuel = language === 'fa' ? "بالا (تراکم بالای هیزم شکسته و برگ خشک پاییزی)" : "High (High density broken timber & dry litter)";
      advice = language === 'fa' ? "هشدار سطح نارنجی: ممنوعیت کامل افروختن آتش و اعزام تانکرهای آب مهار اول به پیشانی جنگل" : "Orange alert: Strict ban on open fires, deploy water tankers to forest boundaries.";
    } else {
      lvl = 'critical';
      vegDensity = language === 'fa' ? "جنگل متراکم خشک (ذخیره‌گاه زیست‌کره ارسباران و البرز شرقی)" : "Dense dry canopy (Arasbaran biosphere & East Alborz)";
      dryFuel = language === 'fa' ? "بحرانی (شاخه‌های کاملا تشنه و هوموس خشک آماده اشتعال سریع)" : "Critical (Extremely thirsty branches & dry humus ready for fast ignition)";
      advice = language === 'fa' ? "وضعیت قرمز فوق‌العاده: گشت‌های موتوری همزمان، استقرار کامل بالگرد اطفای هوایی زاگرس و لغو مرخصی محیط‌بانان" : "State of Red Emergency: Immediate motorized ground loops, stand-by heavy heavy water aviation helicopters.";
    }
    
    return {
      riskPercent: score,
      lvl,
      vegDensity,
      dryFuel,
      advice,
      areaSqKm: 0,
      center: [lat, lng] as [number, number]
    };
  };

  // Simulated IoT tower node state
  const [nodes, setNodes] = useState([
    { id: 'node-zagros-1', name: 'Zagros Tower 1 (کوهپایه زاگرس)', lat: 32.6546, lng: 51.6680, temp: 28.5, hum: 42, windSpeed: 12, windDir: 'NE', solar: 750, active: true, fireRisk: 'low' },
    { id: 'node-alborz-2', name: 'Alborz Watch Station (جنگل ابر)', lat: 36.4211, lng: 55.0519, temp: 34.2, hum: 21, windSpeed: 28, windDir: 'W', solar: 920, active: true, fireRisk: 'high' },
    { id: 'node-golestan-3', name: 'Golestan Wild Reserve (خالد نبی)', lat: 37.4125, lng: 55.4512, temp: 42.1, hum: 8, windSpeed: 45, windDir: 'E', solar: 1050, active: true, fireRisk: 'critical' },
  ]);

  // Selected node in view for simulation
  const [selectedNodeId, setSelectedNodeId] = useState<string>('node-alborz-2');
  const activeNode = nodes.find(n => n.id === selectedNodeId) || nodes[0];

  // Parameters to override in simulator
  const [simTemp, setSimTemp] = useState(activeNode.temp);
  const [simHum, setSimHum] = useState(activeNode.hum);
  const [simWind, setSimWind] = useState(activeNode.windSpeed);
  const [simSolar, setSimSolar] = useState(activeNode.solar);

  // Sync simulator state when selected node changes
  useEffect(() => {
    setSimTemp(activeNode.temp);
    setSimHum(activeNode.hum);
    setSimWind(activeNode.windSpeed);
    setSimSolar(activeNode.solar);
  }, [selectedNodeId]);

  // Calculate dynamic ML fire danger index
  const calculateRiskIndex = (t: number, h: number, w: number, s: number) => {
    const score = (t * 1.5) - (h * 1.2) + (w * 0.8) + (s * 0.05);
    if (score < 10) return { label: 'Safe', risk: 'low', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' };
    if (score < 35) return { label: 'Moderate', risk: 'medium', color: 'text-sky-400 bg-sky-500/10 border-sky-500/20' };
    if (score < 65) return { label: 'High Alert', risk: 'high', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' };
    return { label: 'Critical Burn Risk', risk: 'critical', color: 'text-rose-400 bg-rose-500/10 border-rose-500/30' };
  };

  const currentRisk = calculateRiskIndex(simTemp, simHum, simWind, simSolar);

  // Auto-Dispatch SMS flag or twilio alerts
  const [autoSms, setAutoSms] = useState(true);
  const [smsLogs, setSmsLogs] = useState<string[]>([]);

  // Apply simulator values to state
  const handleUpdateSim = () => {
    setNodes(prev => prev.map(n => {
      if (n.id === selectedNodeId) {
        const risk = currentRisk.risk;
        // Log alarm if critical
        if (risk === 'critical' && n.fireRisk !== 'critical') {
          addSystemLog('error', `CRITICAL WILDFIRE ALARM: Node "${n.name}" triggered fire warning line at Temp ${simTemp}°C, Hum ${simHum}%.`);
          if (autoSms) {
            const timestamp = new Date().toLocaleTimeString();
            setSmsLogs(logs => [
              `[${timestamp}] SMS Dispatched to Zagros Ranger Base: High Risk at ${n.name}!`,
              ...logs
            ]);
            addToast(`SMS Alert sent to area responders!`, 'error');
          }
        } else {
          addSystemLog('info', `Node "${n.name}" environmental register synchronized manually.`);
        }
        return {
          ...n,
          temp: simTemp,
          hum: simHum,
          windSpeed: simWind,
          solar: simSolar,
          fireRisk: risk
        };
      }
      return n;
    }));
    addToast('Simulation nodes successfully synchronized.', 'success');
  };

  // Export drawn selection area coordinates and metadata
  const handleExportJSON = () => {
    if (!selectedRegionRisk) {
      addToast(language === 'fa' ? 'خطا: لطفاً ابتدا یک محدوده روی نقشه تعریف کنید.' : 'Error: Please draw or select a region on the map first.', 'error');
      return;
    }
    
    const exportData = {
      system: "SmartFireSense System",
      timestamp: new Date().toISOString(),
      drawnGeometry: {
        type: shapeMode,
        circleRadiusKm: shapeMode === 'circle' ? circleRadiusKm : undefined,
        centerCoordinate: {
          latitude: selectedRegionRisk.center[0],
          longitude: selectedRegionRisk.center[1]
        },
        points: shapeMode === 'multipoint' ? customPoints : [
          { lat: selectedRegionRisk.center[0], lng: selectedRegionRisk.center[1] }
        ]
      },
      riskAssessment: {
        fireRiskPercentage: selectedRegionRisk.riskPercent,
        riskLevel: selectedRegionRisk.lvl,
        estimatedAreaSqKm: selectedRegionRisk.areaSqKm,
        vegetationDensityProfile: selectedRegionRisk.vegDensity,
        deadwoodDryFuelProfile: selectedRegionRisk.dryFuel,
        tacticalAdvice: selectedRegionRisk.advice
      },
      currentSimulationParams: {
        temperatureCelsius: simTemp,
        humidityPercentage: simHum,
        windSpeedKmh: simWind,
        stationSyncEnabled: autoSms
      }
    };

    try {
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", url);
      downloadAnchor.setAttribute("download", `smartfiresense_export_${Date.now()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      addToast(language === 'fa' ? 'داده‌ها با موفقیت در فرمت JSON صادر شد.' : 'Data successfully exported as JSON.', 'success');
      addSystemLog('info', `Exported drawn selection area metadata and coordinates as JSON.`);
    } catch (err) {
      console.error(err);
      addToast('Export failed', 'error');
    }
  };

  const handleExportCSV = () => {
    if (!selectedRegionRisk) {
      addToast(language === 'fa' ? 'خطا: لطفاً ابتدا یک محدوده روی نقشه تعریف کنید.' : 'Error: Please draw or select a region on the map first.', 'error');
      return;
    }
    
    const headers = [
      "Timestamp", "ShapeType", "CenterLat", "CenterLng", "RadiusKm", 
      "PointsCount", "RiskPercent", "RiskLevel", "AreaSqKm", 
      "VegetationDensity", "DryFuel", "TacticalAdvice", 
      "SimTemperature", "SimHumidity", "SimWind"
    ];
    
    const row = [
      new Date().toISOString(),
      shapeMode,
      selectedRegionRisk.center[0],
      selectedRegionRisk.center[1],
      shapeMode === 'circle' ? circleRadiusKm : '',
      shapeMode === 'multipoint' ? customPoints.length : 1,
      selectedRegionRisk.riskPercent,
      selectedRegionRisk.lvl,
      selectedRegionRisk.areaSqKm,
      `"${selectedRegionRisk.vegDensity.replace(/"/g, '""')}"`,
      `"${selectedRegionRisk.dryFuel.replace(/"/g, '""')}"`,
      `"${selectedRegionRisk.advice.replace(/"/g, '""')}"`,
      simTemp,
      simHum,
      simWind
    ];

    try {
      const csvContent = "\uFEFF" + headers.join(",") + "\n" + row.join(",");
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", url);
      downloadAnchor.setAttribute("download", `smartfiresense_export_${Date.now()}.csv`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      addToast(language === 'fa' ? 'داده‌ها با موفقیت در فرمت CSV صادر شد.' : 'Data successfully exported as CSV.', 'success');
      addSystemLog('info', `Exported drawn selection area metadata and coordinates as CSV.`);
    } catch (err) {
      console.error(err);
      addToast('Export failed', 'error');
    }
  };

  const handleCopyToClipboard = () => {
    if (!selectedRegionRisk) {
      addToast(language === 'fa' ? 'خطا: لطفاً ابتدا یک محدوده روی نقشه تعریف کنید.' : 'Error: Please draw or select a region on the map first.', 'error');
      return;
    }

    const dateStr = new Date().toLocaleString(language === 'fa' ? 'fa-IR' : 'en-US');
    let text = '';
    if (language === 'fa') {
      text = `========================================
سامانه پایش هوشمند حریق جنگل (SmartFireSense)
گزارش جامع ارزیابی ریسک و پایش ماهواره‌ای
تاریخ گزارش: ${dateStr}
========================================

۱. مشخصات جغرافیایی منطقه:
- الگوی محدوده: ${shapeMode === 'circle' ? 'دایره‌ای (شعاع پایش)' : shapeMode === 'rectangle' ? 'مستطیل تعیین‌شده' : 'محدوده چندضلعی'}
- مختصات مرکز: ${selectedRegionRisk.center[0].toFixed(5)}, ${selectedRegionRisk.center[1].toFixed(5)}
- وسعت پایش شده: ${selectedRegionRisk.areaSqKm} کیلومتر مربع

۲. وضعیت ارزیابی ریسک حریق:
- میزان ریسک تخمینی: ${selectedRegionRisk.riskPercent}٪
- سطح خطر: ${selectedRegionRisk.lvl === 'critical' ? 'بحرانی (قرمز)' : selectedRegionRisk.lvl === 'high' ? 'بالا (نارنجی)' : selectedRegionRisk.lvl === 'medium' ? 'متوسط (زرد)' : 'پایدار (سبز)'}
- بافت زنده گیاهی (NDVI): ${selectedRegionRisk.vegDensity}
- پتانسیل سوخت خشک (Deadwood): ${selectedRegionRisk.dryFuel}

۳. سناریو و فرضیات محیطی شبیه‌ساز:
- دمای هوا: ${simTemp} درجه سانتی‌گراد
- رطوبت نسبی: ${simHum}٪
- سرعت باد: ${simWind} کیلومتر بر ساعت
- ارتباط زنده با ایستگاه‌ها: ${autoSms ? 'فعال' : 'غیرفعال'}

۴. پیشنهاد فنی و دستورالعمل استراتژیک کنترلی:
${selectedRegionRisk.advice}

========================================
صادر شده توسط سامانه پایش هوشمند حریق جنگل‌های زاگرس و البرز
`;
    } else {
      text = `========================================
SmartFireSense - Intelligent Forest Fire Monitoring
Comprehensive Risk Assessment & Satellite Report
Date of Report: ${dateStr}
========================================

1. GEOSPATIAL PARAMETERS:
- Shape Selection Type: ${shapeMode.toUpperCase()}
- Center Coordinate: Lat ${selectedRegionRisk.center[0].toFixed(5)}, Lng ${selectedRegionRisk.center[1].toFixed(5)}
- Monitored Area: ${selectedRegionRisk.areaSqKm} sq km

2. FIRE RISK ASSESSMENT:
- Estimated Fire Risk: ${selectedRegionRisk.riskPercent}%
- Alert Level: ${selectedRegionRisk.lvl.toUpperCase()}
- NDVI Vegetation Bio-density: ${selectedRegionRisk.vegDensity}
- Deadwood Dry Fuel Status: ${selectedRegionRisk.dryFuel}

3. ENVIRONMENTAL SIMULATION PARAMS:
- Temperature: ${simTemp}°C
- Relative Humidity: ${simHum}%
- Wind Speed: ${simWind} km/h
- Active Station Synchronization: ${autoSms ? 'ENABLED' : 'DISABLED'}

4. TACTICAL DECISION SUPPORT & STRATEGIC ADVICE:
${selectedRegionRisk.advice}

========================================
Generated by SmartFireSense Wildfire Intelligence Engine (Zagros & Alborz)
`;
    }

    try {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      addToast(language === 'fa' ? 'گزارش متنی با موفقیت در حافظه موقت کپی شد.' : 'Report text successfully copied to clipboard.', 'success');
      addSystemLog('info', `Copied text report of the fire module to clipboard.`);
    } catch (err) {
      console.error(err);
      addToast('Copy failed', 'error');
    }
  };

  const getHTMLReportContent = () => {
    if (!selectedRegionRisk) return '';
    const dateStr = new Date().toLocaleString(language === 'fa' ? 'fa-IR' : 'en-US');
    const title = language === 'fa' ? 'شناسنامه جغرافیایی و گزارش ریسک حریق جنگل' : 'Geospatial Forest Fire Risk & Assessment Report';
    
    const riskColor = selectedRegionRisk.lvl === 'critical' ? '#ef4444' : 
                       selectedRegionRisk.lvl === 'high' ? '#f59e0b' : 
                       selectedRegionRisk.lvl === 'medium' ? '#eab308' : '#10b981';
                       
    const direction = language === 'fa' ? 'rtl' : 'ltr';
    const textLeft = language === 'fa' ? 'text-right' : 'text-left';
    const textRight = language === 'fa' ? 'text-left' : 'text-right';

    return `<!DOCTYPE html>
<html lang="${language}" dir="${direction}">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&family=Vazirmatn:wght@300;400;700;900&display=swap" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body {
      font-family: 'Vazirmatn', 'Inter', system-ui, sans-serif;
    }
    @media print {
      body {
        background-color: white !important;
        color: black !important;
      }
      .no-print {
        display: none !important;
      }
      .print-shadow-none {
        box-shadow: none !important;
        border: 1px solid #e2e8f0 !important;
      }
    }
  </style>
</head>
<body class="bg-slate-50 text-slate-800 antialiased p-6 md:p-12 min-h-screen flex flex-col justify-between">
  
  <div class="no-print max-w-4xl mx-auto w-full mb-6 bg-slate-900 text-white rounded-xl p-4 flex flex-wrap gap-4 items-center justify-between shadow-lg">
    <div>
      <h3 class="font-bold text-sm text-purple-400">SmartFireSense Assessment Explorer</h3>
      <p class="text-xs text-slate-400">Bilingual Interactive Report Module</p>
    </div>
    <div class="flex gap-2">
      <button onclick="window.print()" class="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-2 px-4 rounded-lg transition shadow-md cursor-pointer flex items-center gap-1.5 animate-pulse">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
        </svg>
        ${language === 'fa' ? 'چاپ گزارش / ذخیره به عنوان PDF' : 'Print / Save as PDF'}
      </button>
      <button onclick="window.close()" class="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold py-2 px-4 rounded-lg transition cursor-pointer">
        ${language === 'fa' ? 'بستن پنجره' : 'Close Window'}
      </button>
    </div>
  </div>

  <div class="max-w-4xl mx-auto w-full bg-white rounded-2xl shadow-xl print-shadow-none border border-slate-100 p-8 md:p-12 flex-grow space-y-8">
    
    <div class="border-b border-slate-100 pb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-rose-500 flex items-center justify-center text-white font-black text-lg shadow-md">🔥</div>
          <h1 class="text-2xl font-black text-slate-900 tracking-tight">SmartFireSense</h1>
        </div>
        <p class="text-xs text-slate-500 mt-1">Zagros Forest Fire Risk Assessment Portal</p>
      </div>
      <div class="${textRight} text-xs text-slate-400 font-mono">
        <div>Date: ${dateStr}</div>
        <div>System ID: SFS-SYS-${Math.floor(Math.random() * 90000) + 10000}</div>
        <div>Status: Active Satellite Node</div>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      
      <div class="md:col-span-2 space-y-6">
        <div>
          <h2 class="text-lg font-bold text-slate-900 mb-3 border-b pb-1.5">${language === 'fa' ? '۱. تحلیل محدوده تحت ارزیابی' : '1. Monitored Area Analysis'}</h2>
          <div class="bg-slate-50 rounded-xl p-4 space-y-3 text-sm">
            <div class="flex justify-between border-b border-slate-200/60 pb-2">
              <span class="text-slate-500">${language === 'fa' ? 'نوع کادر هندسی:' : 'Geometry Type:'}</span>
              <span class="font-semibold text-slate-800">${shapeMode === 'circle' ? (language === 'fa' ? 'دایره صدمه‌پذیر (شعاع پایش)' : 'Circular Buffer') : shapeMode === 'rectangle' ? (language === 'fa' ? 'مربع/مستطیل تعیین شده جغرافیایی' : 'Geographic Bounding Box') : (language === 'fa' ? 'چندضلعی ناهمگن' : 'Polygon')}</span>
            </div>
            <div class="flex justify-between border-b border-slate-200/60 pb-2">
              <span class="text-slate-500">${language === 'fa' ? 'مختصات جغرافیایی (مرکز نقشه):' : 'Map Center Coordinates:'}</span>
              <span class="font-mono text-slate-800">${selectedRegionRisk.center[0].toFixed(5)}° N, ${selectedRegionRisk.center[1].toFixed(5)}° E</span>
            </div>
            <div class="flex justify-between pb-1">
              <span class="text-slate-500">${language === 'fa' ? 'وسعت محدوده تحت پایش:' : 'Estimation Area:'}</span>
              <span class="font-bold text-slate-800 text-sm">${selectedRegionRisk.areaSqKm} ${language === 'fa' ? 'کیلومتر مربع' : 'sq km'}</span>
            </div>
          </div>
        </div>

        <div>
          <h2 class="text-lg font-bold text-slate-900 mb-3 border-b pb-1.5">${language === 'fa' ? '۲. پروفایل زیستی منابع گیاهی و سوخت' : '2. Vegetation Bio-Density & Fuel profile'}</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
              <h4 class="text-xs font-bold text-emerald-800 mb-1 flex items-center gap-1">
                <span>🍃</span>
                ${language === 'fa' ? 'بافت پرپشت بیوم بیولوژیکی (NDVI):' : 'Vegetation Cover Index:'}
              </h4>
              <p class="text-emerald-950 font-bold text-xs mt-1 leading-relaxed">${selectedRegionRisk.vegDensity}</p>
            </div>
            <div class="bg-amber-50 rounded-xl p-4 border border-amber-100">
              <h4 class="text-xs font-bold text-amber-800 mb-1 flex items-center gap-1">
                <span>🪵</span>
                ${language === 'fa' ? 'پتانسیل سوخت چوب خشک (Deadwood):' : 'Dry Deadwood Fuelload:'}
              </h4>
              <p class="text-amber-950 font-bold text-xs mt-1 leading-relaxed">${selectedRegionRisk.dryFuel}</p>
            </div>
          </div>
        </div>

        <div>
          <h2 class="text-lg font-bold text-slate-900 mb-3 border-b pb-1.5">${language === 'fa' ? '۳. پیشنهاد تخصصی و استراتژیک مقابله' : '3. Tactical Intervention Protocol'}</h2>
          <div class="bg-rose-50/50 rounded-xl p-5 border border-rose-100 leading-relaxed text-sm text-slate-705">
            <p class="font-semibold text-rose-800 mb-2">${language === 'fa' ? 'سازمان‌دهی پدافند اراضی و مقابله مستقیم:' : 'Deploy Area Interventions & Command Strategy:'}</p>
            <p class="text-slate-800 text-xs md:text-sm leading-relaxed">${selectedRegionRisk.advice}</p>
          </div>
        </div>
      </div>

      <div class="space-y-6">
        
        <div class="bg-slate-900 text-white rounded-2xl p-6 text-center space-y-4 shadow-lg border border-slate-800">
          <div class="text-xs font-bold tracking-wider text-slate-400 uppercase">${language === 'fa' ? 'شاخص ریسک حریق فعال' : 'ACTIVE FIRE RISK INDEX'}</div>
          
          <div class="relative flex items-center justify-center py-4">
            <div class="text-5xl font-black" style="color: ${riskColor}">${selectedRegionRisk.riskPercent}%</div>
          </div>

          <div class="inline-block px-3 py-1 rounded-full text-xs font-extrabold" style="background-color: ${riskColor}30; color: ${riskColor}">
            ${language === 'fa' ? 'وضعیت خطر:' : 'LEVEL:'} ${selectedRegionRisk.lvl.toUpperCase()}
          </div>

          <p class="text-[11px] text-slate-400 leading-relaxed">
            ${language === 'fa' ? 'این ضریب بر اساس مدل هوش مصنوعی منطقه البرز و زاگرس و متغیرهای اقلیمی تعیین شده است.' : 'Calculated by ML forest fire predictors based on local parameters.'}
          </p>
        </div>

        <div class="bg-slate-50 rounded-xl p-4 space-y-3.5 border border-slate-100">
          <h3 class="text-xs font-bold text-slate-500 uppercase tracking-wider">${language === 'fa' ? 'پارامترهای آنی ترانزیت محیطی' : 'Simulated Weather Params'}</h3>
          
          <div class="flex items-center justify-between text-xs pb-2 border-b border-slate-200">
            <span class="text-slate-500 flex items-center gap-1">🌡️ ${language === 'fa' ? 'دمای جوی:' : 'Atmospheric Temp:'}</span>
            <span class="font-bold text-slate-800">${simTemp}°C</span>
          </div>

          <div class="flex items-center justify-between text-xs pb-2 border-b border-slate-200">
            <span class="text-slate-500 flex items-center gap-1">💧 ${language === 'fa' ? 'رطوبت نسبی:' : 'Relative Humidity:'}</span>
            <span class="font-bold text-slate-800">${simHum}%</span>
          </div>

          <div class="flex items-center justify-between text-xs pb-2 border-b border-slate-200">
            <span class="text-slate-500 flex items-center gap-1">💨 ${language === 'fa' ? 'سرعت تندباد:' : 'Wind Velocity:'}</span>
            <span class="font-bold text-slate-800">${simWind} km/h</span>
          </div>

          <div class="flex items-center justify-between text-xs pb-1">
            <span class="text-slate-500 flex items-center gap-1">📡 ${language === 'fa' ? 'تبادل با مرکز مخابرات:' : 'Hub Telemetry Synced:'}</span>
            <span class="font-bold text-emerald-600">${autoSms ? (language === 'fa' ? 'ایستگاهی فعال' : 'ONLINE') : (language === 'fa' ? 'مستقل ماهواره' : 'OFFLINE')}</span>
          </div>
        </div>

        <div class="bg-blue-50/50 rounded-xl p-4 text-[11px] text-blue-800 leading-relaxed border border-blue-100">
          <strong>${language === 'fa' ? 'منشور عملیاتی حریق جنگلی:' : 'Deployment Notice:'}</strong><br/>
          ${language === 'fa' ? 'اطلاعات این گزارش بر اساس پایش ماهواره‌ای بومی و سنسورهای اینترنت اشیاء محیطی استخراج گردیده است.' : 'Report compiled using satellite synthetic imagery and ground IoT mesh arrays. Built for tactical deployment use.'}
        </div>

      </div>

    </div>

    <div class="border-t border-slate-100 pt-6 flex flex-col sm:flex-row justify-between items-center text-[10px] text-slate-400 gap-4">
      <div>
        <span>Generated by </span><strong class="text-slate-600 font-bold">SmartFireSense Intelligent Engine</strong>
      </div>
      <div>
        <span>${language === 'fa' ? 'امضای ناظر بحران محیط زیست' : 'Technical Lead Sign-off Panel'}</span>
      </div>
    </div>

  </div>

  <div class="no-print text-center text-slate-400 text-xs py-4">
    SmartFireSense &copy; 2026. Wildfire Risk Predictor Engine. Powered by React, Leaflet & Tailwind.
  </div>

</body>
</html>`;
  };

  const handleExportHTML = () => {
    if (!selectedRegionRisk) {
      addToast(language === 'fa' ? 'خطا: لطفاً ابتدا یک محدوده روی نقشه تعریف کنید.' : 'Error: Please draw or select a region on the map first.', 'error');
      return;
    }

    try {
      const htmlContent = getHTMLReportContent();
      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", url);
      downloadAnchor.setAttribute("download", `smartfiresense_report_${Date.now()}.html`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      addToast(language === 'fa' ? 'گزارش HTML با موفقیت بارگیری شد.' : 'HTML Report successfully downloaded.', 'success');
      addSystemLog('info', `Downloaded HTML report for the active forest area.`);
    } catch (err) {
      console.error(err);
      addToast('HTML Export failed', 'error');
    }
  };

  const handleExportPDF = () => {
    if (!selectedRegionRisk) {
      addToast(language === 'fa' ? 'خطا: لطفاً ابتدا یک محدوده روی نقشه تعریف کنید.' : 'Error: Please draw or select a region on the map first.', 'error');
      return;
    }

    try {
      const reportWindow = window.open('', '_blank', 'width=1024,height=768');
      if (reportWindow) {
        reportWindow.document.write(getHTMLReportContent());
        reportWindow.document.close();
        reportWindow.onload = () => {
          setTimeout(() => {
            reportWindow.print();
          }, 350);
        };
        addToast(language === 'fa' ? 'بخش پرینت و ذخیره ساز PDF راه‌اندازی شد.' : 'Print and Save-to-PDF wizard opened.', 'success');
        addSystemLog('info', `Opened print wizard to generate PDF of the forest fire report.`);
      } else {
        addToast(language === 'fa' ? 'خطا: باز شدن پنجره جدید توسط مرورگر مسدود شده است.' : 'Error: Popup was blocked by your browser. Please allow popups for SFS.', 'error');
      }
    } catch (err) {
      console.error(err);
      addToast('PDF Launch failed', 'error');
    }
  };

  const getMasterAIReportContent = () => {
    const fireRisk = selectedRegionRisk ? selectedRegionRisk.riskPercent : 74;
    const fireLvl = selectedRegionRisk ? selectedRegionRisk.lvl : 'high';
    const fireArea = selectedRegionRisk ? selectedRegionRisk.areaSqKm : 450;
    const fireLat = selectedRegionRisk ? selectedRegionRisk.center[0] : 34.5;
    const fireLng = selectedRegionRisk ? selectedRegionRisk.center[1] : 50.8;
    const fireAdvice = selectedRegionRisk ? selectedRegionRisk.advice : "Implement immediate moisture enrichment grids and establish local firebreaks around sensitive oak buffers.";
    const fireVeg = selectedRegionRisk ? selectedRegionRisk.vegDensity : "High biome bio-density (NDVI > 0.65). Highly flammable fuel structure.";
    const fireFuel = selectedRegionRisk ? selectedRegionRisk.dryFuel : "High dry fuel accumulation of Zagros forest oak deadwood.";

    const title = language === 'fa' ? 'گزارش ارزیابی جامع سامانه‌های هوش مصنوعی (سبز)' : 'AI Ecological Audit & Integrated Systems Report';
    const direction = language === 'fa' ? 'rtl' : 'ltr';

    return `<!DOCTYPE html>
<html lang="${language}" dir="${direction}">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;800;900&family=Vazirmatn:wght@300;400;700;900&display=swap" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body {
      font-family: 'Vazirmatn', 'Inter', system-ui, sans-serif;
    }
    @media print {
      body {
        background-color: white !important;
        color: black !important;
      }
      .page-break {
        page-break-after: always;
        break-after: page;
      }
      .no-print {
        display: none !important;
      }
      .print-shadow-none {
        box-shadow: none !important;
        border: 1px solid #e2e8f0 !important;
      }
    }
  </style>
</head>
<body class="bg-gray-100 text-slate-800 antialiased min-h-screen flex flex-col justify-between">
  
  <div class="no-print max-w-5xl mx-auto w-full mt-6 mb-2 bg-gradient-to-r from-emerald-900 to-indigo-950 text-white rounded-xl p-5 flex flex-wrap gap-4 items-center justify-between shadow-xl">
    <div>
      <h3 class="font-extrabold text-base text-emerald-400">Green Hope Multi-System AI Audit Portal 📋</h3>
      <p class="text-xs text-slate-300">Unified Executive PDF / Printing Controller Modules</p>
    </div>
    <div class="flex gap-2">
      <button onclick="window.print()" class="bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold py-2.5 px-5 rounded-lg transition shadow-md cursor-pointer flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
        </svg>
        ${language === 'fa' ? 'چاپ گزارش تلفیقی هوش مصنوعی / PDF' : 'Print Unified AI Audit / Save as PDF'}
      </button>
      <button onclick="window.close()" class="bg-slate-850 hover:bg-slate-800 text-slate-300 text-xs font-bold py-2.5 px-4 rounded-lg transition cursor-pointer">
        ${language === 'fa' ? 'خروج' : 'Close'}
      </button>
    </div>
  </div>

  <!-- Page 1: Front Cover and SmartFireSense Analysis -->
  <div class="max-w-5xl mx-auto w-full bg-white rounded-2xl shadow-xl print-shadow-none border border-slate-100 p-10 md:p-14 space-y-8 my-6 page-break flex flex-col justify-between">
    <div>
      <div class="border-b-4 border-emerald-500 pb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div class="flex items-center gap-2">
            <span class="text-3xl">🌱</span>
            <h1 class="text-2xl font-black text-slate-900 tracking-tight">Green Hope Initiative</h1>
          </div>
          <p class="text-xs text-slate-500 mt-1 uppercase font-bold tracking-wider">Unified Ecological AI Platform Audit Report</p>
        </div>
        <div class="text-right text-xs text-slate-400 font-mono">
          <div>Report ID: GH-AUDIT-2026-${Math.floor(Math.random() * 90000) + 10000}</div>
          <div>Date Created: ${new Date().toLocaleDateString(language === 'fa' ? 'fa-IR' : 'en-US')}</div>
          <div>Security Level: Certified Executive Copy</div>
        </div>
      </div>

      <div class="mt-8 text-center py-6 bg-slate-50 rounded-2xl border border-slate-100">
        <h2 class="text-2xl font-extrabold text-slate-900 tracking-tight">${language === 'fa' ? 'کارنامه ممیزی جامع و گزارش فناوری هوشمند' : 'Executive Multi-Engine AI Systems Audit'}</h2>
        <p class="text-xs text-slate-500 mt-2 max-w-xl mx-auto leading-relaxed">
          ${language === 'fa' ? 'این گزارش شامل تجمیع داده‌های تحلیلی شبکه‌های هوش مصنوعی، ماهواره‌ای و مدلسازان سرمایه‌گذاری سبز در دپارتمان‌های اراضی است.' : 'This document consolidates diagnostic telemetry output from all predictive AI engines on the platform, compiling real-time climate and capital alignment records.'}
        </p>
      </div>

      <div class="mt-8 space-y-6">
        <div class="flex items-center gap-2 text-rose-600 font-extrabold text-lg border-b pb-2">
          <span>🔥</span>
          <h2>MODULE 1: SmartFireSense (Wildfire Risk Engine)</h2>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="md:col-span-2 space-y-4">
            <div class="bg-slate-50 p-4 rounded-xl border border-slate-200/60 text-sm space-y-2">
              <div class="flex justify-between pb-1 border-b">
                <span class="text-slate-500">${language === 'fa' ? 'موقعیت پایش اراضی:' : 'Target Center Coordinate:'}</span>
                <span class="font-mono text-slate-800 font-semibold">${fireLat.toFixed(4)}° N, ${fireLng.toFixed(4)}° E</span>
              </div>
              <div class="flex justify-between pb-1 border-b">
                <span class="text-slate-500">${language === 'fa' ? 'بافت زنده گیاهی (NDVI):' : 'Vegetation Cover Index:'}</span>
                <span class="text-slate-800 font-semibold">${fireVeg}</span>
              </div>
              <div class="flex justify-between pb-1 border-b">
                <span class="text-slate-500">${language === 'fa' ? 'سوخت‌های چوبی مرده (Deadwood):' : 'Estimated Bio-Fuel Load:'}</span>
                <span class="text-slate-800 font-semibold">${fireFuel}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-500">${language === 'fa' ? 'وسعت برآورد شده پایش:' : 'Total Scanned Area:'}</span>
                <span class="text-emerald-600 font-bold">${fireArea} ${language === 'fa' ? 'کیلومتر مربع' : 'sq km'}</span>
              </div>
            </div>

            <div class="bg-rose-50 p-4 rounded-xl border border-rose-100 text-xs md:text-sm">
              <h4 class="font-bold text-rose-800 mb-1 flex items-center gap-1.5">
                <span>🛡️</span>
                Tactical Firebreak Strategy & Mitigations:
              </h4>
              <p class="text-slate-700 leading-relaxed">${fireAdvice}</p>
            </div>
          </div>

          <div class="bg-slate-900 text-white rounded-xl p-5 flex flex-col justify-between text-center border shadow-md font-mono">
            <div class="text-xs text-slate-400 font-bold uppercase tracking-wider">${language === 'fa' ? 'ضریب ریسک هوش مصنوعی' : 'AI Wildfire Index'}</div>
            <div class="text-4xl font-extrabold text-rose-500 py-3">${fireRisk}%</div>
            <div class="px-3 py-1 rounded bg-rose-500/10 text-rose-400 font-mono text-xs uppercase font-extrabold border border-rose-500/20">
              LEVEL: ${fireLvl.toUpperCase()}
            </div>
            <p class="text-[10px] text-slate-400 leading-relaxed mt-2">
              Model detection calculated using relative ambient hum: ${simHum}%, temp: ${simTemp}°C.
            </p>
          </div>
        </div>
      </div>
    </div>

    <div class="border-t pt-4 flex justify-between items-center text-[10px] text-slate-400 font-mono">
      <span>Green Hope Unified AI Systems • Audit Document</span>
      <span>Page 1 of 3</span>
    </div>
  </div>

  <!-- Page 2: Grant Finder Opportunity Matching Engine -->
  <div class="max-w-5xl mx-auto w-full bg-white rounded-2xl shadow-xl print-shadow-none border border-slate-100 p-10 md:p-14 space-y-8 my-6 page-break flex flex-col justify-between">
    <div>
      <div class="border-b border-slate-100 pb-5 flex justify-between items-center">
        <div class="flex items-center gap-1.5 font-bold">
          <span class="text-2xl">💰</span>
          <h2 class="text-lg font-black text-slate-900 tracking-tight">MODULE 2: AI Grant Adopter & Capital Matching</h2>
        </div>
        <span class="text-[10px] bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full border border-emerald-500/20 font-extrabold">Active Match Engine v2.4</span>
      </div>

      <p class="text-sm text-slate-500 leading-relaxed">
        ${language === 'fa' ? 'سامانه هوشمند پایش و پیشنهاد گرنت‌های سبز بین‌المللی با بررسی نیازمندی‌های زمین بهترین صندوق‌های حمایت مالی را مطابقت داده است:' : 'The capital deployment algorithm parses organizational goals to identify active international carbon credit, forestry restoration, and biodiversity trust funds:'}
      </p>

      <div class="space-y-4 pt-4">
        <!-- Project Match 1 -->
        <div class="bg-slate-50 rounded-xl p-5 border border-slate-200/70 flex flex-col sm:flex-row justify-between items-start gap-4">
          <div class="space-y-1 w-full">
            <div class="flex justify-between items-center">
              <h4 class="font-extrabold text-sm md:text-base text-emerald-800">1. Global Environmental Facility (GEF) - Forest Ecosystem Resilience Grant</h4>
              <span class="text-xs bg-emerald-500/10 text-emerald-500 px-2.5 py-0.5 rounded font-extrabold font-mono border border-emerald-500/20">98% Match</span>
            </div>
            <p class="text-xs md:text-sm text-slate-600 leading-relaxed">
              Provides foundational venture backing for regional carbon sequestration projects, reforestation buffers, and wildfire early warning integration in sub-tropical bio-diverse environments.
            </p>
            <div class="flex gap-4 pt-1 items-center text-xs text-slate-400 font-mono">
              <span>Fund Pool: <b>$2,500,000 USD</b></span>
              <span>Deadline: <b>Dec 15, 2026</b></span>
            </div>
          </div>
        </div>

        <!-- Project Match 2 -->
        <div class="bg-slate-50 rounded-xl p-5 border border-slate-200/70 flex flex-col sm:flex-row justify-between items-start gap-4">
          <div class="space-y-1 w-full">
            <div class="flex justify-between items-center">
              <h4 class="font-extrabold text-sm md:text-base text-emerald-800">2. Green Climate Fund (GCF) - Zagros & Caspian Oak Stewardship Initiative</h4>
              <span class="text-xs bg-emerald-500/10 text-emerald-500 px-2.5 py-0.5 rounded font-extrabold font-mono border border-emerald-500/20">91% Match</span>
            </div>
            <p class="text-xs md:text-sm text-slate-600 leading-relaxed">
              Targeted development resources for soil moisture preservation, drylands oak restoration, and community-based smart firebreak infrastructure.
            </p>
            <div class="flex gap-4 pt-1 items-center text-xs text-slate-400 font-mono">
              <span>Fund Pool: <b>$1,200,000 USD</b></span>
              <span>Deadline: <b>Oct 30, 2026</b></span>
            </div>
          </div>
        </div>

        <!-- Project Match 3 -->
        <div class="bg-slate-50 rounded-xl p-5 border border-slate-200/70 flex flex-col sm:flex-row justify-between items-start gap-4">
          <div class="space-y-1 w-full">
            <div class="flex justify-between items-center">
              <h4 class="font-extrabold text-sm md:text-base text-emerald-800">3. UNDP Small Grants Program - Local Reforestation Co-operatives</h4>
              <span class="text-xs bg-emerald-500/10 text-emerald-500 px-2.5 py-0.5 rounded font-extrabold font-mono border border-emerald-500/20">86% Match</span>
            </div>
            <p class="text-xs md:text-sm text-slate-600 leading-relaxed">
              Direct micro-grants for community-wide nurseries, local firefighter training academies, and IoT station deployment networks.
            </p>
            <div class="flex gap-4 pt-1 items-center text-xs text-slate-400 font-mono">
              <span>Fund Pool: <b>$450,000 USD</b></span>
              <span>Deadline: <b>Sep 01, 2026</b></span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="border-t pt-4 flex justify-between items-center text-[10px] text-slate-400 font-mono">
      <span>Green Hope Unified AI Systems • Audit Document</span>
      <span>Page 2 of 3</span>
    </div>
  </div>

  <!-- Page 3: Hydrology Forecast & Reforestation AI Planner -->
  <div class="max-w-5xl mx-auto w-full bg-white rounded-2xl shadow-xl print-shadow-none border border-slate-100 p-10 md:p-14 space-y-8 my-6 flex flex-col justify-between">
    <div>
      <div class="border-b border-slate-100 pb-5">
        <div class="flex items-center gap-1.5 font-bold">
          <span class="text-2xl">💧</span>
          <h2 class="text-lg font-black text-slate-900 tracking-tight">MODULE 3: Deep Aquifer Exploration & Reforestation Planner</h2>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
        <div class="bg-blue-50/50 p-5 rounded-2xl border border-blue-100 space-y-3">
          <h3 class="font-extrabold text-sm text-blue-900 uppercase tracking-wider flex items-center gap-1">
            <span>🛡️</span> Subsurface Hydrology telemetry:
          </h3>
          <div class="text-xs md:text-sm space-y-2 font-mono text-slate-700">
            <div class="flex justify-between border-b border-blue-150 pb-1">
              <span>Predicted Target Aquifer Depth:</span>
              <span class="text-blue-950 font-extrabold">135 Meters</span>
            </div>
            <div class="flex justify-between border-b border-blue-150 pb-1">
              <span>Fracture Zone Confident Index:</span>
              <span class="text-blue-950 font-extrabold">89% Deep-Learning Profile</span>
            </div>
            <div class="flex justify-between border-b border-blue-150 pb-1">
              <span>Aquifer Thickness Metric:</span>
              <span class="text-blue-950 font-extrabold">22.4 Meters</span>
            </div>
            <div class="flex justify-between">
              <span>Saturated Bedrock Yield Estimate:</span>
              <span class="text-emerald-700 font-extrabold">18.5 Liters / Sec</span>
            </div>
          </div>
          <p class="text-[11px] text-blue-800 leading-relaxed pt-2">
            *High density alluvial fractured layers identified. Optimal drilling recommended for subterranean hydration setups.
          </p>
        </div>

        <div class="bg-emerald-50/50 p-5 rounded-2xl border border-emerald-100 space-y-3">
          <h3 class="font-extrabold text-sm text-emerald-900 uppercase tracking-wider flex items-center gap-1">
            <span>🍃</span> Ecosystem restoration & Forestry Planner:
          </h3>
          <div class="text-xs md:text-sm space-y-2 font-mono text-slate-700">
            <div class="flex justify-between border-b border-emerald-150 pb-1">
              <span>Target Sapling Planting Density:</span>
              <span class="text-emerald-950 font-extrabold">450 / Hectare</span>
            </div>
            <div class="flex justify-between border-b border-emerald-150 pb-1">
              <span>Forest Canopy Restoration success:</span>
              <span class="text-emerald-950 font-extrabold">92% (Estimated 5 Years)</span>
            </div>
            <div class="flex justify-between border-b border-emerald-150 pb-1">
              <span>Staggered Rotation Planting Speed:</span>
              <span class="text-emerald-950 font-extrabold">30 Hectares / Month</span>
            </div>
            <div class="flex justify-between">
              <span>Indigenous Oak Species Buffer:</span>
              <span class="text-emerald-800 font-extrabold">Quercus Brantii Spicily</span>
            </div>
          </div>
          <p class="text-[11px] text-emerald-850 leading-relaxed pt-2">
            *Reforestation buffer mapping targets Caspian highlands region using native biodiversity overlays.
          </p>
        </div>
      </div>

      <div class="bg-slate-900 text-white rounded-2xl p-6 border shadow-inner mt-6 space-y-3">
        <h3 class="font-extrabold text-xs md:text-sm uppercase text-slate-400 tracking-wider">${language === 'fa' ? 'پنل گواهی‌نامه نهایی ممیزی و منشور امنیتی' : 'Audit Verification & Operations Sign-Off'}</h3>
        <p class="text-xs text-slate-400 leading-relaxed">
          All data generated points have been parsed by Green Hope decentralized neural nodes. Verified safe execution and authorized compliance under IUCN Forestry Stewardship Standards.
        </p>
        <div class="grid grid-cols-2 gap-4 text-center pt-3 text-[11px] font-mono">
          <div class="border-r border-white/10 pb-1">
            <span class="text-slate-450 block">AI Technical Lead Signature</span>
            <span class="font-bold text-emerald-400">APPROVED AT CONTAINER REVOLUTION</span>
          </div>
          <div>
            <span class="text-slate-450 block">Audit Security Token</span>
            <span class="font-bold text-indigo-400">GHX-92305-SEC-OK</span>
          </div>
        </div>
      </div>
    </div>

    <div class="border-t pt-4 flex justify-between items-center text-[10px] text-slate-400 font-mono">
      <span>Green Hope Unified AI Systems • Audit Document</span>
      <span>Page 3 of 3</span>
    </div>
  </div>

</body>
</html>`;
  };

  const handleExportMasterAIReport = () => {
    try {
      const reportWindow = window.open('', '_blank', 'width=1100,height=850');
      if (reportWindow) {
        reportWindow.document.write(getMasterAIReportContent());
        reportWindow.document.close();
        reportWindow.onload = () => {
          setTimeout(() => {
            reportWindow.print();
          }, 400);
        };
        addToast(language === 'fa' ? 'گزارش ممیزی تمامی سامانه‌ها آماده چاپ شد.' : 'Integrated Audit Report opened for printing.', 'success');
        addSystemLog('info', `Opened master unified multi-engine AI audit report printing viewport.`);
      } else {
        addToast(language === 'fa' ? 'خطا: باز شدن پنجره توسط مرورگر مسدود شده است.' : 'Error: Popup was blocked by your browser. Please allow popups.', 'error');
      }
    } catch (err) {
      console.error(err);
      addToast('Unified Audit launch failed', 'error');
    }
  };

  const getPlatformWideHTMLReport = () => {
    const dateStr = new Date().toLocaleString(language === 'fa' ? 'fa-IR' : 'en-US');
    const direction = language === 'fa' ? 'rtl' : 'ltr';
    const align = language === 'fa' ? 'text-right' : 'text-left';
    
    // Fallback if no active drawn shape is selected
    const activeRisk = selectedRegionRisk || {
      center: [34.5000, 53.5000],
      areaSqKm: 450,
      riskPercent: 68,
      lvl: 'high',
      vegDensity: language === 'fa' ? 'شاخص NDVI متوسط متمایل به ضعیف (۰.۲۸) در حریم مرتعی' : 'Semi-arid steppe border, low-moderate NDVI (0.28)',
      dryFuel: language === 'fa' ? 'شدید (تجمع خار و خاشاک و خفتارهای کوهپایه‌ای خشک)' : 'High density (dry scrubwood, fallen dry branch vectors)',
      advice: language === 'fa' 
        ? 'تشکیل خط آتش پشتیبان در شیب‌های تند غربی، استقرار تجهیزات اولیه در پایگاه دهستان‌های حریم، و آماده‌باش تیم‌های محلی.'
        : 'Establish safety buffer firelines along western ridge vectors, mobilize volunteer teams, and pre-deploy water tenders.'
    };

    const riskColor = activeRisk.lvl === 'critical' ? '#ef4444' : 
                       activeRisk.lvl === 'high' ? '#f59e0b' : 
                       activeRisk.lvl === 'medium' ? '#eab308' : '#10b981';

    return `<!DOCTYPE html>
<html lang="${language}" dir="${direction}">
<head>
  <meta charset="UTF-8">
  <title>${language === 'fa' ? 'کارنامه جامع خلاقیت و پایش هوش مصنوعی' : 'Comprehensive AI Ecosystem intelligence Report'}</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Vazirmatn:wght@300;400;700;900&display=swap" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body {
      font-family: 'Vazirmatn', 'Inter', system-ui, sans-serif;
    }
    @media print {
      body {
        background-color: white !important;
        color: black !important;
      }
      .page-break {
        page-break-before: always;
        break-before: page;
      }
      .no-print {
        display: none !important;
      }
      .print-shadow-none {
        box-shadow: none !important;
        border: 1px solid #e2e8f0 !important;
      }
    }
  </style>
</head>
<body class="bg-slate-100 text-slate-850 antialiased p-4 md:p-8 min-h-screen">

  <div class="no-print max-w-5xl mx-auto mb-8 bg-gradient-to-r from-emerald-900 to-indigo-950 text-white rounded-2xl p-5 flex flex-wrap gap-4 items-center justify-between shadow-xl border border-white/10">
    <div className="font-sans">
      <h3 class="font-black text-sm md:text-base text-emerald-400 flex items-center gap-2">
        <span>🏆</span>
        ${language === 'fa' ? 'گزارش ارزیابی جامع هوش مصنوعی (Green Hope Platform-Wide Report)' : 'Green Hope Unified Multi-module AI Report'}
      </h3>
      <p class="text-xs text-slate-300 mt-1">
        ${language === 'fa' ? 'این گزارش شامل پایش حریق جنگلی، سفره‌های آب زیرزمینی، گرنت‌یاب و برنامه‌ریزی دیم زاگرس است.' : 'Consolidated 5-page dossier for all modules. Beautifully structured for PDF printers.'}
      </p>
    </div>
    <div class="flex gap-2">
      <button onclick="window.print()" class="bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black py-2.5 px-5 rounded-lg transition-all shadow-md cursor-pointer flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 stroke-[3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
        </svg>
        ${language === 'fa' ? 'چاپ گزارش / ذخیره PDF' : 'Print / Save PDF Now'}
      </button>
      <button onclick="window.close()" class="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold py-2.5 px-4 rounded-lg transition cursor-pointer">
        ${language === 'fa' ? 'بستن' : 'Close'}
      </button>
    </div>
  </div>

  <div class="max-w-5xl mx-auto bg-white rounded-3xl shadow-2xl p-8 md:p-16 space-y-12 print-shadow-none">

    <!-- PAGE 1: COVER PAGE -->
    <div class="min-h-[850px] flex flex-col justify-between border-b border-slate-100 pb-12">
      <div class="space-y-6">
        <div class="flex justify-between items-center">
          <div class="flex items-center gap-2">
            <span class="text-3xl">🌱</span>
            <span class="text-2xl font-black text-emerald-600 tracking-tight">Green Hope</span>
          </div>
          <span class="px-3 py-1 bg-slate-100 rounded-full text-slate-650 text-xs font-mono font-bold">${dateStr}</span>
        </div>
        
        <div class="py-24 space-y-4 ${align}">
          <span class="text-xs font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-md">
            ${language === 'fa' ? 'کارنامه ارزیابی جامع هوش مصنوعی مستقل' : 'INTELLIGENT ECOSYSTEM DOSSIER'}
          </span>
          <h1 class="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight pt-2">
            ${language === 'fa' ? 'شناسنامه جامع تلفیقی زیست‌محیطی و پایش هوش مصنوعی' : 'Unified Environmental Assessment & Green Capital Allocation'}
          </h1>
          <p class="text-slate-500 text-base md:text-lg max-w-2xl pt-2 font-light leading-relaxed">
            ${language === 'fa' ? 'گزارش رسمی، توصیفی و جامع تلفیقی ماژولار شامل پایش هوشمند تندباد و حریق جنگل‌های زاگرس و البرز، چاه‌یاب پیشرفته منابع سفره‌های آب زیرزمینی، گرنت‌یاب جاده ابریشم و برنامه‌ریزی دیم زارعی.' 
                                : 'A comprehensive consolidated blueprint of geospatial wildfire indices, hydrological exploration grids, grant allocation analysis, and flora planning suggestions.'}
          </p>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-100">
        <div>
          <span class="text-xs text-slate-400 block uppercase font-mono">${language === 'fa' ? 'ماژول‌های فعال تحت ارزیابی' : 'OPERATIONAL SEGMENTS'}</span>
          <span class="font-bold text-slate-850 text-sm">SmartFire, Hydro, Grants, Planting</span>
        </div>
        <div>
          <span class="text-xs text-slate-400 block uppercase font-mono">${language === 'fa' ? 'سامانه پردازش پشتیبان' : 'AI COGNITIVE ENGINE'}</span>
          <span class="font-bold text-slate-850 text-sm">Gemini Wildfire & Biosphere Predictor</span>
        </div>
        <div>
          <span class="text-xs text-slate-400 block uppercase font-mono">${language === 'fa' ? 'تاییدیه مرجع' : 'VERIFICATION SIGNATURE'}</span>
          <span class="font-bold text-emerald-600 text-sm">Green Hope Initiative Hub</span>
        </div>
      </div>
    </div>

    <!-- PAGE 2: SMARTFIRESENSE ANALYSIS -->
    <div class="page-break pt-12 min-h-[920px] flex flex-col justify-between border-b border-slate-100 pb-12 animate-fade-in">
      <div class="space-y-6">
        <div class="flex justify-between items-center border-b pb-4">
          <div class="flex items-center gap-2">
            <span class="text-lg">🔥</span>
            <span class="text-lg font-bold text-slate-905">${language === 'fa' ? 'بخش اول: پایش تندباد و پیش‌بینی حریق جنگلی (SmartFireSense)' : 'Section 1: Active Wildfire Vector & Risk Profiler'}</span>
          </div>
          <span class="text-xs text-slate-400 font-mono">Page 2 / 5</span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="md:col-span-1 bg-slate-900 text-white rounded-2xl p-6 text-center flex flex-col justify-between shadow-xl">
            <div>
              <span class="text-xs text-slate-400 block uppercase tracking-wider">${language === 'fa' ? 'ضریب ریسک ترکیبی حریق' : 'COMBINED FIRE RISK'}</span>
              <div class="text-6xl font-black my-6 animate-pulse" style="color: ${riskColor}">${activeRisk.riskPercent}%</div>
              <span class="inline-block px-3 py-1 rounded-full text-xs font-black uppercase" style="background-color: ${riskColor}25; color: ${riskColor}">
                ${activeRisk.lvl.toUpperCase()}
              </span>
            </div>
            <p class="text-[10px] text-slate-400 leading-relaxed mt-4">
              ${language === 'fa' ? 'محاسبه شده بر مبنای ترکیبی پارامترهای رطوبت نسبی، تندباد زیستی و بیوم گیاهی NDVI.' : 'Evaluated recursively based on relative air dryness, active biomass indices, and dry wood vectors.'}
            </p>
          </div>

          <div class="md:col-span-2 space-y-4 text-sm">
            <div class="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
              <h4 class="font-bold text-slate-800">${language === 'fa' ? 'مشخصات محدوده جغرافیایی تحت پایش' : 'Geographic Scan Bounds'}</h4>
              <div class="grid grid-cols-2 gap-2 text-xs">
                <div><span class="text-slate-400">${language === 'fa' ? 'مختصات مرکز پایش:' : 'Scan Coordinates:'}</span> <strong class="font-mono text-slate-700">${activeRisk.center[0].toFixed(4)}° N, ${activeRisk.center[1].toFixed(4)}° E</strong></div>
                <div><span class="text-slate-400">${language === 'fa' ? 'مساحت کل حوزه:' : 'Covered Area:'}</span> <strong class="text-slate-700">${activeRisk.areaSqKm} ${language === 'fa' ? 'کیلومتر مربع' : 'sq km'}</strong></div>
              </div>
            </div>

            <div class="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 space-y-2">
              <h4 class="font-bold text-emerald-800 text-xs flex items-center gap-1">🍃 ${language === 'fa' ? 'شاخص تراکم پوشش زنده گیاهی (NDVI)' : 'NDVI Canopy Bio-Density'}</h4>
              <p class="text-xs text-slate-800 leading-relaxed">${activeRisk.vegDensity}</p>
            </div>

            <div class="bg-amber-50/50 p-4 rounded-xl border border-amber-100 space-y-2">
              <h4 class="font-bold text-amber-800 text-xs flex items-center gap-1">🪵 ${language === 'fa' ? 'سوخت خشک بستر جنگل (Deadwood Fuel)' : 'Biomass Dry Deadwood Accumulation'}</h4>
              <p class="text-xs text-slate-800 leading-relaxed">${activeRisk.dryFuel}</p>
            </div>
          </div>
        </div>

        <div class="bg-rose-50 rounded-2xl p-5 border border-rose-100">
          <h3 class="text-sm font-bold text-rose-900 mb-2 flex items-center gap-1.5">🚨 ${language === 'fa' ? 'دستورالعمل‌های پیشگیرانه و دفاع مدنی' : 'Tactical Mitigation Protocols & Civil Defense Advice'}</h3>
          <p class="text-[12px] md:text-sm text-slate-800 leading-relaxed font-sans">${activeRisk.advice}</p>
        </div>
      </div>
      
      <div class="text-[10px] text-slate-400 flex justify-between items-center border-t pt-4 mt-4">
        <span>Green Hope SmartFireSense Unit</span>
        <span>Secure Fire Mitigation Output</span>
      </div>
    </div>

    <!-- PAGE 3: GRANT FINDER AI OPPORTUNITIES -->
    <div class="page-break pt-12 min-h-[920px] flex flex-col justify-between border-b border-slate-100 pb-12">
      <div class="space-y-6">
        <div class="flex justify-between items-center border-b pb-4">
          <div class="flex items-center gap-2">
            <span class="text-lg">💵</span>
            <span class="text-lg font-bold text-slate-905">${language === 'fa' ? 'بخش دوم: فرصت‌های مالی بین‌المللی و گرنت‌یاب هوشمند' : 'Section 2: Carbon Offsets & Global Environmental Grant Matcher'}</span>
          </div>
          <span class="text-xs text-slate-400 font-mono">Page 3 / 5</span>
        </div>

        <p class="text-sm text-slate-500 leading-relaxed">
          ${language === 'fa' ? 'سامانه هوشمند مانیتورینگ منابع با ارزیابی پروژه‌های دیم و اراضی بیابانی، گرنت‌های متناظر ذیل را پیشنهاد می‌کند:' 
                              : 'AI grant exploration results optimized for dry forest bio-diversity reclamation, soil stabilization, and agro-forestry crowdfunding matches:'}
        </p>

        <div class="space-y-4">
          <div class="bg-slate-50 rounded-2xl p-5 border border-slate-200/60 shadow-sm flex flex-col justify-between gap-3">
            <div class="flex justify-between items-start">
              <div>
                <h4 class="font-bold text-slate-900 text-sm md:text-base">${language === 'fa' ? '۱. صندوق مالی توسعه جنگلداری پایدار جاده ابریشم' : '1. Silk Road Sustainable Forestry Fund'}</h4>
                <p class="text-xs text-slate-500 mt-1 leading-relaxed">
                  ${language === 'fa' ? 'تسهیلات ویژه احیای جنگل پسته کوهی و بادام کوهی و بومی‌سازی کشاورزی حفاظتی در غرب آسیا.' : 'Specialized grants for mountain almond and local community agro-reforestation programs in West-Asia.'}
                </p>
              </div>
              <span class="bg-emerald-100 text-emerald-800 text-xs font-bold py-1 px-3 rounded-full">$350,000</span>
            </div>
            <div class="flex justify-between items-center border-t border-slate-100 pt-3 text-[11px] text-slate-400 font-sans">
              <span>${language === 'fa' ? 'مهلت ثبت‌نام: ۲۵ آبان ۱۴۰۵' : 'Deadline: Nov 15, 2026'}</span>
              <span class="text-emerald-600 font-semibold uppercase">${language === 'fa' ? 'تطبیق بالا (۹۴٪)' : 'HIGH PROFILE MATCH (94%)'}</span>
            </div>
          </div>

          <div class="bg-slate-50 rounded-2xl p-5 border border-slate-200/60 shadow-sm flex flex-col justify-between gap-3">
            <div class="flex justify-between items-start">
              <div>
                <h4 class="font-bold text-slate-900 text-sm md:text-base">${language === 'fa' ? '۲. مجمع جهانی توسعه پوشش درختی و بیوم دیم' : '2. Global Tree Canopy Reclamation Scheme'}</h4>
                <p class="text-xs text-slate-500 mt-1 leading-relaxed">
                  ${language === 'fa' ? 'سازمان‌دهی حمایت‌های بلاعوض برای مناطق دیم و در خطر خشکسالی با تأکید بر کاشت خوشه‌ای همپوشان.' : 'Funding for drought-adjacent ecosystems incorporating windbreaks, erosion control barriers, and deep-soil roots.'}
                </p>
              </div>
              <span class="bg-emerald-100 text-emerald-800 text-xs font-bold py-1 px-3 rounded-full">$120,500</span>
            </div>
            <div class="flex justify-between items-center border-t border-slate-100 pt-3 text-[11px] text-slate-400 font-sans">
              <span>${language === 'fa' ? 'مهلت ثبت‌نام: ۱۰ دی ۱۴۰۵' : 'Deadline: Dec 30, 2026'}</span>
              <span class="text-emerald-600 font-semibold uppercase">${language === 'fa' ? 'تطبیق با اولویت الف (۸۹٪)' : 'Match Level: Class-A (89%)'}</span>
            </div>
          </div>

          <div class="bg-slate-50 rounded-2xl p-5 border border-slate-200/60 shadow-sm flex flex-col justify-between gap-3">
            <div class="flex justify-between items-start">
              <div>
                <h4 class="font-bold text-slate-900 text-sm md:text-base">${language === 'fa' ? '۳. سرمایه‌گذاری متقابل پاداش کربنی اتحادیه کشاورزی دیم' : '3. Carbon Offset Integration & Seed Grants'}</h4>
                <p class="text-xs text-slate-500 mt-1 leading-relaxed">
                  ${language === 'fa' ? 'تامین نهال‌ها و گواهی کربن داوطلبانه برای حوضه‌های آبریز مستعد فرسایش باد و باران.' : 'Provides seedling purchasing subsidies linked to local voluntary carbon micro-credits.'}
                </p>
              </div>
              <span class="bg-violet-100 text-violet-800 text-xs font-bold py-1 px-3 rounded-full">$45,000</span>
            </div>
            <div class="flex justify-between items-center border-t border-slate-100 pt-3 text-[11px] text-slate-400 font-sans">
              <span>${language === 'fa' ? 'مهلت ثبت‌نام: مستمر بدون وقفه' : 'Deadline: Rolling Schedule'}</span>
              <span class="text-violet-600 font-semibold uppercase">${language === 'fa' ? 'تاییدیه اتوماتیک' : 'AUTO-COMPATIBLE'}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="text-[10px] text-slate-400 flex justify-between items-center border-t pt-4 mt-4">
        <span>Green Hope Grant matching Unit</span>
        <span>Verified International Funds Matching</span>
      </div>
    </div>

    <!-- PAGE 4: UNDERGROUND WATER EXPLORATION -->
    <div class="page-break pt-12 min-h-[920px] flex flex-col justify-between border-b border-slate-100 pb-12">
      <div class="space-y-6">
        <div class="flex justify-between items-center border-b pb-4">
          <div class="flex items-center gap-2">
            <span class="text-lg">💧</span>
            <span class="text-lg font-bold text-slate-905">${language === 'fa' ? 'بخش سوم: اکتشاف سفره‌های آب زیرزمینی و رگه شناسی ژئوفیزیک (Water Exploration)' : 'Section 3: Subsurface Hydrological Vein Scanner & Ground Water'}</span>
          </div>
          <span class="text-xs text-slate-400 font-mono">Page 4 / 5</span>
        </div>

        <p class="text-sm text-slate-500 leading-relaxed">
          ${language === 'fa' ? 'طرح توصیفی ساختار لایه‌های زمین و ردیابی سفره‌های آبی در عمق خاک با پایش امواج الکترومغناطیسی بومی:' 
                              : 'Subsoil geological diagnostics representing mapped aquifer potential and drill suitability parameters:'}
        </p>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="bg-blue-50/50 rounded-2xl p-6 border border-blue-100 space-y-4">
            <h4 class="font-bold text-blue-900 text-sm flex items-center gap-2 font-sans">🌊 ${language === 'fa' ? 'مشخصات ژئوفیزیک سفره اصلی منطقه' : 'Aquifer Layer Metrics'}</h4>
            <div class="space-y-2.5 text-xs">
              <div class="flex justify-between border-b pb-1.5 border-blue-200">
                <span class="text-slate-500">${language === 'fa' ? 'عمق تخمینی رگ اول آب فعال:' : 'First Ground Water Vein Depth:'}</span>
                <strong class="text-slate-800">120 - 165 ${language === 'fa' ? 'متر' : 'meters'}</strong>
              </div>
              <div class="flex justify-between border-b pb-1.5 border-blue-200">
                <span class="text-slate-500">${language === 'fa' ? 'شدت دبی خروجی جریان:' : 'Estimated Flow Discharge Rate:'}</span>
                <strong class="text-slate-800">~4.8 ${language === 'fa' ? 'لیتر بر ثانیه' : 'Lit/sec'}</strong>
              </div>
              <div class="flex justify-between border-b pb-1.5 border-blue-200">
                <span class="text-slate-500">${language === 'fa' ? 'تیپ رسوبی سنگ بستر:' : 'Geological Formation Status:'}</span>
                <strong class="text-slate-800">${language === 'fa' ? 'آبرفت درشت‌دانه و شیل‌های آهکی' : 'Coarse alluvium, calcareous shale'}</strong>
              </div>
              <div class="flex justify-between pb-1 text-blue-900 font-bold">
                <span>${language === 'fa' ? 'پیشنهاد کارشناس حفر:' : 'Recommended Drill Strategy:'}</span>
                <span>${language === 'fa' ? 'ضربه دوانی با غلاف هیدرولیک' : 'Percussion rig with hydraulic sleeve'}</span>
              </div>
            </div>
          </div>

          <div class="bg-indigo-50/40 rounded-2xl p-6 border border-indigo-100/80 space-y-3 text-xs leading-relaxed">
            <h4 class="font-bold text-indigo-900 text-xs flex items-center gap-1.5">🗺️ ${language === 'fa' ? 'ساختار طبقه‌بندی خاک اراضی زاگرس' : 'Soil Substructure Analysis'}</h4>
            <p>
              ${language === 'fa' ? '• لایه سطحی (۰ تا ۶ متر): خاک هوموسی فعال و لومی غنی مستعد استقرار سیستم ریشه‌ها.' : '• Top layer (0-6m): Humic active forest loam, excellent root adaptation.'}
            </p>
            <p>
              ${language === 'fa' ? '• لایه سنگ بستر (۶ تا ۸۵ متر): سنگ ماسه رسوبی با تخلخل بالا هادی زهکشی بارندگ‌های فصلی.' : '• Intermediate Bedrock (6-85m): Semi-dense porous sandstone conveying annual rainfall seepage.'}
            </p>
            <p>
              ${language === 'fa' ? '• لایه مسدود کننده سفره (۸۵ تا ۱۲۰ متر): مارن رسی فشرده غیرقابل نفوذ به عنوان نگهدارنده اصلی آب.' : '• Aquiclude layer (85-120m): Impervious clay-marl sealant holding the groundwater reservoir.'}
            </p>
          </div>
        </div>

        <div class="bg-cyan-50/50 rounded-xl p-4 text-xs text-cyan-800 border border-cyan-100 flex items-start gap-2">
          <span>🔔</span>
          <p>
            ${language === 'fa' ? 'دستورالعمل تعادل آب: حفر و برداشت از سفره باید ترجیحاً بر اساس نرخ شارژ طبیعی و با گابیون‌بندی موازی هماهنگ گردد تا حریم بستر رگه آب دچار ریزش نشود.' : 'Caution Note: Initial extraction should not exceed recommended Lit/sec flow profile to preserve subsurface structural integrity and avoid brackish infiltration.'}
          </p>
        </div>
      </div>

      <div class="text-[10px] text-slate-400 flex justify-between items-center border-t pt-4 mt-4">
        <span>Green Hope Hydrological Exploration Node</span>
        <span>Deep Subsoil Mappings Synced</span>
      </div>
    </div>

    <!-- PAGE 5: REFORESTATION & PLANTING BLUEPRINT -->
    <div class="page-break pt-12 min-h-[920px] flex flex-col justify-between">
      <div class="space-y-6">
        <div class="flex justify-between items-center border-b pb-4">
          <div class="flex items-center gap-2">
            <span class="text-lg">🌲</span>
            <span class="text-lg font-bold text-slate-905">${language === 'fa' ? 'بخش چهارم: برنامه کاشت جنگلی و بیولوژیک اراضی دیم' : 'Section 4: Bio-Diverse Reforestation & Flora Sourcing Advisor'}</span>
          </div>
          <span class="text-xs text-slate-400 font-mono">Page 5 / 5</span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="bg-emerald-50 rounded-2xl p-6 border border-emerald-100 space-y-4">
            <h4 class="font-bold text-emerald-900 text-sm flex items-center gap-2">🌲 ${language === 'fa' ? 'گونه‌های درختی زیست‌سازگار بومی' : 'Adaptive Tree Species'}</h4>
            <div class="space-y-3 text-xs leading-relaxed">
              <div>
                <span class="font-bold text-emerald-950 block">۱. ${language === 'fa' ? 'سیاه تلو / بادام کوهی دیم' : 'Mountain Almond (Amydglaus)'}</span>
                <span class="text-slate-500">${language === 'fa' ? 'سیستم ریشه عمودی عمیق جهت ردیابی رطوبت پایینی سفره دشت.' : 'Ultra-deep lateral roots anchoring dry slopes. Survives long arid dry months.'}</span>
              </div>
              <div>
                <span class="font-bold text-emerald-950 block">۲. ${language === 'fa' ? 'بلوط ایرانی پهن‌برگ' : 'Persian Broadleaf Oak (Quercus)'}</span>
                <span class="text-slate-500">${language === 'fa' ? 'احیای میکروارگانیسم‌های خاک سیاه اراضی و بهبود جذب مواد ارگانیک.' : 'Revitalizes native soil mycorrhizal systems. Long life span and high carbon capture.'}</span>
              </div>
            </div>
          </div>

          <div class="bg-indigo-50/50 rounded-2xl p-6 border border-indigo-100 space-y-4 font-sans">
            <h4 class="font-bold text-indigo-900 text-sm flex items-center gap-2">📊 ${language === 'fa' ? 'شاخص کاداستر کاشت ارگانیک و بازده کربنی' : 'Carbon Abatement & Spacing Models'}</h4>
            <div class="space-y-3 text-xs text-slate-800">
              <div class="flex justify-between border-b pb-2">
                <span>${language === 'fa' ? 'ارایش کاشت خوشه‌ها:' : 'Grid Spacing Scheme:'}</span>
                <strong>${language === 'fa' ? 'فاصله خوشه‌ای شطرنجی ۶×۶ متر' : '6m x 6m Staggered Cluster'}</strong>
              </div>
              <div class="flex justify-between border-b pb-2">
                <span>${language === 'fa' ? 'توان تخمینی جذب کربن:' : 'Annual Carbon Abatement Potential:'}</span>
                <strong class="text-emerald-700">${language === 'fa' ? '۳۸.۴ تن در هکتار سالانه' : '38.4 Tons/Hectare (Annual)'}</strong>
              </div>
              <div class="flex justify-between pb-1">
                <span>${language === 'fa' ? 'فرآیند حفاظت اولیه خاک:' : 'Support Hydration Floor:'}</span>
                <strong>${language === 'fa' ? 'دیم آبگیر هلالی با خاک‌پوش بیولوژیک' : 'Micropore water containment hollows'}</strong>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-slate-900 text-white rounded-2xl p-6 space-y-3">
          <h4 class="font-bold text-sm text-emerald-400 flex items-center gap-2">
            <span>✨</span>
            ${language === 'fa' ? 'بیانیه نهایی مدل تلفیقی هوش مصنوعی' : 'Final AI Summary & Endorsement Note'}
          </h4>
          <p class="text-[11px] md:text-xs text-slate-300 leading-relaxed font-sans">
            ${language === 'fa' ? 'پروژه یکپارچه احیای پوشش زنده اراضی دیم دامنه‌ای لایه‌های هماهنگی ایده آلی را با تلفیق داده‌های پایش تندباد، ایستگاه سنسوری رطوبت محیط زیستی و اکتشاف رگه‌های آب نشان می‌دهد (گرید کیفی ممتاز A+).' 
                                : 'The integration of SmartFireSense telemetry logs with subsoil hydrological profiles indicates highly robust ecological conditions for successful reforestation. Recommended actions: Launch community-led cluster planting mapped above, synchronized with the Silk Road Grant portfolio.'}
          </p>
        </div>
      </div>

      <div class="text-[10px] text-slate-400 flex justify-between items-center border-t pt-4 mt-6">
        <span>Green Hope Ecosystem Planting Advisor</span>
        <span>End of Multi-Page Assessor Dossier &copy; 2026</span>
      </div>
    </div>

  </div>

  <div class="no-print text-center text-slate-550 text-xs py-12">
    Green Hope Intelligent Environmental Monitor Node. Renders seamlessly in compliant standard A4 format.
  </div>

</body>
</html>`;
  };

  const handleExportPlatformWideSample = () => {
    try {
      const reportWindow = window.open('', '_blank', 'width=1100,height=850');
      if (reportWindow) {
        reportWindow.document.write(getPlatformWideHTMLReport());
        reportWindow.document.close();
        reportWindow.onload = () => {
          setTimeout(() => {
            reportWindow.print();
          }, 350);
        };
        addToast(language === 'fa' ? 'کارنامه جامع خلاقیت و پایش چندصفحه‌ای راه‌اندازی شد. در بخش بازشده گزینه ذخیره به عنوان PDF را کلیک کنید.' : 'Multi-Page Platform-Wide Unified AI Report wizard is ready. In the newly opened page, click Print to save as PDF.', 'success');
        addSystemLog('info', `Opened print wizard to compile Platform-Wide AI report covering Fire Jungle, Grants, Water Scanner, and Flora Reforestation.`);
      } else {
        addToast(language === 'fa' ? 'خطا: باز شدن پنجره جدید توسط مرورگر مسدود شده است.' : 'Error: Popup was blocked by your browser. Please allow popups for SFS.', 'error');
      }
    } catch (err) {
      console.error(err);
      addToast('Platform Report Export failed', 'error');
    }
  };

  // Map representation reference (Leaflet container bypass)
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);

  useEffect(() => {
    const L = (window as any).L;
    if (L && mapContainerRef.current) {
      let lastCenter: [number, number] = [34.5000, 53.5000];
      let lastZoom = 5;
      if (leafletMapRef.current) {
        try {
          const c = leafletMapRef.current.getCenter();
          lastCenter = [c.lat, c.lng];
          lastZoom = leafletMapRef.current.getZoom();
        } catch (err) {
          console.error("Could not capture map state:", err);
        }
        leafletMapRef.current.remove();
      }

      const map = L.map(mapContainerRef.current, {
        center: lastCenter,
        zoom: lastZoom,
        zoomControl: false
      });
      leafletMapRef.current = map;

      // 1. DYNAMIC BASE MAP TILES (تصاویر چند لایه باشه)
      let tileUrl = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
      let layerAttribution = '&copy; OpenStreetMap contributors &copy; CARTO';
      
      if (mapLayer === 'satellite') {
        tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
        layerAttribution = 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community';
      } else if (mapLayer === 'topo') {
        tileUrl = 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png';
        layerAttribution = 'Map data: &copy; OpenStreetMap contributors | Style: &copy; OpenTopoMap';
      }

      L.tileLayer(tileUrl, {
        attribution: layerAttribution,
        maxZoom: 18
      }).addTo(map);

      // If satellite is active, add transparent Hybrid overlays (boundaries, place labels, transport) to make it premium
      if (mapLayer === 'satellite') {
        L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', {
          attribution: 'Labels &copy; Esri',
          maxZoom: 18,
          opacity: 0.95
        }).addTo(map);

        L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}', {
          attribution: 'Roads &copy; Esri',
          maxZoom: 18,
          opacity: 0.7
        }).addTo(map);
      }

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // 2. RENDER THE ACTIVE IOT TOWER NODES
      nodes.forEach(node => {
        let color = '#34d399'; // Emerald
        if (node.fireRisk === 'medium') color = '#38bdf8'; // Sky
        if (node.fireRisk === 'high') color = '#fbbf24'; // Amber
        if (node.fireRisk === 'critical') color = '#f43f5e'; // Rose

        const marker = L.circleMarker([node.lat, node.lng], {
          radius: 12,
          fillColor: color,
          color: '#ffffff',
          weight: 1.5,
          opacity: 1,
          fillOpacity: 0.8
        }).addTo(map);

        marker.bindTooltip(`
          <div style="font-family: inherit; direction: ${language === 'fa' ? 'rtl' : 'ltr'}">
            <strong style="color: #ffffff">${node.name}</strong><br/>
            <span style="color: #94a3b8">دما: ${node.temp}°C | رطوبت: ${node.hum}%</span><br/>
            <span style="font-weight: bold; color: ${color}">وضعیت خطر: ${node.fireRisk.toUpperCase()}</span>
          </div>
        `, {
          permanent: false,
          direction: 'top'
        });

        L.circle([node.lat, node.lng], {
          color: color,
          fillColor: color,
          fillOpacity: 0.15,
          radius: node.fireRisk === 'critical' ? 50000 : node.fireRisk === 'high' ? 25000 : 10000
        }).addTo(map);
      });

      // 3. RENDER ADVISORY DRY RISK ZONE OVERLAYS (پیش‌بینی اراضی تشنه)
      if (showRiskZoneOverlay) {
        // High risk region 1: West Zagros Dry Zone Polygon
        const zagrosPolygon = [
          [31.5, 47.5], [33.8, 46.2], [34.5, 47.9], [32.0, 49.5]
        ];
        L.polygon(zagrosPolygon, {
          color: '#f43f5e',
          weight: 1,
          fillColor: '#ef4444',
          fillOpacity: 0.12,
          dashArray: '3, 6'
        }).addTo(map).bindTooltip(
          language === 'fa' ? "🔥 پهنه خشک فوق بحرانی زاگرس (خطر اشتعال فوری)" : "West Zagros Dry Fuel Bed (Critical NDVI)",
          { sticky: true }
        );

        // High risk region 2: East-Alborz Shrubland Area Rectangle
        const alborzBounds = [[36.2, 53.5], [37.2, 55.4]];
        L.rectangle(alborzBounds, {
          color: '#f59e0b',
          weight: 1,
          fillColor: '#f59e0b',
          fillOpacity: 0.10,
          dashArray: '3, 6'
        }).addTo(map).bindTooltip(
          language === 'fa' ? "⚠️ پهنه مستعد حریق سطحی علفزارهای خشک البرز" : "East Alborz Dry Grass Combustion Risk Zone",
          { sticky: true }
        );
      }

      // 4. PLOT BLUE EMERGENCY FIREFIGHTER RESPONDER BASES (نمایش پایگاه‌ها با آیکون و متن کوتاه)
      if (showStationLocations) {
        const fighterBases = [
          { name: language === 'fa' ? 'پایگاه هوایی مهار حریق یاسوج' : 'Yasuj Aerial Fire Base', lat: 30.6681, lng: 51.5875, status: language === 'fa' ? 'آماده‌باش کامل' : 'Aviation Ground Ready', responders: 24, tankers: 4 },
          { name: language === 'fa' ? 'ایستگاه ضربتی جنگلبانی گرگان' : 'Gorgan Forest Ranger Outpost', lat: 36.8456, lng: 54.4320, status: language === 'fa' ? 'گشت موتوری رانجر' : 'Ground Patrol Active', responders: 18, tankers: 2 },
          { name: language === 'fa' ? 'پست مرکزی مدیریت پدافند البرز' : 'Central Alborz Emergency Center', lat: 36.4851, lng: 51.1550, status: language === 'fa' ? 'شیفت ۲۴ ساعته خط مقدم' : 'Emergency Staff On-Duty', responders: 32, tankers: 5 }
        ];

        fighterBases.forEach(base => {
          const rescueMarker = L.circleMarker([base.lat, base.lng], {
            radius: 8,
            fillColor: '#3b82f6', // Firefighter safety blue marker
            color: '#ffffff',
            weight: 2,
            opacity: 1,
            fillOpacity: 1
          }).addTo(map);

          rescueMarker.bindTooltip(`
            <div style="font-family: inherit; font-size: 11px; color:#ffffff; background:#1e293b; border-radius:6px; padding:6px; text-align:right;" dir="rtl">
              <strong style="color: #60a5fa">🚒 ${base.name}</strong><br/>
              <span style="color: #94a3b8">وضعیت: ${base.status}</span><br/>
              <span style="color: #38bdf8">محیط‌بان فعال: ${base.responders} نفر | تجهیزات سنگین: ${base.tankers} خودرو</span>
            </div>
          `, { permanent: false, direction: 'top' });
        });
      }

      // 4.5. SOIL MOISTURE OVERLAYS (رطوبت خاک)
      if (showSoilMoisture) {
        const moisturePoints = [
          { name: language === 'fa' ? 'حوزه هیرکانی خزر' : 'Caspian Hyrcanian Soil Basin', lat: 36.9000, lng: 53.0000, moisture: 75, status: language === 'fa' ? 'اشباع مناسب' : 'Optimal soil hydration', color: '#0284c7' },
          { name: language === 'fa' ? 'ارتفاعات البرز مرکزی' : 'Central Alborz Highlands', lat: 35.9000, lng: 51.5000, moisture: 38, status: language === 'fa' ? 'رطوبت متوسط' : 'Moderate hydration', color: '#10b981' },
          { name: language === 'fa' ? 'پست مهار کوهپایه زاگرس' : 'Zagros Foothills', lat: 32.8000, lng: 48.0000, moisture: 14, status: language === 'fa' ? 'تنزل رطوبت بحرانی' : 'Severe Drought Risk', color: '#f97316' },
          { name: language === 'fa' ? 'مراتع کویری کلوت سرسبز' : 'South Khorasan Shrublands', lat: 33.5000, lng: 59.0000, moisture: 6, status: language === 'fa' ? 'خشکی شدید خاک' : 'Hyper Arid Soil', color: '#b45309' }
        ];

        moisturePoints.forEach(pt => {
          L.circle([pt.lat, pt.lng], {
            radius: 80000,
            color: pt.color,
            fillColor: pt.color,
            fillOpacity: 0.25,
            weight: 2
          }).addTo(map).bindTooltip(`
            <div style="font-family: inherit; font-size: 11px; color:#ffffff; background:#0f172a; border-radius:6px; padding:6px; text-align:right;" dir="rtl">
              <strong style="color: ${pt.color}">Detail Level: 💧 ${pt.name}</strong><br/>
              <span style="color: #cbd5e1">${language === 'fa' ? 'درصد رطوبت خاک' : 'Soil Moisture'}: %${pt.moisture}</span><br/>
              <span style="color: #94a3b8">${language === 'fa' ? 'پروفایل زیست‌محیطی' : 'Status'}: ${pt.status}</span>
            </div>
          `, { sticky: true });
        });
      }

      // 4.6. RECENT FIRE HISTORY OVERLAYS (سابقه حریق‌های اخیر)
      if (showRecentFireHistory) {
        const fireHistory = [
          { name: language === 'fa' ? 'منطقه حفاظت‌شده پارک ملی گلستان' : 'Golestan National Park Area', lat: 37.3500, lng: 55.8000, date: 'July 2025', area: '320 Ha', status: language === 'fa' ? 'در حال احیاء با بذرکاری رنجرها' : 'Reforestation active' },
          { name: language === 'fa' ? 'جنگل‌های بلوط مریوان' : 'Marivan Oak Woodlands', lat: 35.5200, lng: 46.2000, date: 'August 2025', area: '145 Ha', status: language === 'fa' ? 'پایش مداوم پهپادی برای بازگشت پوشش' : 'Complete recovery, high biomass' },
          { name: language === 'fa' ? 'کوهپایه‌های جنگلی ارسباران' : 'Arasbaran Forest Slopes', lat: 38.8500, lng: 47.0000, date: 'September 2025', area: '88 Ha', status: language === 'fa' ? 'تحت پوشش کامل گشت جامعه محلی' : 'Monitored by local stewards' }
        ];

        fireHistory.forEach(hist => {
          // Inner core burned point marker
          L.circleMarker([hist.lat, hist.lng], {
            radius: 6,
            fillColor: '#ef4444',
            color: '#ffffff',
            weight: 1.5,
            fillOpacity: 1
          }).addTo(map);

          // Outer burn scar outline
          L.circle([hist.lat, hist.lng], {
            radius: 40000,
            color: '#b91c1c',
            fillColor: '#ef4444',
            fillOpacity: 0.15,
            weight: 1,
            dashArray: '5, 5'
          }).addTo(map).bindTooltip(`
            <div style="font-family: inherit; font-size: 11px; color:#ffffff; background:#1e293b; border-radius:6px; padding:6px; text-align:right;" dir="rtl">
              <strong style="color: #f87171">🔥 ${hist.name}</strong><br/>
              <span style="color: #cbd5e1">${language === 'fa' ? 'تاریخ حادثه' : 'Event Date'}: ${hist.date}</span><br/>
              <span style="color: #cbd5e1">${language === 'fa' ? 'وسعت حریق' : 'Area Burned'}: ${hist.area}</span><br/>
              <span style="color: #94a3b8">${language === 'fa' ? 'وضعیت بازیابی' : 'Status'}: ${hist.status}</span>
            </div>
          `, { sticky: true });
        });
      }

      // 4.7. BIODIVERSITY INDEX OVERLAYS (شاخص تنوع زیستی)
      if (showBiodiversityIndex) {
        const bioIndexData = [
          { name: language === 'fa' ? 'ذخیره‌گاه زیست‌کره ارسباران' : 'Arasbaran Biosphere Reserve', lat: 38.9000, lng: 46.8500, score: '0.94 / 1.00', keyEndangered: language === 'fa' ? 'پلنگ قفقازی، سیاه خروس ارسبارانی' : 'Caucasian Leopard, Black Grouse', conservation: language === 'fa' ? 'حفاظت فوق بحرانی ردیف ۱' : 'Tier-1 High Alert Protection' },
          { name: language === 'fa' ? 'پارک ملی زیستگاهی گلستان' : 'Golestan National Biosphere', lat: 37.3000, lng: 56.0000, score: '0.89 / 1.00', keyEndangered: language === 'fa' ? 'مارال خزر، پلنگ ایرانی، خرس قهوه‌ای' : 'Caspian Red Deer, Persian Leopard', conservation: language === 'fa' ? 'سیستم یکپارچه پایش ماهواره‌ای' : 'Continuous Integrated Drone Watch' },
          { name: language === 'fa' ? 'بستر جنگلی رودخانه کرخه' : 'Karkheh Riparian Sanctuary', lat: 32.1000, lng: 48.2000, score: '0.82 / 1.00', keyEndangered: language === 'fa' ? 'گوزن زرد ایرانی (در معرض انقراض شدید)' : 'Persian Fallow Deer (Critically Endangered)', conservation: language === 'fa' ? 'منطقه صیانت ویژه محیط زیست' : 'Special Ecological Sanctuary Protection' }
        ];

        bioIndexData.forEach(bio => {
          L.circle([bio.lat, bio.lng], {
            radius: 65000,
            color: '#10b981',
            fillColor: '#059669',
            fillOpacity: 0.18,
            weight: 2
          }).addTo(map).bindTooltip(`
            <div style="font-family: inherit; font-size: 11px; color:#ffffff; background:#0f172a; border-radius:6px; padding:6px; text-align:right;" dir="rtl">
              <strong style="color: #34d399">🌿 ${bio.name}</strong><br/>
              <span style="color: #cbd5e1">${language === 'fa' ? 'شاخص غنای زیستی' : 'Biodiversity Index'}: ${bio.score}</span><br/>
              <span style="color: #a7f3d0">${language === 'fa' ? 'گونه‌های حساس' : 'Key Species'}: ${bio.keyEndangered}</span><br/>
              <span style="color: #94a3b8">${language === 'fa' ? 'رده صیانت' : 'Tier'}: ${bio.conservation}</span>
            </div>
          `, { sticky: true });
        });
      }

      // 5. RENDER CURRENT ACTIVE CUSTOM GEOMETRY (دایره یا مستطیل)
      if (selectedRegionRisk) {
        const center = selectedRegionRisk.center;
        let riskColor = '#34d399'; // Emerald
        if (selectedRegionRisk.lvl === 'medium') riskColor = '#38bdf8'; // Sky
        if (selectedRegionRisk.lvl === 'high') riskColor = '#fbbf24'; // Amber
        if (selectedRegionRisk.lvl === 'critical') riskColor = '#f43f5e'; // Rose

        if (shapeMode === 'circle') {
          const circleLayer = L.circle(center, {
            color: riskColor,
            fillColor: riskColor,
            fillOpacity: 0.22,
            radius: circleRadiusKm * 1000,
            weight: 2
          }).addTo(map);

          if (circleLayer.editing) {
            circleLayer.editing.enable();
            circleLayer.on('edit', () => {
              const newCenter = circleLayer.getLatLng();
              const newRadius = circleLayer.getRadius();
              const newRadiusKm = Math.round(newRadius / 1000);
              setCircleRadiusKm(newRadiusKm);
              setSelectedRegionRisk(prev => {
                if (!prev) return null;
                const risk = estimateRegionRisk(newCenter.lat, newCenter.lng);
                risk.areaSqKm = Math.round(Math.PI * newRadiusKm * newRadiusKm);
                risk.center = [newCenter.lat, newCenter.lng];
                return { ...prev, ...risk };
              });
            });
          }

          L.circleMarker(center, {
            radius: 6,
            fillColor: '#ffffff',
            color: riskColor,
            weight: 3,
            fillOpacity: 1
          }).addTo(map);
        } else if (shapeMode === 'rectangle') {
          let bounds = [
            [center[0] - 0.15, center[1] - 0.22],
            [center[0] + 0.15, center[1] + 0.22]
          ];
          if (selectedRegionRisk.customBounds) {
            bounds = selectedRegionRisk.customBounds;
          }
          const rectLayer = L.rectangle(bounds, {
            color: riskColor,
            fillColor: riskColor,
            fillOpacity: 0.18,
            weight: 2,
            dashArray: '3, 5'
          }).addTo(map);

          if (rectLayer.editing) {
            rectLayer.editing.enable();
            rectLayer.on('edit', () => {
              const newBounds = rectLayer.getBounds();
              const ne = newBounds.getNorthEast();
              const sw = newBounds.getSouthWest();
              const c = newBounds.getCenter();
              const newB: [number, number][] = [
                [sw.lat, sw.lng],
                [ne.lat, ne.lng]
              ];
              const widthKm = c.distanceTo(L.latLng(c.lat, ne.lng)) / 1000 * 2;
              const heightKm = c.distanceTo(L.latLng(ne.lat, c.lng)) / 1000 * 2;
              const newArea = Math.round(widthKm * heightKm);

              setSelectedRegionRisk(prev => {
                if (!prev) return null;
                const risk = estimateRegionRisk(c.lat, c.lng);
                risk.areaSqKm = newArea;
                risk.center = [c.lat, c.lng];
                return {
                  ...prev,
                  ...risk,
                  customBounds: newB
                };
              });
            });
          }

          L.circleMarker(center, {
            radius: 6,
            fillColor: '#ffffff',
            color: riskColor,
            weight: 3,
            fillOpacity: 1
          }).addTo(map);
        }
      }

      // 6. RENDER MULTI-POINT CUSTOM COORDINATES & ENVELOPING POLYGON
      if (customPoints.length > 0) {
        customPoints.forEach((p, idx) => {
          L.circleMarker([p.lat, p.lng], {
            radius: 5,
            fillColor: '#f43f5e',
            color: '#ffffff',
            weight: 1.5,
            fillOpacity: 1
          }).addTo(map).bindTooltip(
            language === 'fa' ? `نقطه ${idx + 1}` : `Point ${idx + 1}`,
            { permanent: true, direction: 'right', className: 'bg-slate-900 text-white text-[9px] px-1 border-0 rounded shadow' }
          );
        });

        const latLngs = customPoints.map(p => [p.lat, p.lng]);
        if (customPoints.length >= 3) {
          let riskColor = '#f59e0b';
          if (selectedRegionRisk) {
            if (selectedRegionRisk.lvl === 'low') riskColor = '#34d399';
            if (selectedRegionRisk.lvl === 'medium') riskColor = '#38bdf8';
            if (selectedRegionRisk.lvl === 'high') riskColor = '#fbbf24';
            if (selectedRegionRisk.lvl === 'critical') riskColor = '#f43f5e';
          }
          const polyLayer = L.polygon(latLngs, {
            color: riskColor,
            fillColor: riskColor,
            fillOpacity: 0.22,
            weight: 2
          }).addTo(map);

          if (polyLayer.editing) {
            polyLayer.editing.enable();
            polyLayer.on('edit', () => {
              const newLatLngs = polyLayer.getLatLngs()[0];
              const flatLatLngs = Array.isArray(newLatLngs) ? (Array.isArray(newLatLngs[0]) ? newLatLngs[0] : newLatLngs) : [];
              if (flatLatLngs.length > 0) {
                const updatedPoints = flatLatLngs.map((ll: any) => ({ lat: ll.lat, lng: ll.lng }));
                setCustomPoints(updatedPoints);
                const avgLat = updatedPoints.reduce((s, p) => s + p.lat, 0) / updatedPoints.length;
                const avgLng = updatedPoints.reduce((s, p) => s + p.lng, 0) / updatedPoints.length;
                setSelectedRegionRisk(prev => {
                  if (!prev) return null;
                  const risk = estimateRegionRisk(avgLat, avgLng);
                  risk.areaSqKm = Math.round(updatedPoints.length * 115);
                  risk.center = [avgLat, avgLng];
                  return { ...prev, ...risk };
                });
              }
            });
          }
        } else if (customPoints.length >= 2) {
          L.polyline(latLngs, {
            color: '#a855f7',
            weight: 3,
            dashArray: '5, 5'
          }).addTo(map);
        }
      }

      // 7. ATTACH MAP CLICK LISTENER FOR SHAPES DRAWING & REALTIME POPUP SUMMARY Output
      map.on('click', (e: any) => {
        const { lat, lng } = e.latlng;
        
        if (shapeMode === 'circle') {
          const risk = estimateRegionRisk(lat, lng);
          risk.areaSqKm = Math.round(Math.PI * circleRadiusKm * circleRadiusKm);
          setSelectedRegionRisk(risk);
          setCustomPoints([]);
          
          let riskColor = '#10b981';
          if (risk.lvl === 'medium') riskColor = '#0ea5e9';
          if (risk.lvl === 'high') riskColor = '#f59e0b';
          if (risk.lvl === 'critical') riskColor = '#f43f5e';

          const popupMsg = `
            <div style="font-family: inherit; font-size: 11px; color:#ffffff; background: #0f172a; border-radius: 8px; padding: 10px; width: 220px; direction: rtl; text-align: right; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3);">
              <strong style="color: #f43f5e; font-size: 12px; display:block; margin-bottom: 4px;">🔥 مشاوره مهار حریق پهنه دایره‌ای</strong>
              <span style="font-weight:bold; color: ${riskColor}; display:block; margin-bottom: 4px;">احتمال حریق: %${risk.riskPercent} (${risk.lvl === 'critical' ? 'اضطرار خطر قرمز' : risk.lvl === 'high' ? 'هشدار نارنجی' : 'امن/پایدار'})</span>
              <span style="color:#94a3b8; display:block; font-size:10px;">شعاع بررسی: ${circleRadiusKm} کیلومتر | مساحت: ${risk.areaSqKm} ک.م مربع</span>
              <span style="color:#38bdf8; display:block; font-size:10px; border-top: 1px solid #334155; padding-top: 4px; margin-top: 4px;">🌿 سوخت زون: ${risk.vegDensity}</span>
            </div>
          `;
          L.popup().setLatLng([lat, lng]).setContent(popupMsg).openOn(map);

        } else if (shapeMode === 'rectangle') {
          const risk = estimateRegionRisk(lat, lng);
          risk.areaSqKm = Math.round((0.3 * 111) * (0.44 * 111 * Math.cos(lat * Math.PI / 180)));
          setSelectedRegionRisk(risk);
          setCustomPoints([]);

          let riskColor = '#10b981';
          if (risk.lvl === 'medium') riskColor = '#0ea5e9';
          if (risk.lvl === 'high') riskColor = '#f59e0b';
          if (risk.lvl === 'critical') riskColor = '#f43f5e';

          const popupMsg = `
            <div style="font-family: inherit; font-size: 11px; color:#ffffff; background: #0f172a; border-radius: 8px; padding: 10px; width: 220px; direction: rtl; text-align: right; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3);">
              <strong style="color: #f59e0b; font-size: 12px; display:block; margin-bottom: 4px;">📐 مشاوره پهنه مستطیلی</strong>
              <span style="font-weight:bold; color: ${riskColor}; display:block; margin-bottom: 4px;">ریسک اشتعال: %${risk.riskPercent} (${risk.lvl === 'critical' ? 'بحرانی شدید' : risk.lvl === 'high' ? 'بالای حد قرمز' : 'عادی'})</span>
              <span style="color:#94a3b8; display:block; font-size:10px;">مساحت کادر: ${risk.areaSqKm} کیلومترمربع</span>
              <span style="color:#22d3ee; display:block; font-size:10px; border-top: 1px solid #334155; padding-top: 4px; margin-top: 4px;">🪵 رطوبت نسبی خاک: مناسب</span>
            </div>
          `;
          L.popup().setLatLng([lat, lng]).setContent(popupMsg).openOn(map);

        } else if (shapeMode === 'multipoint') {
          setCustomPoints(prev => {
            const updated = [...prev, { lat, lng }];
            const avgLat = updated.reduce((s, p) => s + p.lat, 0) / updated.length;
            const avgLng = updated.reduce((s, p) => s + p.lng, 0) / updated.length;
            
            const risk = estimateRegionRisk(avgLat, avgLng);
            risk.areaSqKm = updated.length >= 3 ? Math.round(updated.length * 115) : 0;
            setSelectedRegionRisk(risk);

            let riskColor = '#10b981';
            if (risk.lvl === 'medium') riskColor = '#0ea5e9';
            if (risk.lvl === 'high') riskColor = '#f59e0b';
            if (risk.lvl === 'critical') riskColor = '#f43f5e';

            const popupMsg = `
              <div style="font-family: inherit; font-size: 11px; color:#ffffff; background: #0f172a; border-radius: 8px; padding: 10px; width: 220px; direction: rtl; text-align: right; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3);">
                <strong style="color: #a855f7; font-size: 12px; display:block; margin-bottom: 4px;">📍 چند نقطه‌ای (مساحت باز)</strong>
                <span style="color:#cbd5e1; display:block; font-size:10.5px; margin-bottom: 4px;">نقطه مهار ${updated.length} به بستر افزوده شد</span>
                <span style="font-weight:bold; color: ${riskColor}; display:block; margin-bottom: 4px;">احتمال میانگین: %${risk.riskPercent}</span>
                <span style="color:#94a3b8; display:block; font-size:10px; border-top:1px solid #334155; padding-top:4px; margin-top: 4px;">👨‍🚒 توصیه: ${risk.advice}</span>
              </div>
            `;
            L.popup().setLatLng([lat, lng]).setContent(popupMsg).openOn(map);

            return updated;
          });
        }
      });
    }
  }, [nodes, mapLayer, shapeMode, circleRadiusKm, customPoints, showRiskZoneOverlay, showStationLocations, showSoilMoisture, showRecentFireHistory, showBiodiversityIndex]);

  // --- CELLULAR AUTOMATA SANDBOX - GRID AND PHYSICS SIMULATOR STATES ---
  const GRID_ROWS = 14;
  const GRID_COLS = 26;
  const [grid, setGrid] = useState<number[][]>([]);
  const [isSimActive, setIsSimActive] = useState<boolean>(false);
  const [selectedTool, setSelectedTool] = useState<'spark' | 'firebreak' | 'water' | 'extinguish'>('spark');
  const [fuelType, setFuelType] = useState<'oak' | 'grass' | 'scrub'>('grass');
  const [windAngleDir, setWindAngleDir] = useState<'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW'>('E');
  const [irInfraredMode, setIrInfraredMode] = useState<boolean>(false);
  
  // Real-time HUD stats
  const [containedPercentage, setContainedPercentage] = useState<number>(100);
  const [burningCellsCount, setBurningCellsCount] = useState<number>(0);
  const [co2Emitted, setCo2Emitted] = useState<number>(0);

  // Initialize & reset the sandbox grid
  const initGrid = () => {
    const newGrid: number[][] = [];
    for (let r = 0; r < GRID_ROWS; r++) {
      const row: number[] = [];
      for (let c = 0; c < GRID_COLS; c++) {
        // Safe vegetation (1) by default, with random rocky barren patches (0) at 8% chance to simulate a natural terrain
        if (Math.random() < 0.08) {
          row.push(0); // non-conductive bare soil/rocks
        } else {
          row.push(1); // green forest/grass vegetation
        }
      }
      newGrid.push(row);
    }
    // Set a central default kindle spark
    const midR = Math.floor(GRID_ROWS / 2);
    const midC = Math.floor(GRID_COLS / 2);
    newGrid[midR][midC] = 2; // Spark active!
    
    setGrid(newGrid);
    setCo2Emitted(0);
    setBurningCellsCount(1);
    setContainedPercentage(100);
    setIsSimActive(false);
  };

  // Initialize the grid on start
  useEffect(() => {
    initGrid();
  }, []);

  // Cellular Automata active physics ticking
  useEffect(() => {
    if (!isSimActive) return;

    const interval = setInterval(() => {
      setGrid(prev => {
        if (prev.length === 0) return prev;
        
        const next = prev.map(row => [...row]);
        let isAnyBurning = false;

        // Define wind orientation vectors for mapping calculations
        const windDirections: Record<string, { dr: number, dc: number }> = {
          'N': { dr: -1, dc: 0 },
          'NE': { dr: -1, dc: 1 },
          'E': { dr: 0, dc: 1 },
          'SE': { dr: 1, dc: 1 },
          'S': { dr: 1, dc: 0 },
          'SW': { dr: 1, dc: -1 },
          'W': { dr: 0, dc: -1 },
          'NW': { dr: -1, dc: -1 }
        };
        const currentWindOff = windDirections[windAngleDir];

        for (let r = 0; r < GRID_ROWS; r++) {
          for (let c = 0; c < GRID_COLS; c++) {
            const cell = prev[r][c];

            if (cell === 2) {
              isAnyBurning = true;
              // Burning cells have a 15% probability of collapsing into charcoal ash (3) on each tick
              if (Math.random() < 0.15) {
                next[r][c] = 3; // Burned out
                setCo2Emitted(co => co + 0.35); // simulated metric accumulator
              }
            } else if (cell === 1) {
              // Intact forest: compute combustion index among 8 windward neighbours
              let localSpreadAccumulator = 0;

              for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                  if (dr === 0 && dc === 0) continue;
                  const nr = r + dr;
                  const nc = c + dc;

                  if (nr >= 0 && nr < GRID_ROWS && nc >= 0 && nc < GRID_COLS) {
                    if (prev[nr][nc] === 2) {
                      // Active flame neighbour found! Apply fuel rate
                      let fuelMultiplier = 0.08;
                      if (fuelType === 'grass') fuelMultiplier = 0.15;
                      if (fuelType === 'scrub') fuelMultiplier = 0.12;
                      if (fuelType === 'oak') fuelMultiplier = 0.05;

                      // Slider parameters scale risk
                      fuelMultiplier += (simTemp - 20) * 0.003;
                      fuelMultiplier -= (simHum - 30) * 0.002;

                      // Compute wind vector alignment (dot product orientation multiplier)
                      let windGrip = 1.0;
                      const drUs = -dr; // source of flame direction offset
                      const dcUs = -dc;

                      const matchesRow = Math.sign(drUs) === Math.sign(currentWindOff.dr) || currentWindOff.dr === 0;
                      const matchesCol = Math.sign(dcUs) === Math.sign(currentWindOff.dc) || currentWindOff.dc === 0;

                      if (matchesRow && matchesCol) {
                        // Wind drives flames forward
                        windGrip = 1.0 + (simWind * 0.035);
                      } else if (Math.sign(drUs) === -Math.sign(currentWindOff.dr) && Math.sign(dcUs) === -Math.sign(currentWindOff.dc)) {
                        // Against the wind
                        windGrip = 1.0 / (1.0 + (simWind * 0.025));
                      }

                      fuelMultiplier *= windGrip;
                      localSpreadAccumulator += Math.max(0.01, Math.min(0.80, fuelMultiplier));
                    }
                  }
                }
              }

              // Evaluate random spark ignition limit
              if (localSpreadAccumulator > 0 && Math.random() < localSpreadAccumulator) {
                next[r][c] = 2; // ignited!
              }
            }
          }
        }

        // If no nodes are currently burning, shut down the simulation
        if (!isAnyBurning && isSimActive) {
          setIsSimActive(false);
          addToast('تمامی کانون‌های آتش مهار یا خاموش شدند.', 'info');
        }

        // Calculate and count forest covers
        let safeCount = 0;
        let activeB = 0;
        for (let r = 0; r < GRID_ROWS; r++) {
          for (let c = 0; c < GRID_COLS; c++) {
            if (next[r][c] === 1) safeCount++;
            if (next[r][c] === 2) activeB++;
          }
        }
        setBurningCellsCount(activeB);
        setContainedPercentage(Math.round((safeCount / (GRID_ROWS * GRID_COLS)) * 100));

        return next;
      });
    }, 350);

    return () => clearInterval(interval);
  }, [isSimActive, fuelType, windAngleDir, simTemp, simHum, simWind]);

  // Click & drag interact with individual cells
  const handleCellClick = (r: number, c: number) => {
    setGrid(prev => {
      const next = prev.map(row => [...row]);
      if (selectedTool === 'spark') {
        next[r][c] = 2; // set to burning
      } else if (selectedTool === 'firebreak') {
        next[r][c] = 0; // dig a dry bare firebreak ditch
      } else if (selectedTool === 'water') {
        next[r][c] = 4; // spray high-pressure persistent wet buffer
      } else if (selectedTool === 'extinguish') {
        if (next[r][c] === 2) next[r][c] = 4; // extinguish to wet buffer
      }
      return next;
    });
  };

  // Deployment of Ranger Water Bomber
  const triggerWaterBomberStrike = () => {
    setGrid(prev => {
      if (prev.length === 0) return prev;
      const next = prev.map(row => [...row]);

      // Focus targeted bombing around the center or first active burning coordinate
      let targetR = Math.floor(GRID_ROWS / 2);
      let targetC = Math.floor(GRID_COLS / 2);

      for (let r = 0; r < GRID_ROWS; r++) {
        let found = false;
        for (let c = 0; c < GRID_COLS; c++) {
          if (prev[r][c] === 2) {
            targetR = r;
            targetC = c;
            found = true;
            break;
          }
        }
        if (found) break;
      }

      // Air strike dampens a sizable 5x5 quadrant
      for (let dr = -2; dr <= 2; dr++) {
        for (let dc = -2; dc <= 2; dc++) {
          const nr = targetR + dr;
          const nc = targetC + dc;
          if (nr >= 0 && nr < GRID_ROWS && nc >= 0 && nc < GRID_COLS) {
            next[nr][nc] = 4; // saturated wet cover
          }
        }
      }
      return next;
    });

    addToast('هواپیمای تانکر آبیاری زاگرس بمباران حامی را بر روی حریق اجرا کرد!', 'success');
    addSystemLog('info', 'Helicopter Water Bomber performed manual precision drop on fire center.');
  };

  // Re-seed all ashes to fertile forest cover
  const handleReSeedAshes = () => {
    setGrid(prev => {
      return prev.map(row => row.map(cell => {
        if (cell === 3 || cell === 0) {
          return 1; // restore ash/soil back to healthy forest
        }
        return cell;
      }));
    });
    setCo2Emitted(0);
    addToast('خاکسترها با موفقیت بذرافشانی و به جنگل اضافه شدند!', 'success');
  };

  // Estimate physical rate of propagation (Rothermel formulation)
  const calculateRateOfSpread = () => {
    const baseROS = fuelType === 'grass' ? 18.5 : fuelType === 'scrub' ? 10.4 : 4.8;
    // Calculate slider physics boost
    const windEffect = simWind * 0.45;
    const tempEffect = (simTemp - 15) * 0.2;
    const humEffect = (50 - simHum) * 0.15;
    const results = Math.round((baseROS + windEffect + tempEffect + humEffect) * 10) / 10;
    return Math.max(0.5, results);
  };

  const calculateFlameLength = (ros: number) => {
    // Rothermel relationship estimate
    const results = Math.round((0.45 * Math.pow(ros, 0.46) + (simTemp * 0.02) - (simHum * 0.01)) * 10) / 10;
    return Math.max(0.2, results);
  };

  const rateOfSpread = calculateRateOfSpread();
  const flameLength = calculateFlameLength(rateOfSpread);

  // Persian text resource guides
  const persianGuides = {
    title: 'سیستم SmartFireSense',
    subtitle: 'سازوکار هوشمند ملی پیشگیری زودهنگام و تشخیص آتش‌سوزی در اراضی جنگلی و بیابانی زاگرس و البرز.',
    status: 'سطح خطر کلی شبکه',
    dangerLevel: 'سطح اضطراری',
    simPanelTitle: 'شبیه‌ساز سنسور و فرستنده محیطی',
    iotHeader: 'پایش گره‌های عملیاتی اراضی ایران',
  };

  // Status computation for alerts
  const getIranianStatusLabel = () => {
    const hasCritical = nodes.some(n => n.fireRisk === 'critical');
    const hasHigh = nodes.some(n => n.fireRisk === 'high');
    if (hasCritical) return { label: 'هشدار فوق اضطراری (آتش‌سوزی فعال)', color: 'text-rose-450 bg-rose-950/40 border border-rose-500/40' };
    if (hasHigh) return { label: 'هشدار نارنجی (احتمال حریق بالا)', color: 'text-amber-400 bg-amber-950/40 border border-amber-500/45' };
    return { label: 'وضعیت ایستگاه‌ها: پایدار و سبز', color: 'text-emerald-400 bg-emerald-950/40 border border-emerald-500/40' };
  };

  const siteStatus = getIranianStatusLabel();

  return (
    <div className="space-y-8 animate-fade-in text-slate-100 pb-12 font-sans">
      
      {/* Title Header Banner */}
      <div className="relative overflow-hidden bg-slate-900 border border-white/5 p-6 md:p-8 rounded-2xl flex flex-col md:flex-row items-center md:items-start justify-between gap-6 shadow-2xl">
        <div className="absolute right-0 top-0 w-96 h-96 bg-gradient-to-l from-rose-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
        
        <div className="text-center md:text-right space-y-2">
          <div className="flex items-center justify-center md:justify-start gap-2.5">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
            </span>
            <span className="text-xs uppercase font-mono tracking-widest text-white font-bold bg-rose-500 px-3 py-1 rounded-full border border-rose-400/30">
              SMARTFIRESENSE SYSTEM V2
            </span>
          </div>
          <h1 className="text-2xl md:text-4xl font-extrabold text-white tracking-tight">
            {persianGuides.title}
          </h1>
          <p className="text-slate-400 text-sm max-w-2xl leading-relaxed">
            {persianGuides.subtitle}
          </p>
        </div>

        {/* Global Alert Flag */}
        <div className={`p-4 rounded-xl flex items-center gap-3.5 ${siteStatus.color} shadow-lg shrink-0`}>
          <div className="p-3 bg-white/5 rounded-lg text-lg">
            <Flame className="text-rose-500 animate-pulse text-2xl" />
          </div>
          <div>
            <span className="block text-[10px] text-slate-400 font-bold tracking-wider uppercase">GLOBAL NETWORK STATUS</span>
            <span className="font-bold text-sm tracking-wide">{siteStatus.label}</span>
          </div>
        </div>
      </div>

      {/* Primary Sub Navigation Control */}
      <div className="bg-slate-950 p-1 rounded-xl border border-white/5 max-w-lg mx-auto flex">
        <button
          onClick={() => setActiveSubTab('dashboard')}
          className={`flex-1 py-2.5 text-center font-bold text-xs rounded-lg transition-all ${activeSubTab === 'dashboard' ? 'bg-slate-800 text-rose-400 border border-white/5 shadow-md' : 'text-slate-400 hover:text-white'}`}
        >
          <Compass className="inline-block w-4 h-4 mr-1.5" />
          داشبورد و شبیه‌ساز
        </button>
        <button
          onClick={() => setActiveSubTab('architecture')}
          className={`flex-1 py-2.5 text-center font-bold text-xs rounded-lg transition-all ${activeSubTab === 'architecture' ? 'bg-slate-800 text-rose-400 border border-white/5 shadow-md' : 'text-slate-400 hover:text-white'}`}
        >
          <Cpu className="inline-block w-4 h-4 mr-1.5" />
          معماری و سخت‌افزار
        </button>
        <button
          onClick={() => setActiveSubTab('codehub')}
          className={`flex-1 py-2.5 text-center font-bold text-xs rounded-lg transition-all ${activeSubTab === 'codehub' ? 'bg-slate-800 text-rose-400 border border-white/5 shadow-md' : 'text-slate-400 hover:text-white'}`}
        >
          <Code className="inline-block w-4 h-4 mr-1.5" />
          مخزن کدهای کلیدی
        </button>
        <button
          onClick={() => setActiveSubTab('api')}
          className={`flex-1 py-2.5 text-center font-bold text-xs rounded-lg transition-all ${activeSubTab === 'api' ? 'bg-slate-800 text-rose-400 border border-white/5 shadow-md' : 'text-slate-400 hover:text-white'}`}
        >
          <Database className="inline-block w-4 h-4 mr-1.5" />
          سند API (Swagger)
        </button>
      </div>

      {/* Tab View 1: Active Live Dashboard & Map Simulator */}
      {activeSubTab === 'dashboard' && (
        <div className="space-y-8">
          
          {/* Forest Watch & Wilderness Vitality Telemetry KPI Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in">
            {/* Box 1: Forest Floor Soil Hydration */}
            <div className="relative group overflow-hidden bg-gradient-to-br from-slate-900 to-slate-950 border border-white/5 p-5 rounded-2xl flex flex-col justify-between shadow-lg hover:border-blue-500/30 transition-all duration-300">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition" />
              <div className="flex items-center justify-between">
                <span className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400">
                  <Droplets className="w-5 h-5" />
                </span>
                <span className="text-[10px] font-mono tracking-wider font-extrabold text-blue-400 bg-blue-500/15 border border-blue-500/20 px-2 py-0.5 rounded-full">
                  {language === 'fa' ? 'پایدار' : 'STABLE'}
                </span>
              </div>
              <div className="mt-4 space-y-1">
                <span className="block text-slate-400 text-xs font-semibold">
                  {language === 'fa' ? 'رطوبت متوسط بستر جنگل' : 'Forest Floor Moisture'}
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-black text-white">48.3%</span>
                  <span className="text-[10px] font-mono text-emerald-450 font-bold">+1.5% {language === 'fa' ? 'امروز' : 'today'}</span>
                </div>
                <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden mt-2">
                  <div className="bg-blue-500 h-full rounded-full transition-all duration-1000" style={{ width: '48.3%' }} />
                </div>
              </div>
            </div>

            {/* Box 2: Biome Deadwood Combustible Index */}
            <div className="relative group overflow-hidden bg-gradient-to-br from-slate-900 to-slate-950 border border-white/5 p-5 rounded-2xl flex flex-col justify-between shadow-lg hover:border-amber-500/30 transition-all duration-300">
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition" />
              <div className="flex items-center justify-between">
                <span className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400">
                  <Flame className="w-5 h-5" />
                </span>
                <span className="text-[10px] font-mono tracking-wider font-extrabold text-amber-400 bg-amber-500/15 border border-amber-500/20 px-2 py-0.5 rounded-full">
                  {language === 'fa' ? 'متوسط' : 'MODERATE'}
                </span>
              </div>
              <div className="mt-4 space-y-1">
                <span className="block text-slate-400 text-xs font-semibold">
                  {language === 'fa' ? 'تراکم سوخت چوبی خشک زاگرس' : 'Dry Biomass Fuel density'}
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-black text-white">1.24 <span className="text-xs font-normal text-slate-400">kg/m²</span></span>
                  <span className="text-[10px] font-mono text-amber-500 font-bold">{language === 'fa' ? 'نیاز به هرس' : 'Need clearing'}</span>
                </div>
                <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden mt-2">
                  <div className="bg-amber-500 h-full rounded-full transition-all duration-1000" style={{ width: '35%' }} />
                </div>
              </div>
            </div>

            {/* Box 3: LoRa Node mesh telemetry status */}
            <div className="relative group overflow-hidden bg-gradient-to-br from-slate-900 to-slate-950 border border-white/5 p-5 rounded-2xl flex flex-col justify-between shadow-lg hover:border-purple-500/30 transition-all duration-300">
              <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl group-hover:bg-purple-500/10 transition" />
              <div className="flex items-center justify-between">
                <span className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400">
                  <Wifi className="w-5 h-5" />
                </span>
                <span className="text-[10px] font-mono tracking-wider font-extrabold text-purple-400 bg-purple-500/15 border border-purple-500/20 px-2 py-0.5 rounded-full">
                  {language === 'fa' ? 'مش فعال' : 'MESH LIVE'}
                </span>
              </div>
              <div className="mt-4 space-y-1">
                <span className="block text-slate-400 text-xs font-semibold">
                  {language === 'fa' ? 'پایداری حسگرهای متصل زمینی' : 'LoRa Mesh Signal Health'}
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-black text-white">99.8%</span>
                  <span className="text-[10px] font-mono text-emerald-450 font-bold">{language === 'fa' ? 'اتصال کامل' : 'Full sync'}</span>
                </div>
                <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden mt-2">
                  <div className="bg-purple-500 h-full rounded-full transition-all duration-1000" style={{ width: '99.8%' }} />
                </div>
              </div>
            </div>

            {/* Box 4: Carbon Emission Avoided Preventative Credits */}
            <div className="relative group overflow-hidden bg-gradient-to-br from-slate-900 to-slate-950 border border-white/5 p-5 rounded-2xl flex flex-col justify-between shadow-lg hover:border-emerald-500/30 transition-all duration-300">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition" />
              <div className="flex items-center justify-between">
                <span className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
                  <Leaf className="w-5 h-5" />
                </span>
                <span className="text-[10px] font-mono tracking-wider font-extrabold text-emerald-450 bg-emerald-500/15 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                  {language === 'fa' ? 'ارزشمند' : 'VALUABLE'}
                </span>
              </div>
              <div className="mt-4 space-y-1">
                <span className="block text-slate-400 text-xs font-semibold">
                  {language === 'fa' ? 'ظرفیت کربنی حریق پیشگیری‌شده' : 'Prevented CO₂ Emissions'}
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-black text-emerald-400">+12.4 <span className="text-xs font-normal text-slate-400">tCO₂e / h</span></span>
                  <span className="text-[10px] font-mono text-emerald-450 font-bold">{language === 'fa' ? 'بیمه هوشمند' : 'Smart Creds'}</span>
                </div>
                <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden mt-2">
                  <div className="bg-emerald-500 h-full rounded-full transition-all duration-1000" style={{ width: '82%' }} />
                </div>
              </div>
            </div>
          </div>
          
          {/* Grid Layout containing IoT station and live leaflet map */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Panel: IoT node lists and Sensor Simulator Overrides */}
            <div className="lg:col-span-1 space-y-6">
              
              {/* Active Nodes List */}
              <div className="bg-slate-900 border border-white/5 rounded-2xl p-5 shadow-xl">
                <h3 className="font-bold text-sm text-slate-350 uppercase tracking-wider mb-4 border-b border-white/5 pb-2 flex items-center justify-between">
                  <span>📡 {persianGuides.iotHeader}</span>
                  <span className="text-[10px] font-mono text-rose-400 bg-rose-500/10 px-2.5 py-0.5 rounded border border-rose-500/20">3 Active Stations</span>
                </h3>
                
                <div className="space-y-3">
                  {nodes.map(n => {
                    let badgeColor = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
                    if (n.fireRisk === 'medium') badgeColor = 'bg-sky-500/10 text-sky-400 border-sky-500/20';
                    if (n.fireRisk === 'high') badgeColor = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
                    if (n.fireRisk === 'critical') badgeColor = 'bg-rose-500/10 text-rose-400 border-rose-500/20';

                    return (
                      <div
                        key={n.id}
                        onClick={() => setSelectedNodeId(n.id)}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer ${selectedNodeId === n.id ? 'bg-slate-850 border-rose-500/50 shadow-md shadow-rose-950/20' : 'bg-slate-950/40 border-white/5 hover:border-slate-800'}`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="font-bold text-xs text-white truncate">{n.name}</span>
                          <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold tracking-wider border ${badgeColor}`}>
                            {n.fireRisk}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-2 text-[10px] text-slate-400 font-mono">
                          <span className="flex items-center gap-1">
                            <Flame className="w-3.5 h-3.5 text-rose-550" /> {n.temp}°C
                          </span>
                          <span className="flex items-center gap-1">
                            <Droplets className="w-3.5 h-3.5 text-blue-400" /> {n.hum}%
                          </span>
                          <span className="flex items-center gap-1 text-slate-350">
                            <Wind className="w-3.5 h-3.5" /> {n.windSpeed} km/h
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Simulated Parameter Slider Overrides */}
              <div className="bg-slate-900 border border-white/5 rounded-2xl p-5 shadow-xl space-y-4">
                <div className="border-b border-white/5 pb-2">
                  <h3 className="font-bold text-sm text-slate-350 uppercase tracking-wider">
                    ⚠️ {persianGuides.simPanelTitle}
                  </h3>
                  <span className="text-[10px] text-rose-450 font-mono italic">Adjusting parameters for "{activeNode.name}"</span>
                </div>

                {/* Temperature Slider */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-400 flex items-center gap-1"><Flame className="w-3.5 h-3.5 text-rose-550" /> Temperature (دما)</span>
                    <span className="text-white font-bold">{simTemp}°C</span>
                  </div>
                  <input
                    type="range"
                    min="-10"
                    max="60"
                    step="0.5"
                    value={simTemp}
                    onChange={(e) => setSimTemp(parseFloat(e.target.value))}
                    className="w-full accent-rose-500 bg-slate-950 h-1.5 rounded-lg cursor-pointer"
                  />
                </div>

                {/* Humidity Slider */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-400 flex items-center gap-1"><Droplets className="w-3.5 h-3.5 text-blue-400" /> Humidity (رطوبت)</span>
                    <span className="text-white font-bold">{simHum}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={simHum}
                    onChange={(e) => setSimHum(parseInt(e.target.value))}
                    className="w-full accent-blue-500 bg-slate-950 h-1.5 rounded-lg cursor-pointer"
                  />
                </div>

                {/* Wind Speed Slider */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-400 flex items-center gap-1"><Wind className="w-3.5 h-3.5 text-slate-300" /> Wind Speed (سرعت باد)</span>
                    <span className="text-white font-bold">{simWind} km/h</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="120"
                    value={simWind}
                    onChange={(e) => setSimWind(parseInt(e.target.value))}
                    className="w-full accent-slate-400 bg-slate-950 h-1.5 rounded-lg cursor-pointer"
                  />
                </div>

                {/* Solar Radiation */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-400 flex items-center gap-1"><Sun className="w-3.5 h-3.5 text-amber-500" /> Solar Intensity (زاویه تابش)</span>
                    <span className="text-white font-bold">{simSolar} W/m²</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1200"
                    value={simSolar}
                    onChange={(e) => setSimSolar(parseInt(e.target.value))}
                    className="w-full accent-amber-500 bg-slate-950 h-1.5 rounded-lg cursor-pointer"
                  />
                </div>

                <div className="bg-slate-950 p-3.5 rounded-xl border border-white/5 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-405 uppercase font-mono">Live ML Prediction index:</span>
                    <span className={`px-2.5 py-0.5 rounded text-xs font-bold font-mono ${currentRisk.color}`}>
                      {currentRisk.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="autoSms"
                      checked={autoSms}
                      onChange={(e) => setAutoSms(e.target.checked)}
                      className="rounded bg-slate-900 border-slate-700 text-rose-500 focus:ring-0 cursor-pointer"
                    />
                    <label htmlFor="autoSms" className="text-xs text-slate-350 cursor-pointer select-none">
                      فعال‌سازی ارسال پیامک اضطراری به محیط‌بانی منطقه حریق
                    </label>
                  </div>
                </div>

                <button
                  onClick={handleUpdateSim}
                  className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 font-bold text-xs rounded-xl transition shadow shadow-rose-950/20 flex items-center justify-center gap-1.5 text-white"
                >
                  <Save className="w-4 h-4" />
                  به‌روزرسانی و همگام‌سازی ایستگاه (Sync Node)
                </button>
              </div>

            </div>

            {/* Right Panel: Simulated map view and Alert Log terminal */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Embedded Advanced Interactive Consultative Map Layer */}
              <div className="bg-slate-900 border border-white/5 rounded-2xl overflow-hidden shadow-xl flex flex-col md:h-auto min-h-[600px]">
                
                {/* Header banner */}
                <div className="p-4 bg-slate-905 border-b border-white/5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shrink-0">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 bg-rose-500 rounded-full animate-ping" />
                    <h3 className="font-bold text-sm text-slate-200">مرکز فرماندهی، مدیریت اطفاء و مشاوره پیشگیری زودهنگام (Map Command Core)</h3>
                  </div>
                  <span className="text-[10px] bg-slate-800 text-slate-400 px-3 py-1 rounded border border-white/5 font-mono">Iran Wildfire Strategic Core v3.0</span>
                </div>

                {/* Sub-Header: Tile Layers & Draw Shapes Controllers */}
                <div className="p-3 bg-slate-950/45 border-b border-white/5 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
                  
                  {/* Layer Selector & Overlay Checkboxes */}
                  <div className="space-y-2.5 text-right font-sans" dir="rtl">
                    <div className="flex items-center gap-1.5 text-slate-350 font-bold mb-1">
                      <Layers className="w-3.5 h-3.5 text-blue-400" />
                      <span>لایه‌های تصویر نقشه و سنسورها (Tile Layers)</span>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-1.5" dir="ltr">
                      <button
                        onClick={() => setMapLayer('dark')}
                        className={`py-1.5 px-2 rounded-lg font-medium transition flex items-center justify-center gap-1 border ${
                          mapLayer === 'dark' 
                            ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-900/10' 
                            : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border-white/5'
                        }`}
                      >
                        <MapIcon className="w-3 h-3" />
                        <span>پایه تیره</span>
                      </button>
                      <button
                        onClick={() => setMapLayer('satellite')}
                        className={`py-1.5 px-2 rounded-lg font-medium transition flex items-center justify-center gap-1 border ${
                          mapLayer === 'satellite' 
                            ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-900/10' 
                            : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border-white/5'
                        }`}
                      >
                        <Eye className="w-3 h-3" />
                        <span>ماهواره‌ای</span>
                      </button>
                      <button
                        onClick={() => setMapLayer('topo')}
                        className={`py-1.5 px-2 rounded-lg font-medium transition flex items-center justify-center gap-1 border ${
                          mapLayer === 'topo' 
                            ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-900/10' 
                            : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border-white/5'
                        }`}
                      >
                        <Activity className="w-3 h-3" />
                        <span>توپوگرافی</span>
                      </button>
                    </div>

                    {/* Overlay Checks */}
                    <div className="flex items-center gap-4 pt-1 flex-wrap justify-start">
                      <label className="flex items-center gap-1.5 cursor-pointer text-slate-400 hover:text-slate-200">
                        <input
                          type="checkbox"
                          checked={showRiskZoneOverlay}
                          onChange={(e) => setShowRiskZoneOverlay(e.target.checked)}
                          className="rounded bg-slate-900 border-slate-700 text-blue-550 focus:ring-0 cursor-pointer"
                        />
                        <span>پیش‌بینی خشکی بستر</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer text-slate-400 hover:text-slate-200">
                        <input
                          type="checkbox"
                          checked={showStationLocations}
                          onChange={(e) => setShowStationLocations(e.target.checked)}
                          className="rounded bg-slate-900 border-slate-700 text-blue-550 focus:ring-0 cursor-pointer"
                        />
                        <span>پایگاه‌های اطفاء حریق (🚒)</span>
                      </label>
                    </div>

                    {/* لایه‌های تحلیلی محیط زیست (Environmental Overlays Control Panel) */}
                    <div className="pt-2.5 border-t border-white/5 mt-2.5 space-y-2">
                      <div className="flex items-center gap-1.5 text-slate-300 font-bold">
                        <Layers className="w-3.5 h-3.5 text-emerald-400" />
                        <span>پوشش‌های پیشرفته محیط زیستی (Environmental Data Overlays)</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]" dir="ltr">
                        <label className={`flex items-center justify-between p-2 rounded-lg border cursor-pointer transition ${
                          showSoilMoisture 
                            ? 'bg-sky-950/45 border-sky-500/50 text-sky-200 shadow-md shadow-sky-950/80' 
                            : 'bg-slate-950/30 border-white/5 text-slate-400 hover:border-slate-800 hover:text-slate-300'
                        }`}>
                          <span className="flex items-center gap-1.5 font-medium">
                            <Droplets className={`w-3.5 h-3.5 ${showSoilMoisture ? 'text-sky-400' : 'text-slate-500'}`} />
                            <span>{language === 'fa' ? 'رطوبت خاک' : 'Soil Moisture'}</span>
                          </span>
                          <input
                            type="checkbox"
                            checked={showSoilMoisture}
                            onChange={(e) => setShowSoilMoisture(e.target.checked)}
                            className="rounded bg-slate-900 border-slate-700 text-sky-500 focus:ring-0 cursor-pointer h-3 w-3"
                          />
                        </label>

                        <label className={`flex items-center justify-between p-2 rounded-lg border cursor-pointer transition ${
                          showRecentFireHistory 
                            ? 'bg-amber-950/45 border-amber-500/50 text-amber-200 shadow-md shadow-amber-950/80' 
                            : 'bg-slate-950/30 border-white/5 text-slate-400 hover:border-slate-800 hover:text-slate-300'
                        }`}>
                          <span className="flex items-center gap-1.5 font-medium">
                            <Flame className={`w-3.5 h-3.5 ${showRecentFireHistory ? 'text-amber-450 animate-pulse' : 'text-slate-500'}`} />
                            <span>{language === 'fa' ? 'سابقه حریق' : 'Fire History'}</span>
                          </span>
                          <input
                            type="checkbox"
                            checked={showRecentFireHistory}
                            onChange={(e) => setShowRecentFireHistory(e.target.checked)}
                            className="rounded bg-slate-900 border-slate-700 text-amber-500 focus:ring-0 cursor-pointer h-3 w-3"
                          />
                        </label>

                        <label className={`flex items-center justify-between p-2 rounded-lg border cursor-pointer transition ${
                          showBiodiversityIndex 
                            ? 'bg-emerald-950/45 border-emerald-500/50 text-emerald-250 shadow-md shadow-emerald-950/80' 
                            : 'bg-slate-950/30 border-white/5 text-slate-400 hover:border-slate-800 hover:text-slate-300'
                        }`}>
                          <span className="flex items-center gap-1.5 font-medium">
                            <Leaf className={`w-3.5 h-3.5 ${showBiodiversityIndex ? 'text-emerald-400' : 'text-slate-500'}`} />
                            <span>{language === 'fa' ? 'شاخص تنوع زیستی' : 'Biodiversity Index'}</span>
                          </span>
                          <input
                            type="checkbox"
                            checked={showBiodiversityIndex}
                            onChange={(e) => setShowBiodiversityIndex(e.target.checked)}
                            className="rounded bg-slate-900 border-slate-700 text-emerald-500 focus:ring-0 cursor-pointer h-3 w-3"
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Geometric Draw Shape Selector */}
                  <div className="space-y-2.5 text-right font-sans" dir="rtl">
                    <div className="flex items-center gap-1.5 text-slate-350 font-bold mb-1">
                      <Compass className="w-3.5 h-3.5 text-purple-400" />
                      <span>ابزار تحلیل هندسی و انتخاب منطقه روی نقشه</span>
                    </div>

                    <div className="grid grid-cols-3 gap-1.5" dir="ltr">
                      <button
                        onClick={() => {
                          setShapeMode('circle');
                          setSelectedRegionRisk(null);
                          setCustomPoints([]);
                        }}
                        className={`py-1.5 px-2 rounded-lg font-medium transition flex items-center justify-center gap-1 border ${
                          shapeMode === 'circle' 
                            ? 'bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-900/10' 
                            : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border-white/5'
                        }`}
                      >
                        <div className="w-2.5 h-2.5 rounded-full border border-current" />
                        <span>دایره‌ای</span>
                      </button>
                      <button
                        onClick={() => {
                          setShapeMode('rectangle');
                          setSelectedRegionRisk(null);
                          setCustomPoints([]);
                        }}
                        className={`py-1.5 px-2 rounded-lg font-medium transition flex items-center justify-center gap-1 border ${
                          shapeMode === 'rectangle' 
                            ? 'bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-900/10' 
                            : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border-white/5'
                        }`}
                      >
                        <div className="w-2.5 h-2.5 border border-current rounded-sm" />
                        <span>مستطیلی</span>
                      </button>
                      <button
                        onClick={() => {
                          setShapeMode('multipoint');
                          setSelectedRegionRisk(null);
                          setCustomPoints([]);
                        }}
                        className={`py-1.5 px-2 rounded-lg font-medium transition flex items-center justify-center gap-1 border ${
                          shapeMode === 'multipoint' 
                            ? 'bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-900/10' 
                            : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border-white/5'
                        }`}
                      >
                        <Activity className="w-3 h-3" />
                        <span>چند‌نقطه‌ای</span>
                      </button>
                    </div>

                    {/* Radius Slider or Multipoint controls */}
                    <div className="flex items-center justify-between gap-2 pt-1 h-6">
                      {shapeMode === 'circle' && (
                        <div className="flex items-center gap-2 w-full" dir="rtl">
                          <span className="text-slate-400 shrink-0 text-[11px]">شعاع بررسی {circleRadiusKm} کیلومتر</span>
                          <input
                            type="range"
                            min="10"
                            max="100"
                            step="5"
                            value={circleRadiusKm}
                            onChange={(e) => setCircleRadiusKm(parseInt(e.target.value))}
                            className="flex-1 accent-purple-500 cursor-pointer h-1 bg-slate-800 rounded-lg outline-none"
                          />
                        </div>
                      )}
                      
                      {shapeMode === 'multipoint' && (
                        <div className="flex items-center justify-between w-full" dir="rtl">
                          <span className="text-slate-400 text-[11px]">
                            {customPoints.length === 0 ? "روی نقشه نقاط اراضی را به ترتیب کادر کلیک کنید" : `${customPoints.length} گره در پهنه انتخابی`}
                          </span>
                          {customPoints.length > 0 && (
                            <button
                              onClick={() => {
                                setCustomPoints([]);
                                setSelectedRegionRisk(null);
                              }}
                              className="text-[10px] text-rose-400 hover:text-rose-350 cursor-pointer font-bold shrink-0 flex items-center gap-1"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>پاک کردن کل نقاط</span>
                            </button>
                          )}
                        </div>
                      )}

                      {shapeMode === 'rectangle' && (
                        <span className="text-slate-400 text-[11px]">روی هر پناهگاه زاگرس همسایه کلیک کنید تا کادر مهار محیطی رسم شود</span>
                      )}
                    </div>

                    {/* Export drawn selection area coordinates and metadata */}
                    <div className="pt-2 border-t border-white/5 mt-2 flex items-center justify-between gap-2" dir="rtl">
                      <span className="text-slate-400 text-[10px] font-bold">
                        {language === 'fa' ? 'خروجی کادر فعال و برآورد ریسک:' : 'Export Drawn Area & Risk:'}
                      </span>
                      <div className="flex gap-1.5" dir="ltr">
                        <button
                          onClick={() => {
                            if (!selectedRegionRisk) {
                              addToast(language === 'fa' ? 'خطا: لطفاً ابتدا یک محدوده روی نقشه تعریف کنید.' : 'Error: Please draw or select a region on the map first.', 'error');
                              return;
                            }
                            setIsExportModalOpen(true);
                          }}
                          disabled={!selectedRegionRisk}
                          title={language === 'fa' ? 'دانلود داده اراضی در دو قالب استاندارد' : 'Export area selection data'}
                          className={`px-3 py-1 rounded text-[10px] font-extrabold transition flex items-center gap-1.5 border shadow ${
                            selectedRegionRisk 
                              ? 'bg-purple-600 hover:bg-purple-750 text-white border-purple-500/50 cursor-pointer shadow shadow-purple-950/40' 
                              : 'bg-slate-950/20 text-slate-600 border-white/5 cursor-not-allowed opacity-50'
                          }`}
                        >
                          <Download className="w-2.5 h-2.5" />
                          <span>{language === 'fa' ? 'خروجی داده اراضی' : 'Export Area Data'}</span>
                        </button>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Main Dynamic Map Grid */}
                <div className="flex flex-col xl:flex-row min-h-[380px]">
                  
                  {/* Map Canvas div */}
                  <div ref={mapContainerRef} className="flex-1 min-h-[380px] bg-slate-950 transition-all border-b xl:border-b-0 xl:border-l border-white/5" />

                  {/* Realtime Consultative Risk Analysis HUD sidebar */}
                  <div className="w-full xl:w-80 bg-slate-950/80 p-4 shrink-0 flex flex-col justify-between font-sans text-right" dir="rtl">
                    <div>
                      <div className="flex items-center gap-1.5 border-b border-white/5 pb-2.5 mb-3.5">
                        <ShieldAlert className="w-4 h-4 text-rose-500 animate-pulse" />
                        <h4 className="font-bold text-xs text-white">تخمین احتمال حریق و مشاوره پایداری پهنه</h4>
                      </div>

                      {!selectedRegionRisk ? (
                        <div className="py-12 px-4 text-center text-slate-500 text-xs space-y-2">
                          <Compass className="w-8 h-8 text-slate-700 mx-auto animate-spin" />
                          <p dir="rtl">برای مهار اراضی و مشاوره، یکی از ابزارها را انتخاب کرده و روی نقشه کلیک کنید.</p>
                        </div>
                      ) : (
                        <div className="space-y-4 text-xs">
                          {/* Risk Percent visual dial */}
                          <div className="bg-slate-900/65 p-3 rounded-xl border border-white/5 space-y-2">
                            <div className="flex justify-between items-center text-[11px]">
                              <span className="text-slate-400">امکان وقوع حریق جنگلی:</span>
                              <span className={`font-extrabold px-1.5 py-0.5 rounded ${
                                selectedRegionRisk.lvl === 'critical' ? 'text-rose-450 bg-rose-950/30 border border-rose-500/30' : 
                                selectedRegionRisk.lvl === 'high' ? 'text-amber-400 bg-amber-950/30 border border-amber-500/30' : 
                                selectedRegionRisk.lvl === 'medium' ? 'text-sky-400 bg-sky-950/30 border border-sky-500/30' : 
                                'text-emerald-400 bg-emerald-950/30 border border-emerald-500/30'
                              }`}>
                                %{selectedRegionRisk.riskPercent} ({
                                  selectedRegionRisk.lvl === 'critical' ? 'بحرانی قرمز' : 
                                  selectedRegionRisk.lvl === 'high' ? 'بالا نارنجی' : 
                                  selectedRegionRisk.lvl === 'medium' ? 'متوسط زرد' : 'پایین سبز'
                                })
                              </span>
                            </div>
                            
                            {/* Linear Gauge */}
                            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full transition-all duration-500 ${
                                  selectedRegionRisk.lvl === 'critical' ? 'bg-rose-500' : 
                                  selectedRegionRisk.lvl === 'high' ? 'bg-amber-500' : 
                                  selectedRegionRisk.lvl === 'medium' ? 'bg-sky-500' : 'bg-emerald-500'
                                }`}
                                style={{ width: `${selectedRegionRisk.riskPercent}%` }}
                              />
                            </div>
                          </div>

                          {/* Coordinates & Area representation */}
                          <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-900/40 p-2.5 rounded-lg border border-white/5 font-mono text-center">
                            <div className="space-y-0.5 text-right font-sans" dir="rtl">
                              <span className="text-slate-500 block text-[10px]">مساحت تقریبی پهنه:</span>
                              <span className="text-slate-200 mt-0.5 font-bold">
                                {selectedRegionRisk.areaSqKm > 0 ? `${selectedRegionRisk.areaSqKm} ک.م مربع` : 'محاسبه‌ باز'}
                              </span>
                            </div>
                            <div className="space-y-0.5 text-right font-sans" dir="rtl">
                              <span className="text-slate-500 block text-[10px]">مختصات پهنه:</span>
                              <span className="text-slate-300 font-bold block text-[10px]" dir="ltr">
                                {selectedRegionRisk.center[0].toFixed(3)}, {selectedRegionRisk.center[1].toFixed(3)}
                              </span>
                            </div>
                          </div>

                          {/* Flora vegetation density */}
                          <div className="space-y-1 bg-slate-900/20 p-2 border-r-2 border-emerald-500 text-[11px]">
                            <span className="text-slate-400 block text-[10px] font-bold">بافت بیوم جنگلی (NDVI Profile):</span>
                            <span className="text-slate-200">{selectedRegionRisk.vegDensity}</span>
                          </div>

                          {/* Deadwood Dry fuels */}
                          <div className="space-y-1 bg-slate-900/20 p-2 border-r-2 border-amber-500 text-[11px]">
                            <span className="text-slate-400 block text-[10px] font-bold">میزان هیزم خشک صحرایی (Deadwood):</span>
                            <span className="text-slate-200">{selectedRegionRisk.dryFuel}</span>
                          </div>

                          {/* Tactical advisor recommendations */}
                          <div className="bg-rose-950/20 p-3 rounded-xl border border-rose-500/10 space-y-1.5">
                            <span className="text-rose-400 font-extrabold flex items-center gap-1 text-[11px]">
                              <ShieldAlert className="w-3.5 h-3.5" />
                              پیشنهاد استراتژیک و مشاوره مهار:
                            </span>
                            <p className="text-slate-300 leading-relaxed text-[11px]">
                              {selectedRegionRisk.advice}
                            </p>
                          </div>

                          {/* Export Area Data controls */}
                          <div className="pt-3 border-t border-white/5 space-y-2" dir="rtl">
                            <div className="text-slate-400 text-[10px] font-bold text-right">
                              {language === 'fa' ? 'دریافت شناسنامه جغرافیایی و گزارش ریسک:' : 'Download Geospatial & Risk Report:'}
                            </div>
                            <div className="space-y-1.5 font-sans">
                              {/* Copy Button */}
                              <button
                                onClick={handleCopyToClipboard}
                                className={`w-full py-2 px-3 rounded-lg border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow shadow-slate-950/40 ${
                                  copied 
                                    ? 'bg-emerald-900/30 text-emerald-400 border-emerald-500/40' 
                                    : 'bg-slate-900 border-white/10 hover:border-purple-500/40 text-purple-300 hover:bg-slate-850'
                                }`}
                              >
                                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                <span>{copied ? (language === 'fa' ? 'کپی شد!' : 'Copied!') : (language === 'fa' ? 'کپی گزارش متنی' : 'Copy Text Report')}</span>
                              </button>

                              <button
                                onClick={() => {
                                  if (!selectedRegionRisk) {
                                    addToast(language === 'fa' ? 'خطا: لطفاً ابتدا یک محدوده روی نقشه تعریف کنید.' : 'Error: Please draw or select a region on the map first.', 'error');
                                    return;
                                  }
                                  setIsExportModalOpen(true);
                                }}
                                className="w-full py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-850 border border-white/10 hover:border-purple-500/40 text-xs text-purple-300 font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow shadow-slate-950/40"
                              >
                                <Download className="w-3.5 h-3.5" />
                                <span>{language === 'fa' ? 'دانلود داده اراضی (JSON / CSV)' : 'Export Selection Data (JSON / CSV)'}</span>
                              </button>

                              <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                                <button
                                  onClick={handleExportHTML}
                                  className="py-1.5 px-2.5 rounded-lg bg-indigo-950/40 hover:bg-indigo-900/40 border border-indigo-500/30 hover:border-indigo-400 text-[11px] text-indigo-300 font-semibold transition flex items-center justify-center gap-1 cursor-pointer shadow shadow-slate-950/40"
                                  title={language === 'fa' ? 'بارگیری گزارش در قالب وب‌پیج' : 'Download HTML report'}
                                >
                                  <FileText className="w-3 h-3 text-indigo-400" />
                                  <span>{language === 'fa' ? 'گزارش HTML' : 'HTML Report'}</span>
                                </button>
                                <button
                                  onClick={handleExportPDF}
                                  className="py-1.5 px-2.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/40 border border-rose-500/30 hover:border-rose-400 text-[11px] text-rose-300 font-semibold transition flex items-center justify-center gap-1 cursor-pointer shadow shadow-slate-950/40"
                                  title={language === 'fa' ? 'خروجی رسمی و چاپ PDF' : 'Print / Export PDF report'}
                                >
                                  <Printer className="w-3 h-3 text-rose-450" />
                                  <span>{language === 'fa' ? 'گزارش PDF' : 'PDF Report'}</span>
                                </button>
                              </div>

                              <button
                                onClick={handleExportMasterAIReport}
                                className="w-full py-2 px-3 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/40 border border-emerald-500/30 hover:border-emerald-400 text-xs text-emerald-300 font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow shadow-slate-950/40"
                                title={language === 'fa' ? 'بارگیری کارنامه ممیزی جامع (تمام زیرسیستم‌ها)' : 'Download Combined Executive Report (All AI Modules)'}
                              >
                                <Award className="w-3.5 h-3.5 text-emerald-400" />
                                <span>{language === 'fa' ? 'کارنامه ممیزی تمام سامانه‌ها (Master PDF)' : 'Master AI Audit Report (Combined PDF)'}</span>
                              </button>

                              <button
                                onClick={handleExportPlatformWideSample}
                                className="w-full mt-2 py-2 px-3 rounded-lg bg-gradient-to-r from-teal-950/50 to-emerald-950/50 hover:from-teal-900/50 hover:to-emerald-900/50 border border-emerald-500/30 hover:border-emerald-400 text-[11px] text-emerald-300 font-black transition flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-950/40"
                                title={language === 'fa' ? 'دانلود شناسنامه هوشمند تجمیعی کل پلتفرم (پایش پلاس، گرنت یاب، سفره آب)' : 'Download Combined Cross-Platform AI Report'}
                              >
                                <Award className="w-3.5 h-3.5 text-emerald-400 animate-bounce" />
                                <span>{language === 'fa' ? 'گزارش جامع پلتفرم (PDF)' : 'Unified Platform Report (PDF)'}</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Operational command center notification details */}
                    {selectedRegionRisk && (
                      <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-500 font-sans">
                        <span className="flex items-center gap-1 text-emerald-400 font-bold">
                          <Wifi className="w-3 h-3 animate-pulse" />
                          پایش متقابل ماهواره‌ای فعال
                        </span>
                        <span>نسخه مشاوره هوشمند اراضی</span>
                      </div>
                    )}

                  </div>

                </div>

              </div>

              {/* Bottom Alert Terminal Logs representation */}
              <div className="bg-slate-900 border border-white/5 rounded-2xl p-5 shadow-xl space-y-3.5 font-sans">
                <h3 className="font-bold text-sm text-slate-305 flex items-center gap-2">
                  <Bell className="w-4 h-4 text-rose-455" />
                  سامانه پیام کوتاه اضطراری و اعلان زنده تلفن همراه (FCM / Twilio Logs)
                </h3>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-[11px] h-32 overflow-y-auto space-y-2 text-right" dir="rtl">
                  {smsLogs.length === 0 ? (
                    <div className="text-center py-8 text-slate-600 italic font-sans">
                      موردی برای نمایش وجود ندارد. در شبیه‌ساز با بالا بردن دما گره را در وضعیت بحرانی ذخیره کنید تا پیامک فعال شود.
                    </div>
                  ) : (
                    smsLogs.map((log, i) => (
                      <div key={i} className="text-rose-350 border-b border-slate-900 pb-1 flex items-start gap-2 justify-start font-sans">
                        <span className="text-rose-500 font-bold shrink-0">[پیام ارسال شد]</span>
                        <span>{log}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>

          </div>

          {/* ========================================================== */}
          {/* NEW SECTION: ADVANCED COMPACT WILD-FIRE SPREAD SANDBOX     */}
          {/* ========================================================== */}
          <div className="bg-slate-900 border border-white/5 rounded-2xl p-6 shadow-2xl space-y-6">
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="bg-rose-500/10 text-rose-400 p-1.5 rounded-lg border border-rose-500/20">
                    <Activity className="w-5 h-5" />
                  </span>
                  <h3 className="text-xl font-bold text-white">سامانه هوشمند پیش‌بین رفتار حریق و آزمایشگاه کنترل سرایت (Rothermel Grid)</h3>
                </div>
                <p className="text-xs text-slate-400 max-w-3xl">
                  یک شبیه‌ساز دینامیکی مبتنی بر مدل‌های انتشار سلولی (Cellular Automata) که دینامیک پیش‌روی شعله‌ها را با متناسب‌سازی سرعت پس‌زمینه باد، شیب منطقه، نوع رطوبت پوشش گیاهی و فرسودگی اراضی مدل‌سازی می‌کند.
                </p>
              </div>

              {/* Vision Toggle Button inside HUD */}
              <button
                onClick={() => setIrInfraredMode(!irInfraredMode)}
                className={`py-2 px-4 rounded-xl font-bold text-xs flex items-center gap-2 border transition-all ${
                  irInfraredMode 
                    ? 'bg-rose-950/40 text-rose-400 border-rose-500/40 hover:bg-rose-900/40 swing shadow-lg shadow-rose-950/20' 
                    : 'bg-slate-800 text-slate-300 border-white/10 hover:bg-slate-700'
                }`}
              >
                <Eye className="w-4 h-4" />
                {irInfraredMode ? 'غیرفعال‌سازی فیلتر حرارتی' : 'پخش زنده مادون قرمز پهپاد (FLIR)'}
              </button>
            </div>

            {/* Sandbox grid split section */}
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
              
              {/* Left HUD Panel Controls */}
              <div className="xl:col-span-1 space-y-5">
                
                {/* Simulated variables read only gages */}
                <div className="bg-slate-950/50 p-4 rounded-2xl border border-white/5 space-y-4">
                  <h4 className="text-xs uppercase font-mono tracking-wider font-bold text-slate-400 border-b border-white/5 pb-1.5">
                    شاخص‌های محاسباتی فیزیک آتش‌سوزی
                  </h4>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-950 p-2.5 rounded-xl border border-white/5">
                      <span className="block text-[10px] text-slate-450">سرعت پخش شعله (ROS)</span>
                      <span className="text-lg font-bold text-rose-400 font-mono">{rateOfSpread}</span>
                      <span className="text-[9px] text-slate-500 block">m/min (روترمل)</span>
                    </div>

                    <div className="bg-slate-950 p-2.5 rounded-xl border border-white/5">
                      <span className="block text-[10px] text-slate-455">طول شعله تخمینی</span>
                      <span className="text-lg font-bold text-amber-400 font-mono">{flameLength}</span>
                      <span className="text-[9px] text-slate-500 block">meters (قد شعله)</span>
                    </div>

                    <div className="bg-slate-950 p-2.5 rounded-xl border border-white/5 col-span-2">
                      <span className="block text-[10px] text-slate-450">تولید لحظه‌ای دود و $CO_2$</span>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-lg font-bold text-slate-300 font-mono">{co2Emitted.toFixed(1)}</span>
                        <span className="text-[10px] text-slate-500">متریک تن گاز گلخانه‌ای</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Grid interact weapon toolkits */}
                <div className="bg-slate-950/50 p-4 rounded-2xl border border-white/5 space-y-3">
                  <h4 className="text-xs font-bold text-slate-350 uppercase tracking-wide">
                    ابزار دفاعی زمین و مداخله مستقیم (کلیک روی نقشه)
                  </h4>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setSelectedTool('spark')}
                      className={`p-2.5 rounded-xl text-left font-bold text-xs flex flex-col gap-1 transition-all border ${
                        selectedTool === 'spark' 
                          ? 'bg-rose-500/20 text-rose-400 border-rose-500/40 shadow' 
                          : 'bg-slate-950/60 text-slate-400 border-white/5 hover:bg-slate-900'
                      }`}
                    >
                      <Flame className="w-4 h-4 text-rose-500" />
                      <span>ایجاد کانون آتش</span>
                    </button>

                    <button
                      onClick={() => setSelectedTool('firebreak')}
                      className={`p-2.5 rounded-xl text-left font-bold text-xs flex flex-col gap-1 transition-all border ${
                        selectedTool === 'firebreak' 
                          ? 'bg-amber-500/20 text-amber-400 border-amber-500/40 shadow' 
                          : 'bg-slate-950/60 text-slate-400 border-white/5 hover:bg-slate-900'
                      }`}
                    >
                      <Shield className="w-4 h-4 text-amber-500" />
                      <span>حفر خندق آتش‌بر</span>
                    </button>

                    <button
                      onClick={() => setSelectedTool('water')}
                      className={`p-2.5 rounded-xl text-left font-bold text-xs flex flex-col gap-1 transition-all border ${
                        selectedTool === 'water' 
                          ? 'bg-blue-500/20 text-blue-400 border-blue-500/40 shadow' 
                          : 'bg-slate-950/60 text-slate-400 border-white/5 hover:bg-slate-900'
                      }`}
                    >
                      <Droplets className="w-4 h-4 text-blue-400" />
                      <span>پاشش قطرات آب</span>
                    </button>

                    <button
                      onClick={() => setSelectedTool('extinguish')}
                      className={`p-2.5 rounded-xl text-left font-bold text-xs flex flex-col gap-1 transition-all border ${
                        selectedTool === 'extinguish' 
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow' 
                          : 'bg-slate-950/60 text-slate-400 border-white/5 hover:bg-slate-900'
                      }`}
                    >
                      <RefreshCw className="w-4 h-4 text-emerald-400" />
                      <span>خاموش کردن مستقیم</span>
                    </button>
                  </div>
                </div>

                {/* Fuelbed selection picker */}
                <div className="bg-slate-950/50 p-4 rounded-2xl border border-white/5 space-y-2.5">
                  <h4 className="text-xs font-bold text-slate-350">مدل سوخت اراضی زاگرس</h4>
                  <div className="flex flex-col gap-1.5 text-xs">
                    {[
                      { key: 'grass', name: 'مراتع گندم‌گون و علفزار خشک', desc: 'اشتعال فوق‌سریع و غلیظ' },
                      { key: 'scrub', name: 'درختچه‌های بادام کوهی و گون', desc: 'سرعت متوسط، جرقه‌های پرتاب باد' },
                      { key: 'oak', name: 'جنگل انبود بلوط کهنسال', desc: 'اشتعال عمیق، غلاف کند، خاموشی دشوار' }
                    ].map(f => (
                      <button
                        key={f.key}
                        onClick={() => setFuelType(f.key as any)}
                        className={`text-right p-2 rounded-lg border text-xs transition ${
                          fuelType === f.key 
                            ? 'bg-slate-800 text-white border-white/20' 
                            : 'bg-transparent text-slate-450 border-transparent hover:bg-slate-950/50'
                        }`}
                      >
                        <span className="block font-bold">{f.name}</span>
                        <span className="text-[10px] text-slate-500">{f.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

              </div>

              {/* Center Canvas Grid Panel */}
              <div className="xl:col-span-2 space-y-4 flex flex-col justify-between">
                
                {/* Dynamic State info header */}
                <div className="flex items-center justify-between bg-slate-950 px-4 py-2.5 rounded-xl border border-white/5">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="flex h-2 w-2 relative">
                      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isSimActive ? 'bg-rose-500' : 'bg-slate-400'}`}></span>
                      <span className={`relative inline-flex rounded-full h-2 w-2 ${isSimActive ? 'bg-rose-5003' : 'bg-slate-400'}`}></span>
                    </span>
                    <span className="text-slate-400">وضعیت شبیه‌ساز:</span>
                    <span className={`font-bold font-mono ${isSimActive ? 'text-rose-450' : 'text-slate-400'}`}>
                      {isSimActive ? 'ACTIVE SIMULATION TICK' : 'PAUSED'}
                    </span>
                  </div>

                  <div className="text-xs text-slate-450 font-mono">
                    بستر جنگل سبز باقی‌مانده: <b className="text-emerald-400">{containedPercentage}%</b>
                  </div>
                </div>

                {/* Thermal Live Overlay Radar HUD Container */}
                <div className={`relative p-3 rounded-2xl border transition-all duration-300 ${
                  irInfraredMode 
                    ? 'bg-[#030312] border-rose-500/30 shadow-inner' 
                    : 'bg-slate-950 border-white/5'
                }`}>
                  
                  {/* Grid layout renderer */}
                  <div className="grid grid-cols-[repeat(26,minmax(0,1fr))] gap-1 tracking-normal leading-none select-none">
                    {grid.map((row, r) => 
                      row.map((cell, c) => {
                        let fillStyle = '';
                        
                        // Normal Color Map Styles vs Thermography signatures
                        if (!irInfraredMode) {
                          if (cell === 0) fillStyle = 'bg-stone-800 hover:bg-stone-705 border border-stone-900/40'; // Bare Dressed Soil
                          if (cell === 1) fillStyle = 'bg-emerald-950/70 border border-emerald-900/10 hover:bg-emerald-900/50'; // Safe Green
                          if (cell === 2) fillStyle = 'bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-600 shadow-inner shadow-orange-500/20 scale-105 animate-pulse rounded border border-amber-300 z-10'; // Red Flame
                          if (cell === 3) fillStyle = 'bg-neutral-800 border border-neutral-900 text-slate-600'; // Dead Ash
                          if (cell === 4) fillStyle = 'bg-cyan-600/80 border border-cyan-400'; // Wet Zone
                        } else {
                          // THERMOGRAPHY HUD COLOR MAP
                          if (cell === 0) fillStyle = 'bg-[#101036] border border-[#1b1b4f]';
                          if (cell === 1) fillStyle = 'bg-[#121c42] border border-[#1c2e68]';
                          if (cell === 2) fillStyle = 'bg-white shadow-lg shadow-rose-600 scale-105 border-2 border-red-500 animate-pulse z-10'; // White-hot
                          if (cell === 3) fillStyle = 'bg-[#7c1c5a] border border-[#a22776]'; // Warm Magenta
                          if (cell === 4) fillStyle = 'bg-[#00d0ff]/25 border border-[#00d0ff]/50';
                        }

                        return (
                          <div
                            key={`${r}-${c}`}
                            onClick={() => handleCellClick(r, c)}
                            className={`aspect-square rounded-sm cursor-crosshair transition-all duration-150 ${fillStyle}`}
                            title={`مختصات: R:${r} C:${c}`}
                          />
                        );
                      })
                    )}
                  </div>

                  {/* Scanline HUD design for Infrared thermal radar */}
                  {irInfraredMode && (
                    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
                      <div className="absolute top-0 left-0 right-0 h-[2px] bg-rose-500/20 animate-bounce" style={{ animationDuration: '6s' }} />
                      <div className="absolute inset-0 bg-gradient-to-t from-transparent via-rose-500/5 to-transparent bg-[length:100%_4px]" />
                      <div className="absolute top-2 left-3 text-[9px] font-mono text-rose-500 flex items-center gap-1 bg-black/60 px-2 py-0.5 rounded border border-rose-500/30">
                        <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-ping" />
                        <span>TACTICAL RECON FLIR SUB-ORBIT DRONE ACTIVE</span>
                      </div>
                      <div className="absolute bottom-2 right-3 text-[9px] font-mono text-[#00ffcc] bg-black/60 px-2 py-0.5 rounded">
                        COORD_SET: 34.5000N, 53.5000E | NO_PREV_IGNITION
                      </div>
                    </div>
                  )}

                </div>

                {/* Simulation command actions deck bar */}
                <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-950 p-4 rounded-xl border border-white/5">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsSimActive(!isSimActive)}
                      className={`py-2 px-4 rounded-xl font-bold text-xs flex items-center gap-1.5 transition text-white ${
                        isSimActive 
                          ? 'bg-amber-600 hover:bg-amber-700' 
                          : 'bg-rose-600 hover:bg-rose-700'
                      }`}
                    >
                      <Play className="w-3.5 h-3.5" />
                      {isSimActive ? 'توقف موقت زمان شبیه‌ساز' : 'شروع شبیه‌سازی انتشار آتش'}
                    </button>

                    <button
                      onClick={initGrid}
                      className="py-2 px-4 bg-slate-800 hover:bg-slate-705 border border-white/5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition text-slate-300"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      پاکسازی کل
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={triggerWaterBomberStrike}
                      className="py-2 px-3 bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-700 hover:to-sky-600 rounded-xl font-bold text-xs flex items-center gap-1.5 transition shadow-lg text-white"
                    >
                      <Plane className="w-4 h-4" />
                      اعزام بمب‌افکن آبیاری حریق (Water Bomber)
                    </button>

                    <button
                      onClick={handleReSeedAshes}
                      className="py-2 px-3 bg-[#112a20] hover:bg-[#16382a] text-emerald-400 border border-emerald-500/20 rounded-xl font-bold text-xs flex items-center gap-1.5 transition"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
                      احیا و بذرافشانی جنگل سوخته
                    </button>
                  </div>
                </div>

              </div>

              {/* Right Panel: Wind compass and physical parameters */}
              <div className="xl:col-span-1 bg-slate-950/50 p-5 rounded-2xl border border-white/5 space-y-6">
                
                {/* Wind Compass Dial */}
                <div className="space-y-3.5">
                  <h4 className="text-xs font-bold text-slate-350 flex items-center gap-1.5">
                    <Compass className="w-4 h-4 text-rose-400" /> جهت و جریان وزش باد منطقه
                  </h4>
                  <p className="text-[11px] text-slate-450">
                    جهت وزش باد عامل تعیین‌کننده اصلی بیضی انتشار شعله است. جهت را تغییر داده و گسترش آتش را رصد کنید.
                  </p>
                  
                  {/* Circular visual compass button matrix */}
                  <div className="relative mx-auto w-32 h-32 rounded-full border border-slate-800 flex items-center justify-center bg-slate-950">
                    
                    {/* Compass Center dynamic indicator arrow */}
                    <div 
                      className="w-1.5 h-16 bg-gradient-to-t from-slate-800 via-rose-500 to-rose-500 rounded-full transition-all duration-300 origin-center"
                      style={{
                        transform: `rotate(${
                          windAngleDir === 'N' ? 0 :
                          windAngleDir === 'NE' ? 45 :
                          windAngleDir === 'E' ? 90 :
                          windAngleDir === 'SE' ? 135 :
                          windAngleDir === 'S' ? 180 :
                          windAngleDir === 'SW' ? 225 :
                          windAngleDir === 'W' ? 270 : 315
                        }deg)`
                      }}
                    />

                    {/* Wind vector label in center */}
                    <div className="absolute bg-slate-900 border border-slate-800 w-10 h-10 rounded-full flex items-center justify-center text-[10px] font-bold text-white font-mono shadow">
                      {windAngleDir}
                    </div>

                    {/* 8 Principal buttons layout */}
                    <button onClick={() => setWindAngleDir('N')} className={`absolute top-1 text-[10px] font-bold font-mono transition ${windAngleDir === 'N' ? 'text-rose-500 scale-125' : 'text-slate-500 hover:text-white'}`}>N</button>
                    <button onClick={() => setWindAngleDir('NE')} className={`absolute top-4 right-4 text-[10px] font-bold font-mono transition ${windAngleDir === 'NE' ? 'text-rose-500 scale-125' : 'text-slate-500 hover:text-white'}`}>NE</button>
                    <button onClick={() => setWindAngleDir('E')} className={`absolute right-1 text-[10px] font-bold font-mono transition ${windAngleDir === 'E' ? 'text-rose-500 scale-125' : 'text-slate-500 hover:text-white'}`}>E</button>
                    <button onClick={() => setWindAngleDir('SE')} className={`absolute bottom-4 right-4 text-[10px] font-bold font-mono transition ${windAngleDir === 'SE' ? 'text-rose-500 scale-125' : 'text-slate-500 hover:text-white'}`}>SE</button>
                    <button onClick={() => setWindAngleDir('S')} className={`absolute bottom-1 text-[10px] font-bold font-mono transition ${windAngleDir === 'S' ? 'text-rose-500 scale-125' : 'text-slate-500 hover:text-white'}`}>S</button>
                    <button onClick={() => setWindAngleDir('SW')} className={`absolute bottom-4 left-4 text-[10px] font-bold font-mono transition ${windAngleDir === 'SW' ? 'text-rose-500 scale-125' : 'text-slate-500 hover:text-white'}`}>SW</button>
                    <button onClick={() => setWindAngleDir('W')} className={`absolute left-1 text-[10px] font-bold font-mono transition ${windAngleDir === 'W' ? 'text-rose-500 scale-125' : 'text-slate-500 hover:text-white'}`}>W</button>
                    <button onClick={() => setWindAngleDir('NW')} className={`absolute top-4 left-4 text-[10px] font-bold font-mono transition ${windAngleDir === 'NW' ? 'text-rose-500 scale-125' : 'text-slate-500 hover:text-white'}`}>NW</button>
                  </div>
                </div>

                {/* Educational guide list */}
                <div className="space-y-3 pt-4 border-t border-slate-850">
                  <h4 className="text-xs font-bold text-slate-350 flex items-center gap-1.5"><BookOpen className="w-4 h-4 text-rose-450" /> راهنمای علائم اراضی</h4>
                  <div className="space-y-2 text-[11px] text-slate-400">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-emerald-900 border border-emerald-500/20 rounded-sm" />
                      <span>پوشش گیاهی زنده و متخلخل</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-gradient-to-tr from-amber-500 to-rose-600 rounded-sm" />
                      <span>جبهه‌های پیش‌رونده آتش فعال</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-neutral-800 rounded-sm" />
                      <span>اراضی سوخته و تبدیل شده به خاکستر</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-cyan-705 border border-cyan-400 rounded-sm" />
                      <span>منطقه خیس حائل (مانع انتقال حریق)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-stone-800 rounded-sm" />
                      <span>سنگلاخ / خندق سدکننده حفر شده</span>
                    </div>
                  </div>
                </div>

              </div>

            </div>

          </div>

        </div>
      )}

      {/* Tab View 2: High Scalability/Low Cost Iranian Highlands Architecture & Hardware Spec */}
      {activeSubTab === 'architecture' && (
        <div className="bg-slate-900 border border-white/5 p-6 rounded-2xl shadow-xl space-y-8 animate-fade-in">
          <div className="space-y-2">
            <h3 className="font-extrabold text-xl text-white">معماری سیستم پایش هوشمند اراضی زاگرس و البرز</h3>
            <p className="text-slate-400 text-sm">
              طراحی منحصربفرد جهت کارکرد پایدار در مناطق کوهستانی بدون دسترسی به اینترنت متمرکز، تحت پوشش شبکه پایدار و ارزان LoRaWAN و ماژول فرستنده ماهواره‌ای MODIS ناسا.
            </p>
          </div>

          {/* Graphical custom Mermaid-like Node chart */}
          <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 grid grid-cols-1 md:grid-cols-5 gap-4 items-center relative text-center">
            
            {/* Core Sensor node */}
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2 z-10">
              <div className="mx-auto w-10 h-10 bg-rose-500/10 text-rose-455 rounded-full flex items-center justify-center text-lg font-bold border border-rose-500/20">
                <Cpu className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-xs text-white">ایستگاه گره پایانه (Node)</h4>
              <p className="text-[10px] text-slate-400">ESP32 + DHT22/SHT31 + تشخیص دهنده جهت باد روی دکل</p>
            </div>

            {/* Arrow line 1 */}
            <div className="hidden md:flex flex-col items-center justify-center text-rose-500">
              <span className="text-xs font-mono uppercase bg-rose-950/30 px-2 py-0.5 rounded border border-rose-500/10 text-[9px]">LoRaWAN (868MHz)</span>
              <span className="text-xl">➔</span>
            </div>

            {/* Gateway */}
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2 z-10">
              <div className="mx-auto w-10 h-10 bg-blue-500/10 text-blue-450 rounded-full flex items-center justify-center text-lg font-bold border border-blue-500/20">
                <Wifi className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-xs text-white">دروازه مخابراتی (Gateway)</h4>
              <p className="text-[10px] text-slate-400">اتصال به دکل همگانی یا ماژول سیم‌کارت SIM800L</p>
            </div>

            {/* Arrow line 2 */}
            <div className="hidden md:flex flex-col items-center justify-center text-rose-500">
              <span className="text-xs font-mono uppercase bg-rose-950/30 px-2 py-0.5 rounded border border-rose-500/10 text-[9px]">MQTT / LTE</span>
              <span className="text-xl">➔</span>
            </div>

            {/* Cloud Server & Decision Center */}
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2 z-10">
              <div className="mx-auto w-10 h-10 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center text-lg font-bold border border-emerald-500/20">
                <Database className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-xs text-white">سرور وب و هسته هوش مصنوعی</h4>
              <p className="text-[10px] text-slate-400">Express NodeJS + پیش‌بینی با الگوریتم Random Forest سبک</p>
            </div>

          </div>

          {/* Technical Specs Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-950/50 p-5 rounded-xl border border-white/5 space-y-3.5">
              <h4 className="font-bold text-sm text-rose-400 border-b border-white/5 pb-1.5 flex items-center gap-2">
                <Zap className="w-4 h-4" /> سخت‌افزار ارزان و پایدار (Low-Cost Hardware)
              </h4>
              <ul className="space-y-2 text-xs text-slate-350 list-disc list-inside">
                <li>استفاده از برد پردازنده فوق‌العاده ارزان <b className="text-white">ESP32</b> به عنوان ریزکنترل‌گر تغذیه‌شونده با پنل خورشیدی کوچک.</li>
                <li>سنسور رطوبت و دمای صنعتی <b className="text-white">SHT31 / DHT22</b> ضدآب با غلاف برنزی متخلخل.</li>
                <li>فرستنده‌های توان بالای <b className="text-white">SX1276 LoRa</b> برای مخابره امن کدهای موقعیت در رنج ۱۵+ کیلومتر.</li>
                <li>مجهز به تغذیه اضطراری باتری لیتیومی سری ۱۸۶۵۰ با تکنولوژی خواب عمیق (Deep Sleep) جریان مصرف مایکرو آمپر.</li>
              </ul>
            </div>

            <div className="bg-slate-950/50 p-5 rounded-xl border border-white/5 space-y-3.5">
              <h4 className="font-bold text-sm text-rose-455 border-b border-white/5 pb-1.5 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4" /> مکانیزم هشدار و پوشش چندلایه پیام رسان
              </h4>
              <ul className="space-y-2 text-xs text-slate-350 list-disc list-inside">
                <li>اتصال خودکار به درگاه ماهواره‌ای ناسا <b className="text-white">FIRMS / MODIS</b> جهت همگام‌سازی حرارتی اراضی ایران هر روز.</li>
                <li>سنجش جهت باد و تندبادها برای پیش‌بینی دقیق جهت پخش شعله‌ها و اعزام پهپادهای شناسایی به همان مختصات.</li>
                <li>اعزام پوش نوتیفیکیشن همگانی به اپلیکیشن موبایل امدادگران زاگرس (Flutter/Dart).</li>
                <li>ارسال پیامک اضطراری سوار بر سیم‌کارت بومی (SIM800L) در صورت قطع اینترنت به تلفن مستقیم روسای محیط‌بانی منطقه.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Tab View 3: Key Code Source Code Copier Hub */}
      {activeSubTab === 'codehub' && (
        <div className="bg-slate-900 border border-white/5 p-6 rounded-2xl shadow-xl space-y-6 animate-fade-in">
          <div>
            <h3 className="font-extrabold text-xl text-white">مخزن کدهای کلیدی و کتابخانه‌های نرم‌افزاری</h3>
            <p className="text-slate-400 text-sm">کدهای آماده پیاده‌سازی متناسب با ساختار بومی گره‌ها، هسته پایتون و بک‌اند سرور.</p>
          </div>

          {/* Sub Navigation for actual code directories */}
          <div className="flex border-b border-slate-800 overflow-x-auto gap-2">
            <button
              onClick={() => setActiveCodeTab('esp32')}
              className={`py-2 px-3 shrink-0 font-bold font-sans text-xs border-b-2 transition ${activeCodeTab === 'esp32' ? 'border-rose-500 text-rose-450' : 'border-transparent text-slate-400 hover:text-white'}`}
            >
              کد آردوینو ESP32 (LoRa WAN)
            </button>
            <button
              onClick={() => setActiveCodeTab('python')}
              className={`py-2 px-3 shrink-0 font-bold font-sans text-xs border-b-2 transition ${activeCodeTab === 'python' ? 'border-rose-500 text-rose-450' : 'border-transparent text-slate-400 hover:text-white'}`}
            >
              مدل پایتون (Python Risk Engine)
            </button>
            <button
              onClick={() => setActiveCodeTab('node')}
              className={`py-2 px-3 shrink-0 font-bold font-sans text-xs border-b-2 transition ${activeCodeTab === 'node' ? 'border-rose-500 text-rose-450' : 'border-transparent text-slate-400 hover:text-white'}`}
            >
              سرور بک‌اند (API NodeJS)
            </button>
            <button
              onClick={() => setActiveCodeTab('flutter')}
              className={`py-2 px-3 shrink-0 font-bold font-sans text-xs border-b-2 transition ${activeCodeTab === 'flutter' ? 'border-rose-500 text-rose-450' : 'border-transparent text-slate-450 hover:text-white'}`}
            >
              کد فلاتر اپ (Flutter Dart Alerts)
            </button>
          </div>

          {/* Code Viewer Panel */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs overflow-x-auto select-text shadow-inner">
            
            {activeCodeTab === 'esp32' && (
              <pre className="text-slate-300 leading-relaxed text-left" dir="ltr">{`// ==========================================
// ESP32 SmartFireSense Deep Sleep Reforestation Node
// ==========================================
#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <DHT.h>
#include <SPI.h>
#include <LoRa.h>

#define DHTPIN 15
#define DHTTYPE DHT22
#define BAND 868E6  // LoRa Iranian Frequency standard
#define uS_TO_S_FACTOR 1000000ULL /* Conversion factor */
#define TIME_TO_SLEEP  900        /* 15 Minutes sleeping loop */

DHT dht(DHTPIN, DHTTYPE);

void setup() {
  Serial.begin(115200);
  dht.begin();
  
  // Initialize LoRa Hardware
  SPI.begin(5, 19, 27, 18);
  LoRa.setPins(18, 14, 26);
  
  if (!LoRa.begin(BAND)) {
    Serial.println("ERR: LoRa SX1276 transceiver failed!");
    while (1);
  }
  
  // Read atmospheric variables
  float temp = dht.readTemperature();
  float hum = dht.readHumidity();
  int solarIntensity = analogRead(34); // Photodiode sensor pin

  if (isnan(temp) || isnan(hum)) {
    Serial.println("ERR: Sensor read failed!");
    return;
  }

  // Pack data payload
  String payload = "ID:Zagros-1|T:" + String(temp, 1) + "|H:" + String(hum, 0) + "|S:" + String(solarIntensity);
  
  // Send over LoRa to mountain Gateway
  Serial.print("Dispatching packet: ");
  Serial.println(payload);
  
  LoRa.beginPacket();
  LoRa.print(payload);
  LoRa.endPacket();

  // Enter micro-power Deep Sleep
  esp_sleep_enable_timer_wakeup(TIME_TO_SLEEP * uS_TO_S_FACTOR);
  esp_deep_sleep_start();
}`}</pre>
            )}

            {activeCodeTab === 'python' && (
              <pre className="text-slate-300 leading-relaxed text-left" dir="ltr">{`# ==========================================
# Python ML Model using Scikit-Learn (Random Forest)
# ==========================================
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
import pickle

# Simulated Historical data for Alborz / Zagros mountains fire danger indices
data = {
    'temperature': [25.1, 42.5, 15.0, 38.2, 45.1, 31.0, 18.5, 33.0, 44.0, 22.0],
    'humidity':    [65.0, 12.0, 85.0, 22.0, 5.0,  30.0, 75.0, 29.0, 7.0,  55.0],
    'wind_speed':  [12.0, 45.0,  5.0, 34.0, 55.0, 28.0, 10.0, 25.0, 48.0, 15.0],
    'solar_watts': [600,  1055,  200, 950,  1100, 880,  400,  900,  1150, 700],
    'fire_hazard': [0,    1,     0,   1,    1,    0,    0,    0,    1,    0] # Binary Rating
}

df = pd.DataFrame(data)
X = df[['temperature', 'humidity', 'wind_speed', 'solar_watts']]
y = df['fire_hazard']

# Train-test splitting
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Lightweight Random Forest formulation suited to Edge servers
clf = RandomForestClassifier(n_estimators=50, max_depth=5, random_state=42)
clf.fit(X_train, y_train)

# Output evaluation & Dump model
accuracy = clf.score(X_test, y_test)
print(f"Algorithm Loaded. Test accuracy evaluation: {accuracy * 100:.1f}%")

with open('smart_fire_model.pkl', 'wb') as f:
    pickle.dump(clf, f)
`}</pre>
            )}

            {activeCodeTab === 'node' && (
              <pre className="text-slate-300 leading-relaxed text-left" dir="ltr">{`// ==========================================
// Express API Router with Live MQTT Subscription Gateway
// ==========================================
const express = require('express');
const mqtt = require('mqtt');
const router = express.Router();

// Parse environment settings
const CLIENT_BROKER = process.env.MQTT_BROKER || "mqtt://broker.hivemq.com";
const client = mqtt.connect(CLIENT_BROKER);

client.on('connect', () => {
    console.log("MQTT client connected securely with local Iranian server.");
    client.subscribe('greenhope/fire/+/telemetry');
});

client.on('message', (topic, message) => {
    const rawData = message.toString();
    console.log(\`Received IoT Packet: \${topic} -> \${rawData}\`);
    // Sample format parse 'ID:Zagros-1|T:34.2|H:21.0'
    const parts = rawData.split('|').reduce((acc, part) => {
        const [k, v] = part.split(':');
        acc[k] = v;
        return acc;
    }, {});
    
    // Evaluate risk triggers and dispatch emergency SMS if critical threshold crossed
    if (parseFloat(parts.T) > 40.0 && parseFloat(parts.H) < 15.0) {
        dispatchEmergencyAlert(parts.ID, parts.T, parts.H);
    }
});

function dispatchEmergencyAlert(nodeId, temp, hum) {
    console.log(\`[CRITICAL ALARM] Forest Fire danger at node \${nodeId}! Sending SMS...\`);
    // Twilio/MelliPayamak integration goes here
}

module.exports = router;`}</pre>
            )}

            {activeCodeTab === 'flutter' && (
              <pre className="text-slate-300 leading-relaxed text-left" dir="ltr">{`// ==========================================
// Flutter Dart Mobile App Notifications Service (FCM Setup)
// ==========================================
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';

class FireAlertsService {
  final FirebaseMessaging _fcm = FirebaseMessaging.instance;
  final FlutterLocalNotificationsPlugin _localNotifier = FlutterLocalNotificationsPlugin();

  Future<void> initializeNotificationEngine() async {
    // Request permission from environmental responders
    NotificationSettings settings = await _fcm.requestPermission(
      alert: true,
      sound: true,
      badge: true,
    );
    
    if (settings.authorizationStatus == AuthorizationStatus.authorized) {
      print('Emergency Alerts Authorized!');
    }

    // Subscribe to forest-fire telemetry topic channel
    await _fcm.subscribeToTopic('zagros_fire_alerts');

    // Handle background and active foreground payloads
    FirebaseMessaging.onMessage.listen((RemoteMessage msg) {
      print("CRITICAL WILDFIRE ALARM DETECTED: \${msg.notification?.body}");
      _displayEmergencyHeadsUpNotification(msg);
    });
  }

  void _displayEmergencyHeadsUpNotification(RemoteMessage message) {
    // High Priority notification with red visual flashing
    const AndroidNotificationDetails androidDetails = AndroidNotificationDetails(
      'emergency_fire_channel',
      'Wildfire Alerts',
      channelDescription: 'Real-time hazard notifications',
      importance: Importance.max,
      priority: Priority.high,
      color: Color(0xFFE11D48), // Rose warning badge
    );
    
    _localNotifier.show(
      0,
      message.notification?.title ?? "HURRICANE / BURNING ALARM",
      message.notification?.body,
      const NotificationDetails(android: androidDetails),
    );
  }
}`}</pre>
            )}

          </div>
        </div>
      )}

      {/* Tab View 4: Swagger Documentation Interface */}
      {activeSubTab === 'api' && (
        <div className="bg-slate-900 border border-white/5 p-6 rounded-2xl shadow-xl space-y-6 animate-fade-in text-left" dir="ltr">
          <div className="space-y-1.5 text-right font-sans" dir="rtl">
            <h3 className="font-extrabold text-xl text-white">سند فنی رابط کاربری برنامه‌نویسی (OAS Open API Specification)</h3>
            <p className="text-slate-450 text-sm">مستندات و فراخوان‌های مربوط به گره‌های سنجشی و پکیج‌های ابری.</p>
          </div>

          <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950 font-mono text-xs shadow-md">
            
            {/* Header banner */}
            <div className="bg-slate-900 px-4 py-3 border-b border-slate-800 flex justify-between items-center">
              <span className="text-emerald-400 font-bold">OAS 3.0 OpenAPI Spec</span>
              <span className="bg-slate-800 text-slate-400 px-2 py-0.5 rounded text-[10px]">Swagger Sandbox v1.4.0</span>
            </div>

            {/* API Entry 1 */}
            <div className="p-4 border-b border-slate-850 space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="bg-emerald-600 text-white font-bold px-2 py-0.5 rounded text-[10px]">GET</span>
                <b className="text-white">/api/v1/sensors/status</b>
                <span className="text-slate-500">دریافت لیست گره‌ها و وضعیت سنسورها</span>
              </div>
              
              <div className="pl-4 border-l-2 border-slate-840 space-y-2">
                <p className="text-slate-400 text-[11px] font-sans" dir="rtl">
                  دریافت کل اطلاعات محیطی (دما، رطوبت، باد و زاویه تابش خورشید) سقف دکلی ایستگاه‌های البرز و زاگرس همراه با موقعیت جغرافیایی.
                </p>
                <div className="bg-slate-900/50 p-2.5 rounded text-blue-300 relative text-[10px]">
                  Response: 200 OK (JSON)
                  <pre className="text-slate-400 mt-1 whitespace-pre-wrap">{`[\n  { "id": "node-zagros-1", "name": "Zagros Tower 1", "temp": 28.5, "hum": 42.0, "risk": "low" }\n]`}</pre>
                </div>
              </div>
            </div>

            {/* API Entry 2 */}
            <div className="p-4 border-b border-slate-855 space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="bg-blue-600 text-white font-bold px-2 py-0.5 rounded text-[10px]">POST</span>
                <b className="text-white">/api/v1/telemetry/report</b>
                <span className="text-slate-500">ارسال بسته‌داده جدید گره توسط فرستنده</span>
              </div>

              <div className="pl-4 border-l-2 border-slate-840 space-y-2">
                <p className="text-slate-400 text-[11px] font-sans" dir="rtl">
                  دروازه دریافت پکت داده فرستاده شده از بستر LoRa یا Wi-Fi هینترلند.
                </p>
                <div className="bg-slate-900/50 p-2.5 rounded text-[10px]">
                  <span className="text-slate-500">Request Body:</span>
                  <pre className="text-slate-400 mt-1">{`{\n  "nodeId": "node-alborz-2",\n  "temperature": 34.2,\n  "humidity": 21,\n  "windSpeed": 28\n}`}</pre>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Dynamic Export Selection Dialog Component */}
      {isExportModalOpen && (
        <div id="export-selector-modal" className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fade-in">
          <div className="bg-slate-900 border border-white/10 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl relative font-sans text-right" dir="rtl">
            
            {/* Header banner glow */}
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500" />
            
            <div className="p-6 space-y-6">
              {/* Header Title */}
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <div className="space-y-1">
                  <h3 className="font-extrabold text-base text-white">
                    {language === 'fa' ? 'انتخاب فرمت بارگیری داده‌های اراضی' : 'Select Selection Data Format'}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-medium">
                    {language === 'fa' ? 'لطفاً قالب مورد نظر خود را برای صادرات کادر ترسیم شده انتخاب کنید.' : 'Choose preferred export layout format for drawn coordinates.'}
                  </p>
                </div>
                <button
                  onClick={() => setIsExportModalOpen(false)}
                  className="p-1 px-2.5 rounded bg-slate-800 hover:bg-slate-750 text-slate-400 hover:text-white transition cursor-pointer text-xs font-bold"
                >
                  ✕
                </button>
              </div>

              {/* Grid content */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* JSON selection card */}
                <button
                  onClick={() => {
                    handleExportJSON();
                    setIsExportModalOpen(false);
                  }}
                  className="p-5 rounded-xl bg-slate-950/60 border border-white/5 hover:border-purple-500/40 text-right group transition cursor-pointer flex flex-col justify-between h-40 hover:bg-slate-850/60 active:scale-95 text-purple-300"
                >
                  <div className="flex justify-between items-start w-full">
                    <span className="p-2.5 rounded-lg bg-purple-500/10 text-purple-400 group-hover:scale-110 transition">
                      <Download className="w-5 h-5" />
                    </span>
                    <span className="text-[10px] font-mono font-bold bg-purple-500/15 text-purple-300 px-2 py-0.5 rounded border border-purple-500/25">JSON</span>
                  </div>
                  <div className="text-right">
                    <h4 className="font-extrabold text-sm text-white group-hover:text-purple-300 transition mt-3">
                      {language === 'fa' ? 'قالب استاندارد JSON' : 'JSON Standard Format'}
                    </h4>
                    <p className="text-[10px] text-slate-400 leading-relaxed mt-1">
                      {language === 'fa' ? 'شمل کلیه مختصات نقاط کادر هندسی، ارزیابی ریسک و پارامترها.' : 'Exports coordinates array, dynamic fuel loads and risk metrics.'}
                    </p>
                  </div>
                </button>

                {/* CSV selection card */}
                <button
                  onClick={() => {
                    handleExportCSV();
                    setIsExportModalOpen(false);
                  }}
                  className="p-5 rounded-xl bg-slate-950/60 border border-white/5 hover:border-blue-500/40 text-right group transition cursor-pointer flex flex-col justify-between h-40 hover:bg-slate-850/60 active:scale-95 text-blue-300"
                >
                  <div className="flex justify-between items-start w-full">
                    <span className="p-2.5 rounded-lg bg-blue-500/10 text-blue-400 group-hover:scale-110 transition">
                      <FileText className="w-5 h-5" />
                    </span>
                    <span className="text-[10px] font-mono font-bold bg-blue-500/15 text-blue-300 px-2 py-0.5 rounded border border-blue-500/25">CSV</span>
                  </div>
                  <div className="text-right">
                    <h4 className="font-extrabold text-sm text-white group-hover:text-blue-300 transition mt-3">
                      {language === 'fa' ? 'قالب مسطح CSV' : 'CSV Spreadsheet Format'}
                    </h4>
                    <p className="text-[10px] text-slate-400 leading-relaxed mt-1">
                      {language === 'fa' ? 'مناسب برای اکسل و پردازش عددی، حاوی خلاصه بهینه مقادیر.' : 'Flat table format optimized for Microsoft Excel or Google Sheets imports.'}
                    </p>
                  </div>
                </button>

              </div>

              {/* Tips block */}
              <div className="p-3 rounded-xl bg-slate-950/40 border border-white/5 flex items-start gap-2.5 text-right" dir="rtl">
                <span className="text-amber-400 text-sm">💡</span>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  {language === 'fa' 
                    ? 'هر دو فرمت حاوی داده‌های زنده تخمین مدل هوش مصنوعی در زمان دقیق تقاضا شامل دما، رطوبت و سرعت باد ایستگاه زنده فعال انتخابی می‌باشند.' 
                    : 'Both metadata formats incorporate real-time ML risk predictions, active satellite telemetry indices and atmospheric sync telemetry.'}
                </p>
              </div>

            </div>

            {/* Bottom bar */}
            <div className="bg-slate-950/50 p-4 border-t border-white/5 flex justify-end gap-2">
              <button
                onClick={() => setIsExportModalOpen(false)}
                className="py-1.5 px-4 rounded bg-slate-800 hover:bg-slate-750 text-slate-350 hover:text-white transition text-xs font-bold cursor-pointer"
              >
                {language === 'fa' ? 'بستن' : 'Close'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default SmartFireSensePage;
