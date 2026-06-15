import React, { useState } from 'react';
import { PlantingSuggestion, VegetationAnalysis, RiskAnalysis, CrowdfundingCampaign, WeatherData, useLanguage } from '../types';
import HomeGardeningPage from './HomeGardeningPage';
import GrantFinderPage from './GrantFinderPage';
import UndergroundWaterPage from './UndergroundWaterPage';
import SmartFireSensePage from './SmartFireSensePage';
import ProjectCostEstimator from './ProjectCostEstimator';
import MapLegend from './MapLegend';
import InvestmentPanel from './InvestmentPanel';
import NewsletterHub from './NewsletterHub';
import Map from './Map';
import AnalysisResults from './AnalysisResults';

interface GreenHopePageProps {
    onLocationSelect: (location: { lat: number; lng: number }, analyze: boolean) => void;
    selectedLocation: { lat: number; lng: number } | null;
    onFullAnalysis: () => void;
    onGenerateCampaign: () => void;
    onFetchWeather: () => void;
    plantingSuggestion: PlantingSuggestion | null;
    vegetationAnalysis: VegetationAnalysis | null;
    riskAnalysis: RiskAnalysis | null;
    crowdfundingCampaign: CrowdfundingCampaign | null;
    weatherData: WeatherData | null;
    isLoading: 'full-analysis' | 'campaign' | 'areas' | 'weather' | 'reforestation-need' | false;
    setIsLoading: (state: 'full-analysis' | 'campaign' | 'areas' | 'weather' | 'reforestation-need' | false) => void;
    error: string | null;
    useGrounding: boolean;
    onUseGroundingChange: (use: boolean) => void;
    numberOfTrees: number;
    onNumberOfTreesChange: (num: number) => void;
    reforestationGoal: number;
    onReforestationGoalChange: (num: number) => void;
}

