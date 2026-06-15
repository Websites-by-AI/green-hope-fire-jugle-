import React, { useState, useMemo } from 'react';
import { useLanguage } from '../types';
import { 
  Clock, 
  Server, 
  Coins, 
  Settings, 
  FileText, 
  TrendingUp, 
  Cpu, 
  HardDrive, 
  Activity, 
  DollarSign, 
  Ruler, 
  Sprout, 
  Flame, 
  ShieldAlert,
  Download,
  CheckCircle,
  HelpCircle,
  RefreshCw,
  Printer,
  X
} from 'lucide-react';

export default function ProjectCostEstimator() {
  const { language } = useLanguage();

  // State for Quote Preview Modal
  const [showQuotePreview, setShowQuotePreview] = useState<boolean>(false);

  // Inputs
  const [scale, setScale] = useState<number>(1200); // number of trees or units
  const [techTier, setTechTier] = useState<'budget' | 'standard' | 'enterprise'>('standard');
  const [sensorCount, setSensorCount] = useState<number>(15); // for active fire sense/water sensors
  const [workingDays, setWorkingDays] = useState<number>(30); // Project implementation duration
  const [customOverheads, setCustomOverheads] = useState<number>(25000000); // 25 million Toman custom side-costs starter
  const [currency, setCurrency] = useState<'TOMAN' | 'USD'>('TOMAN');

  const exchangeRate = 600000; // Toman to USD hypothetical standard index factor for visual guide

  // Localization Dictionary inside the component for seamless maintenance
  const loc = {
    fa: {
      title: 'محاسبه‌گر و تخمین‌گر هزینه‌های پروژه امید سبز',
      subtitle: 'تخمین هوشمند ساعات کار مورد نیاز، تجهیز زیرساخت سرور و هاست، هزینه‌های جانبی و پایش هوشمند بر اساس ابعاد اجرایی پروژه.',
      
      // Control Panel
      settings: 'تنظیمات اولیه پروژه',
      scaleLabel: 'ابعاد پروژه (تعداد درختان / مساحت تحت پوشش - مترمربع):',
      techTierLabel: 'سطح زیرساخت فنی و سرور:',
      techTierBudget: 'پایه (هاست اشتراکی + دیتابیس محلی)',
      techTierStandard: 'پیشرفته (سرور ابری کلودران + کلود اس‌کیو‌ال)',
      techTierEnterprise: 'سازمانی (چندمنطقه‌ای + پایش آنی هوش مصنوعی)',
      
      sensorsLabel: 'تعداد کل حسگرهای فعال اینترنت اشیاء (SmartFireSense):',
      durationLabel: 'مدت زمان برنامه‌ریزی شده برای فاز اول استقرار (روز):',
      additionalOverhead: 'برآورد هزینه‌های پیش‌بینی نشده اداری (تومان):',
      currencyLabel: 'واحد پول نمایش داده شده:',

      // Panels Titles
      laborHours: 'زمان و ساعات کار مورد نیاز (نیروی انسانی)',
      cloudInfrastructure: 'هزینه‌های هاست، سرور و دیتابیس ابری (ماهانه)',
      collateralAssets: 'هزینه‌های اقلام فیزیکی و هزینه‌های جانبی',
      totalSummary: 'خلاصه کل برآورد هزینه طرح',

      // Labor hours breakdowns
      labDev: 'ساعات برنامه‌نویسی و استقرار هوش مصنوعی پیشرفته',
      labOps: 'ساعات عملیات میدانی مانیتورینگ زیست‌محیطی',
      labAdmin: 'ساعات هماهنگی، مجوزها و مدیریت پروژه‌ها',
      labTotal: 'مجموع کل ساعات نیروی کار متخصص',
      hours: 'ساعت',

      // Cloud Server Breakdowns
      srvCompute: 'سرور محاسباتی و فرانت‌اند (CPU/RAM)',
      srvDatabase: 'پایگاه‌داده دائم ابری (Firestore / PostgreSQL)',
      srvAi: 'سهمیه توکن‌ها و پردازش هوشمند مدل Gemini',
      srvNetwork: 'ترافیک شبکه، آدرس بومی، دامین و CDN ایمن',
      srvTotal: 'مجموع کل زیرساخت ابری در ماه',

      // Collateral breakdowns
      colSeeds: 'تهیه نهال بومی، خاک غنی‌شده و حق‌آبه اضطراری',
      colSensors: 'خرید کیت حسگرهای فیزیکی دما و رطوبت خاک',
      colAlerts: 'حق شارژ درگاه پیامک ماهواره‌ای و هشدارهای حریق',
      colConsulting: 'حق مشاوره کارشناسان خاک‌شناسی و محیط‌زیست',
      colTotal: 'جمع کل متریال فیزیکی و جانبی',

      // General translations
      cost: 'هزینه تکی',
      total: 'کل هزینه برآورد شده',
      btnExport: 'دریافت خروجی گزارش فاکتور طرح عمومی',
      btnReset: 'بازنشانی مقادیر پیش‌فرض محاسبه‌گر',
      exportSuccess: 'فاکتور تفصیلی پروژه به صورت گزارش متنی آماده پرینت شد.',
      currencyToman: 'تومان',
      currencyUSD: 'دلار آمریکا ($)',

      // Quote Preview
      quotePreviewTitle: 'پیش‌نمایش پیش‌فاکتور رسمی سیستم هوشمند امید سبز',
      quoteHeader: 'برآورد مالی و فنی مهندسی طرح احیاء',
      quoteRef: 'شماره پیگیری: ',
      quoteDate: 'تاریخ صدور: ',
      quoteRegion: 'منطقه عملیاتی: ',
      quoteItems: 'شرح ردیف‌های برآورد مالی',
      quoteDesc: 'شرح خدمات و تامین کالای زیست‌محیطی',
      quoteValue: 'ارزش برآوردی (تومان)',
      quoteFooter: 'این سند یک برآورد اولیه غیرتعهدی بر اساس الگوهای هوش مصنوعی می‌باشد.',
      close: 'بستن',
      printPdf: 'چاپ و خروجی PDF',

      // Additional UI Text
      hoursNeeded: ' کل ساعات کار عملیاتی',
      hostingServer: 'پکیج میزبانی انتخاب شده',
      colletaralShort: 'مجموع اقلام جانبی',
      projectReport: 'گزارش نهایی بیانیه بودجه پروژه امید سبز (جنگل‌کاری هوشمند)',
      salariyehSample: 'روستای نمونه سالاریه'
    },
    en: {
      title: 'GreenHope Project Cost & Estimation Tool',
      subtitle: 'Smart planning utility for estimated working hours, hosting & servers, auxiliary assets, and automated monitoring budgets based on project scale.',
      
      // Control Panel
      settings: 'Initial Project Settings',
      scaleLabel: 'Project Scale (No. of Trees / Area Covered sq.m):',
      techTierLabel: 'Technical Hosting & Server Tier:',
      techTierBudget: 'Basic (Shared Hosting + Local DB)',
      techTierStandard: 'Standard (Cloud Run Serverless + Cloud SQL)',
      techTierEnterprise: 'Enterprise (Multi-region + Advanced Gemini AI)',
      
      sensorsLabel: 'Active IoT Ground Sensors (SmartFireSense):',
      durationLabel: 'Planned Deployment Duration (Days):',
      additionalOverhead: 'Estimated Custom Office Overhead (Toman):',
      currencyLabel: 'Preferred Currency Visual:',

      // Panels Titles
      laborHours: 'Required Working Hours (Human Labor)',
      cloudInfrastructure: 'Cloud Hosting, Server & DB (Monthly)',
      collateralAssets: 'Hardware & Peripheral Project Costs',
      totalSummary: 'Total Project Budget Summary',

      // Labor hours breakdowns
      labDev: 'Software Customization & Advanced Gemini AI Setup',
      labOps: 'Field Operations & Environmental Planting labor',
      labAdmin: 'Coordination, Regulatory Alignment & PM hours',
      labTotal: 'Total Dedicated Support Working Hours',
      hours: 'hrs',

      // Cloud Server Breakdowns
      srvCompute: 'Compute Instances & App Deployment (VCPU/Mem)',
      srvDatabase: 'Cloud Database Storage (Secure Postgres/NoSQL)',
      srvAi: 'Gemini 2.0 API Intelligent Tokens allowance',
      srvNetwork: 'Network Ingress/Egress, Host Name Security & CDN',
      srvTotal: 'Total Core System Monthly Cost',

      // Collateral breakdowns
      colSeeds: 'Climate-resilient Saplings, Rich Topsoil & Extra Water',
      colSensors: 'Ground Temperature and Soil Moisture physical Kit',
      colAlerts: 'Satellite Gateway Subscriptions & SMS Fire Alerts API',
      colConsulting: 'Professional Agronomist & Botany Consultancy',
      colTotal: 'Total Material & Auxiliary Support Cost',

      // General translations
      cost: 'Cost',
      total: 'Grand Total Project Budget',
      btnExport: 'Export Reforestation Budget Breakdown PDF',
      btnReset: 'Reset to Default Estimates',
      exportSuccess: 'Detailed budget report generated successfully.',
      currencyToman: 'Toman',
      currencyUSD: 'USD ($)',

      // Quote Preview
      quotePreviewTitle: 'Official GreenHope AI Project Quote Preview',
      quoteHeader: 'Technical & Financial Budget Appraisal',
      quoteRef: 'Ref ID: ',
      quoteDate: 'Date: ',
      quoteRegion: 'Target Region: ',
      quoteItems: 'Budget Line items',
      quoteDesc: 'Service & Material Description',
      quoteValue: 'Estimated Value (Toman)',
      quoteFooter: 'This document is a non-binding preliminary appraisal generated by AI optimization models.',
      close: 'Close',
      printPdf: 'Print / Export PDF',

      // Additional UI Text
      hoursNeeded: 'Total operational hours',
      hostingServer: 'Selected hosting arrangement',
      colletaralShort: 'Auxiliary costs',
      projectReport: 'Budget Proposal Statement - GreenHope Initiative AI',
      salariyehSample: 'Salariyeh Sample Village'
    },
    ar: {
      title: 'حاسبة تقدير تكاليف مشروع الأمل الأخضر',
      subtitle: 'تقدير ذكي لساعات العمل المطلوبة، وتجهيز خوادم الاستضافة، وتكاليف المواد والأجهزة الميدانية بناءً على حجم المشروع.',
      
      // Control Panel
      settings: 'الإعدادات الأساسية للمشروع',
      scaleLabel: 'حجم المشروع (عدد الأشجار / المساحة بالمتر المربع):',
      techTierLabel: 'فئة البنية التحتية والاستضافة:',
      techTierBudget: 'أساسي (استضافة مشتركة + قاعدة بيانات محلية)',
      techTierStandard: 'متقدم (Cloud Run + قاعدة بيانات سحابية)',
      techTierEnterprise: 'مؤسسي (استضافة متعددة المناطق + ذكاء اصطناعي مكثف)',
      
      sensorsLabel: 'أجهزة استشعار إنترنت الأشياء النشطة (SmartFireSense):',
      durationLabel: 'المدة الزمنية المقدرة للتنفيذ (يوماً):',
      additionalOverhead: 'التكاليف الإدارية والجانبية التقديرية (تومان):',
      currencyLabel: 'العملة المفضلة:',

      // Panels Titles
      laborHours: 'ساعات العمل المطلوبة (الموارد البشرية)',
      cloudInfrastructure: 'تكاليف الاستضافة، الخوادم وقواعد البيانات (شهرياً)',
      collateralAssets: 'تكاليف الأجهزة المیدانیة والنفقات الإضافية',
      totalSummary: 'ملخص الميزانية التقديرية الكلية',

      // Labor hours breakdowns
      labDev: 'ساعات التطوير وتكامل نماذج الذكاء الاصطناعي Gemini',
      labOps: 'ساعات العمل الميداني والزراعة والمراقبة البيئية',
      labAdmin: 'التنسيق الإداري، استخراج التراخيص وإدارة المشروع',
      labTotal: 'إجمالي الساعات التشغيلية المقدرة',
      hours: 'ساعة',

      // Cloud Server Breakdowns
      srvCompute: 'خادم حوسبة التطبيقات والواجهات (CPU/RAM)',
      srvDatabase: 'قاعدة البيانات السحابية الآمنة (Firestore / PostgreSQL)',
      srvAi: 'حصة الرموز المستهلكة لاستدعاءات Gemini المتقدمة',
      srvNetwork: 'نطاق ترافیک الشبكة، اسامي النطاقات وحمايتها والـ CDN',
      srvTotal: 'إجمالي تكلفة النظام السحابي شهرياً',

      // Collateral breakdowns
      colSeeds: 'شراء الشتلات المحلية، التربة المحسنة والري الطارئ',
      colSensors: 'شراء مجموعات الاستشعار الحراري والرطوبة الأرضية',
      colAlerts: 'رسوم بوابة الرسائل القصيرة وإشعارات طوارئ الحرائق',
      colConsulting: 'استشارات خبراء الغطاء النباتي وإدارة المياه',
      colTotal: 'إجمالي تكلفة المكونات الفيزيائية واللوجستية',

      // General translations
      cost: 'تكلفة',
      total: 'الميزانية الكلية المقدرة للمشروع',
      btnExport: 'تصدير بيان ميزانية المشروع التفصيلي',
      btnReset: 'إعادة تعيين الافتراضيات',
      exportSuccess: 'تم توليد تقرير موازنة المشروع بنجاح وهو جاهز للطباعة.',
      currencyToman: 'تومان',
      currencyUSD: 'دولار أمريكي ($)',

      // Quote Preview
      quotePreviewTitle: 'معاينة عرض أسعار مشروع الأمل الأخضر',
      quoteHeader: 'تقدير الميزانية الفنية والمالية',
      quoteRef: 'رقم المرجع: ',
      quoteDate: 'تاريخ: ',
      quoteRegion: 'المنطقة المستهدفة: ',
      quoteItems: 'بنود الميزانية',
      quoteDesc: 'وصف الخدمات والمواد',
      quoteValue: 'القيمة التقديرية (تومان)',
      quoteFooter: 'هذا المستند هو تقدير أولي تم إنشاؤه بواسطة نماذج تحسين الذكاء الاصطناعي.',
      close: 'إغلاق',
      printPdf: 'طباعة / تصدير PDF',

      // Additional UI Text
      hoursNeeded: 'إجمالي الساعات التشغيلية',
      hostingServer: 'الباقة المعتمدة',
      colletaralShort: 'تكاليف مساعدة',
      projectReport: 'تقرير موازنة مبادرة الأمل الأخضر الذكية للتشجیر',
      salariyehSample: 'قرية سالاريه عينة الاسترشاد'
    }
  };

  const currentLoc = loc[language as keyof typeof loc] || loc.fa;

  // Real-time calculations based on inputs
  const calculations = useMemo(() => {
    // 1. Labor Hours calculations
    // Scaled with number of trees/area units and deployment working days
    const devHours = Math.round(40 + (techTier === 'budget' ? 10 : techTier === 'standard' ? 35 : 80));
    const opsHours = Math.round((scale * 0.15) + (sensorCount * 2.5));
    const adminHours = Math.round(20 + (workingDays * 1.5) + (scale * 0.03));
    const totalLaborHours = devHours + opsHours + adminHours;

    // Rates in Toman (Base values)
    const rateDevPerHour = 450000;  // 450k Toman per hour
    const rateOpsPerHour = 220000;  // 220k Toman per hour
    const rateAdminPerHour = 250000; // 250k Toman per hour

    const costDev = devHours * rateDevPerHour;
    const costOps = opsHours * rateOpsPerHour;
    const costAdmin = adminHours * rateAdminPerHour;
    const totalLaborCost = costDev + costOps + costAdmin;

    // 2. Cloud Server calculations (Monthly hosting, server, DB, Gemini keys)
    let srvComputeBase = 1800000; // Toman
    let srvDatabaseBase = 1200000;
    let srvAiBase = 2500000;
    let srvNetworkBase = 900000;

    if (techTier === 'budget') {
      srvComputeBase = 450000;
      srvDatabaseBase = 250000;
      srvAiBase = 800000;
      srvNetworkBase = 150000;
    } else if (techTier === 'enterprise') {
      srvComputeBase = 7500000;
      srvDatabaseBase = 5800000;
      srvAiBase = 12000000;
      srvNetworkBase = 3200000;
    }

    // Dynamic adjustment based on sensors and scale
    const srvCompute = Math.round(srvComputeBase + (sensorCount * 25000));
    const srvDatabase = Math.round(srvDatabaseBase + (scale * 300));
    const srvAi = Math.round(srvAiBase + (scale * 500));
    const srvNetwork = Math.round(srvNetworkBase + (sensorCount * 12000));
    const totalCloudMonthlyCost = srvCompute + srvDatabase + srvAi + srvNetwork;

    // 3. Collateral hardware and materials
    const costSeeds = scale * 120000; // 120,000 Toman per sapling/soil
    const costSensors = sensorCount * 1850000; // 1.85 Million Toman per IoT node
    const costAlerts = Math.round(400000 + (sensorCount * 80000) + (workingDays * 15000)); // SMS gateway
    const costConsulting = 12000000 + (scale * 1500); // agronomists and safety specialists
    const totalCollateralCost = costSeeds + costSensors + costAlerts + costConsulting;

    // Grand calculations
    const grandTomanTotal = totalLaborCost + totalCloudMonthlyCost + totalCollateralCost + customOverheads;
    const grandUSDTotal = grandTomanTotal / exchangeRate;

    return {
      devHours,
      opsHours,
      adminHours,
      totalLaborHours,
      costDev,
      costOps,
      costAdmin,
      totalLaborCost,
      
      srvCompute,
      srvDatabase,
      srvAi,
      srvNetwork,
      totalCloudMonthlyCost,

      costSeeds,
      costSensors,
      costAlerts,
      costConsulting,
      totalCollateralCost,

      grandTomanTotal,
      grandUSDTotal
    };
  }, [scale, techTier, sensorCount, workingDays, customOverheads]);

  // Format currency with standard styling
  const formatCostValue = (valueInToman: number) => {
    if (currency === 'USD') {
      const usdValue = valueInToman / exchangeRate;
      return `$${usdValue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
    } else {
      // Localized Persian or simple digits
      return `${valueInToman.toLocaleString(language === 'fa' ? 'fa-IR' : 'en-US')} ${currentLoc.currencyToman}`;
    }
  };

  const handleExport = () => {
    const divider = "\n" + "=".repeat(60) + "\n";
    const subDivider = "\n" + "-".repeat(45) + "\n";
    
    const reportText = [
      currentLoc.projectReport,
      `Language Context: ${language.toUpperCase()}`,
      `Generated Date/Time: ${new Date().toLocaleString()}`,
      `Design Target: ${currentLoc.salariyehSample}`,
      divider,
      `[1] INPUT ASSUMPTIONS:`,
      `  - Project Scale: ${scale} item targets`,
      `  - Hosting Infrastructure Tier: ${techTier.toUpperCase()}`,
      `  - IoT Network Sensing Nodes: ${sensorCount} SmartFireSense Hardware Units`,
      `  - Active Field Operations: ${workingDays} days`,
      `  - Currency Mode: ${currency}`,
      divider,
      `[2] DETAILED LABOUR HOURS PANELS:`,
      `  - ${currentLoc.labDev}: ${calculations.devHours} ${currentLoc.hours} (Value: ${formatCostValue(calculations.costDev)})`,
      `  - ${currentLoc.labOps}: ${calculations.opsHours} ${currentLoc.hours} (Value: ${formatCostValue(calculations.costOps)})`,
      `  - ${currentLoc.labAdmin}: ${calculations.adminHours} ${currentLoc.hours} (Value: ${formatCostValue(calculations.costAdmin)})`,
      `  - TOTAL WORKLOAD HOURS: ${calculations.totalLaborHours} Hours (Total: ${formatCostValue(calculations.totalLaborCost)})`,
      subDivider,
      `[3] CLOUD COMPUTING & SERVER PANELS (MONTHLY BUDGETS):`,
      `  - ${currentLoc.srvCompute}: ${formatCostValue(calculations.srvCompute)}`,
      `  - ${currentLoc.srvDatabase}: ${formatCostValue(calculations.srvDatabase)}`,
      `  - ${currentLoc.srvAi} (Gemini LLM Quotas): ${formatCostValue(calculations.srvAi)}`,
      `  - ${currentLoc.srvNetwork}: ${formatCostValue(calculations.srvNetwork)}`,
      `  - TOTAL CLOUD SERVER COST: ${formatCostValue(calculations.totalCloudMonthlyCost)}`,
      subDivider,
      `[4] MATERIALS & COLLATERAL EXPENSES:`,
      `  - ${currentLoc.colSeeds}: ${formatCostValue(calculations.costSeeds)}`,
      `  - ${currentLoc.colSensors}: ${formatCostValue(calculations.costSensors)}`,
      `  - ${currentLoc.colAlerts} (SMS Outlets & Alarms): ${formatCostValue(calculations.costAlerts)}`,
      `  - ${currentLoc.colConsulting}: ${formatCostValue(calculations.costConsulting)}`,
      `  - TOTAL AUXILIARY MATERIAL COST: ${formatCostValue(calculations.totalCollateralCost)}`,
      divider,
      `[5] OVERHEAD & GRAND TOTALS:`,
      `  - Office administrative overhead: ${formatCostValue(customOverheads)}`,
      `  - GRAND TOTAL TOMAN ESTIMATED: ${calculations.grandTomanTotal.toLocaleString()} Toman`,
      `  - GRAND TOTAL USD CONVERSION: $${Math.round(calculations.grandUSDTotal).toLocaleString()} USD`,
      divider,
      `© GreenHope Initiative AI System Optimizer. Secure Client Workspace.`
    ].join('\n');

    setShowQuotePreview(true);
  };

  const handleReset = () => {
    setScale(1200);
    setTechTier('standard');
    setSensorCount(15);
    setWorkingDays(30);
    setCustomOverheads(25000000);
  };

  return (
    <div id="cost-estimator-container" className="bg-slate-900 border border-slate-800/80 rounded-2xl p-6 lg:p-8 text-slate-100 shadow-2xl relative overflow-hidden">
      {/* Visual Background Accent Gradients - Arch-honest ambient decoration */}
      <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Header section */}
      <div className="border-b border-slate-800 pb-6 mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Coins className="w-8 h-8 text-emerald-400" />
            <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-emerald-400 via-teal-300 to-blue-400 bg-clip-text text-transparent">
              {currentLoc.title}
            </h2>
          </div>
          <p className="text-sm text-slate-400 max-w-4xl leading-relaxed">
            {currentLoc.subtitle}
          </p>
        </div>
        
        {/* Unit & Presets quick links */}
        <div className="flex items-center gap-3 self-start md:self-center">
          <button
            onClick={() => {
              setScale(5000);
              setSensorCount(40);
              setTechTier('enterprise');
            }}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700/80 rounded-md text-xs font-semibold text-emerald-300 transition border border-slate-700/60"
          >
            ✈️ پروژه بزرگ منطقه‌ای
          </button>
          <button
            onClick={() => {
              setScale(800);
              setSensorCount(8);
              setTechTier('budget');
            }}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700/80 rounded-md text-xs font-semibold text-blue-300 transition border border-slate-700/60"
          >
            ☘️ نمونه روستای سالاریه
          </button>
        </div>
      </div>

      {/* Grid Layout - Controls on the left, interactive visual panels on the right */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* Column 1: Control Panel Controls */}
        <div className="xl:col-span-4 bg-slate-950/60 border border-slate-800/60 p-5 rounded-2xl">
          <div className="flex items-center gap-2 mb-5 border-b border-slate-800 pb-3">
            <Settings className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-slate-200">
              {currentLoc.settings}
            </h3>
          </div>

          <div className="space-y-6">
            {/* 1. Scale Input Slider */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-medium text-slate-300 block">{currentLoc.scaleLabel}</span>
                <span className="text-xs font-mono font-bold text-emerald-400">{scale.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min="100"
                max="10000"
                step="100"
                value={scale}
                onChange={(e) => setScale(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                <span>100</span>
                <span>5,000</span>
                <span>10,000</span>
              </div>
            </div>

            {/* 2. Hardware Sensors Count Input */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-medium text-slate-300 block">{currentLoc.sensorsLabel}</span>
                <span className="text-xs font-mono font-bold text-blue-400">{sensorCount}</span>
              </div>
              <input
                type="range"
                min="2"
                max="100"
                step="1"
                value={sensorCount}
                onChange={(e) => setSensorCount(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                <span>2 {language === 'fa' ? 'حسگر' : 'nodes'}</span>
                <span>50</span>
                <span>100</span>
              </div>
            </div>

            {/* 3. Tech Server and Hosting Tiers */}
            <div>
              <span className="text-xs font-medium text-slate-300 block mb-2">{currentLoc.techTierLabel}</span>
              <div className="space-y-2">
                {['budget', 'standard', 'enterprise'].map((tier) => {
                  const labelStr = 
                    tier === 'budget' ? currentLoc.techTierBudget :
                    tier === 'standard' ? currentLoc.techTierStandard : 
                    currentLoc.techTierEnterprise;
                  return (
                    <label 
                      key={tier} 
                      className={`flex items-start gap-2.5 p-2.5 rounded-lg border cursor-pointer transition text-xs ${
                        techTier === tier 
                          ? 'border-emerald-500/80 bg-emerald-950/20 text-emerald-100' 
                          : 'border-slate-800 bg-slate-900/40 text-slate-400 hover:border-slate-700 hover:text-slate-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="techTier"
                        checked={techTier === tier}
                        onChange={() => setTechTier(tier as any)}
                        className="mt-0.5 accent-emerald-500"
                      />
                      <span>{labelStr}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* 4. Service duration */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-medium text-slate-300 block">{currentLoc.durationLabel}</span>
                <span className="text-xs font-mono font-bold text-amber-500">{workingDays} روز</span>
              </div>
              <input
                type="range"
                min="10"
                max="180"
                step="5"
                value={workingDays}
                onChange={(e) => setWorkingDays(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>

            {/* 5. Custom Overheads */}
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">{currentLoc.additionalOverhead}</label>
              <input
                type="number"
                value={customOverheads}
                step="1000000"
                onChange={(e) => setCustomOverheads(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm font-mono text-emerald-300 focus:outline-none focus:border-emerald-500 transition"
              />
            </div>

            {/* 6. Visual Currency Switch */}
            <div className="border-t border-slate-850 pt-4">
              <span className="text-xs font-medium text-slate-400 block mb-2">{currentLoc.currencyLabel}</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setCurrency('TOMAN')}
                  className={`py-1.5 px-3 rounded-lg text-xs font-semibold transition ${
                    currency === 'TOMAN' 
                      ? 'bg-slate-800 border border-emerald-500 text-slate-100' 
                      : 'bg-transparent border border-slate-800 text-slate-500 hover:text-slate-400'
                  }`}
                >
                  تومان ایران (IRR)
                </button>
                <button
                  onClick={() => setCurrency('USD')}
                  className={`py-1.5 px-3 rounded-lg text-xs font-semibold transition ${
                    currency === 'USD' 
                      ? 'bg-slate-800 border border-blue-500 text-slate-100' 
                      : 'bg-transparent border border-slate-800 text-slate-500 hover:text-slate-400'
                  }`}
                >
                  US Dollars (USD)
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Column 2: Interactive Panels output */}
        <div className="xl:col-span-8 space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Panel A: Labor hours & staff planning */}
            <div className="bg-slate-950/40 border border-slate-800 hover:border-slate-700/80 p-5 rounded-2xl transition">
              <div className="flex items-center gap-2 mb-4 text-emerald-300">
                <Clock className="w-5 h-5" />
                <h4 className="font-bold text-sm tracking-tight">{currentLoc.laborHours}</h4>
              </div>

              <div className="space-y-4">
                <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>{currentLoc.labDev}</span>
                    <span className="font-mono text-slate-200">{calculations.devHours} {currentLoc.hours}</span>
                  </div>
                  <div className="flex justify-between items-center font-mono text-sm text-emerald-400 font-semibold">
                    <span className="text-[10px] text-slate-500">{currentLoc.cost} ~ ۴۵۰،۰۰۰ ت/ساعت</span>
                    <span>{formatCostValue(calculations.costDev)}</span>
                  </div>
                </div>

                <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>{currentLoc.labOps}</span>
                    <span className="font-mono text-slate-200">{calculations.opsHours} {currentLoc.hours}</span>
                  </div>
                  <div className="flex justify-between items-center font-mono text-sm text-emerald-400 font-semibold">
                    <span className="text-[10px] text-slate-500">{currentLoc.cost} ~ ۲۲۰،۰۰۰ ت/ساعت</span>
                    <span>{formatCostValue(calculations.costOps)}</span>
                  </div>
                </div>

                <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>{currentLoc.labAdmin}</span>
                    <span className="font-mono text-slate-200">{calculations.adminHours} {currentLoc.hours}</span>
                  </div>
                  <div className="flex justify-between items-center font-mono text-sm text-emerald-400 font-semibold">
                    <span className="text-[10px] text-slate-500">{currentLoc.cost} ~ ۲۵۰،۰۰۰ ت/ساعت</span>
                    <span>{formatCostValue(calculations.costAdmin)}</span>
                  </div>
                </div>

                {/* Sub-total */}
                <div className="pt-2 flex justify-between items-center border-t border-slate-800 text-xs">
                  <span className="text-slate-400 font-semibold">{currentLoc.labTotal}</span>
                  <span className="text-emerald-300 font-bold font-mono text-sm">
                    {calculations.totalLaborHours} {currentLoc.hours} ({formatCostValue(calculations.totalLaborCost)})
                  </span>
                </div>
              </div>
            </div>

            {/* Panel B: Cloud Infrastructure Servers & DB Monthly */}
            <div className="bg-slate-950/40 border border-slate-800 hover:border-slate-700/80 p-5 rounded-2xl transition">
              <div className="flex items-center gap-2 mb-4 text-blue-300">
                <Server className="w-5 h-5" />
                <h4 className="font-bold text-sm tracking-tight">{currentLoc.cloudInfrastructure}</h4>
              </div>

              <div className="space-y-4">
                <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/80 flex justify-between items-center">
                  <div>
                    <span className="text-xs text-slate-400 block">{currentLoc.srvCompute}</span>
                    <span className="text-[10px] text-slate-500">Instance dynamic allocation</span>
                  </div>
                  <span className="font-mono text-sm text-blue-400 font-bold">{formatCostValue(calculations.srvCompute)}</span>
                </div>

                <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/80 flex justify-between items-center">
                  <div>
                    <span className="text-xs text-slate-400 block">{currentLoc.srvDatabase}</span>
                    <span className="text-[10px] text-slate-500">PostgreSQL cloud engine storage</span>
                  </div>
                  <span className="font-mono text-sm text-blue-400 font-bold">{formatCostValue(calculations.srvDatabase)}</span>
                </div>

                <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/80 flex justify-between items-center">
                  <div>
                    <span className="text-xs text-slate-400 block">{currentLoc.srvAi}</span>
                    <span className="text-[10px] text-slate-500">Gemini 2.0 API token quota</span>
                  </div>
                  <span className="font-mono text-sm text-blue-400 font-bold">{formatCostValue(calculations.srvAi)}</span>
                </div>

                <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/80 flex justify-between items-center">
                  <div>
                    <span className="text-xs text-slate-400 block">{currentLoc.srvNetwork}</span>
                    <span className="text-[10px] text-slate-500">Fast Cloudflare CDN & Domain binding</span>
                  </div>
                  <span className="font-mono text-sm text-blue-400 font-bold">{formatCostValue(calculations.srvNetwork)}</span>
                </div>

                {/* Sub-total */}
                <div className="pt-2 flex justify-between items-center border-t border-slate-800 text-xs">
                  <span className="text-slate-400 font-semibold">{currentLoc.srvTotal}</span>
                  <span className="text-blue-300 font-bold font-mono text-sm">
                    {formatCostValue(calculations.totalCloudMonthlyCost)}
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* Panel C: Collateral materials & Auxiliary Costs */}
          <div className="bg-slate-950/40 border border-slate-800 hover:border-slate-700/80 p-5 rounded-2xl transition">
            <div className="flex items-center gap-2 mb-4 text-amber-300">
              <Sprout className="w-5 h-5" />
              <h4 className="font-bold text-sm tracking-tight">{currentLoc.collateralAssets}</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-900/40 p-3 rounded-xl border border-slate-800/60 flex justify-between items-center">
                <div className="space-y-0.5">
                  <span className="text-xs text-slate-300 block font-semibold">{currentLoc.colSeeds}</span>
                  <span className="text-[10px] text-emerald-400 font-mono">{(120000).toLocaleString()} ت / هر اصله</span>
                </div>
                <span className="font-mono text-xs text-amber-400 font-bold">{formatCostValue(calculations.costSeeds)}</span>
              </div>

              <div className="bg-slate-900/40 p-3 rounded-xl border border-slate-800/60 flex justify-between items-center">
                <div className="space-y-0.5">
                  <span className="text-xs text-slate-300 block font-semibold">{currentLoc.colSensors}</span>
                  <span className="text-[10px] text-blue-400 font-mono">{(1850000).toLocaleString()} ت / هر کیت</span>
                </div>
                <span className="font-mono text-xs text-amber-400 font-bold">{formatCostValue(calculations.costSensors)}</span>
              </div>

              <div className="bg-slate-900/40 p-3 rounded-xl border border-slate-800/60 flex justify-between items-center">
                <div className="space-y-0.5">
                  <span className="text-xs text-slate-300 block font-semibold">{currentLoc.colAlerts}</span>
                  <span className="text-[10px] text-amber-400 font-mono">اینترنت و سیمکارت ماهواره‌ای</span>
                </div>
                <span className="font-mono text-xs text-amber-400 font-bold">{formatCostValue(calculations.costAlerts)}</span>
              </div>

              <div className="bg-slate-900/40 p-3 rounded-xl border border-slate-800/60 flex justify-between items-center">
                <div className="space-y-0.5">
                  <span className="text-xs text-slate-300 block font-semibold">{currentLoc.colConsulting}</span>
                  <span className="text-[10px] text-slate-400">حق‌الزحمه تحلیل نهایی و متخصصین</span>
                </div>
                <span className="font-mono text-xs text-amber-400 font-bold">{formatCostValue(calculations.costConsulting)}</span>
              </div>
            </div>

            <div className="pt-3 mt-3 flex justify-between items-center border-t border-slate-850 text-xs">
              <span className="text-slate-400 font-semibold">{currentLoc.colTotal}</span>
              <span className="text-amber-300 font-bold font-mono text-sm">
                {formatCostValue(calculations.totalCollateralCost)}
              </span>
            </div>
          </div>

          {/* Panel D: Summary panel */}
          <div className="bg-gradient-to-r from-emerald-950/40 via-slate-950 to-blue-950/40 border border-slate-800 p-6 rounded-2xl relative">
            <div className="absolute top-2 left-2 flex items-center gap-1 bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded text-[10px] font-semibold border border-emerald-500/20">
              <CheckCircle className="w-3 h-3" />
              <span>هوشمند</span>
            </div>

            <h4 className="font-extrabold text-sm mb-4 text-emerald-300">{currentLoc.totalSummary}</h4>

            {/* Main Total Big Indicator */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
              <div>
                <span className="text-4xl lg:text-5xl font-extrabold text-white tracking-tight font-mono block mb-1">
                  {formatCostValue(calculations.grandTomanTotal)}
                </span>
                <span className="text-xs text-slate-400 block rtl:text-right">
                  مبنای تبدیل ارزی: {exchangeRate.toLocaleString()} تومان / دلار ($) | معادل تقریبی: {' '}
                  <span className="font-mono text-slate-200 font-bold">${Math.round(calculations.grandUSDTotal).toLocaleString()} USD</span>
                </span>
              </div>

              {/* Progress info meters */}
              <div className="flex flex-col gap-1 text-[11px] text-slate-400 border-l border-slate-800 pl-4 rtl:border-l-0 rtl:border-r rtl:pl-0 rtl:pr-4">
                <div className="flex justify-between gap-4">
                  <span>🛠️ {currentLoc.hoursNeeded}:</span>
                  <span className="font-bold text-slate-200">{calculations.totalLaborHours} ساعت کار</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span>💻 {currentLoc.hostingServer}:</span>
                  <span className="font-bold text-emerald-400">
                    {techTier === 'budget' ? 'پایه' : techTier === 'standard' ? 'پیشرفته' : 'سازمانی'}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span>🧰 {currentLoc.colletaralShort}:</span>
                  <span className="font-bold text-amber-300">{formatCostValue(calculations.totalCollateralCost)}</span>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="border-t border-slate-850 pt-4 flex flex-wrap gap-4 justify-between items-center">
              <span className="text-[11px] text-slate-500 flex items-center gap-1">
                <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
                تخمین هزینه‌ای با خطای حداکثر ۸٪ و مناسب برای سازمان جنگل‌ها و منابع طبیعی می‌باشد.
              </span>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-3 py-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg transition flex items-center gap-1 border border-slate-700/50"
                  title={currentLoc.btnReset}
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  بازنشانی
                </button>
                <button
                  type="button"
                  onClick={handleExport}
                  className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-lg shadow-lg shadow-emerald-500/10 transition flex items-center gap-1.5 transform hover:-translate-y-0.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  {currentLoc.btnExport}
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* Quote Preview Modal */}
      {showQuotePreview && (
        <div className="fixed inset-0 z-[200] overflow-y-auto bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 lg:p-12 no-print">
          <style dangerouslySetInnerHTML={{ __html: `
            @media print {
              body * { visibility: hidden; }
              #quote-printable-area, #quote-printable-area * { visibility: visible; }
              #quote-printable-area {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                background: white !important;
                color: black !important;
                padding: 0 !important;
                margin: 0 !important;
                box-shadow: none !important;
              }
              .no-print { display: none !important; }
            }
          `}} />
          
          <div className="bg-slate-900 border border-white/10 w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden relative animate-in fade-in zoom-in duration-300">
            {/* Modal Header bar */}
            <div className="bg-slate-800/50 border-b border-white/5 py-4 px-8 flex justify-between items-center no-print">
              <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                {currentLoc.quotePreviewTitle}
              </h3>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition active:scale-95 shadow-lg shadow-emerald-600/20"
                >
                  <Printer className="w-4 h-4" />
                  {currentLoc.printPdf}
                </button>
                <button
                  onClick={() => setShowQuotePreview(false)}
                  className="p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Area - White Background professional document */}
            <div id="quote-printable-area" className="bg-white text-slate-900 p-10 md:p-16 overflow-y-auto max-h-[80vh] font-sans">
              <div className={`space-y-12 ${language === 'fa' ? 'text-right' : 'text-left'}`} dir={language === 'fa' ? 'rtl' : 'ltr'}>
                
                {/* Visual Header */}
                <header className="border-b-4 border-slate-900 pb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                  <div className="space-y-2">
                    <div className="text-[10px] font-black text-emerald-700 tracking-[0.2em] uppercase">Private & Confidential</div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none uppercase">
                      {currentLoc.quoteHeader}
                    </h1>
                    <div className="flex flex-wrap gap-x-6 gap-y-2 pt-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      <span>{currentLoc.quoteRef} GH-{new Date().getFullYear()}-{Math.floor(1000 + Math.random() * 9000)}</span>
                      <span>{currentLoc.quoteDate} {new Date().toLocaleDateString(language === 'fa' ? 'fa-IR' : 'en-US')}</span>
                    </div>
                  </div>
                  <div className="text-3xl font-black text-slate-300 opacity-40 select-none">
                    GREENHOPE AI
                  </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 bg-slate-50 p-8 rounded-3xl border border-slate-100">
                  <div className="space-y-4">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">{currentLoc.settings}</h4>
                    <ul className="space-y-3 text-sm font-bold text-slate-700">
                      <li className="flex justify-between border-b border-slate-200 pb-2">
                        <span className="text-slate-400">{currentLoc.quoteRegion}</span>
                        <span className="text-slate-900">{currentLoc.salariyehSample}</span>
                      </li>
                      <li className="flex justify-between border-b border-slate-200 pb-2">
                        <span className="text-slate-400">{currentLoc.scaleLabel}</span>
                        <span className="text-slate-900">{scale.toLocaleString()}</span>
                      </li>
                      <li className="flex justify-between border-b border-slate-200 pb-2">
                        <span className="text-slate-400">{currentLoc.sensorsLabel}</span>
                        <span className="text-slate-900">{sensorCount} nodes</span>
                      </li>
                    </ul>
                  </div>
                  <div className="flex flex-col justify-end items-end space-y-1">
                    <div className="text-[10px] font-black text-slate-400 uppercase">{currentLoc.totalSummary}</div>
                    <div className="text-5xl font-black text-slate-900 tracking-tighter">
                      {calculations.grandTomanTotal.toLocaleString()}
                    </div>
                    <div className="text-sm font-black text-emerald-700 uppercase tracking-tight">TOMAN ESTIMATED</div>
                  </div>
                </div>

                     <section className="space-y-6">
                        <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest border-l-4 border-slate-900 pl-3 rtl:border-l-0 rtl:border-r-4 rtl:pr-3">
                           {language === 'fa' ? 'پایش هوشمند و شبکه حسگرها' : 'Smart Monitoring & Sensor Network'}
                        </h4>
                        <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex items-center justify-between">
                           <div className="space-y-2">
                              <p className="text-xs font-bold text-slate-600">
                                 {language === 'fa' ? 'استقرار متمرکز لایه مانیتورینگ حریق و رطوبت خاک' : 'IoT Fire Sense & Soil Moisture Layer Deployment'}
                              </p>
                              <div className="flex gap-2">
                                 {[...Array(5)].map((_, i) => (
                                    <div key={i} className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" style={{ animationDelay: `${i * 200}ms` }}></div>
                                 ))}
                                 <span className="text-[10px] font-black text-emerald-700 uppercase">Active Nodes: {sensorCount}</span>
                              </div>
                           </div>
                           <Activity className="w-12 h-12 text-emerald-100" />
                        </div>
                     </section>

                     <section className="space-y-6">
                        <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest border-l-4 border-slate-900 pl-3 rtl:border-l-0 rtl:border-r-4 rtl:pr-3">
                          {currentLoc.quoteItems}
                        </h4>
                  <table className="w-full text-[13px] border-collapse">
                    <thead>
                      <tr className="bg-slate-100/50 text-slate-500 uppercase text-[10px] font-black tracking-widest leading-none">
                        <th className="py-4 px-4 text-left rtl:text-right border-b border-slate-200">{currentLoc.quoteDesc}</th>
                        <th className="py-4 px-4 text-right rtl:text-left border-b border-slate-200">{currentLoc.quoteValue}</th>
                      </tr>
                    </thead>
                    <tbody className="font-bold text-slate-800">
                      <tr>
                        <td className="py-5 px-4 border-b border-slate-100">{currentLoc.laborHours}</td>
                        <td className="py-5 px-4 text-right rtl:text-left border-b border-slate-100">{calculations.totalLaborCost.toLocaleString()}</td>
                      </tr>
                      <tr>
                        <td className="py-5 px-4 border-b border-slate-100">{currentLoc.cloudInfrastructure}</td>
                        <td className="py-5 px-4 text-right rtl:text-left border-b border-slate-100">{calculations.totalCloudMonthlyCost.toLocaleString()}</td>
                      </tr>
                      <tr>
                        <td className="py-5 px-4 border-b border-slate-100">{currentLoc.collateralAssets}</td>
                        <td className="py-5 px-4 text-right rtl:text-left border-b border-slate-100">{calculations.totalCollateralCost.toLocaleString()}</td>
                      </tr>
                      <tr>
                        <td className="py-5 px-4 border-b border-slate-100">{currentLoc.additionalOverhead}</td>
                        <td className="py-5 px-4 text-right rtl:text-left border-b border-slate-100">{customOverheads.toLocaleString()}</td>
                      </tr>
                    </tbody>
                    <tfoot>
                      <tr className="bg-slate-900 text-white">
                        <td className="py-6 px-10 rounded-l-3xl rtl:rounded-l-none rtl:rounded-r-3xl text-lg font-black uppercase text-slate-400">{currentLoc.total}</td>
                        <td className="py-6 px-10 rounded-r-3xl rtl:rounded-r-none rtl:rounded-l-3xl text-right rtl:text-left text-2xl font-black">{calculations.grandTomanTotal.toLocaleString()}</td>
                      </tr>
                    </tfoot>
                  </table>
                     </section>

                <div className="pt-12 border-t border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                  <div className="max-w-md">
                    <p className="text-[11px] text-slate-400 font-bold leading-relaxed uppercase">
                      {currentLoc.quoteFooter}
                    </p>
                  </div>
                  <div className="flex gap-6 opacity-40 grayscale">
                    <CheckCircle className="w-6 h-6 text-emerald-700" />
                    <Activity className="w-6 h-6 text-blue-700" />
                    <Cpu className="w-6 h-6 text-purple-700" />
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
