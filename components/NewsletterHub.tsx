import React, { useState, useMemo } from 'react';
import { useLanguage } from '../types';
import { 
  FileText, 
  Mail, 
  Send, 
  Rss, 
  AlertCircle,
  Clock, 
  CheckCircle, 
  Search, 
  Sprout, 
  Settings,
  X,
  Radio,
  Flame,
  Droplet,
  Compass,
  Download,
  Terminal,
  ChevronRight
} from 'lucide-react';

interface NewsletterTemplate {
  id: string;
  titleFa: string;
  titleEn: string;
  categoryFa: string;
  categoryEn: string;
  dateFa: string;
  dateEn: string;
  authorFa: string;
  authorEn: string;
  readingTimeFa: string;
  readingTimeEn: string;
  summaryFa: string;
  summaryEn: string;
  contentFa: string;
  contentEn: string;
  badgeColor: string;
}

const NEWSLETTER_ARCHIVES: NewsletterTemplate[] = [
  {
    id: 'zagros-june-2026',
    titleFa: 'گروه ویژه دپارتمان زاگرس: تدوین نهمین پروتکل مهار حریق‌های ناشی از باد خشک سَموم',
    titleEn: 'Zagros Emergency Briefing: Ninth Protocol Against Dry Syoom Wildfire Vectors',
    categoryFa: 'پایش بحران حریق',
    categoryEn: 'Crisis Monitoring',
    dateFa: '۲۴ خرداد ۱۴۰۵',
    dateEn: 'June 14, 2026',
    authorFa: 'شورای مانیتورینگ امید سبز',
    authorEn: 'GreenHope Scientific Board',
    readingTimeFa: '۵ دقیقه مطالعه',
    readingTimeEn: '5 min read',
    summaryFa: 'تحلیل افت شدید رطوبت لایه‌های خشک جنگلی زاگرس جنوبی و استقرار پهپادهای تلمتری زنده حرارت‌سنج.',
    summaryEn: 'Analysis of relative humidity drops in Southern Zagros oak forests and deployment of cellular telemetry drone grids.',
    contentFa: 'با استقرارهای آزمایشی صورت گرفته در مناطق حفاظت‌شده بویژه حواشی جنگل‌های بلوط یاسوج و ایلام، تلمتری پایش دما افزایش ۲.۴ درجه‌ای میانگین محلی را ثبت می‌کند. این گزارش با تلفیق داده‌های رطوبت سنج خاک نشان می‌دهد که بوته‌زارهای پایین‌رو در آستانه وضعیت اشتعال زودهنگام هستند. توصیه استراتژیک ما تسریع در فعال‌سازی حسگرهای SmartFireSense به صورت چیدمان زنبوری است.',
    contentEn: 'With test deployments in oak woodland borders, temperature logs flag a local surge of 2.4°C above baseline average. Critical soil saturation index shows risk vectors near spontaneous ignition. We advise prompt grid-level cell activation of SmartFireSense nodes.',
    badgeColor: 'text-amber-400 bg-amber-500/10'
  },
  {
    id: 'aquifer-salariyeh-2026',
    titleFa: 'خبرنامه هیدرولوژی: احیای جریان‌های زیرزمینی دشت سالاریه به کمک کشت نخل وحشی بومی',
    titleEn: 'Hydrology Dispatch: Successful Underground Aquifer Recharges in Salariyeh Plains',
    categoryFa: 'پایش زیرسطحی زمین',
    categoryEn: 'Subterranean Hydrology',
    dateFa: '۱۸ خرداد ۱۴۰۵',
    dateEn: 'June 8, 2026',
    authorFa: 'دکتر علیرضا فرزانه (هیدروژئولوژیست)',
    authorEn: 'Dr. Alireza Farzaneh (Senior Botanist)',
    readingTimeFa: '۷ دقیقه مطالعه',
    readingTimeEn: '7 min read',
    summaryFa: 'بررسی علمی چگونگی بازیابی منابع سفره آب زیرسطحی سالاریه با استقرار شبکه‌‌های ریشه گیاهان دیم دوقلو.',
    summaryEn: 'Scientific deep-dive on water table stabilization using dry-cover root structures and satellite infiltration tracking.',
    contentFa: 'داده‌های ته‌نشین حسگرهای دابل گراوند تایید می‌کنند که با جایگزینی کشت نامتعارف با پوشش چندساله زعفران دیم و بوته بومی در روستای سالاریه، ضریب آب‌گذری سفره تا ۱۸ درصد ارتقاء یافته است. این راهکار مانع تبخیر سریع سطحی نزولات ناگهانی بهاری به میزان قابل توجهی شده است.',
    contentEn: 'Deep soil penetration sensors confirm that shifting crop regimes to native Saffron cover in Salariyeh village has increased subterranean water table filtration by 18%. This setup prevents severe evaporation loss during sudden torrential flash rains.',
    badgeColor: 'text-blue-400 bg-blue-500/10'
  },
  {
    id: 'soil-vitality-2026',
    titleFa: 'بررسی سلامت خاک البرز: اثرات همزیستی قارچی بومی بر ثبات شیب لغزه‌ها',
    titleEn: 'Alborz Soil Vitality: Native Cover Mycorrhizae Impact on Steep landslide Vectors',
    categoryFa: 'مطالعات فرسایش',
    categoryEn: 'Erosion Dynamics',
    dateFa: '۰۴ خرداد ۱۴۰۵',
    dateEn: 'May 25, 2026',
    authorFa: 'مهندسی منابع طبیعی امید سبز',
    authorEn: 'GreenHope Agronomy Division',
    readingTimeFa: '۴ دقیقه مطالعه',
    readingTimeEn: '4 min read',
    summaryFa: 'گروه تحقیقات البرز گزارش خود را درباره افزایش چسبندگی بافتی خاک فاکتور ارس صادر کرد.',
    summaryEn: 'Ecology report detailing visual mycorrhizae microclimate impacts on fragile organic soil layers.',
    contentFa: 'طی پایش ماهواره‌ای پهنه شمالی البرز محرز شد که نهال‌های چندساله ارس (سرو کوهی) به واسطه تکثیر میسلیوم‌های قارچی بوم‌زاد، پایداری شیب لایه‌ای را تا ۴۰ درصد افزایش داده‌اند. این امر خطر سناریوهای گل‌لغزش پس از رگبارهای متناوب خطه صخره‌ای را کاملاً مهار می‌کند.',
    contentEn: 'Copernicus satellite imaging across Mount Alborz confirms high-altitude Junipers and symbiotic mycorrhizae cultures increased bank cohesion by 40%. Landslide probabilities after rapid seasonal cloudbursts have decreased significantly.',
    badgeColor: 'text-emerald-400 bg-emerald-500/10'
  }
];

