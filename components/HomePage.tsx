import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { PlantingSuggestion, VegetationAnalysis, RiskAnalysis, CrowdfundingCampaign, WeatherData, useLanguage, localizeNumber } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { auth, googleProvider } from '../src/firebase';
import { signInWithPopup, signOut, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
const HomeGardeningPage = React.lazy(() => import('./HomeGardeningPage'));
const GrantFinderPage = React.lazy(() => import('./GrantFinderPage'));
const PatentDraftingPage = React.lazy(() => import('./PatentDraftingPage'));
const UndergroundWaterPage = React.lazy(() => import('./UndergroundWaterPage'));
const SmartFireSensePage = React.lazy(() => import('./SmartFireSensePage'));
const ProjectCostEstimator = React.lazy(() => import('./ProjectCostEstimator'));
const Timeline = React.lazy(() => import('./Timeline'));
import MapLegend from './MapLegend';
const InvestmentPanel = React.lazy(() => import('./InvestmentPanel'));
const NewsletterHub = React.lazy(() => import('./NewsletterHub'));
const Map = React.lazy(() => import('./Map'));
const AnalysisResults = React.lazy(() => import('./AnalysisResults'));
const AIModuleOptimizer = React.lazy(() => import('./AIModuleOptimizer'));
import { ModuleOptimizer } from './ModuleOptimizer';
const BacklogView = React.lazy(() => import('./BacklogView'));
const ProductsView = React.lazy(() => import('./ProductsView'));
const ContactView = React.lazy(() => import('./ContactView'));
const CooperationRoadmap = React.lazy(() => import('./CooperationRoadmap').then(m => ({ default: m.CooperationRoadmap })));
import { 
    LayoutGrid, 
    History as HistoryIcon, 
    ShoppingBag as ShoppingBagIcon, 
    Contact as ContactIcon,
    Home as HomeIcon,
    ChevronLeft,
    ChevronRight,
    Search,
    User,
    Tag,
    ArrowRight
} from 'lucide-react';

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
    const isRTL = language === 'fa' || language === 'ar';
    const [activeTab, setActiveTab] = useState('dashboard');
    const [user, setUser] = useState<FirebaseUser | null>(null);
    const location = useLocation();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, setUser);
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const tab = queryParams.get('tab');
        const validTabs = ['dashboard', 'reforestation', 'smartfiresense', 'water', 'grants', 'patent', 'backlog', 'products', 'invest', 'contact', 'cooperation'];
        if (tab && validTabs.includes(tab)) {
            setActiveTab(tab);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [location.search]);

    const handleSignIn = () => signInWithPopup(auth, googleProvider);
    const handleSignOut = () => signOut(auth);

    const appleDockItems = React.useMemo(() => [
        { id: 'dashboard', icon: <HomeIcon className="w-5 h-5" />, label: language === 'fa' ? 'پیشخوان' : 'Home' },
        { id: 'backlog', icon: <HistoryIcon className="w-5 h-5" />, label: language === 'fa' ? 'بک‌لاگ' : 'Backlog' },
        { id: 'products', icon: <ShoppingBagIcon className="w-5 h-5" />, label: language === 'fa' ? 'محصولات' : 'Products' },
        { id: 'contact', icon: <ContactIcon className="w-5 h-5" />, label: language === 'fa' ? 'تماس با ما' : 'Contact' },
    ], [language]);

    const dashboardItems = React.useMemo(() => [
        { id: 'reforestation', title: t('home.tabs.reforestation'), icon: 'fa-shield-halved', color: 'text-emerald-400', bg: 'from-emerald-900/40 to-emerald-950/60', desc: language === 'fa' ? 'سنجش سلامت جنگل، پایش خطرات زیستی، و تدارک فاز دوم احیاء' : 'Forest health diagnostics, biological threat assessment, and recovery planning', stats: localizeNumber(3.5, language) + (language === 'fa' ? ' هکتار' : ' Ha') },
        { id: 'cooperation', title: language === 'fa' ? 'نقشه راه ائتلاف ۴ نفره' : '4-Member Cooperation Roadmap', icon: 'fa-users', color: 'text-emerald-400', bg: 'from-emerald-950/40 to-emerald-900/60', desc: language === 'fa' ? 'نقشه راه ۲۸ روزه پایش هوشمند، نوتبوک‌های کولب و سناریوی تولید محتوا' : 'Comprehensive 28-day roadmap fusing system APIs, Google Colab and social content schedules', stats: language === 'fa' ? '۴ هفته' : '4 Weeks' },
        { id: 'smartfiresense', title: t('home.tabs.smartFireSense'), icon: 'fa-fire', color: 'text-rose-400', bg: 'from-rose-900/40 to-rose-950/60', desc: language === 'fa' ? 'پایش لحظه‌ای حریق و پیش‌بینی مناطق بحرانی' : 'Real-time fire monitoring and risk prediction', stats: localizeNumber(72, language) + (language === 'fa' ? '٪ ریسک' : '% Risk') },
        { id: 'water', title: t('home.tabs.water'), icon: 'fa-water', color: 'text-blue-400', bg: 'from-blue-900/40 to-blue-950/60', desc: language === 'fa' ? 'تحلیل سفره‌های زیرزمینی و تراز آبخوان‌های کارستی' : 'Karstic aquifer and groundwater level analysis', stats: localizeNumber(95, language) + (language === 'fa' ? ' متر عمق' : 'm Depth') },
        { id: 'grants', title: t('home.tabs.grants'), icon: 'fa-hand-holding-dollar', color: 'text-amber-400', bg: 'from-amber-900/40 to-amber-950/60', desc: language === 'fa' ? 'یافتن منابع مالی و گرنت‌های بین‌المللی فعال' : 'Find active international grants and funding', stats: localizeNumber(4, language) + (language === 'fa' ? ' فعال' : ' Active') },
        { id: 'patent', title: language === 'fa' ? 'سامانه پتنت و ایده' : 'Patent & Idea Shield', icon: 'fa-shield', color: 'text-emerald-300', bg: 'from-emerald-800/40 to-emerald-900/60', desc: language === 'fa' ? 'ثبت و بررسی ایده‌های محیط‌زیستی' : 'Patent and Idea Shield', stats: 'New' },
        { id: 'backlog', title: language === 'fa' ? 'بک‌لاگ عملیاتی' : 'Project Backlog', icon: 'fa-history', color: 'text-slate-400', bg: 'from-slate-800/40 to-slate-900/60', desc: language === 'fa' ? 'رهگیری آخرین اقدامات و تسک‌های حفاظتی' : 'Tracking latest conservation actions and tasks', stats: localizeNumber(12, language) + (language === 'fa' ? ' مورد' : ' Items') },
        { id: 'products', title: language === 'fa' ? 'تدارکات و محصولات' : 'Products & Logistics', icon: 'fa-shopping-bag', color: 'text-emerald-300', bg: 'from-emerald-800/40 to-emerald-900/60', desc: language === 'fa' ? 'سفارش تجهیزات پایش و نهال‌های بومی' : 'Order monitoring equipment and native seedlings', stats: 'Deymeh V2' },
        { id: 'invest', title: t('home.tabs.invest'), icon: 'fa-chart-line', color: 'text-teal-400', bg: 'from-teal-900/40 to-teal-950/60', desc: language === 'fa' ? 'فرظت‌های سرمایه‌گذاری سبز و بورس کربن' : 'Green investment opportunities and carbon credit', stats: 'B+ Class' },
        { id: 'contact', title: language === 'fa' ? 'تماس و همکاری' : 'Contact & Partners', icon: 'fa-address-book', color: 'text-blue-400', bg: 'from-blue-900/40 to-blue-950/60', desc: language === 'fa' ? 'درگاه ارتباطی شبکه بین‌المللی امید سبز' : 'Communication portal for international partners', stats: localizeNumber(24, language) + (language === 'fa' ? ' گره' : ' Nodes') },
    ], [t, language]);

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
    const [modulesLayout, setModulesLayout] = useState<'compact' | 'list'>('compact');

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
        <div id="dashboard" className={`animate-fade-in py-6 flex flex-col gap-8`}>
            {/* Header Title Hero Section */}
            <div className="absolute top-4 right-4 z-50">
                {user ? (
                    <div className="flex items-center gap-3 bg-slate-900/50 p-2 rounded-full border border-white/10">
                        <img src={user.photoURL || ''} className="w-8 h-8 rounded-full" alt="User" />
                        <button onClick={handleSignOut} className="text-xs font-bold text-slate-300 hover:text-white px-2">
                            {language === 'fa' ? 'خروج' : 'Sign Out'}
                        </button>
                    </div>
                ) : (
                    <button onClick={handleSignIn} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white p-2 px-4 rounded-full text-xs font-bold transition">
                        <User className="w-4 h-4" />
                        {language === 'fa' ? 'ورود با گوگل' : 'Sign In'}
                    </button>
                )}
            </div>

            <div className="text-center mb-4 relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none"></div>
                
                <div className="inline-block px-4 py-1.5 mb-6 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em] animate-pulse">
                    {language === 'fa' ? 'سامانه یکپارچه مقتدر گارد امید سبز' : 'GreenHope Autonomous Guard Unified Platform'}
                </div>
                
                <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-4 leading-[1.1] max-w-4xl mx-auto">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-teal-300 to-rose-400">
                        {t('home.title')}
                    </span>
                </h1>
                
                <p className="text-sm md:text-base text-slate-300 max-w-3xl mx-auto leading-relaxed mb-6">
                    {language === 'fa' 
                      ? 'پلتفرم پیشرفته دانش‌بنیان امید سبز با تکیه بر تحلیل‌های چندطیفی ماهواره‌ای Sentinel-2، پایش حرارتی مادون قرمز حریق، اسکن آبخوان‌های کارستی زاگرس و ثبت بین‌المللی ایده‌های زیست‌محیطی شما، امنیت پایدار منابع طبیعی را تضمین می‌کند.'
                      : 'GreenHope platform delivers cutting-edge satellite surveillance using Sentinel-2 spectra, real-time thermal anomaly fire monitoring, subterranean karstic hydrology management, and automated global green patent protection.'}
                </p>
            </div>

            {/* THREE HIGH-QUALITY INTERACTIVE TELEMETRY & STRATEGY BLOCKS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Block 1: Real-time Sentinel Fire Code Alert */}
                <div className="bg-slate-900/40 p-5 rounded-3xl border border-white/5 shadow-xl shadow-black/30 flex flex-col justify-between text-right rtl:text-right ltr:text-left hover:border-emerald-500/20 transition-all">
                    <div>
                        <div className="flex items-center justify-between mb-4 flex-row-reverse">
                            <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center border border-rose-500/20 text-rose-400 animate-pulse">
                                <i className="fa-solid fa-fire text-lg"></i>
                            </div>
                            <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-rose-950/40 border border-rose-500/20 text-rose-400">
                                {language === 'fa' ? 'پایش مداوم حریق' : 'Live Thermal Guard'}
                            </span>
                        </div>
                        <h4 className="text-base font-extrabold text-white mb-2 leading-tight">
                            {language === 'fa' ? 'سنجش و آنومالی دمایی حومه' : 'Active Ecological Zones Alert'}
                        </h4>
                        <div className="space-y-2 mt-4 text-[11px] text-slate-300">
                            {sentinelSectors.slice(0, 2).map((sec, idx) => (
                                <div key={idx} className="p-2 rounded-lg bg-black/40 border border-white/5 flex justify-between items-center flex-row-reverse">
                                    <div className="flex items-center gap-1.5 flex-row-reverse">
                                        <span className={`w-2 h-2 rounded-full ${sec.level === 'red' ? 'bg-rose-500 animate-ping' : 'bg-amber-500'}`}></span>
                                        <span className="font-bold">{language === 'fa' ? sec.nameFa : sec.nameEn}</span>
                                    </div>
                                    <span className="font-mono text-slate-400">{sec.temp}°C | Hum: {sec.moisture}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <button 
                        onClick={() => setActiveTab('smartfiresense')}
                        className="mt-4 w-full py-2 bg-rose-950/20 hover:bg-rose-900/30 border border-rose-500/20 text-rose-300 font-bold rounded-xl text-xs transition duration-200"
                    >
                        {language === 'fa' ? 'ورود به پایش راداری حریق ←' : 'Open Fire Sensors Monitor →'}
                    </button>
                </div>

                {/* Block 2: Green Patent System Shield */}
                <div className="bg-slate-900/40 p-5 rounded-3xl border border-white/5 shadow-xl shadow-black/30 flex flex-col justify-between text-right rtl:text-right ltr:text-left hover:border-emerald-500/20 transition-all">
                    <div>
                        <div className="flex items-center justify-between mb-4 flex-row-reverse">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-400">
                                <i className="fa-solid fa-gavel text-lg"></i>
                            </div>
                            <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-emerald-950/40 border border-emerald-500/20 text-emerald-400">
                                {language === 'fa' ? 'اسناد و ایده‌های سبز' : 'Patent Shield'}
                            </span>
                        </div>
                        <h4 className="text-base font-extrabold text-white mb-2 leading-tight">
                            {language === 'fa' ? 'طرح معاهده ثبت و کپی‌رایت ایده' : 'Environmental Intellectual Rights'}
                        </h4>
                        <p className="text-[11px] text-slate-300 leading-relaxed mt-2">
                            {language === 'fa'
                              ? 'صاحبان ایده و جنگل‌داران می‌توانند با استفاده از ماژول ارشد پتنت، اسناد مالکیت فکری اراضی را برای معاهدات بریتانیا و اروپا هماهنگ کنند.'
                              : 'Protect your green initiatives through our streamlined fast-track patent drafting tool with active UK and US Climate program compliance.'}
                        </p>
                        <div className="mt-4 p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-500/10 text-[10px] text-emerald-400 font-bold leading-tight">
                            {language === 'fa' ? '⚡ ۳۵ درصد تخفیف خودکار عوارض دولتی معاهده ثبت' : '⚡ 35% Automatic Fee Exemption Active'}
                        </div>
                    </div>
                    <button 
                        onClick={() => setActiveTab('patent')}
                        className="mt-4 w-full py-2 bg-emerald-950/20 hover:bg-emerald-900/30 border border-emerald-500/20 text-emerald-305 font-bold rounded-xl text-xs transition duration-200"
                    >
                        {language === 'fa' ? 'ورود به سامانه پتنت و ایده •' : 'Launch Patent Shield •'}
                    </button>
                </div>

                {/* Block 3: Ground Water Reservoir & Planting Goal */}
                <div className="bg-slate-900/40 p-5 rounded-3xl border border-white/5 shadow-xl shadow-black/30 flex flex-col justify-between text-right rtl:text-right ltr:text-left hover:border-emerald-500/20 transition-all">
                    <div>
                        <div className="flex items-center justify-between mb-4 flex-row-reverse">
                            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 text-blue-400">
                                <i className="fa-solid fa-water text-lg"></i>
                            </div>
                            <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-blue-950/40 border border-blue-500/20 text-blue-400">
                                {language === 'fa' ? 'آبخوان کارستی' : 'Groundwater Reserves'}
                            </span>
                        </div>
                        <h4 className="text-base font-extrabold text-white mb-2 leading-tight">
                            {language === 'fa' ? 'تراز منابع آبی زاگرس و کاشت' : 'Subterranean Hydrology Reserve'}
                        </h4>
                        
                        {/* Climate Toggle Selector */}
                        <div className="flex bg-black/40 p-1 rounded-lg border border-white/5 gap-1 my-3 justify-center">
                            {['normal', 'drought', 'boost'].map((scen) => (
                                <button
                                    key={scen}
                                    type="button"
                                    onClick={() => setClimateScenario(scen as any)}
                                    className={`flex-1 text-[9px] font-bold py-1 px-1.5 rounded-md transition-all ${
                                        climateScenario === scen
                                            ? 'bg-blue-500 text-white shadow-md'
                                            : 'text-slate-400 hover:text-white'
                                    }`}
                                >
                                    {scen === 'normal' ? (language === 'fa' ? 'نرمال' : 'Normal') :
                                     scen === 'drought' ? (language === 'fa' ? 'خشکسالی' : 'Drought') :
                                     (language === 'fa' ? 'ترسالی' : 'Boost')}
                                </button>
                            ))}
                        </div>

                        <div className="space-y-1.5 text-[11px] text-slate-300">
                            <div className="flex justify-between flex-row-reverse">
                                <span>{language === 'fa' ? 'آبخوان کارستی زاگرس:' : 'Karstic active reserve:'}</span>
                                <span className="font-mono font-bold text-blue-400">{getWaterReserve()}</span>
                            </div>
                            <div className="flex justify-between flex-row-reverse">
                                <span>{language === 'fa' ? 'ریسک تبخیر لایه سطحی:' : 'Evapotranspiration risk:'}</span>
                                <span className="font-mono font-bold text-amber-400">{getClimateRisk()}</span>
                            </div>
                        </div>
                    </div>
                    <button 
                        onClick={() => setActiveTab('water')}
                        className="mt-4 w-full py-2 bg-blue-950/20 hover:bg-blue-900/30 border border-blue-500/20 text-blue-300 font-bold rounded-xl text-xs transition duration-200"
                    >
                        {language === 'fa' ? 'پایش منابع آب زیرزمینی ←' : 'Scan Underground Aquifers →'}
                    </button>
                </div>
            </div>

            {/* SEPARATOR AND COMPACT MODULES GRID CONTROLLER */}
            <div className="mt-4 mb-2 flex items-center justify-between border-b border-white/5 pb-4 flex-row-reverse">
                <div className="text-right rtl:text-right">
                    <h3 className="text-lg font-black text-white">
                        {language === 'fa' ? 'دسترسی سریع به سامانه‌ها و ماژول‌ها' : 'Systems & Core Modules Navigation'}
                    </h3>
                    <p className="text-[11px] text-slate-400">
                        {language === 'fa' ? 'ماژول پایش انتخابی خود را جهت پایش عمیق‌تر اراضی بالا بیاورید.' : 'Configure or check the details of specialized GreenHope widgets.'}
                    </p>
                </div>

                {/* Compact Layout Switch Mode */}
                <div className="flex bg-slate-900/60 p-1 rounded-xl border border-white/5 gap-2 shadow-inner">
                    <button
                        type="button"
                        onClick={() => setModulesLayout('compact')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            modulesLayout === 'compact'
                                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md font-black'
                                : 'text-slate-400 hover:text-white hover:bg-white/5'
                        }`}
                    >
                        <i className="fa-solid fa-shapes text-[10px]"></i>
                        <span>{language === 'fa' ? 'شبکه فشرده دکمه‌ها' : 'Compact Grid'}</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setModulesLayout('list')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            modulesLayout === 'list'
                                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md font-black'
                                : 'text-slate-400 hover:text-white hover:bg-white/5'
                        }`}
                    >
                        <i className="fa-solid fa-list-ul text-[10px]"></i>
                        <span>{language === 'fa' ? 'لیست کوتاه خطور' : 'Short List View'}</span>
                    </button>
                </div>
            </div>

            <div className="flex gap-6 flex-col lg:flex-row">
                <div className="flex-grow">
                    {/* Render Compact Grid Layout */}
                    {modulesLayout === 'compact' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {dashboardItems.map((item) => (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => setActiveTab(item.id)}
                                    className={`group relative overflow-hidden rounded-2xl p-4 bg-slate-900/40 hover:bg-slate-900/85 border border-white/5 text-right rtl:text-right ltr:text-left hover:border-emerald-500/20 active:scale-98 transition-all duration-200 flex items-center justify-between gap-4 shadow-lg h-full`}
                                >
                                    <div className="flex items-center gap-3 flex-row-reverse text-right rtl:text-right ltr:text-left">
                                        <div className={`w-10 h-10 rounded-xl bg-slate-950 border border-white/5 flex items-center justify-center text-sm ${item.color} flex-shrink-0 group-hover:scale-105 transition-transform duration-300 shadow`}>
                                            <i className={`fas ${item.icon}`}></i>
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-extrabold text-white group-hover:text-emerald-400 transition-colors">
                                                {item.title}
                                            </h4>
                                            <p className="text-[10px] text-slate-400 line-clamp-1 font-medium mt-0.5">
                                                {item.desc}
                                            </p>
                                        </div>
                                    </div>
                                    <div className={`text-[9px] font-black px-2 py-0.5 rounded-md bg-black/40 border border-white/5 ${item.color} uppercase tracking-tighter shrink-0`}>
                                        {item.stats}
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Render Short List View Layout */}
                    {modulesLayout === 'list' && (
                        <div className="space-y-2">
                            {dashboardItems.map((item) => (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => setActiveTab(item.id)}
                                    className="w-full group rounded-xl p-3.5 bg-slate-900/30 hover:bg-slate-900/70 border border-white/5 text-right rtl:text-right ltr:text-left hover:border-emerald-500/10 active:scale-99 transition-all duration-150 flex items-center justify-between flex-row-reverse"
                                >
                                    <div className="flex items-center gap-3 flex-row-reverse text-right rtl:text-right">
                                        <div className={`w-8 h-8 rounded-lg bg-slate-950 border border-white/5 flex items-center justify-center text-xs ${item.color} flex-shrink-0`}>
                                            <i className={`fas ${item.icon}`}></i>
                                        </div>
                                        <div>
                                            <span className="text-xs font-extrabold text-white group-hover:text-emerald-400 transition-colors block">
                                                {item.title}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <span className={`text-[9px] font-black px-2 py-0.5 rounded bg-black/40 border border-white/5 ${item.color} uppercase tracking-tighter`}>
                                            {item.stats}
                                        </span>
                                        <i className="fa-solid fa-chevron-left text-[9px] text-slate-500 group-hover:text-emerald-400 transition-colors transform rtl:rotate-0 rotate-180"></i>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right Navigation Sidebar */}
                <div className="hidden lg:block w-52 flex-shrink-0">
                    <div className="bg-slate-900/30 border border-white/5 p-4 rounded-2xl sticky top-24">
                        <h4 className="font-bold text-xs text-white mb-3 text-right rtl:text-right">{language === 'fa' ? 'ناوبری هدایت‌گر' : 'Sector Control'}</h4>
                        <div className="space-y-1">
                            {dashboardItems.map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveTab(item.id)}
                                    className={`w-full text-right rtl:text-right p-2 rounded-lg text-[10px] font-bold text-slate-400 hover:bg-white/5 hover:text-emerald-400 transition flex items-center justify-between flex-row-reverse`}
                                >
                                    <span>{item.title}</span>
                                    <i className={`fas ${item.icon} text-[9px] opacity-60 text-slate-500`}></i>
                                </button>
                            ))}
                        </div>
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
            
            <Timeline />

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
                    selectedLocation={props.selectedLocation}
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
            
            <div className="min-h-[500px] mb-24">
                <React.Suspense fallback={<div className="flex justify-center items-center h-64 text-emerald-500">Loading...</div>}>
                {activeTab === 'dashboard' && renderDashboard()}
                {activeTab === 'reforestation' && renderReforestationTab()}
                {activeTab === 'backlog' && <BacklogView />}
                {activeTab === 'products' && <ProductsView />}
                {activeTab === 'contact' && <ContactView />}
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
                {activeTab === 'patent' && (
                    <div className="animate-fade-in">
                        <button onClick={() => setActiveTab('dashboard')} className="mb-6 flex items-center gap-2 text-slate-400 hover:text-emerald-400 font-bold text-sm">
                            <i className="fas fa-chevron-right rtl:rotate-0 rotate-180"></i>
                            {language === 'fa' ? 'بازگشت به پیشخوان' : 'Back to Dashboard'}
                        </button>
                        <PatentDraftingPage />
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
                {activeTab === 'cooperation' && (
                    <div className="animate-fade-in">
                        <button onClick={() => setActiveTab('dashboard')} className="mb-6 flex items-center gap-2 text-slate-400 hover:text-emerald-400 font-bold text-sm">
                            <i className="fas fa-chevron-right rtl:rotate-0 rotate-180"></i>
                            {language === 'fa' ? 'بازگشت به پیشخوان' : 'Back to Dashboard'}
                        </button>
                        <CooperationRoadmap />
                    </div>
                )}
                </React.Suspense>
            </div>
            
            <React.Suspense fallback={null}>
                <AIModuleOptimizer activeTab={activeTab} />
            </React.Suspense>

            {/* APPLE-STYLE FLOATING NAVIGATION DOCK */}
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] no-print">
                <div className="bg-slate-900/60 backdrop-blur-3xl border border-white/10 p-1.5 rounded-[2rem] flex items-center gap-1 shadow-2xl ring-1 ring-white/5">
                    {appleDockItems.map((item) => (
                        <div key={item.id} className="relative group">
                            <button
                                onClick={() => setActiveTab(item.id)}
                                className={`p-4 rounded-[1.5rem] transition-all duration-500 relative flex items-center justify-center ${
                                    activeTab === item.id 
                                        ? 'bg-white text-slate-950 shadow-xl scale-110' 
                                        : 'text-slate-400 hover:bg-white/10 hover:text-white'
                                }`}
                            >
                                {item.icon}
                                {activeTab === item.id && (
                                    <motion.div 
                                        layoutId="dock-dot"
                                        className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-indigo-500 rounded-full"
                                    />
                                )}
                            </button>
                            
                            {/* Label Tooltip */}
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 px-3 py-1 bg-slate-950 text-white text-[10px] font-black rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none uppercase tracking-widest whitespace-nowrap border border-white/10">
                                {item.label}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default GreenHopePage;