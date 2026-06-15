import React, { useState } from 'react';
import { useLanguage, EnvironmentalAudit, Grant, Source } from '../types';
import { getEnvironmentalAudit, findGrants } from '../services/geminiService';
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
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface GrantFinderPageProps {
    selectedLocation: { lat: number; lng: number } | null;
}

const GrantFinderPage: React.FC<GrantFinderPageProps> = ({ selectedLocation }) => {
    const { language } = useLanguage();
    const [audit, setAudit] = useState<EnvironmentalAudit | null>(null);
    const [grants, setGrants] = useState<Grant[] | null>(null);
    const [sources, setSources] = useState<Source[] | null>(null);
    const [isLoadingAudit, setIsLoadingAudit] = useState(false);
    const [isLoadingGrants, setIsLoadingGrants] = useState(false);
    const [error, setError] = useState<string | null>(null);

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
        try {
            const projectDescription = `A reforestation project with fire risk: ${audit.fireRiskStatus}, water status: ${audit.undergroundWaterStatus}, and ecosystem health: ${audit.ecosystemHealthScore}/100. Focused on: ${audit.recommendedGrantCategories.join(', ')}`;
            const result = await findGrants(projectDescription, language);
            setGrants(result.grants);
            if (result.sources) setSources(result.sources);
        } catch (err: any) {
            setError(err.message || 'Failed to find grants');
        } finally {
            setIsLoadingGrants(false);
        }
    };

    const printAudit = () => {
        window.print();
    };

    return (
        <div className="max-w-6xl mx-auto py-8 px-4" dir={language === 'fa' || language === 'ar' ? 'rtl' : 'ltr'}>
            {/* Header section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 no-print">
                <div>
                    <h2 className="text-3xl font-black text-white flex items-center gap-3">
                        <FileSearch className="w-8 h-8 text-indigo-400" />
                        {language === 'fa' ? 'سامانه هوشمند ممیزی محیطی و گرنت‌درمانی' : 'Grant-Therapy & Environmental Digital Audit'}
                    </h2>
                    <p className="text-slate-400 mt-2 max-w-2xl font-medium">
                        {language === 'fa' 
                            ? 'تحلیل عمیق وضعیت آتش‌سوزی، سفره‌های آب زیرزمینی و سلامت اکوسیستم جهت انطباق با منابع مالی و گرنت‌های خاص.'
                            : 'Deep analysis of wildfire risk, groundwater aquifers, and ecosystem health to match with specific funding resources.'}
                    </p>
                </div>
                
                <div className="flex gap-3">
                    {audit && (
                        <button
                            onClick={printAudit}
                            className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl border border-slate-700 transition"
                        >
                            <Printer className="w-4 h-4" />
                            {language === 'fa' ? 'چاپ گزارش رسمی' : 'Print Official Doc'}
                        </button>
                    )}
                    <button
                        onClick={handleRunAudit}
                        disabled={!selectedLocation || isLoadingAudit}
                        className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20 transition active:scale-95"
                    >
                        {isLoadingAudit ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                        {language === 'fa' ? 'اجرای ممیزی هوشمند' : 'Run AI Geo-Audit'}
                    </button>
                </div>
            </div>

            {!audit && !isLoadingAudit && (
                <div className="bg-slate-900/50 border-2 border-dashed border-slate-800 rounded-3xl p-20 text-center no-print">
                    <div className="bg-slate-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                        <BadgeAlert className="w-8 h-8 text-slate-500" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-300 mb-2">
                        {language === 'fa' ? 'در انتظار تحلیل موقعیت جغرافیایی' : 'Awaiting Geo-Location Audit'}
                    </h3>
                    <p className="text-slate-500 max-w-sm mx-auto">
                        {language === 'fa' 
                            ? 'ابتدا نقطه مورد نظر روی نقشه را انتخاب کنید و سپس دکمه اجرای ممیزی را فشار دهید.'
                            : 'Select a location on the map first, then press the Run Audit button to initialize the analysis.'}
                    </p>
                </div>
            )}

            {isLoadingAudit && (
                <div className="space-y-6 no-print">
                    <div className="h-64 bg-slate-800/20 animate-pulse rounded-3xl border border-white/5" />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="h-40 bg-slate-800/20 animate-pulse rounded-2xl" />
                        <div className="h-40 bg-slate-800/20 animate-pulse rounded-2xl" />
                        <div className="h-40 bg-slate-800/20 animate-pulse rounded-2xl" />
                    </div>
                </div>
            )}

            <AnimatePresence>
                {audit && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-8"
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
                                <p className="text-xl font-bold text-white mb-2">{audit.fireRiskStatus}</p>
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
                                <p className="text-xl font-bold text-white mb-2">{audit.undergroundWaterStatus}</p>
                                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-500" style={{ width: '40%' }}></div>
                                </div>
                            </div>

                            <div className="bg-slate-900 border border-white/5 p-6 rounded-3xl shadow-lg hover:border-emerald-500/30 transition duration-300">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg">
                                        <ShieldAlert className="w-5 h-5" />
                                    </div>
                                    <h4 className="font-bold text-slate-400 text-sm uppercase tracking-wider">{language === 'fa' ? 'سلامت اکوسیستم' : 'Ecosystem Health'}</h4>
                                </div>
                                <div className="flex items-end justify-between mb-2">
                                    <p className="text-4xl font-black text-white">{audit.ecosystemHealthScore}<span className="text-sm font-bold text-slate-500 ml-1">/100</span></p>
                                    <span className="text-[10px] font-black uppercase text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded">Analysis Score</span>
                                </div>
                                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-500" style={{ width: `${audit.ecosystemHealthScore}%` }}></div>
                                </div>
                            </div>
                        </div>

                        {/* Basin & Watershed Analysis Section */}
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

                        {/* Operational Estimation Section */}
                        {audit.operationalEstimation && (
                            <section className="bg-slate-900 border border-indigo-500/20 p-8 rounded-[2.5rem] shadow-xl overflow-hidden relative">
                                <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/10 blur-3xl rounded-full" />
                                <h4 className="text-xl font-bold text-white flex items-center gap-3 mb-8">
                                    <Activity className="w-6 h-6 text-indigo-400" />
                                    {language === 'fa' ? 'برآورد عملیاتی و نیازمندی‌های نیروی انسانی' : 'Operational Estimation & Personnel Needs'}
                                </h4>
                                
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
                                    <div className="space-y-1">
                                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{language === 'fa' ? 'تعداد نفرات مورد نیاز' : 'Personnel Needed'}</div>
                                        <div className="text-3xl font-black text-white">{audit.operationalEstimation.personnelCount} <span className="text-sm font-bold text-slate-500">{language === 'fa' ? 'نفر' : 'Staff'}</span></div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{language === 'fa' ? 'ساعات آموزش فنی' : 'Training Hours'}</div>
                                        <div className="text-3xl font-black text-white">{audit.operationalEstimation.trainingHours} <span className="text-sm font-bold text-slate-500">{language === 'fa' ? 'ساعت' : 'Hours'}</span></div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{language === 'fa' ? 'هزینه عملیاتی تخمینی' : 'Est. Operational Cost'}</div>
                                        <div className="text-3xl font-black text-emerald-400">{audit.operationalEstimation.estimatedOperationalCost}</div>
                                    </div>
                                </div>

                                <div className="space-y-4 bg-slate-800/30 p-6 rounded-2xl border border-white/5">
                                    <h5 className="text-xs font-black text-indigo-300 uppercase tracking-widest">{language === 'fa' ? 'زیرساخت‌های مورد نیاز' : 'Infrastructure Needs'}</h5>
                                    <div className="flex flex-wrap gap-3">
                                        {audit.operationalEstimation.infrastructureNeeds.map((need, i) => (
                                            <div key={i} className="flex items-center gap-2 px-4 py-2 bg-slate-800 rounded-xl text-xs font-bold text-slate-300">
                                                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                                {need}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </section>
                        )}

                        {/* Critical Observations & Recommendations */}
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
                                            ? 'بر اساس وضعیت بحرانی منطقه، پیشنهاد می‌شود از مدل «گرنت‌درمانی» برای تامین تجهیزات پایش و تحقیقات احیای پوشش گیاهی استفاده شود.'
                                            : 'Given the critical state of the region, we strongly recommend the "Grant-Therapy" model to source monitoring equipment and vegetation restoration research.'}
                                    </p>
                                </div>
                                
                                <div className="flex flex-col gap-3">
                                    {!grants && !isLoadingGrants && (
                                        <div className="space-y-4">
                                            <button
                                                onClick={handleFindGrants}
                                                className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl shadow-xl shadow-indigo-600/20 transition flex items-center justify-center gap-3 group active:scale-95 border-b-4 border-indigo-800"
                                            >
                                                <div className="flex flex-col items-center">
                                                    <span className="flex items-center gap-2">
                                                        {language === 'fa' ? 'جستجوی هوشمند در منابع گوگل' : 'Find Grants via Google Grounding'}
                                                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition" />
                                                    </span>
                                                    <span className="text-[10px] opacity-60 font-medium uppercase tracking-[0.2em]">{language === 'fa' ? 'با قدرت جستجوی لحظه‌ای گوگل' : 'POWERED BY GOOGLE SEARCH'}</span>
                                                </div>
                                            </button>

                                            <div className="pt-2">
                                                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-3 opacity-60">{language === 'fa' ? 'امتحان کنید:' : 'QUICK ANALYTICS PRESETS:'}</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {[
                                                        { fa: 'گرنت‌های فائو ۲۰۲۵', en: 'FAO 2025 Grants' },
                                                        { fa: 'بودجه‌های اتحادیه اروپا برای جنگل', en: 'EU Forest Funding' },
                                                        { fa: 'منابع مالی صندوق سازگاری', en: 'Adaptation Fund sources' }
                                                    ].map((preset, i) => (
                                                        <button 
                                                            key={i}
                                                            onClick={handleFindGrants}
                                                            className="px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 rounded-lg text-[10px] font-bold text-indigo-300 transition"
                                                        >
                                                            {language === 'fa' ? preset.fa : preset.en}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <button
                                        onClick={() => window.location.hash = '#invest'}
                                        className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-indigo-300 font-black rounded-2xl border border-indigo-500/30 transition flex items-center justify-center gap-3 active:scale-95"
                                    >
                                        <Zap className="w-5 h-5" />
                                        {language === 'fa' ? 'ایجاد کمپین جذب سرمایه مردمی' : 'Launch Crowdfunding Campaign'}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Grant Results */}
                        {isLoadingGrants && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 no-print">
                                <div className="h-64 bg-slate-800/20 animate-pulse rounded-3xl" />
                                <div className="h-64 bg-slate-800/20 animate-pulse rounded-3xl" />
                                <div className="h-64 bg-slate-800/20 animate-pulse rounded-3xl" />
                            </div>
                        )}

                        {grants && (
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="space-y-6"
                            >
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-4 border-l-4 border-emerald-500 py-1 rtl:border-l-0 rtl:border-r-4">
                                    <h3 className="text-xl font-bold text-white">
                                        {language === 'fa' ? 'پیشنهادات گرنت‌درمانی و تحقیقاتی (بروزرسانی زنده)' : 'Grant-Therapy & Research Proposals (Live)'}
                                    </h3>
                                    <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20 text-[10px] font-black uppercase tracking-widest">
                                        <Search className="w-3 h-3" />
                                        Grounded by Google Search
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {grants.map((grant, idx) => (
                                        <div key={idx} className="bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 hover:border-indigo-500/30 text-white p-8 rounded-[2rem] shadow-2xl backdrop-blur-sm flex flex-col justify-between group hover:scale-[1.02] transition duration-300">
                                            <div>
                                                <div className="w-12 h-12 bg-indigo-500/10 text-indigo-400 rounded-2xl flex items-center justify-center mb-6 border border-indigo-500/20">
                                                    <FileText className="w-6 h-6" />
                                                </div>
                                                <h4 className="text-lg font-black text-slate-100 leading-tight mb-4">{grant.name}</h4>
                                                <p className="text-sm text-slate-400 font-medium leading-relaxed mb-6">
                                                    {grant.description}
                                                </p>
                                            </div>
                                            <div className="pt-6 border-t border-white/5 flex justify-between items-center text-xs font-black uppercase">
                                               <span className="text-slate-500">{language === 'fa' ? 'مهلت:' : 'Deadline:'} {grant.deadline}</span>
                                               <a 
                                                 href={grant.link} 
                                                 target="_blank" 
                                                 rel="noreferrer" 
                                                 className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
                                               >
                                                 {language === 'fa' ? 'جزئیات' : 'Details'}
                                                 <ArrowRight className="w-3 h-3" />
                                               </a>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                
                                {sources && sources.length > 0 && (
                                    <div className="mt-12 bg-slate-950/40 p-8 rounded-[2rem] border border-white/5 shadow-inner">
                                        <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                                            <BookOpen className="w-4 h-4 text-indigo-400" />
                                            {language === 'fa' ? 'منابع احراز شده (تأیید گوگل)' : 'Verified Sources (Google Grounding)'}
                                        </h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {sources.map((source, idx) => (
                                                <a 
                                                    key={idx} 
                                                    href={source.uri} 
                                                    target="_blank" 
                                                    rel="noreferrer"
                                                    className="flex items-center gap-3 p-3 bg-slate-900/60 hover:bg-slate-800/85 border border-white/5 hover:border-indigo-500/30 rounded-xl transition group"
                                                >
                                                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center text-xs font-bold transition group-hover:bg-indigo-600 group-hover:text-white border border-indigo-500/20">
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
                        <footer className="pt-12 border-t border-white/5 text-center">
                            <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">
                                © GreenHope AI Smart Audit Node • {selectedLocation?.lat.toFixed(4)}, {selectedLocation?.lng.toFixed(4)}
                            </p>
                        </footer>
                    </motion.div>
                )}
            </AnimatePresence>

            {error && (
                <div className="mt-8 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-2xl flex items-center gap-3">
                    <ShieldAlert className="w-5 h-5 shrink-0" />
                    <p className="text-sm font-bold">{error}</p>
                </div>
            )}
        </div>
    );
};

export default GrantFinderPage;