export default function NewsletterHub() {
  const { language } = useLanguage();
  
  // States
  const [emailInput, setEmailInput] = useState('');
  const [targetRegion, setTargetRegion] = useState('zagros');
  const [topicFocus, setTopicFocus] = useState('fires');
  const [customPrompt, setCustomPrompt] = useState('');
  const [activeArticle, setActiveArticle] = useState<NewsletterTemplate | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [generatedNewsletter, setGeneratedNewsletter] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Auto generated newsletter dispatch mock
  const handleBuildCustomNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setGeneratedNewsletter(null);

    // Simulate smart environmental compiler with telemetry data
    setTimeout(() => {
      const regionLabel = 
        targetRegion === 'zagros' ? (language === 'fa' ? 'زنجیره کوهستان زاگرس (یاسوج/کُردستان)' : 'Zagros Highland Range') :
        targetRegion === 'alborz' ? (language === 'fa' ? 'دامنه البرز شمالی (دماوند/سوادکوه)' : 'Northern Alborz Slope') :
        (language === 'fa' ? 'دشت بیابانی سالاریه نمونه' : 'Salariyeh Experimental Desert Plain');

      const topicLabel =
        topicFocus === 'fires' ? (language === 'fa' ? 'پایش هوشمند و اضطراری مناطق حریق' : 'Extreme Fire Hotspots') :
        topicFocus === 'water' ? (language === 'fa' ? 'پایداری دبی و سفره‌های آب زیرزمینی' : 'Aquifer Hydrologic Flow') :
        (language === 'fa' ? 'تنوع زیستی گونه‌ای و احیاء پوشش گیاهی' : 'Species Diversity & Mycorrhizal Growth');

      const simulatedOutput = language === 'fa' ? 
`[گراش خبرنامه اختصاصی امید سبز - ویرایشگر توسعه‌یافته]

موقعیت پایش: ${regionLabel}
تمرکز موضوعی: ${topicFocus === 'fires' ? '🔥' : topicFocus === 'water' ? '💧' : '🌱'} ${topicLabel}
شاخص تلمتری تصادفی زمین: رطوبت خاک ${Math.floor(Math.random() * 15 + 10)}% | میانگین افزایش دمای سطحی: +۱.۸ درجه

بخش ۱: خلاصه اجرایی و برآورد فنی
با پایش شبکه‌های حسگری ماکارونی و حسگرهای SmartFireSense به صورت برخط، مشخص می‌گردد پایداری اقلیمی این منطقه نیازمند تغییرات بیدارفکری در مهار خشکی خاک است. رول‌های فرسایشی خاک نشان می‌دهند کشت نهشتی جدید با خطای کمی روبه‌رو است. توصیه می‌شود حامیان برای پایداری هر چه بیشتر، تلمتری را آنلاین نگه‌دارند.

بخش ۲: راهکار پیشنهادی فوری زیست‌محیطی
۱. تجهیز سیستم پاشش خودکار آب در زمان ثبت دمای بالای ۴۲ درجه توسط حسگر.
۲. کاشت فوری پوشش گیاهی دوقلو جهت تحکیم هیدرولیکی بستر.
۳. ارسال مداوم اطلاعات هشدار به جامعه محلی و دهیاری‌های حاشیه جنگل بخصوص منطقه سالاریه.

این گزارش به صورت کامپیوتری تایید و به آدرس ایمیل اشتراکی ارسال گردید.` :
`[GREENHOPE INTELLIGENT DISPATCH - PRIVATE CUSTOM BRIEFING]

Ecology Target Area: ${regionLabel}
Focus Domain: ${topicFocus === 'fires' ? '🔥' : topicFocus === 'water' ? '💧' : '🌱'} ${topicLabel}
Ground Telemetry Baseline: Soil moisture at ${Math.floor(Math.random() * 15 + 10)}% | Surface thermal delta: +1.8°C

Section A: Advanced Diagnostics & Findings
Analysis from autonomous ground IoT networks (SmartFireSense) highlights high tension levels corresponding with rapid dry wind events. Real-time satellite imagery models suggest the organic horizon of layers is vulnerable to topsoil shedding. Stabilizing vegetative grids should be activated without delay.

Section B: Tactical Remedies & Immediate Action Points
1. Provision satellite cellular early responders to relay warnings directly to village offices.
2. Form biological soil crusts using mycorrhizal additives.
3. Align local agriculture buffers to sustainable agroforestry planting profiles.

This report is finalized and dispatched to registered subscription systems.`;

      setGeneratedNewsletter(simulatedOutput);
      setIsGenerating(false);
    }, 1200);
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailInput.trim()) {
      setIsSubscribed(true);
      setTimeout(() => {
        // Keeps subscribed view active
      }, 3000);
    }
  };

  const loc = {
    fa: {
      head: 'سامانه انتشارات، نشریه تخصصی و پایش برخط امید سبز',
      sub: 'عضو نشریه زیست‌محیطی شوید یا بر اساس تلمتری و سنسورهای محلی، خبرنامه‌های مینیاتوری اختصاصی بسازید.',
      tabArch: 'آرشیو نشریات علمی پلتفرم',
      tabGenerator: 'ابزار هوشمند سنتز خبرنامه اختصاصی',
      subCta: 'عضویت در خبرنامه ماهواره‌ای پایش جنگل‌ها',
      subDesc: 'آخرین هشدارهای پایش رطوبت، دما و تهدیدات حریق منطقه زاگرس و البرز را به صورت هفتگی در ایمیل خود دریافت کنید.',
      emailPlaceholder: 'ایمیل خود را وارد کنید (مثال: user@domain.com)',
      btnSub: 'عضویت و ثبت نهایی دامین ایمیل',
      subSuccess: 'آدرس ایمیل شما با موفقیت در مخزن توزیع خبرنامه ثبت گردید.',
      archLabel: 'نشریات اخیر پاشش اراضی',
      promptLabel: 'پاسخ تکمیلی به شبیه‌ساز (دلخواه):',
      promptPlaceholder: 'مثال: با تمرکز شدید روی فرسایش خاک در پایین‌دست...',
      btnBuild: 'سنتز خبرنامه جدید بر اساس تلمتری زنده',
      btnBuilding: 'در حال کامپایل داده‌های حسگرها...',
      resultTitle: 'تلمتری سنتز شده نهایی خبرنامه',
      btnClose: 'بستن پنجره جزئیات'
    },
    en: {
      head: 'GreenHope Environmental Publications & Dispatch Hub',
      sub: 'Subscribe to verified telemetry journals or compile instant localized reports using live soil/fire sensor outputs.',
      tabArch: 'Ecology Archive Bulletins',
      tabGenerator: 'Instantly Generate Bespoke Report Newsletter',
      subCta: 'Subscribe to Satellite Reforestation Intelligence',
      subDesc: 'Receive weekly soil moisture readings, fire risk forecasts, and agroforestry updates from active Iranian woodlands in your inbox.',
      emailPlaceholder: 'Enter your valid email (e.g. user@domain.com)',
      btnSub: 'Subscribe to Active Dispatch Link',
      subSuccess: 'Email registered successfully in our distribution list.',
      archLabel: 'Archived Environmental Newsletters',
      promptLabel: 'Include custom focus criteria (Optional):',
      promptPlaceholder: 'e.g. emphasize downstream landslide risks...',
      btnBuild: 'Compile Customized Telemetry Bulletin',
      btnBuilding: 'Processing sensor array signals...',
      resultTitle: 'Custom Environmental Report Dispatch Result',
      btnClose: 'Close Article Detail'
    },
    ar: {
      head: 'مركز منشورات ونشرات الأمل الأخضر البيئية',
      sub: 'اشترك بالنشرات الرسمية وتحليلات الأراضي أو ابدأ بتوليد نشرتك الإخبارية المخصصة بناءً على قراءات أجهزة الاستشعار.',
      tabArch: 'أرشيف النشرات البيئية',
      tabGenerator: 'أداة توليد تقرير بيئي فوري مخصص',
      subCta: 'الاشتراك بالنشرة السحابية لمكافحة الحرائق',
      subDesc: 'احصل على تحديثات دورية بخصوص قياسات الجفاف والإنذار المبكر بالحرائق في غابات زاجروس والبرز عبر بريدك.',
      emailPlaceholder: 'أدخل بريدك الإلكتروني المعتمد',
      btnSub: 'تسجيل وتفعيل الاشتراك',
      subSuccess: 'تم تسجيل بريدكم بنجاح في سجل توزيع النشرات الدورية.',
      archLabel: 'النشرات المحفوظة والمؤرشفة',
      promptLabel: 'تخصيص تركيز النشرة الإضافي (اختياري):',
      promptPlaceholder: 'مثلاً: التركيز على مشاكل انجراف التربة الطينية...',
      btnBuild: 'توليد النشرة البيئية المستندة لحسگرها',
      btnBuilding: 'جارٍ معالجة تلمتری الأجهزة الأرضية...',
      resultTitle: 'النشرة البيئية التفاعلية المولدة',
      btnClose: 'إغلاق التفاصيل المعروضة'
    }
  };

  const currentLoc = loc[language as keyof typeof loc] || loc.fa;

  return (
    <div id="newsletter-hub-container" className="bg-slate-900 border border-slate-800/80 rounded-2xl p-6 lg:p-8 text-slate-100 shadow-2xl relative">
      <div className="absolute top-0 right-10 w-[250px] h-[250px] bg-blue-500/5 rounded-full blur-[90px] pointer-events-none" />

      {/* Hero Header */}
      <div className="border-b border-slate-800 pb-6 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Rss className="w-8 h-8 text-emerald-400" />
            <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-blue-300 bg-clip-text text-transparent">
              {currentLoc.head}
            </h2>
          </div>
          <p className="text-xs md:text-sm text-slate-400 max-w-4xl">
            {currentLoc.sub}
          </p>
        </div>

        {/* Live System Broadcast Indicator */}
        <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[10px] text-slate-400 font-mono tracking-wider uppercase">SATELLITE DOWNLINK: ONLINE</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* Left Span (7/12) - Archive & Read Panel */}
        <div className="xl:col-span-7 space-y-6">
          <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2 border-b border-slate-800 pb-2 mb-4">
            <FileText className="w-4 h-4 text-emerald-400" />
            {currentLoc.archLabel}
          </h3>

          <div className="grid grid-cols-1 gap-4">
            {NEWSLETTER_ARCHIVES.map((item) => {
              const itemTitle = language === 'fa' ? item.titleFa : item.titleEn;
              const itemCategory = language === 'fa' ? item.categoryFa : item.categoryEn;
              const itemSummary = language === 'fa' ? item.summaryFa : item.summaryEn;
              const itemDate = language === 'fa' ? item.dateFa : item.dateEn;

              return (
                <div 
                  key={item.id} 
                  className="bg-slate-950/40 border border-slate-850 hover:border-slate-800 p-5 rounded-xl transition duration-200 cursor-pointer group relative"
                  onClick={() => setActiveArticle(item)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${item.badgeColor}`}>
                      {itemCategory}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {itemDate}
                    </span>
                  </div>

                  <h4 className="font-bold text-sm text-slate-100 group-hover:text-emerald-400 transition mb-2">
                    {itemTitle}
                  </h4>

                  <p className="text-xs text-slate-400 leading-relaxed mb-3">
                    {itemSummary}
                  </p>

                  <span className="text-xs text-emerald-400 group-hover:underline flex items-center gap-1">
                    {language === 'fa' ? 'مطالعه و بررسی کامل نشریه' : 'Read full bulletin'}
                    <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              );
            })}
          </div>

          {/* Active Reader Modal Overlays */}
          {activeArticle && (
            <div className="bg-slate-950 border-2 border-slate-800 p-6 rounded-2xl relative shadow-2xl animate-fade-in">
              <button 
                onClick={() => setActiveArticle(null)}
                className="absolute top-4 left-4 p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                title={currentLoc.btnClose}
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2 text-xs text-slate-500 mb-3 block">
                <span>{language === 'fa' ? activeArticle.categoryFa : activeArticle.categoryEn}</span>
                <span>•</span>
                <span>{language === 'fa' ? activeArticle.dateFa : activeArticle.dateEn}</span>
                <span>•</span>
                <span>{language === 'fa' ? activeArticle.readingTimeFa : activeArticle.readingTimeEn}</span>
              </div>

              <h3 className="font-extrabold text-base md:text-lg text-white mb-4 leading-snug">
                {language === 'fa' ? activeArticle.titleFa : activeArticle.titleEn}
              </h3>

              <p className="text-xs text-slate-400 italic mb-4 border-l-2 border-emerald-500 pl-3 rtl:border-l-0 rtl:border-r-2 rtl:pl-0 rtl:pr-3">
                {language === 'fa' ? activeArticle.summaryFa : activeArticle.summaryEn}
              </p>

              <div className="text-xs text-slate-300 leading-relaxed whitespace-pre-line border-t border-slate-850 pt-4">
                {language === 'fa' ? activeArticle.contentFa : activeArticle.contentEn}
              </div>

              <div className="mt-6 flex justify-between items-center border-t border-slate-850 pt-4 text-[10px] text-slate-500">
                <span>{language === 'fa' ? `نویسنده: ${activeArticle.authorFa}` : `Analyst: ${activeArticle.authorEn}`}</span>
                <span>© دپارتمان تلمتری امید سبز</span>
              </div>
            </div>
          )}

        </div>

        {/* Right Span (5/12) - Newsletter Generator & Mail subscription */}
        <div className="xl:col-span-5 space-y-6">
          
          {/* Subscription Card */}
          <div className="bg-slate-950/40 p-5 rounded-2xl border border-slate-850 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-[40px] pointer-events-none" />
            
            <h3 className="text-sm font-bold text-slate-200 mb-2 flex items-center gap-2">
              <Mail className="w-4 h-4 text-emerald-400" />
              {currentLoc.subCta}
            </h3>
            
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              {currentLoc.subDesc}
            </p>

            {!isSubscribed ? (
              <form onSubmit={handleSubscribe} className="space-y-3">
                <input
                  type="email"
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder={currentLoc.emailPlaceholder}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 focus:outline-none px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-100"
                />

                <button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-extrabold text-xs py-2.5 rounded-lg transition text-slate-100 flex items-center justify-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  {currentLoc.btnSub}
                </button>
              </form>
            ) : (
              <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-xl p-3 flex gap-2 text-emerald-400 animate-fade-in">
                <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="text-xs leading-relaxed font-semibold">
                  {currentLoc.subSuccess}
                </span>
              </div>
            )}
          </div>

          {/* AI Custom Newsletter Builder Card */}
          <div className="bg-slate-950 p-5 rounded-2xl border border-slate-850">
            <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2">
              <Settings className="w-4 h-4 text-teal-400" />
              {currentLoc.tabGenerator}
            </h3>

            <form onSubmit={handleBuildCustomNewsletter} className="space-y-4">
              
              {/* Region choice */}
              <div>
                <span className="block text-xs text-slate-400 font-bold mb-2">انتخاب حوزه پایش زیستی مینیاتوری:</span>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: 'zagros', label: 'کوهستان زاگرس' },
                    { id: 'alborz', label: 'ارتفاع البرز' },
                    { id: 'salariyeh', label: 'دشت سالاریه' }
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setTargetRegion(item.id)}
                      className={`py-1.5 px-1 rounded text-[10px] font-bold transition text-center ${
                        targetRegion === item.id 
                          ? 'bg-slate-800 text-emerald-400 border border-emerald-500/80' 
                          : 'bg-slate-900 text-slate-400 hover:text-slate-300'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Topic focus */}
              <div>
                <span className="block text-xs text-slate-400 font-bold mb-2">نوع تمرکز تحلیلی گزارش:</span>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: 'fires', icon: Flame, label: 'خطر حریق' },
                    { id: 'water', icon: Droplet, label: 'کمبود آب' },
                    { id: 'species', icon: Sprout, label: 'تنوع سنسور' }
                  ].map((item) => {
                    const IconComp = item.icon;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setTopicFocus(item.id)}
                        className={`py-1.5 px-1 rounded text-[10px] font-bold transition flex flex-col items-center justify-center gap-1 border ${
                          topicFocus === item.id 
                            ? 'bg-slate-800 text-teal-400 border-teal-500/80 shadow' 
                            : 'bg-slate-900 text-slate-500 border-transparent hover:text-slate-300'
                        }`}
                      >
                        <IconComp className="w-3.5 h-3.5" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Optional Prompt instructions */}
              <div>
                <label className="text-xs text-slate-400 block mb-1 font-bold">{currentLoc.promptLabel}</label>
                <input
                  type="text"
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder={currentLoc.promptPlaceholder}
                  className="w-full bg-slate-900 border border-slate-850 px-3 py-2 rounded-lg text-xs font-semibold focus:outline-none focus:border-teal-500"
                />
              </div>

              <button
                type="submit"
                disabled={isGenerating}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black text-xs py-3 rounded-lg transition transform hover:-translate-y-0.5 disabled:opacity-50 flex items-center justify-center gap-2 shadow"
              >
                {isGenerating ? (
                  <>
                    <Radio className="w-4 h-4 animate-pulse text-yellow-300" />
                    <span>{currentLoc.btnBuilding}</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>{currentLoc.btnBuild}</span>
                  </>
                )}
              </button>

            </form>

            {/* Generated Newsletter Output Frame */}
            {generatedNewsletter && (
              <div className="mt-5 bg-slate-900 rounded-xl p-4 border border-slate-800 relative animate-fade-in">
                <div className="flex justify-between items-center mb-2.5 pb-2 border-b border-slate-850 text-[10px] text-slate-500">
                  <span className="flex items-center gap-1 font-bold text-teal-400">
                    <Terminal className="w-3.5 h-3.5" />
                    {currentLoc.resultTitle}
                  </span>
                  <button
                    onClick={() => {
                      const element = document.createElement("a");
                      const file = new Blob([generatedNewsletter], {type: 'text/plain;charset=utf-8'});
                      element.href = URL.createObjectURL(file);
                      element.download = "Environmental_Telemetry_Bulletin.txt";
                      document.body.appendChild(element);
                      element.click();
                      document.body.removeChild(element);
                    }}
                    className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition"
                    title="Download Report"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="text-[11px] text-slate-300 leading-relaxed font-mono whitespace-pre-line select-text max-h-60 overflow-y-auto pr-1">
                  {generatedNewsletter}
                </div>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
