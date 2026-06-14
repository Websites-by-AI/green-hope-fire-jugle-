import React, { useState, useMemo } from 'react';
import { useLanguage } from '../types';
import { 
  TrendingUp, 
  Coins, 
  Sprout, 
  ShieldCheck, 
  ChevronRight, 
  Download, 
  Leaf, 
  Globe, 
  Award, 
  Users, 
  DollarSign, 
  Sparkles,
  ArrowRight,
  Calculator,
  Flame,
  CheckCircle,
  HelpCircle,
  Zap
} from 'lucide-react';

interface InvestmentTier {
  id: string;
  nameFa: string;
  nameEn: string;
  nameAr: string;
  saplingTypeFa: string;
  saplingTypeEn: string;
  co2ReductionValue: number; // kg per year
  unitPriceToman: number;
  expectedYieldPercent: number; // environmental biodiversity yield
  regionFa: string;
  regionEn: string;
  descriptionFa: string;
  descriptionEn: string;
  icon: any;
}

const INVESTMENT_TIERS: InvestmentTier[] = [
  {
    id: 'zagros-oak',
    nameFa: 'پرتفوی طلایی بلوط زاگرس',
    nameEn: 'Zagros Royal Oak Portfolio',
    nameAr: 'محفظة بلوط زاجروس الذهبية',
    saplingTypeFa: 'بلوط کهنسال مقاوم به خشکی',
    saplingTypeEn: 'Drought-Resilient Mountain Oak',
    co2ReductionValue: 45, 
    unitPriceToman: 450000,
    expectedYieldPercent: 12.4,
    regionFa: 'جنگل‌های ایلام و کهگیلویه',
    regionEn: 'Ilam & Yasuj Mountains',
    descriptionFa: 'احیای زیست‌بوم آسیب‌دیده با کاشت بلوط‌های بومی شناسنامه‌دار متصل به حسگرهای حریق.',
    descriptionEn: 'Restoring historic woodland biomes using tagged oak trees equipped with thermal SmartFireSense.',
    icon: Leaf
  },
  {
    id: 'alborz-juniper',
    nameFa: 'پکیج سرو کوهی و ارس البرز',
    nameEn: 'Alborz Wild Juniper Pack',
    nameAr: 'باقة العرعر البري في البرز',
    saplingTypeFa: 'ارس (سرو کوهی مینیاتوری)',
    saplingTypeEn: 'High-Altitude Juniperus',
    co2ReductionValue: 35,
    unitPriceToman: 580000,
    expectedYieldPercent: 15.2,
    regionFa: 'ارتفاعات مازندران و دماوند',
    regionEn: 'High-Elevation Mazandaran',
    descriptionFa: 'کاشت در شیب‌های تند صخره‌ای جهت پیشگیری فوق‌العاده از فرسایش لایه‌ای خاک خزر.',
    descriptionEn: 'Strategic stabilizing planting on vulnerable steep slides to stop Caspian soil erosion.',
    icon: Sprout
  },
  {
    id: 'salariyeh-saffron',
    nameFa: 'طرح اشتراکی زعفران دیم سالاریه',
    nameEn: 'Salariyeh Agroforestry Saffron',
    nameAr: 'مشروع زعفران سالاريه الزراعي المشترك',
    saplingTypeFa: 'پیاز فرآوری‌شده زعفران + نخل کوهی',
    saplingTypeEn: 'Organic Saffron Bulbs + Native Groundcover',
    co2ReductionValue: 18,
    unitPriceToman: 280000,
    expectedYieldPercent: 22.8,
    regionFa: 'روستای نمونه سالاریه نیشابور',
    regionEn: 'Salariyeh Dry-Farming Plains',
    descriptionFa: 'ترکیب پوشش بومی برای احیای آب سفره‌های زیرزمینی به همراه ایجاد معیشت جایگزین پایدار.',
    descriptionEn: 'Dual-benefit planting supporting water table recharge and offering secondary fair-trade cash crop.',
    icon: Award
  }
];