const GreenHopePage: React.FC<GreenHopePageProps> = (props) => {
    const { t, language } = useLanguage();
    const [activeTab, setActiveTab] = useState('dashboard');

    const dashboardItems = [
        { id: 'reforestation', title: t('home.tabs.reforestation'), icon: 'fa-shield-halved', color: 'text-emerald-400', bg: 'from-emerald-900/40 to-emerald-950/60', desc: language === 'fa' ? 'سنجش سلامت جنگل، پایش خطرات زیستی، و تدارک فاز دوم احیاء' : 'Forest health diagnostics, biological threat assessment, and recovery planning', stats: '3.5 Ha' },
        { id: 'smartfiresense', title: t('home.tabs.smartFireSense'), icon: 'fa-fire', color: 'text-rose-400', bg: 'from-rose-900/40 to-rose-950/60', desc: language === 'fa' ? 'پایش لحظه‌ای حریق و پیش‌بینی مناطق بحرانی' : 'Real-time fire monitoring and risk prediction', stats: '72% Risk' },
        { id: 'water', title: t('home.tabs.water'), icon: 'fa-water', color: 'text-blue-400', bg: 'from-blue-900/40 to-blue-950/60', desc: language === 'fa' ? 'تحلیل سفره‌های زیرزمینی و تراز آبخوان‌های کارستی' : 'Karstic aquifer and groundwater level analysis', stats: '95m Depth' },
        { id: 'grants', title: t('home.tabs.grants'), icon: 'fa-hand-holding-dollar', color: 'text-amber-400', bg: 'from-amber-900/40 to-amber-950/60', desc: language === 'fa' ? 'یافتن منابع مالی و گرنت‌های بین‌المللی فعال' : 'Find active international grants and funding', stats: '4 Active' },
        { id: 'estimator', title: t('home.tabs.estimator'), icon: 'fa-calculator', color: 'text-indigo-400', bg: 'from-indigo-900/40 to-indigo-950/60', desc: language === 'fa' ? 'برآورد دقیق هزینه‌های پروژه‌های حفاظتی' : 'Precision costing for conservation projects', stats: '$28K Est.' },
        { id: 'invest', title: t('home.tabs.invest'), icon: 'fa-chart-line', color: 'text-teal-400', bg: 'from-teal-900/40 to-teal-950/60', desc: language === 'fa' ? 'فرصت‌های سرمایه‌گذاری سبز و بورس کربن' : 'Green investment opportunities and carbon credit', stats: 'B+ Class' },
        { id: 'gardening', title: t('home.tabs.gardening'), icon: 'fa-seedling', color: 'text-lime-400', bg: 'from-lime-900/40 to-lime-950/60', desc: language === 'fa' ? 'پیشنهادات اختصاصی برای فضای سبز شهری و خانگی' : 'Custom suggestions for urban and home gardens', stats: 'High Care' },
        { id: 'newsletter', title: t('home.tabs.newsletter'), icon: 'fa-envelopes-bulk', color: 'text-cyan-400', bg: 'from-cyan-900/40 to-cyan-950/60', desc: language === 'fa' ? 'دریافت آخرین اخبار و گزارش‌های بحران زمین' : 'Latest earth crisis news and periodic reports', stats: 'Weekly' },
    ];

    const getEstimatedRadius = (areaStr: string | undefined): number | undefined => {
        if (!areaStr) return undefined;
        // Try to find a number in the string
        const match = areaStr.match(/(\d+(\.\d+)?)/);
        if (!match) return 50; // Default 50m if we can't parse but have a string
        
        const value = parseFloat(match[1]);
        if (areaStr.toLowerCase().includes('hectare')) {
            // Area = PI * r^2 => r = sqrt(Area / PI)
            // 1 hectare = 10,000 m^2
            return Math.sqrt((value * 10000) / Math.PI);
        }
        if (areaStr.toLowerCase().includes('square meter') || areaStr.toLowerCase().includes('m2') || areaStr.toLowerCase().includes('متر مربع')) {
            return Math.sqrt(value / Math.PI);
        }
        if (areaStr.toLowerCase().includes('acre')) {
            // 1 acre = 4046.86 m^2
            return Math.sqrt((value * 4046.86) / Math.PI);
        }
        return 50; // Default fallback
    };

    const areaRadius = props.plantingSuggestion ? getEstimatedRadius(props.plantingSuggestion.areaPlanted) : undefined;

    const [climateScenario, setClimateScenario] = useState<'normal' | 'drought' | 'boost'>('normal');

    const getClimateRisk = () => {
        if (climateScenario === 'drought') return '89% Critical';
        if (climateScenario === 'boost') return '15% Minimal';
        return '45% Moderate';
    };

    const getWaterReserve = () => {
        if (climateScenario === 'drought') return '4.2 MT';
        if (climateScenario === 'boost') return '12.8 MT';
        return '8.4 MT';
    };

    // Real-Time Sentinel Live Threat Database for major Iranian ecosystems
    const sentinelSectors = [
        { 
            nameFa: 'پارک ملی گلستان (گلستان)', 
            nameEn: 'Golestan National Park (Caspian Highlands)', 
            temp: 34, 
            moisture: 18, 
            wind: 26, 
            statusFa: 'هشدار نارنجی - آمادگی کامل', 
            statusEn: 'Orange Alert - Standby', 
            level: 'orange',
            uavActive: true
        },
        { 
            nameFa: 'ارتفاعات حفاظت‌شده دنا (کهگیلویه و بویراحمد)', 
            nameEn: 'Dena Biosphere Heights (Zagros Oakwoods)', 
            temp: 41, 
            moisture: 7, 
            wind: 32, 
            statusFa: 'کد قرمز فعال - احتمال خودمراقبتی', 
            statusEn: 'Red Code Active - Extreme Risk', 
            level: 'red',
            uavActive: true
        },
        { 
            nameFa: 'جنگل‌های ارسباران (آذربایجان شرقی)', 
            nameEn: 'Arasbaran Deciduous Forests', 
            temp: 28, 
            moisture: 38, 
            wind: 12, 
            statusFa: 'پایدار - پایش روتین', 
            statusEn: 'Stable - Satellite Guard', 
            level: 'green',
            uavActive: false
        },
        { 
            nameFa: 'سراوان و روس کلا (مازندران)', 
            nameEn: 'Saravan Hyrcanian Basin (Guilan/Mazandaran)', 
            temp: 31, 
            moisture: 24, 
            wind: 15, 
            statusFa: 'تنش خفیف تبخیر - نرمال', 
            statusEn: 'Mild Evapotranspiration - Blue Code', 
            level: 'blue',
            uavActive: false
        }
    ];

    const renderDashboard = () => (
        <div id="dashboard" className="animate-fade-in py-6">
            
            {/* Header Title Hero Section */}
            <div className="text-center mb-16 relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none"></div>
                
                <div className="inline-block px-4 py-1.5 mb-6 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em] animate-pulse">
                    {language === 'fa' ? 'پیشخوان ارشد پایش هوشمند و ضدحریق اراضی v3.2' : 'Enterprise Forest Sentinel & Fire Safeguard Dashboard v3.2'}
                </div>
                
                <h1 className="text-4xl md:text-7xl font-black text-white tracking-tighter mb-6 leading-[1.0] max-w-4xl mx-auto">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-teal-300 to-rose-400">
                        {t('home.title')}
                    </span>
                </h1>
                
                <p className="max-w-3xl mx-auto text-lg md:text-xl text-slate-300 font-semibold leading-relaxed px-4">
                    {t('home.subtitle')}
                </p>

                {/* Dashboard Core Telemetry Metrics Bar */}
                <div className="mt-12 max-w-5xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-4 px-2">
                    {[
                        { 
                            label: language === 'fa' ? 'مساحت کل اراضی تحت پایش' : 'Total Surveyed Woodlands', 
                            val: ((props.reforestationGoal || 5) * 15).toLocaleString(), 
                            unit: language === 'fa' ? 'هکتار زنده' : 'Hectares', 
                            color: 'text-teal-400',
                            icon: 'fa-earth-asia'
                        },
                        { 
                            label: language === 'fa' ? 'میانگین ریسک تنش خشکی' : 'Mean Moisture Stress Index', 
                            val: climateScenario === 'drought' ? '89% Critical' : climateScenario === 'boost' ? '15% Safe' : '52% Moderate', 
                            unit: '', 
                            color: climateScenario === 'drought' ? 'text-rose-500 animate-pulse' : 'text-amber-400',
                            icon: 'fa-temperature-sun'
                        },
                        { 
                            label: language === 'fa' ? 'ذخیره رواناب سفره کارستی' : 'Estimated Aquifer Index', 
                            val: getWaterReserve(), 
                            unit: 'Million Tons', 
                            color: 'text-blue-400',
                            icon: 'fa-water'
                        },
                        { 
                            label: language === 'fa' ? 'سنسورهای صوتی و ماهواره‌ای' : 'IoT Nodes & Satellites', 
                            val: '2,480 Active', 
                            unit: 'Live Gates', 
                            color: 'text-emerald-400',
                            icon: 'fa-satellite-dish'
                        },
                    ].map((s, i) => (
                        <div key={i} className="bg-slate-900/60 backdrop-blur-md rounded-3xl p-5 border border-white/5 shadow-xl hover:border-white/10 transition-all text-center relative group">
                            <div className="absolute top-4 right-4 text-slate-600/50 group-hover:text-emerald-500/30 transition-colors">
                                <i className={`fa-solid ${s.icon} text-lg`}></i>
                            </div>
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">{s.label}</div>
                            <div className="flex items-baseline justify-center gap-1">
                                <span className={`text-2xl font-black ${s.color}`}>{s.val}</span>
                                {s.unit && <span className="text-[9px] font-bold text-slate-500">{s.unit}</span>}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* LIVE SENTINEL SECTORS REAL-TIME MONITOR (ZAAGROS & ALBORZ FEED) */}
            <div id="satellite-stream" className="mb-12 max-w-5xl mx-auto bg-slate-950/80 border border-white/5 rounded-[2.5rem] p-8 shadow-3xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-500 via-rose-500 to-emerald-500 animate-pulse"></div>
                
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 text-right rtl:text-right">
                    <div>
                        <div className="flex items-center gap-2 justify-end">
                            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
                            <span className="text-[10px] font-black text-rose-400 uppercase tracking-widest">{language === 'fa' ? 'فید زنده ماهواره‌ای و پایش سنسورهای محلی' : 'Copernicus Sentinels & Ground IoT Feed'}</span>
                        </div>
                        <h3 className="text-2xl font-black text-white mt-1">
                            {language === 'fa' ? 'پایش سنجش از دور و تهدید حرارتی کانون‌های جنگلی' : 'Dynamic Remote Sensing and Thermal Threat Logs'}
                        </h3>
                    </div>
                    <div className="px-4 py-2 rounded-2xl bg-white/5 border border-white/5 text-xs text-slate-400 inline-flex items-center justify-center gap-2 font-mono">
                        <i className="fa-solid fa-clock text-emerald-400 animate-spin" style={{ animationDuration: '6s' }}></i>
                        <span>{language === 'fa' ? 'پایگاه داده زاگرس: برخط' : 'Telemetry Link: ESTABLISHED'}</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {sentinelSectors.map((sec, idx) => (
                        <div key={idx} className="bg-slate-900/50 rounded-2xl p-5 border border-white/5 hover:border-slate-800 transition-all flex flex-col justify-between text-right rtl:text-right">
                            <div className="flex justify-between items-start flex-row-reverse mb-4">
                                <div>
                                    <h4 className="font-extrabold text-sm text-white">
                                        {language === 'fa' ? sec.nameFa : sec.nameEn}
                                    </h4>
                                    <div className="flex items-center gap-1.5 justify-end mt-1 text-[10px] text-slate-400">
                                        {sec.uavActive && (
                                            <span className="bg-teal-500/20 text-teal-300 px-1.5 py-0.2 rounded text-[8px] font-black uppercase">
                                                🚁 {language === 'fa' ? 'گشت پهپادی فعال' : 'UAV Patrol Active'}
                                            </span>
                                        )}
                                        <span>Sentinel-2 Orthophoto • 10m Pixels</span>
                                    </div>
                                </div>
                                <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${
                                    sec.level === 'red' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 
                                    sec.level === 'orange' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 
                                    sec.level === 'blue' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 
                                    'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                }`}>
                                    {language === 'fa' ? sec.statusFa : sec.statusEn}
                                </span>
                            </div>

                            <div className="grid grid-cols-3 gap-3 border-t border-white/5 pt-4">
                                <div className="text-center">
                                    <div className="text-[9px] text-slate-500 uppercase tracking-widest mb-0.5">{language === 'fa' ? 'درجه حرارت' : 'Temp'}</div>
                                    <div className="text-sm font-extrabold text-slate-300 font-mono">{sec.temp}°C</div>
                                </div>
                                <div className="text-center border-x border-white/5">
                                    <div className="text-[9px] text-slate-500 uppercase tracking-widest mb-0.5">{language === 'fa' ? 'رطوبت خاک' : 'Moisture'}</div>
                                    <div className="text-sm font-extrabold text-slate-300 font-mono">{sec.moisture}%</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-[9px] text-slate-500 uppercase tracking-widest mb-0.5">{language === 'fa' ? 'سرعت باد' : 'Wind'}</div>
                                    <div className="text-sm font-extrabold text-slate-300 font-mono">{sec.wind} km/h</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* LIVE INTERACTIVE SIMULATOR & PLANNER PANEL */}
            <div id="simulator-controller" className="mb-12 max-w-5xl mx-auto glass-card bg-slate-900/40 p-8 rounded-[2.5rem] border border-white/5 relative overflow-hidden shadow-3xl">
                <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/5 rounded-full blur-[100px] pointer-events-none"></div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
                    
                    {/* Simulator Controls */}
                    <div className="lg:col-span-5 text-right rtl:text-right ltr:text-left">
                        <h4 className="text-xl font-black text-white mb-2 tracking-tight flex items-center justify-end gap-2">
                            <span>{language === 'fa' ? 'سامانه شبیه‌سازی و سناریوسازی اقلیمی' : 'Ecology Scenario Simulator'}</span>
                            <i className="fas fa-microchip text-emerald-400"></i>
                        </h4>
                        <p className="text-slate-300 text-xs font-semibold mb-6 leading-relaxed">
                            {language === 'fa' 
                              ? 'تاثیر تصمیمات حفاظتی، حجم اراضی و خشکسالی‌های موسمی را بر پارامترهای جنگل زنده بررسی کنید.' 
                              : 'Simulate the impact of climate anomalies on soil dry wood moisture and fire hazard ratings.'}
                        </p>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 mb-2 flex justify-between">
                                    <span className="text-emerald-400">{(props.numberOfTrees || 1000).toLocaleString()} {language === 'fa' ? 'نهال آماده' : 'Saplings'}</span>
                                    <span>{language === 'fa' ? 'نهال‌های بازیابی فاز ۲ (کمک به حریق)' : 'Target Post-Fire Saplings'}</span>
                                </label>
                                <input 
                                    type="range" 
                                    min="100" 
                                    max="50000" 
                                    step="100"
                                    value={props.numberOfTrees || 1000} 
                                    onChange={(e) => props.onNumberOfTreesChange(parseInt(e.target.value))}
                                    className="w-full accent-emerald-500 bg-slate-850 rounded-lg appearance-none h-1.5 cursor-pointer focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-400 mb-2 flex justify-between">
                                    <span className="text-emerald-400">{(props.reforestationGoal || 5).toLocaleString()} {language === 'fa' ? 'هکتار حفاظتی' : 'Protection Hectares'}</span>
                                    <span>{language === 'fa' ? 'مساحت کل پهنه حفاظت‌شونده' : 'Woodland Protected Buffer Scale'}</span>
                                </label>
                                <input 
                                    type="range" 
                                    min="1" 
                                    max="200" 
                                    step="1"
                                    value={props.reforestationGoal || 5} 
                                    onChange={(e) => props.onReforestationGoalChange(parseInt(e.target.value))}
                                    className="w-full accent-teal-500 bg-slate-850 rounded-lg appearance-none h-1.5 cursor-pointer focus:outline-none"
                                />
                            </div>

                            <div className="pt-2">
                                <label className="block text-[9px] font-black uppercase text-slate-400 mb-2.5">{language === 'fa' ? 'سناریوی جوی فعال در شبیه‌ساز' : 'Active Atmospheric Simulator Scenario'}</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        { id: 'normal', icon: 'fa-cloud-sun', label: language === 'fa' ? 'نرمال' : 'Normal', color: 'hover:text-emerald-400' },
                                        { id: 'drought', icon: 'fa-sun', label: language === 'fa' ? 'خشکسالی' : 'Drought', color: 'hover:text-rose-500' },
                                        { id: 'boost', icon: 'fa-droplet', label: language === 'fa' ? 'بارش شدید' : 'Rainy Boost', color: 'hover:text-blue-500' },
                                    ].map((sc) => (
                                        <button
                                            key={sc.id}
                                            onClick={() => setClimateScenario(sc.id as any)}
                                            className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all ${climateScenario === sc.id ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-emerald-400 shadow-md shadow-emerald-500/20 scale-102' : 'bg-slate-900/60 text-slate-400 border-white/5 ' + sc.color}`}
                                        >
                                            <i className={`fas ${sc.icon} text-[10px]`}></i>
                                            <span>{sc.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Output indicators calculated in real-time */}
                    <div className="lg:col-span-7 bg-slate-950/70 border border-white/5 rounded-3xl p-6 grid grid-cols-1 md:grid-cols-3 gap-6 relative">
                        <div className="flex flex-col justify-between text-right rtl:text-right ltr:text-left">
                            <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-400 mb-4 border border-teal-500/20 shadow-inner">
                                <i className="fas fa-satellite"></i>
                            </div>
                            <div>
                                <div className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">{language === 'fa' ? 'مساحت تحت پایش حرارتی' : 'Area Under Thermal Watch'}</div>
                                <div className="text-2xl font-black text-white tracking-tight leading-none">
                                    {((props.reforestationGoal || 5) * 15).toLocaleString()} <span className="text-xs text-slate-500 font-bold">Ha</span>
                                </div>
                                <div className="text-[9px] text-teal-400 font-bold mt-1.5 flex items-center gap-1 justify-end">
                                    <i className="fas fa-check-circle"></i>
                                    {language === 'fa' ? 'پایش مادون قرمز فعال' : 'Active sat sweeps'}
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col justify-between text-right rtl:text-right ltr:text-left border-t md:border-t-0 md:border-r border-white/5 pt-6 md:pt-0 md:pr-6">
                            <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-400 mb-4 border border-orange-500/20 shadow-inner">
                                <i className="fas fa-shield-halved"></i>
                            </div>
                            <div>
                                <div className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">{language === 'fa' ? 'ریسک رطوبتی پیشگیری حریق' : 'Moisture Spark Risk'}</div>
                                <div className="text-2xl font-black text-white tracking-tight leading-none">
                                    {climateScenario === 'drought' ? (language === 'fa' ? 'حیاتی / بسیار خشک' : 'Critical / Flammable') : (language === 'fa' ? 'پایدار / نرمال' : 'Stable / Normal')}
                                </div>
                                <div className="text-[9px] text-orange-400 font-bold mt-1.5 flex items-center gap-1 justify-end">
                                    <i className="fas fa-microchip"></i>
                                    {language === 'fa' ? 'سنسورهای رطوبت چوب فعال' : 'Moisture sensor link live'}
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col justify-between text-right rtl:text-right ltr:text-left border-t md:border-t-0 md:border-r border-white/5 pt-6 md:pt-0 md:pr-6">
                            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 mb-4 border border-blue-500/20 shadow-inner">
                                <i className="fas fa-seedling"></i>
                            </div>
                            <div>
                                <div className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">{language === 'fa' ? 'نهال‌های آماده بهزراعی' : 'Endemic Species Reserve'}</div>
                                <div className="text-2xl font-black text-white tracking-tight leading-none">
                                    {(props.numberOfTrees || 1000).toLocaleString()} <span className="text-xs text-slate-500 font-bold">{language === 'fa' ? 'اصله' : 'Saplings'}</span>
                                </div>
                                <div className="text-[9px] text-blue-400 font-bold mt-1.5 flex items-center gap-1 justify-end">
                                    <i className="fas fa-dharmachakra"></i>
                                    {language === 'fa' ? 'کاشت تکمیلی پس از مهار ریسک' : 'Phase 2 reforestation ready'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* INTERACTIVE FOREST GUARD CONSERVATION CHAIN WORKFLOW */}
            <div id="about-mission" className="mb-16 max-w-5xl mx-auto text-right rtl:text-right">
                <h3 className="text-2xl font-black text-white mb-6 text-center">
                    {language === 'fa' ? '🔒 حلقه حفاظتی پلتفرم امید سبز: مهار آتش‌سوزی تا کاشت جبرانی' : '🔒 GreenHope Protection Chain: From Spreading Spark Control to Forest Growth'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    {[
                        { step: '01', icon: 'fa-satellite', labelFa: 'سنجش مادون قرمز', labelEn: 'Satellite Thermal Scan', descFa: 'رهگیری روزانه نقاط حرارتی بحرانی زاگرس', descEn: 'Daily Sentinel infra thermal alert logs' },
                        { step: '02', icon: 'fa-ear-listen', labelFa: 'شنود حفاظتی (صوت)', labelEn: 'Acoustic Ears on Canopy', descFa: 'تشخیص فوری صدای اره برقی، شلیک و باروت', descEn: 'Real-time solar microphone acoustic logs' },
                        { step: '03', icon: 'fa-droplet', labelFa: 'پایش آبخوان کارستی', labelEn: 'Karstic Hydrology', descFa: 'سنجش و تراز آبخوان زیرزمینی صخره‌ها', descEn: 'Underground karstic water flow tracking' },
                        { step: '04', icon: 'fa-plane-slash', labelFa: 'مهار ترابری ضدحریق', labelEn: 'Tactical Aviation Containment', descFa: 'اعزام جهت خفه‌سازی حریق با بستر دفاعی', descEn: 'Swarms deploying tactical retardant vessels' },
                        { step: '05', icon: 'fa-leaf', labelFa: 'بازسازی و جنگل‌کاری', labelEn: 'Endemic Reforestation', descFa: 'کاشت علمی گونه‌های مقاوم وحشی پسته و بلوط', descEn: 'Drone biodiversity seeding & community nursery' }
                    ].map((step, idx) => (
                        <div key={idx} className="bg-slate-900/40 p-5 rounded-2xl border border-white/5 flex flex-col justify-between relative group hover:border-emerald-500/20 transition-all">
                            <span className="text-[10px] font-mono font-black text-emerald-500/40 block mb-2">{step.step}</span>
                            <div>
                                <div className="text-emerald-400 mb-3 text-lg">
                                    <i className={`fa-solid ${step.icon}`}></i>
                                </div>
                                <h5 className="font-extrabold text-white text-xs mb-1.5">
                                    {language === 'fa' ? step.labelFa : step.labelEn}
                                </h5>
                                <p className="text-[10px] text-slate-400 leading-normal">
                                    {language === 'fa' ? step.step === '05' ? 'فاز نهایی بازسازی جنگل با کاشت علمی درختان بومی مقاوم.' : step.descFa : step.descEn}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* INTEGRATED FUNCTIONAL WORKFLOW GRID MODULES */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-2">
                {dashboardItems.map((item) => (
                    <button
                        key={item.id}
                        type="button"
                        onClick={() => setActiveTab(item.id)}
                        className={`group relative overflow-hidden rounded-[2.5rem] p-8 glass-card bg-gradient-to-br ${item.bg} text-right rtl:text-right ltr:text-left h-full flex flex-col justify-between border border-white/5 active:scale-95 transition-all duration-300 shadow-2xl shadow-black/40`}
                    >
                        <div className="relative z-10 w-full">
                            <div className="flex justify-between items-start mb-6">
                                <div className={`w-14 h-14 rounded-2xl bg-slate-900/50 flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform duration-500 shadow-lg`}>
                                    <i className={`fas ${item.icon} text-2xl ${item.color}`}></i>
                                </div>
                                <div className={`text-[10px] font-black px-3 py-1 rounded-full bg-black/40 border border-white/10 ${item.color} uppercase tracking-tighter`}>
                                    {item.stats}
                                </div>
                            </div>
                            <h3 className="text-2xl font-black text-white mb-3 group-hover:text-emerald-400 tracking-tighter transition-colors">
                                {item.title}
                            </h3>
                            <p className="text-slate-300 text-xs leading-relaxed font-semibold opacity-85 group-hover:opacity-100 transition-opacity">
                                {item.desc}
                            </p>
                        </div>
                        <div className="mt-8 flex justify-between items-center relative z-10 w-full">
                            <div className="flex -space-x-2 rtl:space-x-reverse opacity-40 group-hover:opacity-100 transition-opacity">
                                {[1,2,3].map(i => (
                                    <div key={i} className="w-6 h-6 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center">
                                       <div className={`w-1.5 h-1.5 rounded-full bg-emerald-500`}></div>
                                    </div>
                                ))}
                            </div>
                            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white group-hover:shadow-[0_0_15px_rgba(16,185,129,0.5)] transition-all duration-500">
                                <i className={`fas ${language === 'fa' ? 'fa-arrow-left' : 'fa-arrow-right'} text-xs`}></i>
                            </div>
                        </div>
                        {/* Decorative background shape */}
                        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/5 rounded-full blur-3xl group-hover:bg-emerald-400/20 transition-all duration-700"></div>
                    </button>
                ))}
            </div>

            {/* Quick Status / Footer of Dashboard */}
            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 border-t border-white/5 pt-12">
                 <div className="flex items-center gap-4 p-4 rounded-3xl bg-slate-900/30">
                    <div className="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500">
                        <i className="fas fa-fire-flame-curved text-lg"></i>
                    </div>
                    <div>
                        <div className="text-[10px] font-black uppercase tracking-tighter text-slate-500">{language === 'fa' ? 'وضعیت حریق پلتفرم' : 'Platform Sentinel Status'}</div>
                        <div className="text-white font-extrabold">{language === 'fa' ? 'پایش لحظه‌ای زاگرس و البرز' : 'Live Ecosystem Watch'}</div>
                    </div>
                 </div>
                 <div className="flex items-center gap-4 p-4 rounded-3xl bg-slate-900/30">
                    <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                        <i className="fas fa-microchip text-lg"></i>
                    </div>
                    <div>
                        <div className="text-[10px] font-black uppercase tracking-tighter text-slate-500">{language === 'fa' ? 'مدل هوش مصنوعی هسته' : 'Core Processing Unit'}</div>
                        <div className="text-white font-extrabold">Gemini 2.0 Flash Advanced</div>
                    </div>
                 </div>
                 <div className="flex items-center gap-4 p-4 rounded-3xl bg-slate-900/30">
                    <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                        <i className="fas fa-earth-americas text-lg"></i>
                    </div>
                    <div>
                        <div className="text-[10px] font-black uppercase tracking-tighter text-slate-500">{language === 'fa' ? 'پوشش جغراقیایی زمینی' : 'Ground Geofencing'}</div>
                        <div className="text-white font-extrabold">{language === 'fa' ? 'زاگرس، البرز و جنگل‌های خزری' : 'Hyrcanian, Zagros & Caspian'}</div>
                    </div>
                 </div>
            </div>
        </div>
    );

    const renderReforestationTab = () => (
        <div className="animate-fade-in">
            <button 
                onClick={() => setActiveTab('dashboard')}
                className="mb-8 flex items-center gap-2 text-slate-400 hover:text-emerald-400 transition-colors font-bold text-sm"
            >
                <i className="fas fa-chevron-right rtl:rotate-0 rotate-180"></i>
                {language === 'fa' ? 'بازگشت به پیشخوان' : 'Back to Dashboard'}
            </button>
            
            <div className="relative w-full mb-8">
                <Map 
                    selectedLocation={props.selectedLocation}
                    onLocationSelect={(loc) => props.onLocationSelect(loc, false)}
                    areaRadius={areaRadius}
                />
                <MapLegend items={[
                    { label: t('home.map.selected'), color: 'bg-blue-500' },
                    { label: t('home.map.analyzed'), color: 'bg-emerald-500' }
                ]} />
            </div>

            <div className="bg-slate-800/50 rounded-xl p-6 border border-white/10 backdrop-blur-sm mb-12">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                         <label className="flex items-center cursor-pointer group">
                             <div className="relative">
                                <input 
                                    type="checkbox" 
                                    className="sr-only" 
                                    checked={props.useGrounding} 
                                    onChange={(e) => props.onUseGroundingChange(e.target.checked)} 
                                />
                                <div className={`block w-12 h-7 rounded-full transition-colors ${props.useGrounding ? 'bg-emerald-500' : 'bg-slate-600'}`}></div>
                                <div className={`absolute left-1 top-1 bg-white w-5 h-5 rounded-full transition-transform ${props.useGrounding ? 'translate-x-5' : ''}`}></div>
                            </div>
                            <div className="ml-3 text-slate-300 text-sm font-medium group-hover:text-white transition-colors">
                                {t('home.enableGrounding')}
                                <span className="block text-xs text-slate-500 font-normal">{t('home.groundingSub')}</span>
                            </div>
                        </label>
                    </div>

                    <div className="flex flex-wrap gap-3 justify-center">
                         <button
                            onClick={() => props.onLocationSelect({ lat: 36.175683, lng: 58.465929 }, true)}
                            disabled={!!props.isLoading}
                            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm font-semibold rounded-lg transition disabled:opacity-50"
                         >
                            {t('home.sampleLocation')}
                         </button>
                         <button
                            onClick={props.onFullAnalysis}
                            disabled={!props.selectedLocation || !!props.isLoading}
                            className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-lg shadow-lg shadow-emerald-500/20 transition transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center"
                         >
                             {props.isLoading === 'full-analysis' ? (
                                 <>
                                   <i className="fas fa-circle-notch fa-spin mr-2 rtl:mr-0 rtl:ml-2"></i>
                                   {t('home.analyzingBtn')}
                                 </>
                             ) : (
                                 <>
                                    <i className="fas fa-wand-magic-sparkles mr-2 rtl:mr-0 rtl:ml-2"></i>
                                    {t('home.analyzeBtn')}
                                 </>
                             )}
                        </button>
                    </div>
                </div>
            </div>

            {props.error && (
                <div className="mb-8 p-4 bg-red-900/20 border border-red-500/50 rounded-lg flex items-start gap-3 text-red-200">
                    <i className="fas fa-circle-exclamation mt-1"></i>
                    <div>
                        <h4 className="font-bold">{t('home.analysisFailed')}</h4>
                        <p className="text-sm opacity-80">{props.error}</p>
                    </div>
                </div>
            )}

            {/* Analysis Results */}
            {props.plantingSuggestion && props.vegetationAnalysis && props.riskAnalysis && (
                <AnalysisResults 
                    plantingSuggestion={props.plantingSuggestion}
                    vegetationAnalysis={props.vegetationAnalysis}
                    riskAnalysis={props.riskAnalysis}
                    weatherData={props.weatherData}
                    crowdfundingCampaign={props.crowdfundingCampaign}
                    onGenerateCampaign={props.onGenerateCampaign}
                    isGeneratingCampaign={props.isLoading === 'campaign'}
                />
            )}
        </div>
    );

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
            {activeTab !== 'dashboard' && (
                <div className="mb-8 border-b border-white/5 flex justify-center overflow-x-auto">
                    <nav className="-mb-px flex space-x-6 rtl:space-x-reverse" aria-label="Tabs">
                        {dashboardItems.map(item => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`whitespace-nowrap py-4 px-1 border-b-2 font-bold text-xs transition-all duration-200 ${activeTab === item.id ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-500 hover:text-white'}`}
                            >
                                <i className={`fas ${item.icon} mr-2 rtl:ml-2`}></i>
                                {item.title}
                            </button>
                        ))}
                    </nav>
                </div>
            )}
            
            <div className="min-h-[500px]">
                {activeTab === 'dashboard' && renderDashboard()}
                {activeTab === 'reforestation' && renderReforestationTab()}
                {activeTab === 'smartfiresense' && (
                    <div className="animate-fade-in">
                        <button onClick={() => setActiveTab('dashboard')} className="mb-6 flex items-center gap-2 text-slate-400 hover:text-emerald-400 font-bold text-sm">
                            <i className="fas fa-chevron-right rtl:rotate-0 rotate-180"></i>
                            {language === 'fa' ? 'بازگشت به پیشخوان' : 'Back to Dashboard'}
                        </button>
                        <SmartFireSensePage />
                    </div>
                )}
                {activeTab === 'water' && (
                    <div className="animate-fade-in">
                        <button onClick={() => setActiveTab('dashboard')} className="mb-6 flex items-center gap-2 text-slate-400 hover:text-emerald-400 font-bold text-sm">
                            <i className="fas fa-chevron-right rtl:rotate-0 rotate-180"></i>
                            {language === 'fa' ? 'بازگشت به پیشخوان' : 'Back to Dashboard'}
                        </button>
                        <UndergroundWaterPage />
                    </div>
                )}
                {activeTab === 'gardening' && (
                    <div className="animate-fade-in">
                        <button onClick={() => setActiveTab('dashboard')} className="mb-6 flex items-center gap-2 text-slate-400 hover:text-emerald-400 font-bold text-sm">
                            <i className="fas fa-chevron-right rtl:rotate-0 rotate-180"></i>
                            {language === 'fa' ? 'بازگشت به پیشخوان' : 'Back to Dashboard'}
                        </button>
                        <HomeGardeningPage />
                    </div>
                )}
                {activeTab === 'grants' && (
                    <div className="animate-fade-in">
                        <button onClick={() => setActiveTab('dashboard')} className="mb-6 flex items-center gap-2 text-slate-400 hover:text-emerald-400 font-bold text-sm">
                            <i className="fas fa-chevron-right rtl:rotate-0 rotate-180"></i>
                            {language === 'fa' ? 'بازگشت به پیشخوان' : 'Back to Dashboard'}
                        </button>
                        <GrantFinderPage selectedLocation={props.selectedLocation} />
                    </div>
                )}
                {activeTab === 'estimator' && (
                   <div className="animate-fade-in">
                        <button onClick={() => setActiveTab('dashboard')} className="mb-6 flex items-center gap-2 text-slate-400 hover:text-emerald-400 font-bold text-sm">
                            <i className="fas fa-chevron-right rtl:rotate-0 rotate-180"></i>
                            {language === 'fa' ? 'بازگشت به پیشخوان' : 'Back to Dashboard'}
                        </button>
                        <ProjectCostEstimator />
                    </div>
                )}
                {activeTab === 'invest' && (
                    <div className="animate-fade-in">
                        <button onClick={() => setActiveTab('dashboard')} className="mb-6 flex items-center gap-2 text-slate-400 hover:text-emerald-400 font-bold text-sm">
                            <i className="fas fa-chevron-right rtl:rotate-0 rotate-180"></i>
                            {language === 'fa' ? 'بازگشت به پیشخوان' : 'Back to Dashboard'}
                        </button>
                        <InvestmentPanel />
                    </div>
                )}
                {activeTab === 'newsletter' && (
                    <div className="animate-fade-in">
                        <button onClick={() => setActiveTab('dashboard')} className="mb-6 flex items-center gap-2 text-slate-400 hover:text-emerald-400 font-bold text-sm">
                            <i className="fas fa-chevron-right rtl:rotate-0 rotate-180"></i>
                            {language === 'fa' ? 'بازگشت به پیشخوان' : 'Back to Dashboard'}
                        </button>
                        <NewsletterHub />
                    </div>
                )}
            </div>
        </div>
    );
};

export default GreenHopePage;