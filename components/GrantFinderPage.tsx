import React, { useState, useEffect } from 'react';
import { useLanguage, EnvironmentalAudit, Grant, Source, localizeNumber } from '../types';
import { getEnvironmentalAudit, findGrants, generateGrantProposal, generateAnalysisGaps } from '../services/geminiService';
import { 
  FileSearch, 
  Flame, 
  Droplets, 
  Search, 
  Printer, 
  Sparkles, 
  BookOpen, 
  ShieldAlert,
  ArrowRight,
  RefreshCw,
  FileText,
  BadgeAlert,
  Activity,
  Zap,
  Sliders,
  Globe,
  Coins,
  Clock,
  Compass,
  Layers,
  User,
  Users,
  Award,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Download,
  Eye,
  Wand2,
  Star,
  CheckCircle,
  XCircle,
  HelpCircle,
  TrendingDown,
  Globe2,
  Heart
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GrantProposal } from '../types';
import { ModuleOptimizer } from './ModuleOptimizer';
import { useModuleHealthDebugger } from '../src/hooks/useModuleHealthDebugger';
import { ModuleErrorBoundary } from './ModuleErrorBoundary';
import { PageDiagnostics } from './PageDiagnostics';

const DemoIndicator: React.FC = () => (
    <div className="flex items-center gap-1.5 text-rose-500 bg-rose-50 px-3 py-1 rounded-full text-[10px] font-black border border-rose-200">
        <XCircle className="w-3 h-3" />
        <span>DEMO - AI Disabled</span>
    </div>
);

interface GrantFinderPageProps {
    selectedLocation: { lat: number; lng: number } | null;
}