export default function InvestmentPanel() {
  const { language } = useLanguage();
  
  // Selection states
  const [selectedTier, setSelectedTier] = useState<string>('zagros-oak');
  const [pledgeUnits, setPledgeUnits] = useState<number>(20);
  const [investorName, setInvestorName] = useState<string>('سبزاندیش گرامی');
  const [simulatedYears, setSimulatedYears] = useState<number>(5);
  const [paymentSuccess, setPaymentSuccess] = useState<boolean>(false);
  const [carbonGoalTons, setCarbonGoalTons] = useState<number>(10);
  
  // Custom Portfolio state
  const selectedPortfolio = useMemo(() => {
    return INVESTMENT_TIERS.find(t => t.id === selectedTier) || INVESTMENT_TIERS[0];
  }, [selectedTier]);

  // Calculations
  const calculations = useMemo(() => {
    const totalCostToman = selectedPortfolio.unitPriceToman * pledgeUnits;
    const totalCO2YearlyKg = selectedPortfolio.co2ReductionValue * pledgeUnits;
    const totalCO2SimulatedKg = totalCO2YearlyKg * simulatedYears;
    const totalCO2Tons = totalCO2SimulatedKg / 1000;
    
    // Growth progression index 
    const waterRetentionLiters = pledgeUnits * 12 * simulatedYears;
    const biodiversityIndexGain = (selectedPortfolio.expectedYieldPercent * pledgeUnits * 0.05).toFixed(1);

    // Goal percentage
    const goalPercent = Math.min(Math.round((totalCO2Tons / carbonGoalTons) * 100), 100);

    return {
      totalCostToman,
      totalCO2YearlyKg,
      totalCO2SimulatedKg,
      totalCO2Tons,
      waterRetentionLiters,
      biodiversityIndexGain,
      goalPercent
    };
  }, [selectedPortfolio, pledgeUnits, simulatedYears, carbonGoalTons]);

  // Handle Mock payment flow
  const handleSimulatedPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentSuccess(true);
    setTimeout(() => {
      // Auto pulse off later or keep
    }, 4500);
  };

  // Generate certificate TXT download
  const downloadCertificate = () => {
    const divider = "\n" + "*****************************************************" + "\n";
    const certText = [
      divider,
      `             GREENHOPE ENVIRONMENT INITIATIVE             `,
      `            مدرک افتخاری حفاظت و سرمایه‌گذاری سبز             `,
      divider,
      `  This certifies that [ ${investorName || 'Anonymous Sponsor'} ]`,
      `  has successfully funded carbon-offset forestry assets.`,
      `  `,
      `  - Chosen Asset Type: ${language === 'fa' ? selectedPortfolio.nameFa : selectedPortfolio.nameEn}`,
      `  - Cultivation Volume: ${pledgeUnits} Sapling Units`,
      `  - Forest Region: ${language === 'fa' ? selectedPortfolio.regionFa : selectedPortfolio.regionEn}`,
      `  - Certified CO2 Isolation: ${calculations.totalCO2Tons.toFixed(2)} Metric Tons (over ${simulatedYears} Years)`,
      `  - Contributed Soil Water: +${calculations.waterRetentionLiters} Liters conserved`,
      `  `,
      divider,
      `  SECURED AND TELEMETERED BY SMARTFIRESENSE IOT SCHEMES`,
      `  Registry: ID-GH-${Math.floor(Math.random() * 900000 + 100000)}`,
      divider
    ].join('\n');

    const element = document.createElement("a");
    const file = new Blob([certText], {type: 'text/plain;charset=utf-8'});
    element.href = URL.createObjectURL(file);
    element.download = `GreenHope_Sponsor_Cert_${investorName.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const dashboardLoc = {
    fa: {
      investTitle: 'داشبورد هوشمند سرمایه‌گذاری و تامین مالی سبز',
      investSub: 'با خرید سهام جنگل‌کاری، میزان کربن تولیدی خود را خنثی کنید و به رشد پوشش گیاهی و توسعه حسگرهای پایش حریق کمک کنید.',
      choosePortfolio: '۱. انتخاب پرتفوی و طرح سرمایه‌گذاری',
      impactCalculations: '۲. شبیه‌ساز اثرات زیست‌محیطی طرح شما',
      pledgeHeading: 'تنظیم تعداد نهال و جزئیات سرمایه‌گذار',
      unitCount: 'تعداد کل واحدهای حمایتی (اصله نهال):',
      investorNameLabel: 'نام کامل و حقیقی حامی (جهت ثبت در سند):',
      projectionPeriod: 'مدت پایش اختصاصی کربن:',
      years: 'سال',
      carbonGoalLabel: 'امتیاز هدف خنثی‌سازی کربن من شخصا (تن کربن دی‌اکسید):',
      
      carbonOffsetTitle: 'ذخیره‌سازی و جذب کربن حاصله',
      soilWaterCons: 'احیای سفره‌های آبی دیم',
      bioGain: 'ضریب کل بازیابی تنوع زیستی',
      costSummaryLabel: 'کل سرمایه تخصیصی پروژه:',
      
      pledgeButton: 'صدور و پرداخت آنلاین فاکتور سبز (شبیه‌ساز)',
      successPayTitle: 'تراکنش فرضی با موفقیت ثبت گردید!',
      successPaySub: 'سهم‌الشرکه کاشت شما در هسته مرکزی دیتابیس ثبت شد. هم‌اکنون می‌توانید مدرک سند سبز خود را دریافت کنید.',
      btnCert: 'بارگیری گواهی حامی زیست‌محیطی (سند سبز)',
      goalMeter: 'پیشرفت هدف خنثی‌سازی کربن شخصی شما',
      microIndicator: 'سهم پایش در شبکه ماهواره‌ای کوپرنیک فعال شد'
    },
    en: {
      investTitle: 'Green Capital & Carbon Investment Dashboard',
      investSub: 'Purchase licensed forestry shares to offset your environmental footprint, trigger physical planting, and finance ground IoT early warnings.',
      choosePortfolio: '1. Select Reforestation Asset Portfolio',
      impactCalculations: '2. Live Ecological Footprint Simulator',
      pledgeHeading: 'Configure Sapling Count & Investor Record',
      unitCount: 'Total Sapling Planting Units (Qty):',
      investorNameLabel: 'Sponsors Registered Legal/Personal Name:',
      projectionPeriod: 'Active Carbon Sequestration Horizon:',
      years: 'years',
      carbonGoalLabel: 'My Carbon Offset Absolute Target (Metric Tons of CO2):',
      
      carbonOffsetTitle: 'Est. CO2 Sequestered Over Time',
      soilWaterCons: 'Simulated Water Reservoir Ingress',
      bioGain: 'Estimated Biodiversity Multiplier',
      costSummaryLabel: 'Total Capital Allocation Needed:',
      
      pledgeButton: 'Initiate Environmental Contribution Gateway',
      successPayTitle: 'Mock Capital Pledge Processed!',
      successPaySub: 'Your reforestation share allocation has been compiled in our ledgers. Download your custom certificate asset.',
      btnCert: 'Download Signed Ecology Sponsorship Deed',
      goalMeter: 'Your Personal Carbon-Offset Achievement Tracker',
      microIndicator: 'Telemetry linkage to Copernicus constellation enabled'
    },
    ar: {
      investTitle: 'منصة الاستثمار الكربوني والتمويل البيئي الأخضر',
      investSub: 'اشترِ أسهم زراعة الغابات للمساهمة في تعويض البصمة الكربونية وتمويل أجهزة استشعار حماية الأراضي.',
      choosePortfolio: '١. اختيار محفظة الاستثمار البيئي المحددة',
      impactCalculations: '٢. محاكاة التأثيرات الحيوية والبيئية',
      pledgeHeading: 'تحديد كميات المساهمة وتوثيق الاسم',
      unitCount: 'عدد الشتلات الكلي (وحدات الزراعة الميدانية):',
      investorNameLabel: 'اسم الداعم المعتمد (لإصدار الوثيقة الإيكولوجية):',
      projectionPeriod: 'أفق قياس عزل الكربون:',
      years: 'سنوات',
      carbonGoalLabel: 'الهدف الكربوني الشخصي (طن من غاز ثنائي أكسيد الكربون):',
      
      carbonOffsetTitle: 'إجمالي كمية ثاني أكسيد الكربون المعزولة',
      soilWaterCons: 'المياه السطحية والجوفية المجددة',
      bioGain: 'معدل تنوع الكائنات والغطاء النباتي',
      costSummaryLabel: 'إجمالي مبلغ الاستثمار البيئي المقدر:',
      
      pledgeButton: 'إصدار ودفع الفاتورة الخضراء التقديرية (محاكاة)',
      successPayTitle: 'تم تسجيل مساهمتكم بنجاح في سجلاتنا!',
      successPaySub: 'تم حجز حصة الزراعة وادماجها بقواعد البيانات التفاعلية. يمكنك الآن طباعة وتحميل الوثيقة الخضراء.',
      btnCert: 'تحميل صك التنمية الخضراء والتشجير',
      goalMeter: 'مدى تحقيق هدفك الكربوني الشخصي المستهدف',
      microIndicator: 'تم تفعيل الاتصال المباشر بنظم مراقبة كوبرنيكوس الدولية'
    }
  };

  const translate = dashboardLoc[language as keyof typeof dashboardLoc] || dashboardLoc.fa;

  return (
    <div id="investment-dashboard-root" className="bg-slate-900 border border-slate-800/85 rounded-2xl p-6 lg:p-8 text-slate-100 shadow-2xl relative">
      {/* Dynamic particles decoration */}
      <div className="absolute top-0 left-1/3 w-[150px] h-[150px] bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[200px] h-[200px] bg-teal-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Main Title Banner */}
      <div className="border-b border-slate-800 pb-6 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-8 h-8 text-emerald-400" />
            <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-emerald-400 via-teal-300 to-blue-400 bg-clip-text text-transparent">
              {translate.investTitle}
            </h2>
          </div>
          <p className="text-xs md:text-sm text-slate-400 max-w-4xl">
            {translate.investSub}
          </p>
        </div>

        {/* Visual quick metrics counter for all-time platform stats */}
        <div className="flex items-center gap-4 bg-slate-950/60 border border-slate-800 px-4 py-2 rounded-xl text-xs">
          <div className="text-center border-r border-slate-800 pr-4 rtl:border-r-0 rtl:border-l rtl:pr-0 rtl:pl-4">
            <span className="block text-slate-500 font-mono">ALL-TIME PLEDGES</span>
            <span className="font-bold text-emerald-400 font-mono text-sm">۴۲,۸۵۰ +</span>
          </div>
          <div className="text-center">
            <span className="block text-slate-500 font-mono">CO2 ISOLATED</span>
            <span className="font-bold text-blue-400 font-mono text-sm">۱,۹۲۰ Ton</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* Left Column: Selector & Input configs (5/12 span) */}
        <div className="xl:col-span-5 space-y-6">
          
          {/* Choose portfolio card group */}
          <div className="bg-slate-950/40 border border-slate-850 p-5 rounded-2xl">
            <h3 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2">
              <Coins className="w-4 h-4 text-emerald-400" />
              {translate.choosePortfolio}
            </h3>

            <div className="space-y-3">
              {INVESTMENT_TIERS.map((tier) => {
                const isSelected = selectedTier === tier.id;
                const IconComponent = tier.icon;
                const tierName = language === 'fa' ? tier.nameFa : language === 'ar' ? tier.nameAr : tier.nameEn;
                const tierRegion = language === 'fa' ? tier.regionFa : tier.regionEn;
                const tierDesc = language === 'fa' ? tier.descriptionFa : tier.descriptionEn;

                return (
                  <div
                    key={tier.id}
                    onClick={() => {
                      setSelectedTier(tier.id);
                      setPaymentSuccess(false); // Reset checkout state
                    }}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      isSelected 
                        ? 'border-emerald-500 bg-emerald-950/10 text-white shadow-lg' 
                        : 'border-slate-800 bg-slate-900/40 text-slate-300 hover:border-slate-700/80 hover:bg-slate-900/60'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <div className="flex items-center gap-2.5">
                        <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
                          <IconComponent className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-sm tracking-tight">{tierName}</span>
                      </div>
                      <span className="text-xs bg-slate-850 px-2 py-0.5 rounded text-slate-400 font-mono">
                        {tierRegion}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 mb-3 leading-relaxed">
                      {tierDesc}
                    </p>

                    <div className="flex justify-between items-center text-xs border-t border-slate-805 pt-2">
                      <div className="flex items-center gap-1">
                        <Leaf className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-slate-500">{language === 'fa' ? 'جذب کربن:' : 'CO2 offset:'}</span>
                        <span className="font-mono font-bold text-emerald-300">{tier.co2ReductionValue} kg/yr</span>
                      </div>
                      <div className="text-sm font-bold text-white font-mono">
                        {tier.unitPriceToman.toLocaleString()} {language === 'fa' ? 'تومان' : 'Toman'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Form setup pledge Units */}
          <div className="bg-slate-950/40 border border-slate-850 p-5 rounded-2xl">
            <h3 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2">
              <Calculator className="w-4 h-4 text-emerald-400" />
              {translate.pledgeHeading}
            </h3>

            <div className="space-y-4">
              
              {/* Unit Count Range Slider & Input */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-slate-300 font-semibold">{translate.unitCount}</span>
                  <span className="text-sm font-mono font-bold text-emerald-400">{pledgeUnits} {language === 'fa' ? 'اصله نهال' : 'Units'}</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="500"
                  step="5"
                  value={pledgeUnits}
                  onChange={(e) => {
                    setPledgeUnits(parseInt(e.target.value));
                    setPaymentSuccess(false);
                  }}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
              </div>

              {/* Years Horizon range slider */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-slate-300 font-semibold">{translate.projectionPeriod}</span>
                  <span className="text-sm font-mono font-bold text-emerald-400">{simulatedYears} {translate.years}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={simulatedYears}
                  onChange={(e) => setSimulatedYears(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-500"
                />
              </div>

              {/* Set Carbon Goal target */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-slate-300 font-semibold">{translate.carbonGoalLabel}</span>
                  <span className="text-sm font-mono font-bold text-blue-400">{carbonGoalTons} Tons</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="50"
                  value={carbonGoalTons}
                  onChange={(e) => setCarbonGoalTons(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>

              {/* User Registered Full Name */}
              <div>
                <label className="text-xs text-slate-300 font-semibold block mb-1.5">{translate.investorNameLabel}</label>
                <input
                  type="text"
                  value={investorName}
                  onChange={(e) => setInvestorName(e.target.value)}
                  placeholder="مثال: مهدی احمدی و شرکاء"
                  className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 focus:outline-none px-3.5 py-2.5 rounded-xl text-sm font-medium"
                />
              </div>

            </div>
          </div>

        </div>

        {/* Right Column: Live Ecological outputs and Checkout (7/12 span) */}
        <div className="xl:col-span-7 space-y-6">
          
          {/* Output Panel visual charts simulation */}
          <div className="bg-slate-950 p-6 rounded-2xl border border-slate-850">
            <h3 className="text-sm font-bold text-slate-300 mb-5 flex items-center gap-2">
              <Globe className="w-4 h-4 text-teal-400" />
              {translate.impactCalculations}
            </h3>

            {/* Impact stats row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              
              {/* Stat 1: CO2 Sequestration */}
              <div className="bg-slate-900 border border-slate-850/80 p-4 rounded-xl text-center relative overflow-hidden group">
                <div className="absolute top-0 left-0 h-1 w-full bg-emerald-500" />
                <span className="block text-[10px] text-slate-500 font-extrabold uppercase mb-1">{translate.carbonOffsetTitle}</span>
                <span className="text-2xl font-black font-mono text-emerald-300 block mb-0.5">
                  {(calculations.totalCO2Tons).toFixed(2)}
                </span>
                <span className="text-xs text-slate-400 block font-mono">Tons CO2</span>
                <div className="mt-2 text-[10px] text-slate-500 font-mono">
                  ({calculations.totalCO2YearlyKg.toLocaleString()} kg / Year)
                </div>
              </div>

              {/* Stat 2: Water retention */}
              <div className="bg-slate-900 border border-slate-850/80 p-4 rounded-xl text-center relative overflow-hidden group">
                <div className="absolute top-0 left-0 h-1 w-full bg-blue-500" />
                <span className="block text-[10px] text-slate-500 font-extrabold uppercase mb-1">{translate.soilWaterCons}</span>
                <span className="text-2xl font-black font-mono text-blue-300 block mb-0.5">
                  +{calculations.waterRetentionLiters.toLocaleString()}
                </span>
                <span className="text-xs text-slate-400 block font-mono">Liters conserved</span>
                <div className="mt-2 text-[10px] text-slate-500 font-mono">
                  Ground runoff reduction
                </div>
              </div>

              {/* Stat 3: Biodiversity increase coefficient */}
              <div className="bg-slate-900 border border-slate-850/80 p-4 rounded-xl text-center relative overflow-hidden group">
                <div className="absolute top-0 left-0 h-1 w-full bg-teal-500" />
                <span className="block text-[10px] text-slate-500 font-extrabold uppercase mb-1">{translate.bioGain}</span>
                <span className="text-2xl font-black font-mono text-teal-300 block mb-0.5">
                  +{calculations.biodiversityIndexGain}%
                </span>
                <span className="text-xs text-slate-400 block font-mono">Eco Vitality Rate</span>
                <div className="mt-2 text-[10px] text-slate-500 font-mono text-blue-200">
                  {selectedPortfolio.saplingTypeFa.substring(0, 16)}..
                </div>
              </div>

            </div>

            {/* Achievement Bar Target */}
            <div className="bg-slate-900/60 border border-slate-850 p-4 rounded-xl mb-6">
              <div className="flex justify-between items-center text-xs mb-2">
                <span className="text-slate-400 font-semibold">{translate.goalMeter}</span>
                <span className="text-emerald-400 font-bold font-mono">{calculations.goalPercent}%</span>
              </div>
              
              {/* Outer bar */}
              <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full transition-all duration-500" 
                  style={{ width: `${calculations.goalPercent}%` }}
                />
              </div>

              <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1.5">
                <span>0 Ton</span>
                <span>Target: {carbonGoalTons} Tons of CO2</span>
              </div>
            </div>

            {/* Interactive Visual Projection Chart (Architecturally honest mockup with dynamic SVGs) */}
            <div className="bg-slate-900/40 border border-slate-850/80 rounded-xl p-4">
              <span className="block text-xs text-slate-400 mb-3 text-center font-bold">نمودار پیش‌بینی حجم پوشش سایه‌بان جنگل ایجاد شده (مترمربع)</span>
              
              {/* Simplified high fidelity SVG chart */}
              <div className="h-28 flex items-end justify-between gap-2 px-4 border-b border-l border-slate-800 pb-2">
                {[1, 2, 3, 4, 5].map((item) => {
                  const valMultiplier = item * (10 + (pledgeUnits * 0.15));
                  const percentOfMax = Math.min(valMultiplier, 100);
                  return (
                    <div key={item} className="flex-1 flex flex-col items-center group">
                      <span className="text-[10px] text-emerald-400 font-mono font-bold opacity-0 group-hover:opacity-100 transition duration-150 mb-1">
                        {Math.round(valMultiplier)}m²
                      </span>
                      <div 
                        className="w-full bg-gradient-to-t from-emerald-800 to-teal-400 hover:to-emerald-300 rounded-t transition-all duration-500"
                        style={{ height: `${percentOfMax}px` }}
                      />
                      <span className="text-[9px] text-slate-500 font-mono mt-1.5">سال {item}</span>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Checkout billing simulator */}
          <div className="bg-slate-950 p-6 rounded-2xl border border-slate-850">
            <div className="flex justify-between items-center border-b border-slate-850 pb-4 mb-4">
              <span className="text-xs text-slate-400 font-semibold uppercase">{translate.costSummaryLabel}</span>
              <span className="text-2xl font-black font-mono text-emerald-400">
                {calculations.totalCostToman.toLocaleString()} {language === 'fa' ? 'تومان' : 'Toman'}
              </span>
            </div>

            <div className="space-y-4">
              
              {!paymentSuccess ? (
                <button
                  type="button"
                  onClick={handleSimulatedPayment}
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-extrabold text-sm py-4 rounded-xl transition shadow-xl shadow-emerald-950/20 text-center uppercase tracking-wider flex items-center justify-center gap-2"
                >
                  <Zap className="w-4 h-4 text-yellow-300" />
                  {translate.pledgeButton}
                </button>
              ) : (
                <div className="space-y-4 animate-fade-in">
                  
                  <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <div className="p-1 bg-emerald-500/20 text-emerald-400 rounded-full mt-0.5">
                        <CheckCircle className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-white mb-1">
                          {translate.successPayTitle}
                        </h4>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          {translate.successPaySub}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions for certified users */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      type="button"
                      onClick={downloadCertificate}
                      className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold text-xs py-3 px-4 rounded-xl text-center flex items-center justify-center gap-2 transform active:scale-95 transition"
                    >
                      <Download className="w-4 h-4" />
                      {translate.btnCert}
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setPaymentSuccess(false)}
                      className="bg-slate-850 hover:bg-slate-800 text-slate-300 font-bold text-xs py-3 px-4 rounded-xl text-center border border-slate-700 transition"
                    >
                      {language === 'fa' ? 'ریست تراکنش' : 'Reset Contribution'}
                    </button>
                  </div>

                  <p className="text-[10px] text-slate-500 text-center font-mono">
                    {translate.microIndicator}
                  </p>

                </div>
              )}

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
