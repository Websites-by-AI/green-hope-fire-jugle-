import React, { useState, useEffect } from 'react';
import { useLanguage, EnvironmentalAudit } from '../types';
import { getEnvironmentalAudit } from '../services/geminiService';
import { 
  Flame, 
  Users, 
  Clock, 
  DollarSign, 
  ShieldAlert, 
  ArrowRight, 
  RefreshCw, 
  MapPin, 
  Library,
  Construction,
  Sparkles,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface FireResponsePlanProps {
    location?: { lat: number; lng: number } | null;
}

const FireResponsePlan: React.FC<FireResponsePlanProps> = ({ location }) => {
    const { language } = useLanguage();
    const [audit, setAudit] = useState<EnvironmentalAudit | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const generatePlan = async () => {
        if (!location) return;
        setIsLoading(true);
        setError(null);
        try {
            const data = await getEnvironmentalAudit(location, language);
            setAudit(data);
        } catch (err: any) {
            setError(err.message || 'Failed to generate AI plan');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (location && !audit && !isLoading) {
            generatePlan();
        }
    }, [location]);

    if (!location) {
        return (
            <div className="bg-slate-900/50 border border-white/5 rounded-3xl p-12 text-center">
                <MapPin className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-300">
                    {language === 'fa' ? 'مکانی انتخاب نشده است' : 'No Location Selected'}
                </h3>
                <p className="text-slate-500 mt-2">
                    {language === 'fa' ? 'لطفاً ابتدا روی نقشه یک نقطه را برای تحلیل هوش مصنوعی انتخاب کنید.' : 'Please select a point on the map first to trigger AI analysis.'}
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center bg-slate-900 p-6 rounded-3xl border border-white/5">
                <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-3">
                        <Flame className="w-6 h-6 text-rose-500" />
                        {language === 'fa' ? 'گزارش تاکتیکی مقابله و پیشگیری' : 'Tactical Response & Prevention Report'}
                    </h3>
                    <p className="text-slate-500 text-sm mt-1">
                        {language === 'fa' ? `تحلیل هوشمند برای مختصات: ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` : `AI Analysis for: ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`}
                    </p>
                </div>
                <button 
                    onClick={generatePlan}
                    disabled={isLoading}
                    className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition disabled:opacity-50"
                >
                    <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {isLoading && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="h-64 bg-slate-800/20 animate-pulse rounded-3xl" />
                    <div className="h-64 bg-slate-800/20 animate-pulse rounded-3xl" />
                </div>
            )}

            <AnimatePresence>
                {audit && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="space-y-8"
                    >
                        {/* Summary Card */}
                        <div className="bg-gradient-to-br from-rose-950/40 to-slate-900 border border-rose-500/20 p-8 rounded-[2.5rem] shadow-2xl overflow-hidden relative">
                            <div className="absolute top-0 right-0 p-8 opacity-10">
                                <ShieldAlert className="w-40 h-40 text-rose-500" />
                            </div>
                            <div className="relative z-10">
                                <div className="inline-block px-3 py-1 bg-rose-500/10 text-rose-400 text-[10px] font-black uppercase tracking-[0.2em] rounded-full border border-rose-500/20 mb-6">
                                    {language === 'fa' ? 'تحلیل وضعیت بحرانی' : 'Critical Status Analysis'}
                                </div>
                                <h4 className="text-3xl font-black text-white mb-4">{audit.fireRiskStatus}</h4>
                                <p className="text-lg text-slate-300 font-serif italic italic leading-relaxed max-w-3xl">
                                    "{audit.shakespeareanSummary}"
                                </p>
                            </div>
                        </div>

                        {/* Operational Metrics Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-slate-900 border border-white/5 p-8 rounded-3xl shadow-xl hover:border-indigo-500/30 transition">
                                <Users className="w-8 h-8 text-indigo-400 mb-6" />
                                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{language === 'fa' ? 'نیروی متخصص مورد نیاز' : 'Expert Personnel'}</div>
                                <div className="text-4xl font-black text-white">{audit.operationalEstimation?.personnelCount || 0} <span className="text-sm font-bold text-slate-500 text-slate-500">{language === 'fa' ? 'نفر' : 'Staff'}</span></div>
                            </div>

                            <div className="bg-slate-900 border border-white/5 p-8 rounded-3xl shadow-xl hover:border-amber-500/30 transition">
                                <Clock className="w-8 h-8 text-amber-400 mb-6" />
                                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{language === 'fa' ? 'ساعات آموزش فنی' : 'Training Hours'}</div>
                                <div className="text-4xl font-black text-white">{audit.operationalEstimation?.trainingHours || 0} <span className="text-sm font-bold text-slate-500 text-slate-500">{language === 'fa' ? 'ساعت' : 'Hours'}</span></div>
                            </div>

                            <div className="bg-slate-900 border border-white/5 p-8 rounded-3xl shadow-xl hover:border-emerald-500/30 transition border-emerald-500/20 border-2">
                                <DollarSign className="w-8 h-8 text-emerald-400 mb-6" />
                                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{language === 'fa' ? 'برآورد هزینه مالی' : 'Financial Estimate'}</div>
                                <div className="text-2xl font-black text-white">{audit.operationalEstimation?.estimatedOperationalCost || 'N/A'}</div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Infrastructure Needs */}
                            <div className="bg-slate-900 p-8 rounded-[2rem] border border-white/5">
                                <h4 className="text-lg font-bold text-white flex items-center gap-3 mb-6">
                                    <Construction className="w-5 h-5 text-indigo-400" />
                                    {language === 'fa' ? 'نیازمندی‌های زیرساختی' : 'Infrastructure & Tools'}
                                </h4>
                                <div className="space-y-4">
                                    {audit.operationalEstimation?.infrastructureNeeds.map((need, i) => (
                                        <div key={i} className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-2xl border border-white/5">
                                            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 text-xs font-black">0{i+1}</div>
                                            <span className="text-slate-300 font-bold">{need}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* CTAs & Next Steps */}
                            <div className="bg-indigo-950/20 p-8 rounded-[2rem] border border-indigo-500/20 flex flex-col justify-between">
                                <div>
                                    <h4 className="text-lg font-bold text-white flex items-center gap-3 mb-4">
                                        <Sparkles className="w-5 h-5 text-indigo-400" />
                                        {language === 'fa' ? 'گام‌های بعدی و تامین سرمایه' : 'Next Steps & Funding'}
                                    </h4>
                                    <p className="text-sm text-slate-400 leading-relaxed mb-8">
                                        {language === 'fa' 
                                            ? 'این گزارش عملیاتی مبنای لازم برای دریافت گرنت از صندوق‌های بین‌المللی یا راه‌اندازی کمپین جذب سرمایه مردمی (Crowdfunding) می‌باشد.'
                                            : 'This operational report provides the necessary foundation for grant applications from international funds or launching a local crowdfunding campaign.'}
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 gap-3">
                                    <button 
                                        onClick={() => window.location.hash = '#grants'}
                                        className="flex items-center justify-between w-full p-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black transition group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Library className="w-5 h-5" />
                                            {language === 'fa' ? 'انتقال به گرنت‌یاب هوشمند' : 'Go to Smart Grant Finder'}
                                        </div>
                                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition" />
                                    </button>

                                    <button 
                                        onClick={() => window.location.hash = '#invest'}
                                        className="flex items-center justify-between w-full p-5 bg-slate-800 hover:bg-slate-700 text-indigo-300 rounded-2xl font-black border border-indigo-500/30 transition group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Zap className="w-5 h-5" />
                                            {language === 'fa' ? 'ایجاد کمپین جمع‌آوری کمک' : 'Create Support Campaign'}
                                        </div>
                                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {error && (
                <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-2xl">
                    {error}
                </div>
            )}
        </div>
    );
};

export default FireResponsePlan;