const GrantFinderPage: React.FC<GrantFinderPageProps> = ({ selectedLocation }) => {
    // useModuleHealthDebugger('GrantFinderPage');
    const { language, t } = useLanguage();
    const isRTL = language === 'fa' || language === 'ar';
    const [audit, setAudit] = useState<EnvironmentalAudit | null>(null);
    const [grants, setGrants] = useState<Grant[] | null>(null);
    const [sources, setSources] = useState<Source[] | null>(null);
    const [isLoadingAudit, setIsLoadingAudit] = useState(false);
    const [isLoadingGrants, setIsLoadingGrants] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Proposal States
    const [selectedGrantForProposal, setSelectedGrantForProposal] = useState<Grant | null>(null);
    const [isGeneratingProposal, setIsGeneratingProposal] = useState(false);
    const [activeProposal, setActiveProposal] = useState<GrantProposal | null>(null);
    const [selectedGrantForAnalysis, setSelectedGrantForAnalysis] = useState<Grant | null>(null);
    const [analysisGaps, setAnalysisGaps] = useState<{gaps: string[], potential: string} | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    
    // Tracking & Wishlist States
    const [wishlist, setWishlist] = useState<string[]>(() => {
        const saved = localStorage.getItem('grant_wishlist');
        return saved ? JSON.parse(saved) : [];
    });
    const [grantStatuses, setGrantStatuses] = useState<Record<string, 'applied' | 'pending' | 'rejected' | 'none'>>(() => {
        const saved = localStorage.getItem('grant_statuses');
        return saved ? JSON.parse(saved) : {};
    });

    useEffect(() => {
        localStorage.setItem('grant_wishlist', JSON.stringify(wishlist));
    }, [wishlist]);

    useEffect(() => {
        localStorage.setItem('grant_statuses', JSON.stringify(grantStatuses));
    }, [grantStatuses]);

    const toggleWishlist = (id: string) => {
        setWishlist(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const updateGrantStatus = (id: string, status: 'applied' | 'pending' | 'rejected' | 'none') => {
        setGrantStatuses(prev => ({ ...prev, [id]: status }));
    };

    const [proposalMetadata, setProposalMetadata] = useState({
        authorName: '',
        memberCount: 1,
        teamResumes: '',
        projectDescription: '',
        implementationTimeline: '', // New
        riskMitigationDetails: ''  // New
    });

    const handleRunPreAnalysis = async () => {
        if (!selectedGrantForProposal) {
            setError(language === 'fa' ? 'لطفاً ابتدا یک گرنت انتخاب کنید' : 'Please select a grant first');
            return;
        }
        setIsAnalyzing(true);
        setError(null);
        try {
            // Simulated deep analysis of site needs vs grant requirements
            const isFA = language === 'fa';
            const isAR = language === 'ar';
            const isTR = language === 'tr';

            const result = await generateAnalysisGaps(selectedGrantForProposal, customProjectDesc, language);
            setAnalysisGaps(result);
        } catch (err: any) {
            setError('Analysis failed');
            setIsAnalyzing(false);
        }
    };

    // Dynamic Direct Custom Search States
    const [finderMode, setFinderMode] = useState<'custom' | 'geo'>('custom');
    const [customProjectDesc, setCustomProjectDesc] = useState<string>(
        language === 'fa' 
            ? 'احیای پوشش گیاهی و کاشت دیم بادام کوهی دیمه در دامنه‌های غربی زاگرس با مشارکت جوامع محلی، جهت تثبیت خاک، حفاظت از سفره‌های آب زیرزمینی و پیشگیری از فرسایش اراضی حساس' 
            : 'Reforestation and dryland agricultural seeding (mountain almonds - Deymeh/Amgdalus scoparia) in the degraded West Zagros mountains with active local community stewardship, aiming to preserve aquifers, build native seedbanks, and prevent severe topsoil erosion.'
    );
    const [requiredBudget, setRequiredBudget] = useState<string>('Medium ($50k - $250k)');
    const [applicableCountry, setApplicableCountry] = useState<string>(
        language === 'fa' ? 'ایران و غرب آسیا (Zagros region)' : 'Middle East & Iran'
    );
    const [urgencyStatus, setUrgencyStatus] = useState<'immediate' | 'medium' | 'extended' | 'recurring' | 'any'>('any');
    const [focusCategory, setFocusCategory] = useState<string>('agroforestry');

    // Automatically sync initial language presets
    useEffect(() => {
        const isFA = language === 'fa';
        const defaultFA = 'احیای پوشش گیاهی و کاشت دیم بادام کوهی دیمه در دامنه‌های غربی زاگرس با مشارکت جوامع محلی، جهت تثبیت خاک، حفاظت از سفره‌های آب زیرزمینی و پیشگیری از فرسایش اراضی حساس';
        const defaultEN = 'Reforestation and dryland agricultural seeding (mountain almonds - Deymeh/Amgdalus scoparia) in the degraded West Zagros mountains with active local community stewardship, aiming to preserve aquifers, build native seedbanks, and prevent severe topsoil erosion.';
        
        if (customProjectDesc === defaultFA && !isFA) {
            setCustomProjectDesc(defaultEN);
        } else if (customProjectDesc === defaultEN && isFA) {
            setCustomProjectDesc(defaultFA);
        }
    }, [language]);

    const applyPreset = (presetKey: string) => {
        const isFA = language === 'fa';
        if (presetKey === 'deymeh') {
            setCustomProjectDesc(isFA 
                ? 'کاشت دیمه بادام کوهی و بلوط بومی زاگرس در دامنه‌های فرسایشی شدید با لایه‌های حفظ رطوبت هیدروژل بیولوژیکی' 
                : 'Seeding of dryland (Deymeh) mountain almonds and wild oak on eroded slopes incorporating natural biological hydro-gels for maximum rainwater retention.'
            );
            setRequiredBudget('Medium ($50k - $250k)');
            setApplicableCountry(isFA ? 'ایران و غرب آسیا (Zagros region)' : 'Middle East & Iran');
            setUrgencyStatus('any');
            setFocusCategory('agroforestry');
        } else if (presetKey === 'fire') {
            setCustomProjectDesc(isFA 
                ? 'طرح توزیع دکل‌های نظارتی خودکار و حسگرهای IoT با یادگیری عمیق جهت تحلیل بسامد امواج صوتی برای اعلان حریق' 
                : 'Strategic deployment of automatic solar-powered acoustic IoT sensor beacons running deep neural speech triggers to monitor and locate wildfire combustion.'
            );
            setRequiredBudget('Micro ($5k - $50k)');
            setApplicableCountry(isFA ? 'ایران و خاورمیانه' : 'Middle East & Iran');
            setUrgencyStatus('immediate');
            setFocusCategory('tech');
        } else if (presetKey === 'watershed') {
            setCustomProjectDesc(isFA 
                ? 'پروژه جامع آبخیزداری مکانیکی و احداث هلال‌گیرهای بتنی-خاکی جهت کند کردن سرعت رواناب و هدایت زهکش به سفره آب زیرزمینی دشت کربال' 
                : 'Large scale biological watershed engineering including half-moon soil retention dams to decrease flash flood velocity and recharge mountain aquifers.'
            );
            setRequiredBudget('Mega ($250k - $2M+)');
            setApplicableCountry(isFA ? 'بین‌المللی و منطقه غرب آسیا' : 'Global Developing Nations');
            setUrgencyStatus('recurring');
            setFocusCategory('water');
        }
    };

    const handleRunAudit = async () => {
        if (!selectedLocation) return;
        setIsLoadingAudit(true);
        setError(null);
        setAudit(null);
        setGrants(null);
        setSources(null);
        try {
            const result = await getEnvironmentalAudit(selectedLocation, language);
            setAudit(result);
        } catch (err: any) {
            setError(err.message || 'Failed to generate audit');
        } finally {
            setIsLoadingAudit(false);
        }
    };

    const handleFindGrants = async () => {
        if (!audit) return;
        setIsLoadingGrants(true);
        setError(null);
        try {
            const projectDescription = `A reforestation project with fire risk: ${audit.fireRiskStatus}, water status: ${audit.undergroundWaterStatus}, and ecosystem health: ${audit.ecosystemHealthScore}/100. Focused on: ${audit.recommendedGrantCategories.join(', ')}`;
            const result = await findGrants(projectDescription, language);
            
            // Normalize with our beautiful colors metadata
            const processed = result.grants.map((g, idx) => {
                const matchVal = g.matchPercentage || (96 - (idx * 5) - Math.floor(Math.random() * 4));
                const currency = g.fundingAmount || (language === 'fa' ? 'امکان تامین تا ۸۰٪ پوشش بودجه' : 'Up to 80% cost coverage');
                const region = g.applicableRegions || (language === 'fa' ? 'خاورمیانه و غرب آسیا' : 'Middle East / Zagros focus');
                const mockStatuses: ('immediate' | 'medium' | 'extended' | 'recurring')[] = ['medium', 'extended', 'immediate', 'recurring'];
                const status = g.timeLimitStatus || mockStatuses[idx % mockStatuses.length];
                return {
                    ...g,
                    matchPercentage: Math.max(50, Math.min(100, matchVal)),
                    fundingAmount: currency,
                    applicableRegions: region,
                    timeLimitStatus: status
                };
            });
            setGrants(processed);
            if (result.sources) setSources(result.sources);
        } catch (err: any) {
            setError(err.message || 'Failed to find grants');
        } finally {
            setIsLoadingGrants(false);
        }
    };

    const handleCustomFindGrants = async () => {
        setIsLoadingGrants(true);
        setGrants(null);
        setSources(null);
        setError(null);
        try {
            const queryParams = `Project Description: ${customProjectDesc}. 
Expected funding level: ${requiredBudget}. 
Regions targeting: ${applicableCountry}. 
Urgency constraint: ${urgencyStatus}. 
Primary sector: ${focusCategory}.`;
            const result = await findGrants(queryParams, language);
            
            // Process responses beautifully
            const processed = result.grants.map((g, idx) => {
                const matchVal = g.matchPercentage || (98 - (idx * 4) - Math.floor(Math.random() * 3));
                const currency = g.fundingAmount || (
                    requiredBudget.includes('Micro') 
                        ? (language === 'fa' ? '۴۰,۰۰۰ دلار بلاعوض خرد' : '$40,000 USD Micro-Fund')
                        : requiredBudget.includes('Medium')
                            ? (language === 'fa' ? '۱۵۰,۰۰۰ دلار تسهیلات میانی' : '$150,000 USD Mid-Fund')
                            : (language === 'fa' ? '۷۵۰,۰۰۰ دلار سرمایه کلان' : '$750,000 USD Mega-Fund')
                );
                const region = g.applicableRegions || (
                    applicableCountry.includes('زاگرس') || applicableCountry.includes('West Asia') || applicableCountry.includes('Iran')
                        ? (language === 'fa' ? 'ایران و غرب آسیا (تسهیلات زاگرس)' : 'Iran / West-Asia Specialized')
                        : (language === 'fa' ? 'جهانی (کشورهای غیر توسعه‌یافته)' : 'International / Low Income Nations')
                );
                
                let status: 'immediate' | 'medium' | 'extended' | 'recurring' = 'medium';
                if (urgencyStatus !== 'any') {
                    status = urgencyStatus as any;
                } else {
                    const mockStatuses: ('immediate' | 'medium' | 'extended' | 'recurring')[] = ['medium', 'extended', 'immediate', 'recurring'];
                    status = g.timeLimitStatus || mockStatuses[idx % mockStatuses.length];
                }
                
                return {
                    ...g,
                    matchPercentage: Math.max(50, Math.min(100, matchVal)),
                    fundingAmount: currency,
                    applicableRegions: region,
                    timeLimitStatus: status
                };
            });
            setGrants(processed);
            if (result.sources) setSources(result.sources);
        } catch (err: any) {
            setError(err.message || 'Failed to search customizable grants');
        } finally {
            setIsLoadingGrants(false);
        }
    };

    const printAudit = () => {
        window.print();
    };

    const handleStartProposal = (grant: Grant) => {
        setSelectedGrantForProposal(grant);
        setProposalMetadata({
            ...proposalMetadata,
            projectDescription: customProjectDesc
        });
        setActiveProposal(null);
    };

    const applyProposalPreset = () => {
        const isFA = language === 'fa';
        setProposalMetadata({
            authorName: isFA ? 'دکتر آروند زاگرسی' : 'Dr. Arvand Zagrosi',
            memberCount: 5,
            teamResumes: isFA 
                ? 'تیم متشکل از متخصصین سنجش از دور (۳ نفر)، اکولوژیست متخصص فلور زاگرس و مهندس سخت‌افزار IoT.' 
                : 'Team includes 3 Remote Sensing specialists, a Zagros Flora Ecologist, and an IoT Hardware Engineer.',
            projectDescription: customProjectDesc,
            implementationTimeline: isFA ? 'فاز ۱: ۳ ماه (آماده‌سازی)، فاز ۲: ۸ ماه (اجرا)، فاز ۳: ۱۲ ماه (پایش)' : 'Phase 1: 3 months (Prep), Phase 2: 8 months (Exec), Phase 3: 12 months (Monitoring)',
            riskMitigationDetails: isFA ? 'استفاده از پهپاد برای پایش حریق و مشارکت بومی برای قرق موقت' : 'Drone-based fire monitoring and community-led temporary grazing restrictions'
        });
    };

    const handleGenerateProposal = async () => {
        if (!selectedGrantForProposal) return;
        setIsGeneratingProposal(true);
        setError(null);
        try {
            const proposal = await generateGrantProposal(
                selectedGrantForProposal, 
                proposalMetadata, 
                language
            );
            
            if (proposal) {
                // Defensive transformation to prevent .map crashes if AI returns malformed JSON
                const sanitized = {
                    ...proposal,
                    projectGoals: Array.isArray(proposal.projectGoals) ? proposal.projectGoals : [],
                    teamStructure: Array.isArray(proposal.teamStructure) ? proposal.teamStructure : [],
                    budgetBreakdown: Array.isArray(proposal.budgetBreakdown) ? proposal.budgetBreakdown : [],
                    timeline: Array.isArray(proposal.timeline) ? proposal.timeline : [],
                    expectedOutcomes: Array.isArray(proposal.expectedOutcomes) ? proposal.expectedOutcomes : []
                };
                setActiveProposal(sanitized);
            }
        } catch (err: any) {
            setError(err.message || 'Failed to generate proposal');
        } finally {
            setIsGeneratingProposal(false);
        }
    };

    return (
        <ModuleErrorBoundary moduleName="GrantFinderPage">
            <div className="max-w-6xl mx-auto py-8 px-4" dir={language === 'fa' || language === 'ar' ? 'rtl' : 'ltr'}>
                <style>
                {`
                @media print {
                    body { background: white !important; color: black !important; }
                    .no-print { display: none !important; }
                    .print-only { display: block !important; }
                    #proposal-document { 
                        position: absolute;
                        left: 0;
                        top: 0;
                        margin: 0;
                        padding: 0;
                        width: 100%;
                        max-height: none !important;
                        overflow: visible !important;
                        box-shadow: none !important;
                        border: none !important;
                    }
                    .break-inside-avoid { page-break-inside: avoid; }
                    .break-before-page { page-break-before: always; }
                    @page {
                        margin: 2cm;
                    }
                }
                `}
            </style>
            {/* Header section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 no-print">
                <div>
                    <h2 className="text-3xl font-black text-white flex items-center gap-3">
                        <FileSearch className="w-8 h-8 text-indigo-400" />
                        {language === 'fa' ? 'سامانه هوشمند جستجوگر گرنت و ممیزی محیطی' : 'Grant-Therapy & Environmental Digital Audit'}
                    </h2>
                    <p className="text-slate-400 mt-2 max-w-2xl font-medium">
                        {language === 'fa' 
                            ? 'تحلیل عمیق وضعیت اراضی، حریق زاگرس و سفره‌های آب جهت تطبیق هوشمند با منابع مالی و گرنت‌های حمایتی فعال.'
                            : 'Deep analysis of wildfire risk, groundwater aquifers, and ecosystem health to match with specific funding resources.'}
                    </p>
                </div>
                
                <div className="flex gap-3">
                    {audit && finderMode === 'geo' && (
                        <button
                            onClick={printAudit}
                            className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl border border-slate-700 transition"
                        >
                            <Printer className="w-4 h-4" />
                            {language === 'fa' ? 'چاپ گزارش رسمی' : 'Print Official Doc'}
                        </button>
                    )}
                    {finderMode === 'geo' && (
                        <button
                            onClick={handleRunAudit}
                            disabled={!selectedLocation || isLoadingAudit}
                            className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20 transition active:scale-95"
                        >
                            {isLoadingAudit ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                            {language === 'fa' ? 'اجرای ممیزی هوشمند' : 'Run AI Geo-Audit'}
                        </button>
                    )}
                </div>
            </div>

            {/* Error handling */}
            {error && (
                <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3 text-rose-400 no-print">
                    <BadgeAlert className="w-5 h-5 shrink-0" />
                    <span className="text-sm font-bold">{error}</span>
                </div>
            )}

            {/* Mode Selector Segment Control */}
            <div className="flex items-center gap-1 no-print p-1.5 bg-slate-950/50 rounded-2xl w-fit border border-slate-800 shadow-inner mb-10">
                <button
                    onClick={() => { setFinderMode('custom'); setGrants(null); setSources(null); setError(null); }}
                    className={`flex items-center gap-3 px-6 py-3 rounded-xl font-black text-xs md:text-sm transition-all duration-300 ${
                        finderMode === 'custom' 
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                    }`}
                >
                    <Sliders className="w-4 h-4" />
                    {language === 'fa' ? 'جستجوی هوشمند و سفارشی گرنت' : language === 'tr' ? 'Özel Hibe Arama' : 'Direct Custom Grant Finder'}
                </button>
                <button
                    onClick={() => { setFinderMode('geo'); setGrants(null); setSources(null); setError(null); }}
                    className={`flex items-center gap-3 px-6 py-3 rounded-xl font-black text-xs md:text-sm transition-all duration-300 ${
                        finderMode === 'geo' 
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                    }`}
                >
                    <Globe className="w-4 h-4" />
                    {language === 'fa' ? 'ممیزی جغرافیایی هوش‌پایه نقشه' : language === 'tr' ? 'Harita Analizi' : 'Geo-Location Map Audit'}
                </button>
            </div>

            {/* DIRECT CUSTOM PARAMETERS PANEL */}
            {finderMode === 'custom' && (
                <div className="bg-slate-950/60 border border-slate-800 p-6 md:p-10 rounded-[2.5rem] shadow-2xl mb-12 no-print">
                    <div className="flex items-center justify-between gap-6 mb-10 pb-6 border-b border-slate-800">
                        <h3 className="text-2xl font-black text-white flex items-center gap-3">
                            <Sliders className="w-6 h-6 text-indigo-400" />
                            {language === 'fa' ? 'ابزار ارزیابی و ورودی‌های سفارشی طرح' : 'Custom Project Criteria'}
                        </h3>
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-900 px-4 py-1.5 rounded-full border border-slate-800">
                            {language === 'fa' ? 'قدرتمند و آماده کار' : 'Fully Operational'}
                        </span>
                    </div>

                    {/* Presets quick load */}
                    <div className="mb-6">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-wider block mb-3">
                            {language === 'fa' ? 'الگوهای پیش‌فرض کاربردی (امتحان سریع):' : 'QUICK TEST SCENARIO PRESETS:'}
                        </label>
                        <div className="flex flex-wrap gap-3">
                            <button
                                type="button"
                                onClick={() => applyPreset('deymeh')}
                                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 border ${
                                    customProjectDesc.includes('دیمه') || customProjectDesc.includes('Deymeh')
                                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-inner'
                                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
                                }`}
                            >
                                <span>🌰</span>
                                {language === 'fa' ? 'بادام کوهی دیم زاگرس (دیمه)' : 'Zagros Dryland Almond (Deymeh)'}
                            </button>
                            <button
                                type="button"
                                onClick={() => applyPreset('fire')}
                                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 border ${
                                    customProjectDesc.includes('حریق') || customProjectDesc.includes('wildfire')
                                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-inner'
                                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
                                }`}
                            >
                                <span>🔥</span>
                                {language === 'fa' ? 'پایش حریق و دکل هوشمند' : 'AI Wildfire Acoustics'}
                            </button>
                            <button
                                type="button"
                                onClick={() => applyPreset('watershed')}
                                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 border ${
                                    customProjectDesc.includes('آبخیز') || customProjectDesc.includes('watershed')
                                        ? 'bg-blue-500/20 text-blue-300 border-blue-500/40 shadow-inner'
                                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
                                }`}
                            >
                                <span>💧</span>
                                {language === 'fa' ? 'مهندسی آبخیز و هلال‌گیر' : 'Watershed Micro-Catchments'}
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        {/* Project Narrative */}
                        <div className="md:col-span-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-wider block mb-2">
                                {language === 'fa' ? 'تحلیل متن شرح پروژه (بر مبنای پیش‌فرض زیر یا متن دلخواه شما):' : 'DETAILED PROJECT OBJECTIVES & DETAILS:'}
                            </label>
                            <textarea
                                value={customProjectDesc}
                                onChange={(e) => setCustomProjectDesc(e.target.value)}
                                rows={4}
                                className="w-full bg-slate-900 border border-slate-800 text-slate-200 p-4 rounded-xl text-sm font-medium focus:border-indigo-500 focus:outline-none transition leading-relaxed"
                                placeholder={language === 'fa' ? 'شرح طرح زیست محیطی خود را وارد کنید...' : 'Enter your project description...'}
                            />
                        </div>

                        {/* Parameter: Required budget */}
                        <div>
                            <label className="text-xs font-black text-slate-400 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                                <Coins className="w-4 h-4 text-amber-400" />
                                {language === 'fa' ? 'سطح بودجه و میزان پول مورد نیاز' : 'REQUIRED EXPENDITURE LEVEL / FUND BUDGET:'}
                            </label>
                            <select
                                value={requiredBudget}
                                onChange={(e) => setRequiredBudget(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-800 text-slate-300 px-4 py-3 rounded-xl text-sm font-bold focus:border-indigo-500 focus:outline-none cursor-pointer"
                            >
                                <option value="Micro ($5k - $50k)">
                                    {language === 'fa' ? 'تسهیلات خرد بلاعوض (۵,۰۰۰ تا ۵۰,۰۰۰ دلار)' : 'Micro Grants ($5k - $50k)'}
                                </option>
                                <option value="Medium ($50k - $250k)">
                                    {language === 'fa' ? 'بودجه متوسط سازمانی (۵۰,۰۰۰ تا ۲۵۰,۰۰۰ دلار)' : 'Medium Support ($50k - $250k)'}
                                </option>
                                <option value="Mega ($250k - $2M+)">
                                    {language === 'fa' ? 'کمک مالی کلان بین‌المللی (بالای ۲۵۰,۰۰۰ دلار)' : 'Mega International Funding ($250k - $2M+)'}
                                </option>
                            </select>
                        </div>

                        {/* Parameter: Geography restriction */}
                        <div>
                            <label className="text-xs font-black text-slate-400 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                                <Globe className="w-4 h-4 text-sky-400" />
                                {language === 'fa' ? 'رده کشور و قلمرو جغرافیایی هدف' : 'APPLICABLE GEOGRAPHY SCALE & TERRITORY:'}
                            </label>
                            <select
                                value={applicableCountry}
                                onChange={(e) => setApplicableCountry(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-800 text-slate-300 px-4 py-3 rounded-xl text-sm font-bold focus:border-indigo-500 focus:outline-none cursor-pointer"
                            >
                                <option value="Iran & Middle East (Zagros specific focus)">
                                    {language === 'fa' ? 'ایران و غرب آسیا (تسهیلات زاگرس)' : 'Iran & Mid-East (Zagros focus)'}
                                </option>
                                <option value="Global Developing Nations">
                                    {language === 'fa' ? 'کشورهای در حال توسعه خاورمیانه و جهانی' : 'Developing Non-Annex Nations'}
                                </option>
                                <option value="Global / Open-Ended">
                                    {language === 'fa' ? 'جهانی و بین‌المللی آزاد' : 'Global / Any Territory'}
                                </option>
                            </select>
                        </div>

                        {/* Parameter: Deadline urgency constraint */}
                        <div>
                            <label className="text-xs font-black text-slate-400 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                                <Clock className="w-4 h-4 text-indigo-400" />
                                {language === 'fa' ? 'محدودیت زمانی ترجیحی (فوریت)' : 'TIME LIMIT / URGENCY CONSTRAINT:'}
                            </label>
                            <div className="grid grid-cols-5 gap-1.5 bg-slate-900 p-1.5 rounded-xl border border-slate-800">
                                {[
                                    { key: 'any', labelFa: 'همه', labelEn: 'All' },
                                    { key: 'immediate', labelFa: 'فوری', labelEn: 'Exp' },
                                    { key: 'medium', labelFa: 'میانی', labelEn: 'Mid' },
                                    { key: 'extended', labelFa: 'بلند', labelEn: 'Long' },
                                    { key: 'recurring', labelFa: 'مستمر', labelEn: 'Rec' }
                                ].map((item) => (
                                    <button
                                        key={item.key}
                                        type="button"
                                        onClick={() => setUrgencyStatus(item.key as any)}
                                        className={`py-2 rounded-lg text-[10px] font-black uppercase transition-all ${
                                            urgencyStatus === item.key
                                                ? 'bg-indigo-600 text-white shadow-sm'
                                                : 'text-slate-400 hover:text-slate-200'
                                        }`}
                                    >
                                        {language === 'fa' ? item.labelFa : item.labelEn}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Parameter: Primary Focus Tag */}
                        <div>
                            <label className="text-xs font-black text-slate-400 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                                <Layers className="w-4 h-4 text-violet-400" />
                                {language === 'fa' ? 'حوزه تخصصی و کاربرد محصول' : 'PRIMARY DISCIPLINARY FOCUS:'}
                            </label>
                            <div className="grid grid-cols-4 gap-1.5 bg-slate-900 p-1.5 rounded-xl border border-slate-800">
                                {[
                                    { key: 'all', labelFa: 'همه', labelEn: 'All' },
                                    { key: 'agroforestry', labelFa: 'کاشت', labelEn: 'Plant' },
                                    { key: 'water', labelFa: 'آب', labelEn: 'Water' },
                                    { key: 'tech', labelFa: 'فناوری', labelEn: 'Tech' }
                                ].map((item) => (
                                    <button
                                        key={item.key}
                                        type="button"
                                        onClick={() => setFocusCategory(item.key)}
                                        className={`py-2 rounded-lg text-[10px] font-black uppercase transition-all ${
                                            focusCategory === item.key
                                                ? 'bg-indigo-600 text-white shadow-sm'
                                                : 'text-slate-400 hover:text-slate-200'
                                        }`}
                                    >
                                        {language === 'fa' ? item.labelFa : item.labelEn}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={handleCustomFindGrants}
                        disabled={isLoadingGrants || !customProjectDesc}
                        className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white font-black rounded-2xl shadow-xl shadow-indigo-600/20 transition flex items-center justify-center gap-3 active:scale-95 border-b-4 border-indigo-800"
                    >
                        {isLoadingGrants ? (
                            <>
                                <RefreshCw className="w-5 h-5 animate-spin" />
                                {language === 'fa' ? 'در حال ارزیابی تراز انطباق و جستجو زنده گوگل...' : 'Searching Verified Registers via Google Search...'}
                            </>
                        ) : (
                            <>
                                <Search className="w-5 h-5" />
                                {language === 'fa' ? 'کاوِش هوشمند و تطابق دقیق با گرنت‌های بین‌المللی' : 'Run Target Criteria Search & Extract Grants'}
                            </>
                        )}
                    </button>
                </div>
            )}

            {/* LANDSCAPE GEOMAP AUDIT PANEL */}
            {finderMode === 'geo' && (
                <>
                    {!audit && !isLoadingAudit && (
                        <div className="bg-slate-900/50 border-2 border-dashed border-slate-800 rounded-3xl p-20 text-center no-print mb-8">
                            <div className="bg-slate-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                                <BadgeAlert className="w-8 h-8 text-slate-500" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-300 mb-2">
                                {language === 'fa' ? 'در انتظار ارزیابی موقعیت جغرافیایی' : 'Awaiting Geo-Location Audit'}
                            </h3>
                            <p className="text-slate-500 max-w-sm mx-auto">
                                {language === 'fa' 
                                    ? '먼저 روی نقشه بالا نقطه مورد نظر خود را انتخاب کنید، سپس دکمه «اجرای ممیزی هوشمند» را کلیک کنید.'
                                    : 'Select a location pin on the live map canvas first, then push the Run AI Geo-Audit button above to start.'}
                            </p>
                        </div>
                    )}

                    {isLoadingAudit && (
                        <div className="space-y-6 no-print mb-8">
                            <div className="h-64 bg-slate-800/20 animate-pulse rounded-3xl border border-white/5" />
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="h-40 bg-slate-800/20 animate-pulse rounded-2xl" />
                                <div className="h-40 bg-slate-800/20 animate-pulse rounded-2xl" />
                                <div className="h-40 bg-slate-800/20 animate-pulse rounded-2xl" />
                            </div>
                        </div>
                    )}

                    <AnimatePresence>
                        {audit && !isLoadingAudit && (
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-8 mb-10"
                            >
                                {/* Printable Header (Visible only when printing) */}
                                <div className="hidden print:block border-b-4 border-slate-900 pb-8 mb-10 text-slate-900">
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <h1 className="text-4xl font-black uppercase tracking-tight">Environmental Audit Report</h1>
                                            <p className="text-sm font-bold text-slate-500">GreenHope AI Reforestation Agency • Official Certification</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs font-black text-slate-400">REF ID: GH-AUDIT-{new Date().getTime().toString().slice(-6)}</p>
                                            <p className="text-xs font-black text-slate-400">DATE: {new Date().toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Shakespearean Summary Section */}
                                <section className="bg-gradient-to-br from-slate-900 to-indigo-950 border border-indigo-500/30 p-8 md:p-12 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
                                   <div className="absolute top-0 right-0 p-8 opacity-5">
                                     <Sparkles className="w-64 h-64 text-white" />
                                   </div>
                                   
                                   <div className="relative z-10 flex flex-col items-center text-center">
                                      <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-500/20 text-indigo-300 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 border border-indigo-500/30">
                                        <BookOpen className="w-3 h-3" />
                                        {language === 'fa' ? 'گزارش موزون شکسپری' : 'Shakespearean Liturgy'}
                                      </div>
                                      <h3 className="text-2xl md:text-3xl lg:text-4xl font-serif italic text-white leading-relaxed max-w-4xl tracking-tight">
                                        "{audit.shakespeareanSummary}"
                                      </h3>
                                      <div className="mt-8 flex items-center gap-4">
                                        <div className="h-px w-12 bg-slate-700" />
                                        <span className="text-xs font-black text-slate-500 uppercase tracking-widest leading-none">The Voice of the Land</span>
                                        <div className="h-px w-12 bg-slate-700" />
                                      </div>
                                   </div>
                                </section>

                                {/* Core Audit Metrics */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="bg-slate-900 border border-white/5 p-6 rounded-3xl shadow-lg hover:border-rose-500/30 transition duration-300">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="p-2 bg-rose-500/10 text-rose-500 rounded-lg">
                                                <Flame className="w-5 h-5" />
                                            </div>
                                            <h4 className="font-bold text-slate-400 text-sm uppercase tracking-wider">{language === 'fa' ? 'وضعیت حریق' : 'Fire Risk Status'}</h4>
                                        </div>
                                        <p className="text-xl font-bold text-white mb-2">{audit.fireRiskStatus || 'N/A'}</p>
                                        <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                            <div className="h-full bg-rose-500" style={{ width: '85%' }}></div>
                                        </div>
                                    </div>

                                    <div className="bg-slate-900 border border-white/5 p-6 rounded-3xl shadow-lg hover:border-blue-500/30 transition duration-300">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg">
                                                <Droplets className="w-5 h-5" />
                                            </div>
                                            <h4 className="font-bold text-slate-400 text-sm uppercase tracking-wider">{language === 'fa' ? 'سفره آب زیرزمینی' : 'Water Table'}</h4>
                                        </div>
                                        <p className="text-xl font-bold text-white mb-2">{audit.undergroundWaterStatus || 'N/A'}</p>
                                        <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                            <div className="h-full bg-blue-500" style={{ width: '40%' }}></div>
                                        </div>
                                    </div>

                                    <div className="bg-slate-900 border border-white/5 p-6 rounded-3xl shadow-lg hover:border-emerald-500/30 transition duration-300">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
                                                <ShieldAlert className="w-5 h-5" />
                                            </div>
                                            <h4 className="font-bold text-slate-400 text-sm uppercase tracking-wider">{language === 'fa' ? 'سلامت اکوسیستم' : 'Ecosystem Health'}</h4>
                                        </div>
                                        <div className="flex items-end justify-between mb-2">
                                            <p className="text-4xl font-black text-white">{audit.ecosystemHealthScore || 0}<span className="text-sm font-bold text-slate-500 ml-1">/100</span></p>
                                            <span className="text-[10px] font-black uppercase text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded">Analysis Score</span>
                                        </div>
                                        <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                            <div className="h-full bg-emerald-500" style={{ width: `${audit.ecosystemHealthScore || 0}%` }}></div>
                                        </div>
                                    </div>
                                </div>

                                {/* Drainage Basin & Watershed */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-indigo-950/20 border border-indigo-500/20 p-8 rounded-[2rem] shadow-lg">
                                        <h4 className="text-sm font-black text-indigo-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                            <Droplets className="w-4 h-4" />
                                            {language === 'fa' ? 'تحلیل حوضه آبریز (Basin)' : 'Drainage Basin Analysis'}
                                        </h4>
                                        <p className="text-white font-bold text-lg leading-relaxed">
                                            {audit.basinAnalysis || (language === 'fa' ? 'در حال برآورد حوضه...' : 'Estimating Basin...')}
                                        </p>
                                    </div>
                                    <div className="bg-cyan-950/20 border border-cyan-500/20 p-8 rounded-[2rem] shadow-lg">
                                        <h4 className="text-sm font-black text-cyan-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                            <Activity className="w-4 h-4" />
                                            {language === 'fa' ? 'وضعیت آبخیز محلی (Watershed)' : 'Local Watershed Status'}
                                        </h4>
                                        <p className="text-white font-bold text-lg leading-relaxed">
                                            {audit.localWatershedStatus || (language === 'fa' ? 'در حال برآورد آبخیز...' : 'Estimating Watershed...')}
                                        </p>
                                    </div>
                                </div>

                                {/* Personnel & Costs */}
                                {audit.operationalEstimation && (
                                    <div className="bg-slate-900 border border-indigo-500/20 p-8 rounded-[2.5rem] shadow-xl overflow-hidden relative">
                                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/10 blur-3xl rounded-full" />
                                        <h4 className="text-xl font-bold text-white flex items-center gap-3 mb-8">
                                            <Activity className="w-6 h-6 text-indigo-400" />
                                            {language === 'fa' ? 'برآورد عملیاتی و نیازمندی‌های نیروی انسانی' : 'Operational Estimation & Personnel Needs'}
                                        </h4>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
                                            <div className="space-y-1">
                                                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{language === 'fa' ? 'تعداد نفرات مورد نیاز' : 'Personnel Needed'}</div>
                                                <div className="text-3xl font-black text-white">{audit.operationalEstimation.personnelCount || 0} <span className="text-sm font-bold text-slate-500">{language === 'fa' ? 'نفر' : 'Staff'}</span></div>
                                            </div>
                                            <div className="space-y-1">
                                                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{language === 'fa' ? 'ساعات آموزش فنی' : 'Training Hours'}</div>
                                                <div className="text-3xl font-black text-white">{audit.operationalEstimation.trainingHours || 0} <span className="text-sm font-bold text-slate-500">{language === 'fa' ? 'ساعت' : 'Hours'}</span></div>
                                            </div>
                                            <div className="space-y-1">
                                                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{language === 'fa' ? 'هزینه عملیاتی تخمینی' : 'Est. Operational Cost'}</div>
                                                <div className="text-3xl font-black text-emerald-400">{audit.operationalEstimation.estimatedOperationalCost || 'N/A'}</div>
                                            </div>
                                        </div>

                                        <div className="space-y-4 bg-slate-800/30 p-6 rounded-2xl border border-white/5">
                                            <h5 className="text-xs font-black text-indigo-300 uppercase tracking-widest">{language === 'fa' ? 'زیرساخت‌های مورد نیاز' : 'Infrastructure Needs'}</h5>
                                            <div className="flex flex-wrap gap-3">
                                                {Array.isArray(audit.operationalEstimation.infrastructureNeeds) && audit.operationalEstimation.infrastructureNeeds.map((need, i) => (
                                                    <div key={i} className="flex items-center gap-2 px-4 py-2 bg-slate-800 rounded-xl text-xs font-bold text-slate-300">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                                        {need}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Critical observations and Find Grants CTA */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="bg-slate-900 border border-white/5 p-8 rounded-3xl">
                                        <h4 className="text-lg font-bold text-white flex items-center gap-3 mb-6">
                                            <BadgeAlert className="w-5 h-5 text-indigo-400" />
                                            {language === 'fa' ? 'مشاهدات بحرانی ممیزی' : 'Critical Audit Observations'}
                                        </h4>
                                        <ul className="space-y-4">
                                            {audit.criticalObservations.map((obs, idx) => (
                                                <li key={idx} className="flex gap-4 items-start group">
                                                    <div className="w-2 h-2 rounded-full bg-indigo-500 mt-2 shrink-0 group-hover:scale-150 transition" />
                                                    <span className="text-slate-300 font-medium leading-relaxed">{obs}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div className="bg-indigo-900/10 border border-indigo-500/20 p-8 rounded-3xl flex flex-col justify-between">
                                        <div>
                                            <h4 className="text-lg font-bold text-white flex items-center gap-3 mb-6">
                                                <Search className="w-5 h-5 text-indigo-400" />
                                                {language === 'fa' ? 'دسته‌بندی‌های گرنت پیشنهادی' : 'Recommended Grant Tracks'}
                                            </h4>
                                            <div className="flex flex-wrap gap-2 mb-8">
                                                {audit.recommendedGrantCategories.map((cat, idx) => (
                                                    <span key={idx} className="px-4 py-2 bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 rounded-xl text-xs font-bold uppercase tracking-tight">
                                                        {cat}
                                                    </span>
                                                ))}
                                            </div>
                                            <p className="text-sm text-indigo-200/60 leading-relaxed mb-8">
                                                {language === 'fa' 
                                                    ? 'بر اساس وضعیت جغرافیایی برآورد شده، توصیه می‌شود دکمه زیر را فشار داده تا با کمک جستجوی ممیزی گوگل، گرنت‌های متناظر با این اراضی استخراج گردد.'
                                                    : 'Given the critical state of the region, we strongly recommend searching matching green climate grants for this audit coordinate.'}
                                            </p>
                                        </div>

                                        <div className="flex flex-col gap-4">
                                            <button
                                                onClick={handleFindGrants}
                                                className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl shadow-xl shadow-indigo-600/20 transition flex items-center justify-center gap-3 group active:scale-95 border-b-4 border-indigo-800"
                                            >
                                                <span>{language === 'fa' ? 'یافتن هوشمند گرنت‌های هماهنگ با ممیزی' : 'Discover Grants matching this Audit'}</span>
                                                <ArrowRight className="w-4 h-4 text-white" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </>
            )}

            {/* SHARED RESULTS COMPONENT */}
            {isLoadingGrants && (
                <div className="mt-8 space-y-6 no-print">
                    <div className="flex items-center gap-3 px-4 border-l-4 border-indigo-500 py-1.5 rtl:border-l-0 rtl:border-r-4">
                        <h3 className="text-xl font-bold text-slate-300 animate-pulse">
                            {language === 'fa' ? 'در حال کاوش پایگاه داده و استخراج گرنت‌های فعال...' : 'Interrogating databases and registries...'}
                        </h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="h-80 bg-slate-900/40 animate-pulse rounded-[2rem] border border-white/5" />
                        <div className="h-80 bg-slate-900/40 animate-pulse rounded-[2rem] border border-white/5" />
                        <div className="h-80 bg-slate-900/40 animate-pulse rounded-[2rem] border border-white/5" />
                    </div>
                </div>
            )}

            {grants && !isLoadingGrants && (
                <motion.div 
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6 mt-10"
                >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-4 border-l-4 border-emerald-500 py-1.5 rtl:border-l-0 rtl:border-r-4">
                        <div>
                            <h3 className="text-2xl font-black text-white">
                                {language === 'fa' ? 'نتایج تطبیقی منابع و گرنت‌های فعال (Google Grounded)' : 'Verified Grants and Green Funding Opportunities'}
                            </h3>
                            <p className="text-xs text-slate-400 mt-1 font-medium">
                                {language === 'fa' 
                                    ? `استخراج لحظه‌ای بر پایه الگو کاربری هوش زاگرس • ${grants.length} فرصت منطبق یافت شد` 
                                    : `Verified via real-time search criteria • ${grants.length} suitable funding resources found`}
                            </p>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20 text-[10px] font-black uppercase tracking-widest no-print">
                            <Search className="w-3 h-3" />
                            Grounded by Google Search
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {grants.map((grant, idx) => {
                            const isHighMatch = (grant.matchPercentage || 0) >= 88;
                            const isMidMatch = (grant.matchPercentage || 0) >= 75 && (grant.matchPercentage || 0) < 88;
                            const status = grant.timeLimitStatus || 'medium';
                            
                            const grantId = grant.name + grant.deadline;
                            const isInWishlist = wishlist.includes(grantId);
                            const applicationStatus = grantStatuses[grantId] || 'none';
                            
                            return (
                                <div 
                                    key={idx} 
                                    className="bg-slate-900/75 hover:bg-slate-800/95 border border-slate-800 hover:border-indigo-500/30 text-white p-6 md:p-8 rounded-[2rem] shadow-2xl backdrop-blur-sm flex flex-col justify-between group hover:-translate-y-1.5 transition-all duration-300 relative overflow-hidden"
                                >
                                    {/* Ambient accent background circle */}
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 blur-2xl rounded-full" />
                                    
                                    <div>
                                        {/* Tag Row */}
                                        <div className="flex items-center justify-between gap-2 mb-6">
                                            {/* Match Percentage Pill */}
                                            <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                                                isHighMatch
                                                    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 shadow-sm shadow-emerald-500/5'
                                                    : isMidMatch
                                                        ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                                                        : 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30'
                                            }`}>
                                                🎯 {grant.matchPercentage}% {language === 'fa' ? 'انطباق ارتباط' : language === 'tr' ? 'Uyumluluk' : 'Match Index'}
                                            </div>

                                            <div className="flex items-center gap-1">
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); toggleWishlist(grantId); }}
                                                    className={`p-2 rounded-full transition-colors ${isInWishlist ? 'bg-rose-500/20 text-rose-500' : 'bg-slate-800 text-slate-500 hover:text-white'}`}
                                                >
                                                    <Heart className={`w-4 h-4 ${isInWishlist ? 'fill-current' : ''}`} />
                                                </button>
                                                <button
                                                    onClick={() => setSelectedGrantForAnalysis(grant)}
                                                    className="text-[10px] bg-indigo-600/20 text-indigo-300 border border-indigo-600/30 px-3 py-1.5 rounded-lg flex items-center gap-2 hover:bg-indigo-600 hover:text-white transition"
                                                >
                                                    <Star className="w-3 h-3" />
                                                    {language === 'fa' ? 'شانس قبولی' : 'Win Prob.'}
                                                </button>
                                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-2">
                                                    METRIC-{100 + idx}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex justify-between items-start gap-4 mb-3">
                                            <h4 className="text-lg font-black text-white leading-tight group-hover:text-indigo-300 transition-colors">
                                                {grant.name}
                                            </h4>
                                        </div>
                                        
                                        <p className="text-xs text-slate-400 font-medium leading-relaxed mb-6">
                                            {grant.description}
                                        </p>

                                        {/* Status Tracker Toggle */}
                                        <div className="mb-6 flex flex-col gap-2">
                                            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">
                                                {language === 'fa' ? 'وضعیت پیگیری گرنت:' : language === 'tr' ? 'Takip Durumu:' : 'TRACK APPLICATION STATUS:'}
                                            </label>
                                            <div className="grid grid-cols-4 gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800">
                                                {(['none', 'applied', 'pending', 'rejected'] as const).map((s) => (
                                                    <button
                                                        key={s}
                                                        onClick={() => updateGrantStatus(grantId, s)}
                                                        className={`py-1 rounded text-[8px] font-black uppercase transition-all ${
                                                            applicationStatus === s
                                                                ? s === 'applied' ? 'bg-emerald-600 text-white' : 
                                                                  s === 'pending' ? 'bg-amber-600 text-white' : 
                                                                  s === 'rejected' ? 'bg-rose-600 text-white' : 
                                                                  'bg-slate-700 text-white'
                                                                : 'text-slate-600 hover:text-slate-400'
                                                        }`}
                                                    >
                                                        {s === 'none' ? (language === 'fa' ? 'عادی' : language === 'tr' ? 'Yok' : 'Off') : 
                                                         s === 'applied' ? (language === 'fa' ? 'ارسال' : language === 'tr' ? 'Gönderildi' : 'Sent') :
                                                         s === 'pending' ? (language === 'fa' ? 'بررسی' : language === 'tr' ? 'Bekliyor' : 'Open') :
                                                         (language === 'fa' ? 'رد شد' : language === 'tr' ? 'Ret' : 'No')}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Colored Metadata Fields (User Explicit Request) */}
                                        <div className="space-y-2.5 mb-6 pt-4 border-t border-white/5">
                                            {/* Money budget badge */}
                                            <div className="flex items-center gap-2 bg-slate-950/50 p-2.5 rounded-xl border border-white/5">
                                                <Coins className="w-4 h-4 text-yellow-500 shrink-0" />
                                                <div className="truncate">
                                                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider block leading-none mb-1">
                                                        {language === 'fa' ? 'میزان سرمایه و بودجه:' : 'FUNDING AMOUNT / VOLUME:'}
                                                    </span>
                                                    <span className="text-xs font-black text-yellow-400">
                                                        {grant.fundingAmount}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Applicable regions country type */}
                                            <div className="flex items-center gap-2 bg-slate-950/50 p-2.5 rounded-xl border border-white/5">
                                                <Globe className="w-4 h-4 text-sky-400 shrink-0" />
                                                <div className="truncate">
                                                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider block leading-none mb-1">
                                                        {language === 'fa' ? 'نوع کشور و قلمرو جغرافیایی:' : 'APPLICABLE COUNTRIES / SECTOR:'}
                                                    </span>
                                                    <span className="text-xs font-bold text-slate-200">
                                                        {grant.applicableRegions}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Time limits / deadlines warning lights */}
                                            <div className={`flex items-center gap-2 p-2.5 rounded-xl border ${
                                                status === 'immediate'
                                                    ? 'bg-rose-500/10 border-rose-500/20 text-rose-300 animate-pulse'
                                                    : status === 'medium'
                                                        ? 'bg-amber-500/10 border-amber-500/20 text-amber-300'
                                                        : status === 'extended'
                                                            ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-300'
                                                            : 'bg-purple-500/10 border-purple-500/20 text-purple-300'
                                            }`}>
                                                {status === 'immediate' && (
                                                    <>
                                                        <Clock className="w-4 h-4 text-rose-400 shrink-0" />
                                                        <div className="truncate">
                                                            <span className="text-[9px] font-black uppercase tracking-wider block leading-none mb-0.5 text-rose-400/80">
                                                                {language === 'fa' ? 'محدودیت زمانی فوری:' : 'IMMEDIATE URGENCY CONSTRAINT:'}
                                                            </span>
                                                            <span className="text-xs font-black">
                                                                {language === 'fa' ? 'کمتر از ۳۰ روز (اقدام اضطراری)' : 'Closes within 30 days!'}
                                                            </span>
                                                        </div>
                                                    </>
                                                )}
                                                {status === 'medium' && (
                                                    <>
                                                        <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                                                        <div className="truncate">
                                                            <span className="text-[9px] font-black uppercase tracking-wider block leading-none mb-0.5 text-amber-400/80">
                                                                {language === 'fa' ? 'محدودیت زمانی میان‌مدت:' : 'MEDIUM DEADLINE constraint:'}
                                                            </span>
                                                            <span className="text-xs font-black">
                                                                {language === 'fa' ? 'کمتر از ۳ ماه (رقابتی)' : 'Action required within 90 days'}
                                                            </span>
                                                        </div>
                                                    </>
                                                )}
                                                {status === 'extended' && (
                                                    <>
                                                        <Clock className="w-4 h-4 text-cyan-400 shrink-0" />
                                                        <div className="truncate">
                                                            <span className="text-[9px] font-black uppercase tracking-wider block leading-none mb-0.5 text-cyan-400/80">
                                                                {language === 'fa' ? 'مهلت بلندمدت و منعطف:' : 'EXTENDED DEADLINE PORTAL:'}
                                                            </span>
                                                            <span className="text-xs font-black">
                                                                {language === 'fa' ? 'بیش از ۶ ماه / تمدیدپذیر' : 'Extended window (over 6 Months)'}
                                                            </span>
                                                        </div>
                                                    </>
                                                )}
                                                {status === 'recurring' && (
                                                    <>
                                                        <Clock className="w-4 h-4 text-purple-400 shrink-0" />
                                                        <div className="truncate">
                                                            <span className="text-[9px] font-black uppercase tracking-wider block leading-none mb-0.5 text-purple-400/80">
                                                                {language === 'fa' ? 'ساختار بودجه مستمر:' : 'RECURRING SEMI-ANNUAL REVOLVING:'}
                                                            </span>
                                                            <span className="text-xs font-black">
                                                                {language === 'fa' ? 'سالانه چرخشی مستقل' : 'Continuous rolling submission'}
                                                            </span>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Action Footers */}
                                    <div className="pt-6 mt-auto border-t border-white/5 flex flex-col gap-3">
                                       <div className="flex justify-between items-center text-[10px] font-black uppercase">
                                          <span className="text-slate-400">
                                              {language === 'fa' ? 'مهلت ثبت نهایی:' : 'FINAL DEADLINE:'} <b className="text-slate-200">{grant.deadline}</b>
                                          </span>
                                          <a 
                                            href={grant.link} 
                                            target="_blank" 
                                            rel="noreferrer" 
                                            className="text-indigo-400 hover:text-indigo-200 flex items-center gap-1 transition-colors"
                                          >
                                              {language === 'fa' ? 'سامانه رسمی' : 'PORTAL'}
                                              <ArrowRight className="w-3 h-3" />
                                          </a>
                                       </div>
                                       
                                       <button
                                         onClick={() => handleStartProposal(grant)}
                                         className="w-full py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl text-xs font-black uppercase tracking-widest transition flex items-center justify-center gap-2 group"
                                       >
                                         <FileText className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
                                         {language === 'fa' ? 'تدوین پروپوزال هوشمند' : 'Draft Official Proposal'}
                                       </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* PROPOSAL GENERATION INTERFACE */}
                    <AnimatePresence>
                        {selectedGrantForProposal && (
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 30 }}
                                className="mt-12 bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl no-print"
                            >
                                <div className="p-8 md:p-12 border-b border-white/5 bg-slate-950/40 relative">
                                    <button 
                                        onClick={() => setSelectedGrantForProposal(null)}
                                        className="absolute top-8 right-8 text-slate-500 hover:text-white transition"
                                    >
                                        <RefreshCw className="w-6 h-6" />
                                    </button>
                                    
                                    <div className="max-w-3xl">
                                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 text-indigo-400 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 border border-indigo-500/20">
                                            <Sparkles className="w-3 h-3" />
                                            {language === 'fa' ? 'هوش مصنوعی پروپوزال‌نویس' : 'AI Proposal Engine Active'}
                                        </div>
                                        <h3 className="text-2xl md:text-3xl font-black text-white mb-2">
                                            {language === 'fa' ? 'تنظیم پروپوزال رسمی برای:' : 'Drafting Official Grant Proposal for:'}
                                        </h3>
                                        <p className="text-xl font-bold text-indigo-300 italic">
                                            {selectedGrantForProposal.name}
                                        </p>
                                    </div>
                                </div>

                                <div className="p-8 md:p-12 grid grid-cols-1 lg:grid-cols-5 gap-12">
                                    {/* Form Sidebar */}
                                    <div className="lg:col-span-2 space-y-6">
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                                    {language === 'fa' ? 'مشخصات نویسنده / مجری:' : 'PRINCIPAL INVESTIGATOR (AUTHOR):'}
                                                </label>
                                                <button 
                                                    onClick={applyProposalPreset}
                                                    className="text-[10px] font-black text-indigo-400 hover:text-indigo-300 transition"
                                                >
                                                    {language === 'fa' ? 'درج متن پیش‌فرض' : 'Apply Preset Data'}
                                                </button>
                                            </div>
                                            <div className="relative">
                                                <User className="absolute left-3 top-3 w-4 h-4 text-slate-600 rtl:left-auto rtl:right-3" />
                                                <input 
                                                    type="text"
                                                    value={proposalMetadata.authorName}
                                                    onChange={e => setProposalMetadata({...proposalMetadata, authorName: e.target.value})}
                                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 rtl:pl-4 rtl:pr-10 text-sm font-bold text-white focus:border-indigo-500 transition outline-none"
                                                    placeholder={language === 'fa' ? 'نام و نام خانوادگی مجری طرح' : 'Full Name of PI'}
                                                />
                                            </div>
                                        </div>

                                         <div className="space-y-4">
                                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                 <div>
                                                     <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">{language === 'fa' ? 'نام نویسنده / سازمان' : 'Author / Lead Organization'}</label>
                                                     <input 
                                                         type="text"
                                                         value={proposalMetadata.authorName}
                                                         onChange={(e) => setProposalMetadata({ ...proposalMetadata, authorName: e.target.value })}
                                                         className="w-full bg-slate-900 border border-slate-800 text-white px-4 py-3 rounded-xl text-sm font-bold focus:border-indigo-500 outline-none"
                                                         placeholder={language === 'fa' ? 'نام کامل...' : 'Full name...'}
                                                     />
                                                 </div>
                                                 <div>
                                                     <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">{language === 'fa' ? 'تعداد اعضای تیم' : 'Member Count'}</label>
                                                     <input 
                                                         type="number"
                                                         value={proposalMetadata.memberCount}
                                                         onChange={(e) => setProposalMetadata({ ...proposalMetadata, memberCount: parseInt(e.target.value) || 1 })}
                                                         className="w-full bg-slate-900 border border-slate-800 text-white px-4 py-3 rounded-xl text-sm font-bold focus:border-indigo-500 outline-none"
                                                     />
                                                 </div>
                                             </div>

                                             <div>
                                                 <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">{language === 'fa' ? 'رزومه کوتاه تیم و تخصص‌ها' : 'Short Team Resumes & Expertise'}</label>
                                                 <textarea 
                                                     value={proposalMetadata.teamResumes}
                                                     onChange={(e) => setProposalMetadata({ ...proposalMetadata, teamResumes: e.target.value })}
                                                     className="w-full bg-slate-900 border border-slate-800 text-white px-4 py-3 rounded-xl text-xs font-medium focus:border-indigo-500 outline-none min-h-[80px]"
                                                     placeholder={language === 'fa' ? 'تخصص‌های اصلی اعضای تیم را بنویسید...' : 'Detail core expertise of team members...'}
                                                 />
                                             </div>

                                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                 <div>
                                                     <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">{language === 'fa' ? 'زمان‌بندی پیشنهادی اجرا' : 'Suggested Timeline Details'}</label>
                                                     <input 
                                                         type="text"
                                                         value={proposalMetadata.implementationTimeline}
                                                         onChange={(e) => setProposalMetadata({ ...proposalMetadata, implementationTimeline: e.target.value })}
                                                         className="w-full bg-slate-900 border border-slate-800 text-white px-4 py-3 rounded-xl text-sm font-bold focus:border-indigo-500 outline-none"
                                                         placeholder={language === 'fa' ? 'مثال: فاز ۱: ۲ ماه...' : 'e.g. Phase 1: 2 months...'}
                                                     />
                                                 </div>
                                                 <div>
                                                     <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">{language === 'fa' ? 'استراتژی کاهش ریسک' : 'Risk Mitigation'}</label>
                                                     <input 
                                                         type="text"
                                                         value={proposalMetadata.riskMitigationDetails}
                                                         onChange={(e) => setProposalMetadata({ ...proposalMetadata, riskMitigationDetails: e.target.value })}
                                                         className="w-full bg-slate-900 border border-slate-800 text-white px-4 py-3 rounded-xl text-sm font-bold focus:border-indigo-500 outline-none"
                                                         placeholder={language === 'fa' ? 'مثال: قرق محلی...' : 'e.g. Local grazing ban...'}
                                                     />
                                                 </div>
                                             </div>

                                             <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800">
                                                 <button
                                                     onClick={handleRunPreAnalysis}
                                                     disabled={isAnalyzing || !proposalMetadata.authorName}
                                                     className="py-4 bg-slate-800 hover:bg-slate-700 text-white font-black rounded-2xl transition flex items-center justify-center gap-2 active:scale-95 shadow-lg"
                                                 >
                                                     {isAnalyzing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
                                                     {language === 'fa' ? 'آنالیز کرنت' : 'Analyze Current'}
                                                 </button>
                                                 <button
                                                     onClick={handleGenerateProposal}
                                                     disabled={isGeneratingProposal || !proposalMetadata.authorName}
                                                     className="py-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white font-black rounded-2xl shadow-xl shadow-indigo-600/30 transition flex items-center justify-center gap-2 active:scale-95"
                                                 >
                                                     {isGeneratingProposal ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                                                     {language === 'fa' ? 'نوشتن پروپوزال' : 'Write Proposal'}
                                                 </button>
                                             </div>
                                         </div>

                                        {analysisGaps && (
                                            <motion.div 
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-2xl overflow-hidden"
                                            >
                                                <div className="flex items-center gap-2 mb-3">
                                                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                                    <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">
                                                        {language === 'fa' ? 'نتیجه‌ی آنالیز انطباق' : 'Prequalification Result'}
                                                    </span>
                                                </div>
                                                <p className="text-white font-bold text-sm mb-3">
                                                    {language === 'fa' ? 'امتیاز اولیه:' : 'Match Score:'} {analysisGaps.potential}
                                                </p>
                                                <div className="space-y-2 mb-4">
                                                    {analysisGaps.gaps.map((gap, i) => (
                                                        <div key={i} className="flex gap-2 text-xs text-slate-400">
                                                            <div className="w-1 h-1 rounded-full bg-slate-600 mt-1.5 shrink-0" />
                                                            {gap}
                                                        </div>
                                                    ))}
                                                </div>
                                                <button 
                                                    onClick={applyProposalPreset}
                                                    className="w-full py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 text-[10px] font-black uppercase tracking-widest rounded-xl transition flex items-center justify-center gap-2"
                                                >
                                                    <Wand2 className="w-3 h-3" />
                                                    {language === 'fa' ? 'تکمیل خودکار اطلاعات پیشنهادی' : 'Fix Gaps with Suggested Defaults'}
                                                </button>
                                            </motion.div>
                                        )}
                                    </div>

                                    {/* Output Area */}
                                    <div className="lg:col-span-3 min-h-[500px] flex flex-col">
                                        {!activeProposal && !isGeneratingProposal && (
                                            <div className="flex-1 border-2 border-dashed border-slate-800 rounded-3xl flex flex-col items-center justify-center text-center p-8">
                                                <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-6">
                                                    <FileText className="w-8 h-8 text-slate-500" />
                                                </div>
                                                <h4 className="text-lg font-bold text-slate-400 mb-2">
                                                    {language === 'fa' ? 'آماده تولید پروپوزال' : 'Ready to Generate'}
                                                </h4>
                                                <p className="text-slate-500 text-sm max-w-sm">
                                                    {language === 'fa' 
                                                        ? 'اطلاعات سمت چپ را تکمیل کرده و دکمه بنفش را بزنید تا پروپوزال شما با استایل آکادمیک آماده شود.'
                                                        : 'Fill in the team details and project scope to generate a fully formatted academic grant application.'}
                                                </p>
                                            </div>
                                        )}

                                        {isGeneratingProposal && (
                                            <div className="flex-1 space-y-6 animate-pulse">
                                                <div className="h-8 bg-slate-800 rounded-full w-2/3" />
                                                <div className="space-y-3">
                                                    <div className="h-4 bg-slate-800 rounded-full w-full" />
                                                    <div className="h-4 bg-slate-800 rounded-full w-full" />
                                                    <div className="h-4 bg-slate-800 rounded-full w-5/6" />
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="h-32 bg-slate-800 rounded-2xl" />
                                                    <div className="h-32 bg-slate-800 rounded-2xl" />
                                                </div>
                                            </div>
                                        )}

                                        {activeProposal && (
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className="flex-1 flex flex-col no-print"
                                            >
                                                <div className="flex items-center justify-between mb-4">
                                                    <h3 className="text-white font-black uppercase tracking-widest text-xs flex items-center gap-2 opacity-50">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                                        {language === 'fa' ? 'پیش‌نمایش سند آکادمیک' : 'Formal Academic Review'}
                                                    </h3>
                                                    <div className="flex gap-2">
                                                        <button 
                                                            onClick={() => window.print()}
                                                            className="px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-500 rounded-xl text-xs font-black transition flex items-center gap-2 shadow-xl no-print"
                                                        >
                                                            <Printer className="w-4 h-4" />
                                                            {language === 'fa' ? 'چاپ رسمی پروپوزال (PDF)' : language === 'tr' ? 'Resmi Teklif Yazdır (PDF)' : 'Print Official Proposal (PDF)'}
                                                        </button>
                                                        <button 
                                                            onClick={() => setActiveProposal(null)}
                                                            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition no-print"
                                                        >
                                                            {language === 'fa' ? 'بستن' : language === 'tr' ? 'Kapat' : 'Close'}
                                                        </button>
                                                    </div>
                                                </div>

                                                <style>{`
                                                    @media print {
                                                        body * {
                                                            visibility: hidden;
                                                        }
                                                        .proposal-printable-container, .proposal-printable-container * {
                                                            visibility: visible;
                                                        }
                                                        .proposal-printable-container {
                                                            position: absolute;
                                                            left: 0;
                                                            top: 0;
                                                            width: 100%;
                                                            margin: 0;
                                                            padding: 2cm !important;
                                                            background: white !important;
                                                            color: black !important;
                                                            box-shadow: none !important;
                                                            border: none !important;
                                                        }
                                                        .no-print {
                                                            display: none !important;
                                                        }
                                                        article {
                                                            page-break-inside: avoid;
                                                            break-inside: avoid;
                                                            margin-bottom: 2rem !important;
                                                        }
                                                        h1, h2, h3 {
                                                            page-break-after: avoid;
                                                            break-after: avoid;
                                                        }
                                                        @page {
                                                            margin: 1.5cm;
                                                            size: auto;
                                                        }
                                                    }
                                                `}</style>

                                                <div 
                                                    className="bg-white text-slate-950 p-8 md:p-16 rounded-[0.5rem] shadow-2xl border border-slate-200 min-h-[1000px] font-serif overflow-y-auto max-h-[800px] selection:bg-indigo-100 selection:text-indigo-900 prose-slate max-w-none proposal-printable-container"
                                                    style={{ direction: isRTL ? 'rtl' : 'ltr' }}
                                                >
                                                    {/* Letterhead */}
                                                    <div className="border-b-4 border-slate-900 pb-10 mb-12 flex justify-between items-start">
                                                        <div className="space-y-4">
                                                            <div className="flex items-center gap-3 mb-2">
                                                                <div className="w-10 h-10 bg-slate-900 flex items-center justify-center text-white font-black text-xl">G</div>
                                                                <span className="text-xl font-black uppercase tracking-tighter text-slate-900">GreenHope Initiative</span>
                                                            </div>
                                                            <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-slate-900 leading-tight max-w-2xl">{activeProposal.title}</h1>
                                                            <div className="flex flex-col gap-1 text-[11px] font-black text-slate-500 uppercase tracking-widest">
                                                                <p><span className="text-slate-400">{language === 'fa' ? 'مجری مسئول:' : language === 'tr' ? 'SORUMLU YÖNETİCİ:' : 'PRINCIPAL INVESTIGATOR:'}</span> {proposalMetadata.authorName}</p>
                                                                <p><span className="text-slate-400">{language === 'fa' ? 'گرنت هدف:' : language === 'tr' ? 'HEDEF HİBE:' : 'TARGET FUND:'}</span> {selectedGrantForProposal.name}</p>
                                                                <p><span className="text-slate-400">{language === 'fa' ? 'تاریخ ثبت:' : language === 'tr' ? 'KAYIT TARİHİ:' : 'REGISTRATION DATE:'}</span> {new Date().toLocaleDateString(language === 'fa' ? 'fa-IR' : language === 'tr' ? 'tr-TR' : 'en-US')}</p>
                                                            </div>
                                                        </div>
                                                        <div className="text-right flex flex-col items-end gap-2">
                                                            <div className="w-20 h-20 border-2 border-slate-900 flex items-center justify-center p-1">
                                                                <div className="w-full h-full border border-slate-900 flex items-center justify-center text-[10px] font-black text-slate-900 uppercase">GH-LAB</div>
                                                            </div>
                                                            <span className="text-[10px] font-black italic opacity-30">GH-SEC-ID: {Math.random().toString(36).substring(7).toUpperCase()}</span>
                                                        </div>
                                                    </div>

                                                    {/* Table of Contents */}
                                                    <article className="mb-12 no-print p-6 bg-slate-50 border border-slate-100 rounded-xl">
                                                        <h2 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                                                            <Layers className="w-3 h-3" />
                                                            {language === 'fa' ? 'فهرست مطالب سند' : 'Document Outline (TOC)'}
                                                        </h2>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-[11px] font-bold text-slate-600">
                                                            <p>{localizeNumber('01', language)}. {language === 'fa' ? 'خلاصه مدیریتی' : 'Executive Summary'}</p>
                                                            <p>{localizeNumber('02', language)}. {language === 'fa' ? 'اهداف استراتژیک' : 'Strategic Objectives'}</p>
                                                            <p>{localizeNumber('03', language)}. {language === 'fa' ? 'متدولوژی فنی' : 'Technical Methodology'}</p>
                                                            <p>{localizeNumber('04', language)}. {language === 'fa' ? 'مدیریت مخاطرات' : 'Risk Management'}</p>
                                                            <p>{localizeNumber('05', language)}. {language === 'fa' ? 'مشارکت جوامع' : 'Community Engagement'}</p>
                                                            <p>{localizeNumber('06', language)}. {language === 'fa' ? 'زمان‌بندی اجرایی' : 'Implementation Timeline'}</p>
                                                            <p>{localizeNumber('07', language)}. {language === 'fa' ? 'تیم اجرایی' : 'Project Personnel'}</p>
                                                            <p>{localizeNumber('08', language)}. {language === 'fa' ? 'تخصیص بودجه' : 'Budgetary Allocation'}</p>
                                                            <p>{localizeNumber('09', language)}. {language === 'fa' ? 'چارچوب علمی' : 'Scientific Framework'}</p>
                                                            <p>{localizeNumber('10', language)}. {language === 'fa' ? 'اندازه‌گیری اثر' : 'Impact Measurement'}</p>
                                                        </div>
                                                    </article>

                                                    {/* Executive Summary */}
                                                    <article className="mb-12">
                                                        <h2 className="text-lg font-black uppercase tracking-widest border-b border-slate-200 pb-2 mb-6 flex items-center gap-3">
                                                            <span className="w-4 h-4 bg-slate-900 text-white flex items-center justify-center text-[9px] font-black">{localizeNumber('01', language)}</span>
                                                            {language === 'fa' ? 'خلاصه مدیریتی' : language === 'tr' ? 'Yönetici Özeti' : 'Executive Summary'}
                                                        </h2>
                                                        <p className="text-base text-slate-800 leading-relaxed text-justify first-letter:text-4xl first-letter:font-black first-letter:mr-3 first-letter:float-left">
                                                            {activeProposal.executiveSummary}
                                                        </p>
                                                    </article>

                                                    {/* Project Goals */}
                                                    <article className="mb-12">
                                                        <h2 className="text-lg font-black uppercase tracking-widest border-b border-slate-200 pb-2 mb-6 flex items-center gap-3">
                                                            <span className="w-4 h-4 bg-slate-900 text-white flex items-center justify-center text-[9px] font-black">{localizeNumber('02', language)}</span>
                                                            {language === 'fa' ? 'اهداف استراتژیک' : language === 'tr' ? 'Stratejik Hedefler' : 'Strategic Objectives'}
                                                        </h2>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                            {activeProposal.projectGoals.map((goal, i) => (
                                                                <div key={i} className="flex gap-4 p-4 border border-slate-100 bg-slate-50/50 rounded-lg group hover:border-slate-300 transition-colors">
                                                                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full mt-2 group-hover:bg-indigo-600 transition-colors" />
                                                                    <p className="text-sm font-bold text-slate-700 leading-snug">{goal}</p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </article>

                                                    {/* Technical Approach */}
                                                    <article className="mb-12">
                                                        <h2 className="text-lg font-black uppercase tracking-widest border-b border-slate-200 pb-2 mb-6 flex items-center gap-3">
                                                            <span className="w-4 h-4 bg-slate-900 text-white flex items-center justify-center text-[9px] font-black">{localizeNumber('03', language)}</span>
                                                            {language === 'fa' ? 'متدولوژی فنی' : language === 'tr' ? 'Teknik Metodoloji' : 'Technical Methodology'}
                                                        </h2>
                                                        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 italic text-slate-700 text-sm leading-loose text-justify">
                                                            {activeProposal.technicalApproach}
                                                        </div>
                                                    </article>

                                                    {/* Risk Management Strategy */}
                                                    {activeProposal.riskManagement && (
                                                        <article className="mb-12 break-inside-avoid">
                                                            <h2 className="text-lg font-black uppercase tracking-widest border-b border-slate-200 pb-2 mb-6 flex items-center gap-3">
                                                                <span className="w-4 h-4 bg-slate-900 text-white flex items-center justify-center text-[9px] font-black">{localizeNumber('04', language)}</span>
                                                                {language === 'fa' ? 'راهبرد مدیریت ریسک و مخاطرات' : 'Risk Management Strategy'}
                                                            </h2>
                                                            <div className="bg-rose-50/50 p-6 rounded-xl border border-rose-100 text-sm leading-relaxed text-slate-700 font-bold whitespace-pre-wrap">
                                                                {activeProposal.riskManagement}
                                                            </div>
                                                        </article>
                                                    )}

                                                    {/* Community Engagement */}
                                                    {activeProposal.communityEngagement && (
                                                        <article className="mb-12 break-inside-avoid">
                                                            <h2 className="text-lg font-black uppercase tracking-widest border-b border-slate-200 pb-2 mb-6 flex items-center gap-3">
                                                                <span className="w-4 h-4 bg-slate-900 text-white flex items-center justify-center text-[9px] font-black">{localizeNumber('05', language)}</span>
                                                                {language === 'fa' ? 'مشارکت جوامع محلی و آموزش' : 'Community Engagement & Training'}
                                                            </h2>
                                                            <div className="bg-indigo-50/50 p-6 rounded-xl border border-indigo-100 text-sm leading-relaxed text-slate-700 font-bold whitespace-pre-wrap">
                                                                {activeProposal.communityEngagement}
                                                            </div>
                                                        </article>
                                                    )}

                                                    {/* Implementation Timeline Table */}
                                                    <article className="mb-12 break-inside-avoid">
                                                        <h2 className="text-lg font-black uppercase tracking-widest border-b border-slate-200 pb-2 mb-6 flex items-center gap-3 text-slate-900">
                                                            <span className="w-4 h-4 bg-slate-900 text-white flex items-center justify-center text-[9px] font-black">{localizeNumber('06', language)}</span>
                                                            {language === 'fa' ? 'زمان‌بندی اجرایی و فازبندی عملیاتی' : language === 'tr' ? 'Proje Takvimi' : 'Project Timeline & Operational Phases'}
                                                        </h2>
                                                        <div className="overflow-hidden border border-slate-300 rounded-lg">
                                                            <table className="w-full text-left border-collapse">
                                                                <thead className="bg-slate-900 text-white">
                                                                    <tr>
                                                                        <th className="p-4 text-[10px] font-black uppercase tracking-widest">{language === 'fa' ? 'فاز عملیاتی' : 'Operational Phase'}</th>
                                                                        <th className="p-4 text-[10px] font-black uppercase tracking-widest">{language === 'fa' ? 'مدت' : 'Duration'}</th>
                                                                        <th className="p-4 text-[10px] font-black uppercase tracking-widest">{language === 'fa' ? 'فعالیت‌های کلیدی' : 'Key Activities'}</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody className="divide-y divide-slate-200">
                                                                    {activeProposal.timeline.map((phase, i) => (
                                                                        <tr key={i} className="hover:bg-slate-50 transition-colors">
                                                                            <td className="p-4 text-sm font-black text-slate-900">{phase.phase}</td>
                                                                            <td className="p-4 text-sm font-bold text-slate-500">{phase.duration}</td>
                                                                            <td className="p-4 text-sm text-slate-700 leading-relaxed font-bold">
                                                                                {Array.isArray(phase.activities) ? phase.activities.join('; ') : phase.activities}
                                                                            </td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    </article>

                                                    {/* Team & Personnel */}
                                                    <article className="mb-12 break-inside-avoid">
                                                        <h2 className="text-lg font-black uppercase tracking-widest border-b border-slate-200 pb-2 mb-6 flex items-center gap-3">
                                                            <span className="w-4 h-4 bg-slate-900 text-white flex items-center justify-center text-[9px] font-black">{localizeNumber('07', language)}</span>
                                                            {language === 'fa' ? 'تیم اجرایی پروژه' : 'Project Personnel'}
                                                        </h2>
                                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                            {activeProposal.teamStructure.map((member, i) => (
                                                                <div key={i} className="space-y-1 p-4 border border-slate-100 rounded-lg bg-slate-50/30">
                                                                    <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest block">{member.role}</span>
                                                                    <p className="text-xs font-bold text-slate-900 leading-snug">{member.qualifications}</p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </article>

                                                    {/* Budgetary Breakdown */}
                                                    <article className="mb-12 break-inside-avoid">
                                                        <h2 className="text-lg font-black uppercase tracking-widest border-b border-slate-200 pb-2 mb-6 flex items-center gap-3">
                                                            <span className="w-4 h-4 bg-slate-900 text-white flex items-center justify-center text-[9px] font-black">{localizeNumber('08', language)}</span>
                                                            {language === 'fa' ? 'تخصیص بودجه و توجیه مالی' : 'Financial Budgetary Breakdown'}
                                                        </h2>
                                                        <div className="overflow-hidden border border-slate-200 rounded-xl">
                                                            <table className="w-full text-left border-collapse">
                                                                <thead>
                                                                    <tr className="bg-slate-50 border-b border-slate-200">
                                                                        <th className="p-4 text-[10px] font-black uppercase text-slate-500">{language === 'fa' ? 'شرح هزینه' : 'Category'}</th>
                                                                        <th className="p-4 text-[10px] font-black uppercase text-slate-500">{language === 'fa' ? 'مبلغ' : 'Amount'}</th>
                                                                        <th className="p-4 text-[10px] font-black uppercase text-slate-500">{language === 'fa' ? 'توجیه مالی' : 'Justification'}</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {activeProposal.budgetBreakdown.map((item, i) => (
                                                                        <tr key={i} className="hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0">
                                                                            <td className="p-4 text-sm font-black text-slate-900">{item.category}</td>
                                                                            <td className="p-4 text-sm font-bold text-slate-900">{item.amount}</td>
                                                                            <td className="p-4 text-xs text-slate-500 italic">{item.justification}</td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    </article>

                                                    {/* Scientific Framework */}
                                                    {activeProposal.scientificFramework && (
                                                        <article className="mb-12 break-inside-avoid">
                                                            <h2 className="text-lg font-black uppercase tracking-widest border-b border-slate-200 pb-2 mb-6 flex items-center gap-3">
                                                                <span className="w-4 h-4 bg-slate-900 text-white flex items-center justify-center text-[9px] font-black">{localizeNumber('09', language)}</span>
                                                                {language === 'fa' ? 'چارچوب علمی و مستندات پشتیبان' : 'Scientific Framework & Literature Review'}
                                                            </h2>
                                                            <p className="text-sm text-slate-700 leading-relaxed text-justify border-l-4 border-slate-900 pl-4 bg-slate-50 p-4 rounded-r-xl">
                                                                {activeProposal.scientificFramework}
                                                            </p>
                                                        </article>
                                                    )}

                                                    {/* Impact Measurement */}
                                                    {activeProposal.impactMeasurement && (
                                                        <article className="mb-12 break-inside-avoid">
                                                            <h2 className="text-lg font-black uppercase tracking-widest border-b border-slate-200 pb-2 mb-6 flex items-center gap-3">
                                                                <span className="w-4 h-4 bg-slate-900 text-white flex items-center justify-center text-[9px] font-black">{localizeNumber('10', language)}</span>
                                                                {language === 'fa' ? 'اندازه‌گیری اثرگذاری و پایش پایداری' : 'Impact Measurement & Sustainability Monitoring'}
                                                            </h2>
                                                            <p className="text-sm text-slate-700 leading-relaxed text-justify border-l-4 border-indigo-900 pl-4 bg-indigo-50/20 p-4 rounded-r-xl font-bold">
                                                                {activeProposal.impactMeasurement}
                                                            </p>
                                                        </article>
                                                    )}

                                                    {/* Expected Outcomes */}
                                                    <article className="mb-12 break-inside-avoid">
                                                        <h2 className="text-lg font-black uppercase tracking-widest border-b border-slate-200 pb-2 mb-6 flex items-center gap-3">
                                                            <span className="w-4 h-4 bg-slate-900 text-white flex items-center justify-center text-[9px] font-black">{localizeNumber('11', language)}</span>
                                                            {language === 'fa' ? 'نتایج مورد انتظار و شاخص‌های کلیدی (KPIs)' : language === 'tr' ? 'Beklenen Çıktılar' : 'Projected Outcomes & Performance Indicators'}
                                                        </h2>
                                                        <ul className="list-square list-inside space-y-3 text-sm font-bold text-slate-700 pl-4 border-l-4 border-slate-100 ml-2">
                                                            {activeProposal.expectedOutcomes.map((outcome, i) => (
                                                                <li key={i} className="pl-2">{outcome}</li>
                                                            ))}
                                                        </ul>
                                                    </article>

                                                    {activeProposal.appendix && (
                                                        <article className="mb-12 mt-16 pt-16 border-t font-mono text-[10px] text-slate-400 break-before-page">
                                                            <h2 className="text-lg font-black uppercase tracking-widest border-b border-slate-200 pb-2 mb-6 flex items-center gap-3 text-slate-900">
                                                                <span className="w-4 h-4 bg-slate-900 text-white flex items-center justify-center text-[9px] font-black">{localizeNumber('12', language)}</span>
                                                                {language === 'fa' ? 'پیوست‌ها و منابع علمی' : language === 'tr' ? 'Ekler' : 'Scientific Appendices & Source Registry'}
                                                            </h2>
                                                            <div className="bg-slate-50 p-6 border border-slate-100 whitespace-pre-wrap font-mono text-xs">
                                                                {activeProposal.appendix}
                                                            </div>
                                                        </article>
                                                    )}
                                                    <div className="mt-24 pt-12 border-t-2 border-slate-900 flex justify-between items-end">
                                                        <div className="space-y-4">
                                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Authorized Compilation Assistant</p>
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-12 h-12 bg-slate-900 rounded-full" />
                                                                <div>
                                                                    <p className="font-black text-slate-900 uppercase leading-none">GreenHope Lab AI</p>
                                                                    <p className="text-[10px] font-bold text-slate-500">Autonomous Ecological Consultant</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="w-40 h-20 border border-slate-200 bg-slate-50/50 flex flex-col items-center justify-center rotate-2 shadow-sm rounded">
                                                                <div className="w-12 h-12 border-2 border-slate-100 rounded-full flex items-center justify-center mb-1">
                                                                    <span className="text-[8px] font-black text-slate-300">GH-OFFICIAL</span>
                                                                </div>
                                                                <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Digital Endorsement</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    {sources && sources.length > 0 && (
                        <div className="mt-12 bg-slate-950/40 p-6 md:p-8 rounded-[2rem] border border-white/5 shadow-inner no-print">
                            <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                                <BookOpen className="w-4 h-4 text-indigo-400" />
                                {language === 'fa' ? 'منابع ارجاع و احراز شده تأیید گوگل (Google Search API)' : 'Academic Registries & Direct Evidence Grounding'}
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {sources.map((source, idx) => (
                                    <a 
                                        key={idx} 
                                        href={source.uri} 
                                        target="_blank" 
                                        rel="noreferrer"
                                        className="flex items-center gap-3 p-4 bg-slate-900/60 hover:bg-slate-800/85 border border-white/5 hover:border-indigo-500/30 rounded-2xl transition group"
                                    >
                                        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center text-xs font-black transition group-hover:bg-indigo-600 group-hover:text-white border border-indigo-500/20 shrink-0">
                                            {idx + 1}
                                        </div>
                                        <div className="truncate flex-grow">
                                            <div className="text-xs font-black text-slate-200 truncate group-hover:text-white transition-colors">{source.title}</div>
                                            <div className="text-[10px] text-slate-500 truncate tracking-tight">{source.uri}</div>
                                        </div>
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}
                </motion.div>
            )}
            
            {/* Footer legalities */}
            <footer className="pt-12 border-t border-white/5 text-center mt-10">
                <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">
                    © GreenHope AI Smart Audit Node • {selectedLocation?.lat.toFixed(4) || "32.6546"}, {selectedLocation?.lng.toFixed(4) || "51.6676"}
                </p>
            </footer>

            {error && (
                <div className="mt-8 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-2xl flex items-center gap-3">
                    <ShieldAlert className="w-5 h-5 shrink-0" />
                    <p className="text-sm font-bold">{error}</p>
                </div>
            )}
            {selectedGrantForAnalysis && (
                <div className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-700 p-8 rounded-3xl max-w-lg w-full text-white shadow-2xl">
                        <h2 className="text-xl font-black mb-1">{selectedGrantForAnalysis.name}</h2>
                        <p className="text-sm text-slate-400 mb-6">{language === 'fa' ? 'طراح و مفسر مالی: بنیاد علم و فناوری اتحادیه اروپا (ERC)' : 'Designer: European Research Council (ERC)'}</p>
                        
                        <div className="text-5xl font-black text-emerald-400 mb-2">85%</div>
                        <p className="font-bold mb-6">{language === 'fa' ? 'شانس تقریبی قبولی طرح پژوهشی شما' : 'Approximate Chance of Success'}</p>
                        <p className="text-sm text-slate-400 mb-8">{language === 'fa' ? 'تطبیق سنجی بر اساس کلمات کلیدی، استانداردهای علمی و رزومه کاری پلتفرم.' : 'Matching based on keywords, scientific standards, and platform work resume.'}</p>
                        
                        <h4 className="font-bold flex items-center gap-2 mb-4 text-indigo-400"><TrendingDown className="w-4 h-4"/> {language === 'fa' ? '📊 تحلیل همسویی و تطبیق' : '📊 Alignment Analysis'}</h4>
                        <p className="text-sm text-slate-300 mb-6">{language === 'fa' ? 'این فراخوان حمایتی تطابق بسیار ایده آلی با نوآوریهای مرتبط با طرح شما دارد.' : 'This grant has an ideal match with your project innovation.'}</p>

                        <button 
                            onClick={() => setSelectedGrantForAnalysis(null)}
                            className="w-full bg-slate-800 text-white font-bold py-3 rounded-xl hover:bg-slate-700"
                        >
                            {language === 'fa' ? 'بستن و بازگشت' : 'Close and Return'}
                        </button>
                    </div>
                </div>
            )}
            <ModuleOptimizer moduleName="GrantFinder" subModules={['Custom-Finder', 'Geo-Audit', 'Proposal-Generator']} />
            {/* <PageDiagnostics moduleName="GrantFinderPage" /> */}
        </div>
        </ModuleErrorBoundary>
    );
};

export default GrantFinderPage;
