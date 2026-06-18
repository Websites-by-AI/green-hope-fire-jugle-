import React from 'react';
import { motion } from 'motion/react';
import { useLanguage } from '../types';
import { 
    Mail, 
    Phone, 
    MapPin, 
    Send,
    MessageSquare,
    Globe,
    Cpu,
    Shield
} from 'lucide-react';

const ContactView: React.FC = () => {
    const { language } = useLanguage();
    const isFA = language === 'fa';

    return (
        <div className="max-w-5xl mx-auto space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-1200">
            <div className="text-center space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-500/20 mb-4">
                    <Shield className="w-3 h-3" />
                    {isFA ? 'مرکز ارتباطات رسمی' : 'Official Communication Hub'}
                </div>
                <h2 className="text-5xl font-black text-white tracking-tighter">
                    {isFA ? 'با شبکه امید سبز در ارتباط باشید' : 'Connect with the Network'}
                </h2>
                <p className="text-slate-400 font-medium max-w-2xl mx-auto">
                    {isFA ? 'تسهیل همکاری‌های بین‌المللی برای حفاظت از تنوع زیستی فلات ایران.' : 'Facilitating international collaboration for the preservation of Iranian plateau biodiversity.'}
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                <div className="space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-slate-900/40 border border-white/5 p-6 rounded-[2rem] space-y-3">
                            <div className="w-10 h-10 bg-indigo-500/20 text-indigo-400 rounded-xl flex items-center justify-center">
                                <Mail className="w-5 h-5" />
                            </div>
                            <h4 className="text-sm font-black text-white uppercase tracking-widest">{isFA ? 'ایمیل رسمی' : 'Email Address'}</h4>
                            <p className="text-slate-400 font-bold text-sm">node@greenhope.ai</p>
                        </div>
                        <div className="bg-slate-900/40 border border-white/5 p-6 rounded-[2rem] space-y-3">
                            <div className="w-10 h-10 bg-blue-500/20 text-blue-400 rounded-xl flex items-center justify-center">
                                <Phone className="w-5 h-5" />
                            </div>
                            <h4 className="text-sm font-black text-white uppercase tracking-widest">{isFA ? 'پشتیبانی فنی' : 'Technical Line'}</h4>
                            <p className="text-slate-400 font-bold text-sm">+98 21 8890 XXXX</p>
                        </div>
                    </div>

                    <div className="bg-slate-900/40 border border-white/5 p-8 rounded-[2.5rem] space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-slate-400">
                                <MapPin className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="text-sm font-black text-white uppercase tracking-widest">{isFA ? 'مقر عملیاتی زاگرس' : 'Zagros Operational HQ'}</h4>
                                <p className="text-slate-500 text-xs font-bold mt-1">
                                    {isFA ? 'خیابان کشاورز، پارک علم و فناوری زاگرس، مرکز شماره ۳' : 'Technology Park III, Keshavarz Blvd, Zagros Research Node'}
                                </p>
                            </div>
                        </div>
                        
                        <div className="h-48 bg-slate-950 rounded-2xl border border-white/5 flex items-center justify-center overflow-hidden grayscale contrast-125 opacity-40">
                             <div className="text-[10px] font-black text-slate-700 tracking-[1em] uppercase">Satellite Map Data</div>
                        </div>
                    </div>

                    <div className="flex items-center justify-center gap-12 pt-4">
                        <div className="flex flex-col items-center gap-2 grayscale hover:grayscale-0 transition cursor-pointer">
                            <Globe className="w-6 h-6 text-slate-500" />
                            <span className="text-[8px] font-black text-slate-600 uppercase">Weblink</span>
                        </div>
                        <div className="flex flex-col items-center gap-2 grayscale hover:grayscale-0 transition cursor-pointer">
                            <MessageSquare className="w-6 h-6 text-slate-500" />
                            <span className="text-[8px] font-black text-slate-600 uppercase">Chat</span>
                        </div>
                        <div className="flex flex-col items-center gap-2 grayscale hover:grayscale-0 transition cursor-pointer">
                            <Cpu className="w-6 h-6 text-slate-500" />
                            <span className="text-[8px] font-black text-slate-600 uppercase">API Access</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-10 md:p-12 rounded-[3.5rem] text-slate-950 shadow-2xl overflow-hidden relative group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 group-hover:bg-indigo-100 transition-colors rounded-bl-[100%] z-0" />
                    
                    <div className="relative z-10">
                        <h3 className="text-3xl font-black tracking-tight mb-8">
                            {isFA ? 'ثبت درخواست همکاری' : 'Initiate Collaboration'}
                        </h3>
                        
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{isFA ? 'نام و نام خانوادگی / سازمان' : 'Full Name / Organization'}</label>
                                <input type="text" className="w-full bg-slate-50 border-b-2 border-slate-200 py-3 text-sm font-bold focus:border-indigo-600 outline-none transition" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{isFA ? 'ایمیل معتبر' : 'Email Address'}</label>
                                <input type="email" className="w-full bg-slate-50 border-b-2 border-slate-200 py-3 text-sm font-bold focus:border-indigo-600 outline-none transition" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{isFA ? 'موضوع پیام' : 'Subject of Inquiry'}</label>
                                <select className="w-full bg-slate-50 border-b-2 border-slate-200 py-3 text-sm font-bold focus:border-indigo-600 outline-none transition">
                                    <option>{isFA ? 'سرمایه‌گذاری سبز' : 'Green Investment'}</option>
                                    <option>{isFA ? 'همکاری فنی' : 'Technical Partnership'}</option>
                                    <option>{isFA ? 'ثبت گرنت جدید' : 'Grant Submission'}</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{isFA ? 'شرح مختصری از درخواست' : 'Brief Description'}</label>
                                <textarea rows={4} className="w-full bg-slate-50 border-b-2 border-slate-200 py-3 text-sm font-medium focus:border-indigo-600 outline-none transition resize-none leading-relaxed"></textarea>
                            </div>

                            <button className="w-full py-5 bg-slate-950 text-white font-black rounded-[2rem] hover:bg-indigo-600 transition shadow-xl active:scale-95 flex items-center justify-center gap-3 mt-8">
                                <Send className="w-5 h-5" />
                                {isFA ? 'ارسال درخواست به نود مرکزی' : 'Send Message to Core Node'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            <footer className="text-center pt-8 border-t border-white/5">
                <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em]">
                    SECURE END-TO-END ENCRYPTED NODE • GreenHope Communications
                </p>
            </footer>
        </div>
    );
};

export default ContactView;
