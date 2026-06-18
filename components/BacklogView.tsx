import React from 'react';
import { motion } from 'motion/react';
import { BacklogItem, useLanguage } from '../types';
import { 
    CheckCircle2, 
    Clock, 
    AlertCircle, 
    History, 
    Filter,
    Search,
    ChevronRight,
    User,
    Tag
} from 'lucide-react';

const BacklogView: React.FC = () => {
    const { language } = useLanguage();
    const isFA = language === 'fa';

    const backlog: BacklogItem[] = [
        { 
            id: 'B001', 
            title: isFA ? 'پایش سنسورهای رطوبت اراضی سالاریه' : 'Salariyeh Soil Moisture Sensor Audit', 
            status: 'completed', 
            date: '2026-06-10', 
            priority: 'high', 
            category: isFA ? 'فنی' : 'Technical',
            assignee: 'Arvand Z.' 
        },
        { 
            id: 'B002', 
            title: isFA ? 'توزیع نهال بلوط دیمه در منطقه لردگان' : 'Deymeh Oak Seedling Distribution - Lordegan', 
            status: 'in-progress', 
            date: '2026-06-14', 
            priority: 'medium', 
            category: isFA ? 'عملیاتی' : 'Operational',
            assignee: 'Sara M.' 
        },
        { 
            id: 'B003', 
            title: isFA ? 'بروزرسانی ماژول هوش مصنوعی پیش‌بینی حریق' : 'Fire Prediction AI Model Update', 
            status: 'planned', 
            date: '2026-06-20', 
            priority: 'high', 
            category: isFA ? 'توسعه' : 'Development',
            assignee: 'Dev Node' 
        },
        { 
            id: 'B004', 
            title: isFA ? 'آموزش جامعه محلی برای اطفاء حریق پهپادی' : 'Localized UAV Fire Suppression Training', 
            status: 'planned', 
            date: '2026-07-05', 
            priority: 'low', 
            category: isFA ? 'آموزشی' : 'Educational',
            assignee: 'Education Team' 
        }
    ];

    const getStatusIcon = (status: BacklogItem['status']) => {
        switch (status) {
            case 'completed': return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
            case 'in-progress': return <Clock className="w-4 h-4 text-amber-400" />;
            case 'planned': return <AlertCircle className="w-4 h-4 text-slate-500" />;
        }
    };

    const getPriorityColors = (priority: BacklogItem['priority']) => {
        switch (priority) {
            case 'high': return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
            case 'medium': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
            case 'low': return 'bg-slate-800 text-slate-400 border-white/5';
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
                        <History className="w-8 h-8 text-indigo-400" />
                        {isFA ? 'بک‌لاگ عملیاتی امید سبز' : 'Operational Backlog'}
                    </h2>
                    <p className="text-slate-400 font-medium mt-1">
                        {isFA ? 'رهگیری پیشرفت پروژه‌های حفاظتی و احیاء در زاگرس' : 'Tracking conservation and restoration progress across the Zagros range'}
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                        <input 
                            type="text" 
                            placeholder={isFA ? 'جستجوی تسک...' : 'Search tasks...'}
                            className="bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm font-bold text-white focus:outline-none focus:border-indigo-500 transition w-full md:w-64"
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {backlog.map((item, idx) => (
                    <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-slate-900/40 border border-white/5 p-6 rounded-3xl hover:bg-white/5 transition-all group flex flex-col md:flex-row md:items-center gap-6"
                    >
                        <div className="flex items-center gap-4 flex-1">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-slate-800/80 border border-white/5 group-hover:scale-110 transition-transform`}>
                                {getStatusIcon(item.status)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{item.id}</span>
                                    <div className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${getPriorityColors(item.priority)}`}>
                                        {item.priority}
                                    </div>
                                </div>
                                <h3 className="text-white font-bold text-lg truncate group-hover:text-indigo-300 transition-colors">{item.title}</h3>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 md:gap-8 border-t md:border-t-0 md:border-l border-white/5 pt-4 md:pt-0 md:pl-8">
                            <div className="flex flex-col">
                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-tighter mb-0.5 flex items-center gap-1">
                                    <Tag className="w-2.5 h-2.5" />
                                    {isFA ? 'دسته‌بندی' : 'CATEGORY'}
                                </span>
                                <span className="text-xs font-bold text-slate-300">{item.category}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-tighter mb-0.5 flex items-center gap-1">
                                    <User className="w-2.5 h-2.5" />
                                    {isFA ? 'مسئول' : 'ASSIGNEE'}
                                </span>
                                <span className="text-xs font-bold text-slate-300">{item.assignee}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-tighter mb-0.5">
                                    {isFA ? 'تاریخ ثبت' : 'DATE'}
                                </span>
                                <span className="text-xs font-bold text-slate-300 font-mono tracking-tighter">{item.date}</span>
                            </div>
                            <ChevronRight className="w-5 h-5 text-slate-700 group-hover:text-white transition-colors cursor-pointer hidden md:block" />
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 p-8 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                    <h4 className="text-xl font-black text-white mb-2">{isFA ? 'ثبت تسک جدید در زنجیره' : 'Add New Task to Nodes'}</h4>
                    <p className="text-slate-400 text-sm">{isFA ? 'آیا بخشی از زاگرس نیاز به پایش فوری دارد؟ گزارش کنید.' : 'Request urgent monitoring or reforestation node deployment.'}</p>
                </div>
                <button className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl transition shadow-xl shadow-indigo-600/20 active:scale-95">
                    {isFA ? 'درخواست عملیات زاگرس' : 'Request Operation'}
                </button>
            </div>
        </div>
    );
};

export default BacklogView;
