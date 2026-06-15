import React from 'react';
import { useLanguage } from '../types';

const SiteFooter: React.FC = () => {
    const { t, language } = useLanguage();

    return (
        <footer id="footer" className="bg-slate-950 text-slate-400 border-t border-white/5 relative overflow-hidden">
            {/* Ambient backdrop glow */}
            <div className="absolute top-0 left-1/3 w-80 h-80 bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none"></div>
            
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 text-right rtl:text-right">
                    {/* Column 1: Brand & Mission */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-start md:justify-start gap-3 flex-row-reverse">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shadow-md">
                                <i className="fa-solid fa-shield-cat text-emerald-400 text-lg"></i>
                            </div>
                            <span className="font-black text-xl text-white tracking-tight">
                                {language === 'fa' ? 'سامانه مقتدر امید سبز' : 'GreenHope Autonomous Guard'}
                            </span>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed font-medium">
                            {language === 'fa' 
                              ? 'پلتفرم پیشرفته پایش حرارتی، صوتی و ماهواره‌ای جنگل‌های ایران جهت مهار جرقه و پیشگیری مطلق از حریق پیش‌اقلیمی.' 
                              : 'Autonomous climate forecasting, infrared thermal anomaly detection, and real-time acoustic canopy protection framework.'}
                        </p>
                        <div className="flex justify-start gap-3 pt-2 flex-row-reverse">
                            {['twitter', 'github', 'linkedin', 'telegram'].map((s) => (
                                <a key={s} href={`#${s}`} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-emerald-500 hover:text-white transition-all flex items-center justify-center border border-white/5" aria-label={s}>
                                    <i className={`fab fa-${s} text-xs`}></i>
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Column 2: Core Monitors */}
                    <div className="space-y-3">
                        <h4 className="text-xs font-black text-white hover:text-emerald-400 transition-colors uppercase tracking-wider">
                            {language === 'fa' ? '🛡️ ماژول‌های پایش و گارد جنگل' : '🛡️ Forest Guard Modules'}
                        </h4>
                        <ul className="space-y-2 text-xs">
                            <li>
                                <a href="#smartfiresense" className="hover:text-emerald-400 transition-all block">
                                    {language === 'fa' ? 'پیش‌بین حریق زنده (Sentinel-2)' : 'Thermal Fire Radar'}
                                </a>
                            </li>
                            <li>
                                <a href="#water" className="hover:text-emerald-400 transition-all block">
                                    {language === 'fa' ? 'اسکنر آبخوان‌های کارستی زاگرس' : 'Subterranean Aquifers'}
                                </a>
                            </li>
                            <li>
                                <a href="#reforestation" className="hover:text-emerald-400 transition-all block">
                                    {language === 'fa' ? 'پرتاب مکانیزه بذر و برنامه‌ریزی بهزراعی' : 'Dynamic Seed Swarms Scheduler'}
                                </a>
                            </li>
                            <li>
                                <a href="#estimator" className="hover:text-emerald-400 transition-all block">
                                    {language === 'fa' ? 'محاسبه‌گر مالی و تخمین نیروی جهادی' : 'Ecology Budget & Labor Plan'}
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Column 3: Active Satellites & Stations */}
                    <div className="space-y-3">
                        <h4 className="text-xs font-black text-white uppercase tracking-wider">
                            {language === 'fa' ? '📡 ماهواره‌ها و ایستگاه‌های زمینی' : '📡 Connected Constellations'}
                        </h4>
                        <ul className="space-y-2 text-xs">
                            <li className="flex items-center gap-2 justify-end">
                                <span className="bg-emerald-400/20 text-emerald-400 px-1 py-0.2 rounded text-[9px] font-bold">ACTIVE</span>
                                <span>ESA Sentinel-2 Multi-Spectral</span>
                            </li>
                            <li className="flex items-center gap-2 justify-end">
                                <span className="bg-emerald-400/20 text-emerald-400 px-1 py-0.2 rounded text-[9px] font-bold">LIVE</span>
                                <span>NASA MODIS Thermal Imagery</span>
                            </li>
                            <li className="flex items-center gap-2 justify-end">
                                <span className="bg-blue-500/20 text-blue-400 px-1 py-0.2 rounded text-[9px] font-bold">ONLINE</span>
                                <span>IoT acoustic ZigBee canopy nodes</span>
                            </li>
                        </ul>
                    </div>

                    {/* Column 4: Quick Contacts & Compliance */}
                    <div className="space-y-4">
                        <h4 className="text-xs font-black text-white uppercase tracking-wider">
                            {language === 'fa' ? '📞 تماس اضطراری و پایداری' : '📞 Contacts & Safeguards'}
                        </h4>
                        <div className="text-xs leading-relaxed space-y-1">
                            <p className="font-bold text-white">
                                {language === 'fa' ? 'شماره بحران جنگلبانی:' : 'National Forest Guard:'}
                            </p>
                            <p className="text-rose-400 font-mono text-sm font-extrabold flex justify-end items-center gap-1.5">
                                <i className="fa-solid fa-phone-volume animate-pulse"></i>
                                <span>1504 / 139</span>
                            </p>
                        </div>
                        <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-[9px]">
                            <p className="font-bold text-slate-300">
                                {language === 'fa' ? '🛡️ استاندارد زیست‌محیطی:' : 'Standards Compliance:'}
                            </p>
                            <p className="text-slate-400 mt-0.5">
                                App aligned with IUCN Guidelines & Copernicus Wildfire Mitigation Action Protocols.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Sub footer */}
                <div className="mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-center">
                    <p className="text-xs text-slate-500">
                        {language === 'fa' 
                          ? 'حقوق معنوی محفوظ است © ۱۴۰۵ سامانه ملی هوشمند امید سبز' 
                          : '© 2026 GreenHope Forest Sentinel Network. Developed with advanced AI telemetry.'}
                    </p>
                    <div className="flex gap-4 text-xs text-slate-500">
                        <a href="#privacy" className="hover:text-emerald-400">Privacy Policy</a>
                        <span>•</span>
                        <a href="#terms" className="hover:text-emerald-400">Terms of Operation</a>
                        <span>•</span>
                        <a href="#developer" className="hover:text-emerald-400">UI/UX Specialty Board</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default SiteFooter;
