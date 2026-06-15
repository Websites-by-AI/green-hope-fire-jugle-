import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../types';

interface SiteHeaderProps {
    onLogoClick: () => void;
    currentView: 'app' | 'admin';
    onAdminClick: (isAdmin: boolean) => void;
}

const SiteHeader: React.FC<SiteHeaderProps> = ({ onLogoClick, currentView, onAdminClick }) => {
  const { language, setLanguage, t } = useLanguage();
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const langMenuRef = useRef<HTMLDivElement>(null);

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
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  return (
    <header className="bg-slate-950/90 backdrop-blur-xl sticky top-0 z-50 border-b border-white/5 shadow-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Brand ID */}
          <div className="flex items-center gap-4">
            <button 
              type="button"
              onClick={onLogoClick} 
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
                    {language === 'fa' ? 'امنیت و پایش فعال جنگل‌ها' : 'Active Forest Protection'}
                  </span>
               </div>
            </button>
          </div>

          {/* Desktop Core Navigation Links */}
          <nav className="hidden lg:flex items-center gap-8 text-right rtl:text-right" dir="rtl">
            <a 
              href="#dashboard" 
              onClick={onLogoClick}
              className="text-xs font-black text-slate-300 hover:text-emerald-400 transition-colors uppercase tracking-wider flex items-center gap-1.5"
            >
              <i className="fa-solid fa-gauge text-slate-500 text-[10px]"></i>
              <span>{language === 'fa' ? 'پیشخوان امنیت اراضی' : 'Security Dashboard'}</span>
            </a>
            <span className="w-1 h-1 rounded-full bg-slate-800"></span>
            <a 
              href="#about-mission" 
              className="text-xs font-black text-slate-300 hover:text-emerald-400 transition-colors uppercase tracking-wider flex items-center gap-1.5"
            >
              <i className="fa-solid fa-feather text-slate-500 text-[10px]"></i>
              <span>{language === 'fa' ? 'بیانیه ماموریت ضدحریق' : 'Anti-Fire Mission'}</span>
            </a>
            <span className="w-1 h-1 rounded-full bg-slate-800"></span>
            <a 
              href="#satellite-stream" 
              className="text-xs font-black text-slate-300 hover:text-emerald-400 transition-colors uppercase tracking-wider flex items-center gap-1.5"
            >
              <i className="fa-solid fa-satellite-dish text-slate-500 text-[10px]"></i>
              <span>{language === 'fa' ? 'پایش زنده دما سنجی' : 'Thermal Sensing Stream'}</span>
            </a>
            <span className="w-1 h-1 rounded-full bg-slate-800"></span>
            <a 
              href="#footer" 
              className="text-xs font-black text-slate-300 hover:text-emerald-400 transition-colors uppercase tracking-wider flex items-center gap-1.5"
            >
              <i className="fa-solid fa-phone text-slate-500 text-[10px]"></i>
              <span>{language === 'fa' ? 'تماس فوری گارد' : 'Emergency Contact'}</span>
            </a>
          </nav>

          {/* Right utility elements (Admin panel trigger, Lang switch) */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => onAdminClick(currentView !== 'admin')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                currentView === 'admin'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 border-emerald-400/30 text-white shadow-lg shadow-emerald-500/20'
                  : 'bg-white/5 border-white/10 text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <i className={`fa-solid ${currentView === 'admin' ? 'fa-grid-horizontal' : 'fa-laptop-code'} text-xs`}></i>
              <span>{currentView === 'admin' ? (language === 'fa' ? 'نقشه و سنجنده‌ها' : 'Planner View') : getAdminLabel()}</span>
            </button>

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
                    <div className="absolute right-0 rtl:left-0 rtl:right-auto mt-2 w-48 rounded-xl shadow-2xl bg-slate-900 border border-white/10 p-1.5 z-50 animate-fade-in">
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
                                onClick={() => { setLanguage('ar'); setIsLangMenuOpen(false); }} 
                                className={`w-full text-right block px-3 py-2 text-xs rounded-lg transition-colors font-semibold ${language === 'ar' ? 'bg-emerald-500 text-white font-extrabold' : 'text-gray-300 hover:bg-white/5'}`}
                            >
                                العربية (Arabic)
                            </button>
                        </div>
                    </div>
                )}
            </div>
          </div>

        </div>
      </div>
    </header>
  );
};

export default SiteHeader;
