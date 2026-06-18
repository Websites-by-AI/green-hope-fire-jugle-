import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../types';
import { Link, useLocation } from 'react-router-dom';

interface SiteHeaderProps {
    onLogoClick: () => void;
    currentView: 'app' | 'admin';
    onAdminClick: (isAdmin: boolean) => void;
}

const SiteHeader: React.FC<SiteHeaderProps> = ({ onLogoClick, currentView, onAdminClick }) => {
  const { language, setLanguage, t } = useLanguage();
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [isModulesMenuOpen, setIsModulesMenuOpen] = useState(false);
  
  const langMenuRef = useRef<HTMLDivElement>(null);
  const modulesMenuRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileModulesOpen, setIsMobileModulesOpen] = useState(false);

  const getAdminLabel = () => {
    if (language === 'fa') return 'پنل مدیریت سیستمی';
    if (language === 'ar') return 'لوحة التحكم';
    return 'System Core Admin';
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setIsLangMenuOpen(false);
      }
      if (modulesMenuRef.current && !modulesMenuRef.current.contains(event.target as Node)) {
        setIsModulesMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const systemModules = [
    { id: 'cooperation', labelFa: 'نقشه راه ائتلاف ۴ نفره', labelEn: '4-Member Cooperation Roadmap', icon: 'fa-users', color: 'text-emerald-400', descFa: 'نقشه راه ۲۸ روزه پیوند فنی، کُلب و سناریو کپی پرامپت‌ها', descEn: 'Strategic 28-day pipeline fusing AI notebooks & templates' },
    { id: 'smartfiresense', labelFa: 'کنترل و پایش حریق', labelEn: 'Smart Fire Sense', icon: 'fa-fire', color: 'text-rose-400', descFa: 'سنجش مادون قرمز حرارتی حریق زنده', descEn: 'Real-time infrared thermal fire surveillance' },
    { id: 'reforestation', labelFa: 'احیاء و جنگل‌کاری خودکار', labelEn: 'Autonomous Reforestation', icon: 'fa-shield-halved', color: 'text-emerald-400', descFa: 'سنجش سلامت جنگل با ماهواره Sentinel', descEn: 'Forest health diagnostics with Sentinel' },
    { id: 'water', labelFa: 'پایش منابع آب کارستی', labelEn: 'Water Aquifers', icon: 'fa-water', color: 'text-blue-400', descFa: 'تحلیل تراز سفره‌های آب زیرزمینی', descEn: 'Subterranean karstic aquifer monitoring' },
    { id: 'patent', labelFa: 'سامانه‌ پتنت و ایده سبز', labelEn: 'Patent & Idea Shield', icon: 'fa-shield', color: 'text-teal-400', descFa: 'کپی‌رایت ایده‌های زیست‌محیطی', descEn: 'Climate action patent & IP draft shield', path: '/patent' },
    { id: 'invest', labelFa: 'فرصت‌های سرمایه‌گذاری سبز', labelEn: 'Green Carbon Investment', icon: 'fa-chart-line', color: 'text-teal-300', descFa: 'بورس اعتبارات کربنی و فایننس جنگل', descEn: 'Eco-credits & sovereign forestry funding' },
    { id: 'grants', labelFa: 'گرنت‌ها و یارانه‌های حمایتی', labelEn: 'Climate Grants Finder', icon: 'fa-hand-holding-dollar', color: 'text-amber-400', descFa: 'یابنده تسهیلات بین‌المللی بلاعوض', descEn: 'Real-time global grants & NGO fund tracker' },
    { id: 'products', labelFa: 'تدارکات، بذور و محصولات بومی', labelEn: 'Seedlings & Logistics', icon: 'fa-shopping-bag', color: 'text-emerald-300', descFa: 'سفارش نهال، درخت و سخت‌افزار پایش', descEn: 'Active sapling checkout & logistics' },
    { id: 'backlog', labelFa: 'بک‌لاگ عملیاتی گارد', labelEn: 'Conservation Backlog', icon: 'fa-history', color: 'text-slate-400', descFa: 'گام‌های عملیاتی و فواصل زمانی احیاء', descEn: 'Active work logs and timeline schedules' },
  ];
  
  return (
    <header className="bg-slate-950/90 backdrop-blur-xl sticky top-0 z-50 border-b border-b-white/5 shadow-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Brand ID */}
          <div className="flex items-center gap-4">
            <Link 
              to="/"
              onClick={() => {
                onLogoClick();
                setIsMobileMenuOpen(false);
              }} 
              className="flex-shrink-0 flex items-center gap-3 rtl:flex-row-reverse transform transition-all hover:scale-102 active:scale-98"
            >
               <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-slate-950 shadow-lg shadow-emerald-500/20">
                  <i className="fa-solid fa-cloud-sun text-lg"></i>
               </div>
               <div className="text-right rtl:text-right ltr:text-left">
                  <span className="font-extrabold text-lg text-white block leading-tight tracking-tight">
                    {t('header.title')}
                  </span>
                  <span className="text-[9px] text-emerald-400 font-bold block tracking-widest uppercase">
                    {language === 'fa' ? 'امنیت و پایش فعال اراضی' : 'Active Land Protection'}
                  </span>
               </div>
            </Link>
          </div>

          {/* Desktop Core Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 text-right rtl:text-right" dir="rtl">
            <Link 
              to="/"
              onClick={onLogoClick}
              className="text-xs font-black text-slate-300 hover:text-emerald-400 transition-colors uppercase tracking-wider flex items-center gap-1.5"
            >
              <i className="fa-solid fa-gauge text-slate-500 text-[10px]"></i>
              <span>{language === 'fa' ? 'پیشخوان امنیت اراضی' : 'Security Dashboard'}</span>
            </Link>
            
            <span className="w-1 h-1 rounded-full bg-slate-800"></span>

            {/* HIGHLY INTERACTIVE DROPDOWN MENU FOR THE FULL PRODUCT MODULES LIST */}
            <div className="relative" ref={modulesMenuRef}>
              <button
                type="button"
                onClick={() => setIsModulesMenuOpen(!isModulesMenuOpen)}
                className={`text-xs font-black transition-colors uppercase tracking-wider flex items-center gap-1.5 focus:outline-none ${
                  isModulesMenuOpen ? 'text-emerald-400' : 'text-slate-300 hover:text-emerald-400'
                }`}
              >
                <i className="fa-solid fa-square-poll-horizontal text-slate-500 text-[10px]"></i>
                <span>{language === 'fa' ? 'سامانه‌ها و ابزارها' : 'Ecosystem Modules'}</span>
                <i className={`fa-solid fa-chevron-down text-[8px] transition-transform duration-200 ${isModulesMenuOpen ? 'rotate-180 text-emerald-400' : 'text-slate-500'}`}></i>
              </button>

              {isModulesMenuOpen && (
                <div className="absolute right-0 mt-3 w-80 rounded-2xl shadow-2xl bg-slate-900 border border-white/10 p-3 z-50 animate-scale-up text-right rtl:text-right ltr:text-left">
                  <div className="text-[10px] uppercase font-black text-emerald-400 px-2.5 pb-2 mb-2 border-b border-white/5 tracking-wider">
                    {language === 'fa' ? 'ابزارهای تخصصی امنیت سبز' : 'Specialized Green Security Tools'}
                  </div>
                  <div className="space-y-1 max-h-96 overflow-y-auto custom-scrollbar">
                    {systemModules.map((module) => {
                      const linkPath = module.path ? module.path : `/?tab=${module.id}`;
                      return (
                        <Link
                          key={module.id}
                          to={linkPath}
                          onClick={() => {
                            setIsModulesMenuOpen(false);
                          }}
                          className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-all group"
                        >
                          <div className={`mt-0.5 w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center ${module.color} group-hover:scale-105 transition-transform`}>
                            <i className={`fa-solid ${module.icon} text-xs`}></i>
                          </div>
                          <div className="flex-1 space-y-0.5 border-none">
                            <div className="text-xs font-black text-slate-200 group-hover:text-emerald-400 transition-colors">
                              {language === 'fa' ? module.labelFa : module.labelEn}
                            </div>
                            <div className="text-[9px] text-slate-400 font-medium leading-normal">
                              {language === 'fa' ? module.descFa : module.descEn}
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <span className="w-1 h-1 rounded-full bg-slate-800"></span>
            
            <a 
              href="#about-mission" 
              className="text-xs font-black text-slate-300 hover:text-emerald-400 transition-colors uppercase tracking-wider flex items-center gap-1.5"
            >
              <i className="fa-solid fa-feather text-slate-500 text-[10px]"></i>
              <span>{language === 'fa' ? 'بیانیه ضدحریق' : 'Anti-Fire Mission'}</span>
            </a>
            
            <span className="w-1 h-1 rounded-full bg-slate-800"></span>
            
            <a 
              href="#satellite-stream" 
              className="text-xs font-black text-slate-300 hover:text-emerald-400 transition-colors uppercase tracking-wider flex items-center gap-1.5"
            >
              <i className="fa-solid fa-satellite-dish text-slate-500 text-[10px]"></i>
              <span>{language === 'fa' ? 'پایش زنده دما' : 'Thermal Sensing'}</span>
            </a>
            
            <span className="w-1 h-1 rounded-full bg-slate-800"></span>
            
            <a 
              href="#footer" 
              className="text-xs font-black text-slate-300 hover:text-emerald-400 transition-colors uppercase tracking-wider flex items-center gap-1.5"
            >
              <i className="fa-solid fa-phone text-slate-500 text-[10px]"></i>
              <span>{language === 'fa' ? 'تماس گارد' : 'Emergency Contact'}</span>
            </a>
          </nav>

          {/* Right utility elements (Admin panel trigger, Lang switch, Mobile menu trigger) */}
          <div className="flex items-center gap-2 sm:gap-4">
            <Link
              to={location.pathname === '/admin' ? '/' : '/admin'}
              className={`hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                location.pathname === '/admin'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 border-emerald-400/30 text-white shadow-lg shadow-emerald-500/20'
                  : 'bg-white/5 border-white/10 text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <i className={`fa-solid ${location.pathname === '/admin' ? 'fa-grid-horizontal' : 'fa-laptop-code'} text-xs`}></i>
              <span>{location.pathname === '/admin' ? (language === 'fa' ? 'نقشه اصلی' : 'Planner View') : getAdminLabel()}</span>
            </Link>

            {/* Language dropdown switcher */}
            <div className="relative" ref={langMenuRef}>
                <button 
                  type="button"
                  onClick={() => setIsLangMenuOpen(!isLangMenuOpen)} 
                  className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-center text-slate-300 hover:text-white transition-all active:scale-95" 
                  aria-label="Change language"
                >
                    <i className="fa-solid fa-globe text-sm"></i>
                </button>
                {isLangMenuOpen && (
                    <div className="absolute right-0 rtl:left-0 rtl:right-auto mt-2 w-48 rounded-xl shadow-2xl bg-slate-900 border border-white/10 p-1.5 z-50 animate-scale-up">
                        <div className="text-[10px] uppercase font-black text-slate-500 px-3 py-1.5 tracking-wider">Select Lang:</div>
                        <div className="space-y-1">
                            <button 
                                type="button"
                                onClick={() => { setLanguage('en'); setIsLangMenuOpen(false); }} 
                                className={`w-full text-left block px-3 py-2 text-xs rounded-lg transition-colors font-semibold ${language === 'en' ? 'bg-emerald-500 text-white font-extrabold' : 'text-gray-300 hover:bg-white/5'}`}
                            >
                                English
                            </button>
                            <button 
                                type="button"
                                onClick={() => { setLanguage('fa'); setIsLangMenuOpen(false); }} 
                                className={`w-full text-right block px-3 py-2 text-xs rounded-lg transition-colors font-semibold ${language === 'fa' ? 'bg-emerald-500 text-white font-extrabold' : 'text-gray-300 hover:bg-white/5'}`}
                            >
                                فارسی (Persian)
                            </button>
                            <button 
                                type="button"
                                onClick={() => { setLanguage('tr'); setIsLangMenuOpen(false); }} 
                                className={`w-full text-right block px-3 py-2 text-xs rounded-lg transition-colors font-semibold ${language === 'tr' ? 'bg-emerald-500 text-white font-extrabold' : 'text-gray-300 hover:bg-white/5'}`}
                            >
                                Türkçe (Turkish)
                            </button>
                            <button 
                                type="button"
                                onClick={() => { setLanguage('ar'); setIsLangMenuOpen(false); }} 
                                className={`w-full text-right block px-3 py-2 text-xs rounded-lg transition-colors font-semibold ${language === 'ar' ? 'bg-emerald-500 text-white font-extrabold' : 'text-gray-300 hover:bg-white/5'}`}
                            >
                                العربية (Arabic)
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Mobile menu trigger */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 transition-all active:scale-95"
              aria-label="Toggle mobile Menu"
            >
              <i className={`fa-solid ${isMobileMenuOpen ? 'fa-xmark' : 'fa-bars'} text-sm`}></i>
            </button>
          </div>

        </div>

        {/* Responsive Mobile Drawer Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-white/5 bg-slate-950/98 backdrop-blur-3xl animate-fade-in p-4 pb-6 space-y-4 rounded-b-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex flex-col gap-2 text-right rtl:text-right" dir="rtl">
              <Link 
                to="/"
                onClick={() => {
                  onLogoClick();
                  setIsMobileMenuOpen(false);
                }}
                className="p-3 rounded-xl hover:bg-emerald-950/20 text-slate-200 hover:text-emerald-400 font-bold text-xs flex items-center gap-2 border border-white/5 transition-all"
              >
                <i className="fa-solid fa-gauge text-[11px] text-emerald-500"></i>
                <span>{language === 'fa' ? 'پیشخوان امنیت اراضی' : 'Security Dashboard'}</span>
              </Link>

              {/* Collapsible Mobile Ecosystem Modules */}
              <div className="border border-white/5 rounded-xl bg-white/2 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setIsMobileModulesOpen(!isMobileModulesOpen)}
                  className="w-full text-right p-3 text-slate-200 font-bold text-xs flex items-center justify-between hover:bg-emerald-950/10 transition-all focus:outline-none"
                >
                  <span className="flex items-center gap-2">
                    <i className="fa-solid fa-square-poll-horizontal text-[11px] text-emerald-500"></i>
                    <span>{language === 'fa' ? 'سامانه‌ها و ابزارها' : 'Ecosystem Modules'}</span>
                  </span>
                  <i className={`fa-solid fa-chevron-down text-[8px] transition-transform ${isMobileModulesOpen ? 'rotate-180 text-emerald-400' : 'text-slate-500'}`}></i>
                </button>

                {isMobileModulesOpen && (
                  <div className="bg-slate-950/50 p-2 border-t border-white/5 space-y-1.5 animate-slide-down">
                    {systemModules.map((module) => {
                      const linkPath = module.path ? module.path : `/?tab=${module.id}`;
                      return (
                        <Link
                          key={module.id}
                          to={linkPath}
                          onClick={() => {
                            setIsMobileMenuOpen(false);
                          }}
                          className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-all"
                        >
                          <div className={`w-6 h-6 rounded bg-white/5 flex items-center justify-center ${module.color}`}>
                            <i className={`fa-solid ${module.icon} text-[10px]`}></i>
                          </div>
                          <div className="text-[11px] font-black text-slate-300">
                            {language === 'fa' ? module.labelFa : module.labelEn}
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>

              <a 
                href="#about-mission" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-3 rounded-xl hover:bg-emerald-950/20 text-slate-200 hover:text-emerald-400 font-bold text-xs flex items-center gap-2 border border-white/5 transition-all"
              >
                <i className="fa-solid fa-feather text-[11px] text-emerald-500"></i>
                <span>{language === 'fa' ? 'بیانیه ماموریت ضدحریق' : 'Anti-Fire Mission'}</span>
              </a>
              <a 
                href="#satellite-stream" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-3 rounded-xl hover:bg-emerald-950/20 text-slate-200 hover:text-emerald-400 font-bold text-xs flex items-center gap-2 border border-white/5 transition-all"
              >
                <i className="fa-solid fa-satellite-dish text-[11px] text-emerald-500"></i>
                <span>{language === 'fa' ? 'پایش زنده دما سنجی' : 'Thermal Sensing Stream'}</span>
              </a>
              <Link 
                to="/patent"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-3 rounded-xl hover:bg-emerald-950/20 text-slate-200 hover:text-emerald-400 font-bold text-xs flex items-center gap-2 border border-white/5 transition-all"
              >
                <i className="fa-solid fa-shield text-[11px] text-emerald-500"></i>
                <span>{language === 'fa' ? 'سامانه پتنت و ایده' : 'Patent & Idea Shield'}</span>
              </Link>
              <a 
                href="#footer" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-3 rounded-xl hover:bg-emerald-950/20 text-slate-200 hover:text-emerald-400 font-bold text-xs flex items-center gap-2 border border-white/5 transition-all"
              >
                <i className="fa-solid fa-phone text-[11px] text-emerald-500"></i>
                <span>{language === 'fa' ? 'تماس فوری گارد' : 'Emergency Contact'}</span>
              </a>
              <Link
                to={location.pathname === '/admin' ? '/' : '/admin'}
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-3 rounded-xl bg-emerald-900/10 hover:bg-emerald-900/20 text-emerald-400 border border-emerald-500/20 font-black text-xs flex items-center justify-center gap-2 transition-all mt-2"
              >
                <i className="fa-solid fa-laptop-code text-[11px]"></i>
                <span>{location.pathname === '/admin' ? (language === 'fa' ? 'بازگشت به نقشه' : 'Back to Map') : getAdminLabel()}</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default SiteHeader;
