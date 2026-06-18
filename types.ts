import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

// Language and Translation types
export type Language = 'en' | 'fa' | 'ar' | 'tr';

export interface Translations {
  [key: string]: {
    [key: string]: string | ((params: { [key: string]: string | number }) => string);
  };
}

export interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, params?: { [key: string]: string | number }) => string;
}

// Data structure types from geminiService
export interface Source {
    uri: string;
    title: string;
}

export const localizeNumber = (num: number | string, language: Language): string => {
    const strNum = num.toString();
    if (language === 'fa') {
        return strNum.replace(/[0-9]/g, (d) => String.fromCharCode(d.charCodeAt(0) + 1728));
    } else if (language === 'ar') {
         return strNum.replace(/[0-9]/g, (d) => String.fromCharCode(d.charCodeAt(0) + 1584));
    }
    return strNum;
};

export interface PlantingSuggestion {
    suggestedSpecies: { name: string; reason: string; }[];
    plantingTechniques: string;
    careAndMaintenance: string;
    environmentalBenefits: string;
    estimatedCost?: {
        treeCost: string;
        wateringCost: string;
        laborCost: string;
        otherCosts: string;
        totalCost: string;
    };
    plantingDuration?: string;
    locationDetails?: string;
    areaPlanted?: string;
    sources?: Source[];
}

export interface VegetationAnalysis {
    currentVegetation: string;
    dominantSpecies: string[];
    healthStatus: string;
    deforestationThreat: string;
    sources?: Source[];
}

export interface RiskAnalysis {
    naturalDisasters: { type: string; riskLevel: string; mitigation: string; }[];
    humanActivityImpact: string;
    pestAndDiseaseThreats: string;
    sources?: Source[];
}

export interface FullAnalysis {
    plantingSuggestion: PlantingSuggestion;
    vegetationAnalysis: VegetationAnalysis;
    riskAnalysis: RiskAnalysis;
    sources: Source[];
}

export interface CrowdfundingCampaign {
    title: string;
    tagline: string;
    story: string;
    donationTiers: { amount: number; reward: string; }[];
    imageUrl?: string;
}

export interface WeatherData {
    summary: string;
    temperature: string;
    precipitation: string;
    wind: string;
}

export interface HomePlant {
    name: string;
    type: string;
    suitableFor: string;
    careInstructions: string;
}

export interface Grant {
    name: string;
    description: string;
    deadline: string;
    link: string;
    matchPercentage?: number;
    fundingAmount?: string;
    applicableRegions?: string;
    timeLimitStatus?: 'immediate' | 'medium' | 'extended' | 'recurring';
}

export interface EnvironmentalAudit {
    fireRiskStatus: string;
    undergroundWaterStatus: string;
    basinAnalysis?: string;
    localWatershedStatus?: string;
    ecosystemHealthScore: number;
    shakespeareanSummary: string;
    criticalObservations: string[];
    recommendedGrantCategories: string[];
    operationalEstimation?: {
        personnelCount: number;
        trainingHours: number;
        estimatedOperationalCost: string;
        infrastructureNeeds: string[];
    };
}

export interface UndergroundWaterAnalysis {
    estimatedDepth: string;
    aquiferType: string;
    estimatedYield: string;
    waterQuality: string;
    rechargePotential: string;
    sustainability: string;
    academicSources: string[];
}


export interface GrantProposal {
    title: string;
    executiveSummary: string;
    projectGoals: string[];
    technicalApproach: string;
    riskManagement?: string;
    communityEngagement?: string;
    teamStructure: {
        role: string;
        qualifications: string;
    }[];
    budgetBreakdown: {
        category: string;
        amount: string;
        justification: string;
    }[];
    timeline: {
        phase: string;
        duration: string;
        activities: string[];
    }[];
    expectedOutcomes: string[];
    sustainabilityPlan: string;
    scientificFramework?: string; // New: for that "article" feel
    impactMeasurement?: string;  // New: for academic rigor
    appendix?: string;
}

export interface Product {
    id: string;
    name: string;
    price: string;
    category: 'seeds' | 'tech' | 'tools';
    description: string;
    specs: string[];
    image: string;
    stock: number;
}

export interface BacklogItem {
    id: string;
    title: string;
    status: 'completed' | 'in-progress' | 'planned';
    date: string;
    priority: 'low' | 'medium' | 'high';
    category: string;
    assignee: string;
}

// --- Language Provider ---

const translations: Translations = {
    en: {
        'header.title': 'GreenHope Initiative',
        'footer.copyright': '© 2024 GreenHope Initiative. Fostering a greener tomorrow with AI.',
        'error': 'An unexpected error occurred. Please try again later.',
        'loading': 'Loading...',
        'quotaErrorModal.title': 'API Quota Exhausted',
        'quotaErrorModal.body': 'You have reached your API request limit for today. To continue using the service, please check your billing settings.',
        'quotaErrorModal.cta': 'Check Billing',
        'quotaErrorModal.close': 'Close',
        'rateLimitError': ({ seconds }) => `Rate limit exceeded. Please wait ${seconds} seconds before trying again.`,
        'networkError': 'A network error occurred. Please check your connection and try again.',
        'mapLegend.title': 'Legend',
        'homeGardening.conditions.sunnyBalcony': 'Sunny Balcony',
        'homeGardening.conditions.shadedPatio': 'Shaded Patio',
        'homeGardening.conditions.indoorLowLight': 'Indoor (Low Light)',
        'homeGardening.conditions.indoorHighLight': 'Indoor (High Light)',
        'homeGardening.title': 'Home Gardening Advisor',
        'homeGardening.description': 'Get personalized plant suggestions for your home environment.',
        'homeGardening.conditionLabel': 'Select Your Condition',
        'homeGardening.getSuggestions': 'Get Suggestions',
        'homeGardening.resultsTitle': 'Your Personalized Plant Suggestions',
        'homeGardening.suitableFor': 'Suitable For',
        'homeGardening.careInstructions': 'Care Instructions',
        
        // Homepage
        'home.title': 'AI-Powered Fire Prevention & Forest Conservation',
        'home.subtitle': 'Predict and mitigate forest fire risks using satellite data and smart IoT sensors. Precision reforestation strategies are initiated as a subsequent, secured phase.',
        'home.enableGrounding': 'Enable Google Search Grounding',
        'home.groundingSub': 'Connect to real-time data',
        'home.sampleLocation': 'Sample: Salariyeh Village',
        'home.analyzeBtn': 'Analyze Location',
        'home.analyzingBtn': 'Analyzing...',
        'home.analysisFailed': 'Analysis Failed',
        'home.tabs.reforestation': 'Forest Health & Protection Planner',
        'home.tabs.gardening': 'Home Gardening',
        'home.tabs.grants': 'Official Audit',
        'home.tabs.water': 'Underground Water',
        'home.tabs.smartFireSense': 'SmartFireSense Alerts',
        'home.tabs.estimator': 'Budget Estimator',
        'home.tabs.invest': 'Green Investments',
        'home.tabs.newsletter': 'E-Publications Hub',
        'home.map.selected': 'Selected Location',
        'home.map.analyzed': 'Analyzed Area',

        // Analysis Results
        'analysis.weather': 'Local Weather',
        'analysis.weather.temp': 'Temperature',
        'analysis.weather.precip': 'Precipitation',
        'analysis.weather.wind': 'Wind',
        
        'analysis.vegetation': 'Vegetation Analysis',
        'analysis.vegetation.current': 'Current State',
        'analysis.vegetation.dominant': 'Dominant Species',
        'analysis.vegetation.health': 'Health',
        'analysis.vegetation.threats': 'Threats',
        'analysis.sources': 'Sources:',
        
        'analysis.strategy': 'Forest Protection & Recovery Strategy',
        'analysis.strategy.species': 'Recommended Species',
        'analysis.strategy.techniques': 'Planting Techniques',
        'analysis.strategy.benefits': 'Environmental Benefits',
        'analysis.strategy.care': 'Care & Maintenance',
        'analysis.strategy.cost': 'Estimated Cost',
        'analysis.strategy.cost.tree': 'Tree Cost',
        'analysis.strategy.cost.watering': 'Watering Cost',
        'analysis.strategy.cost.labor': 'Labor Cost',
        'analysis.strategy.cost.other': 'Other Costs',
        'analysis.strategy.cost.total': 'Total Estimated Cost',
        'analysis.strategy.duration': 'Planting Duration',
        'analysis.strategy.location': 'Planting Location',
        'analysis.strategy.area': 'Planted Area',
        'analysis.strategy.moreDetails': 'Show More Details',
        'analysis.strategy.lessDetails': 'Show Less Details',
        'analysis.downloadReport': 'Download HTML Report',
        
        'analysis.risk': 'Risk Assessment',
        'analysis.risk.natural': 'Natural Disaster Risks',
        'analysis.risk.human': 'Human Impact',
        'analysis.risk.pests': 'Pests & Diseases',
        'analysis.risk.mitigation': 'Mitigation: ',
        
        'campaign.cta.title': 'Ready to take action?',
        'campaign.cta.desc': 'Generate a complete crowdfunding campaign structure based on this analysis to start raising funds immediately.',
        'campaign.cta.btn': 'Generate Campaign Draft',
        'campaign.cta.generating': 'Generating...',
        'campaign.draft': 'DRAFT CAMPAIGN',
        'campaign.story': 'The Story',
        'campaign.tiers': 'Donation Tiers',

        // Underground Water
        'water.title': 'Underground Resource Estimator',
        'water.subtitle': 'Estimate groundwater potential using academic and geological data.',
        'water.btn.analyze': 'Estimate Resources',
        'water.depth': 'Estimated Depth',
        'water.aquifer': 'Aquifer Type',
        'water.yield': 'Estimated Yield',
        'water.quality': 'Water Quality',
        'water.recharge': 'Recharge Potential',
        'water.sustainability': 'Sustainability',
        'water.sources': 'Academic References',

        // Grant Finder
        'grants.title': 'Grant Finder',
        'grants.subtitle': 'Discover funding opportunities for your reforestation project.',
        'grants.descLabel': 'Project Description',
        'grants.placeholder': 'e.g., A community-led project to reforest 10 hectares of degraded land in coastal Kenya with native mangrove species.',
        'grants.findBtn': 'Find Grants',
        'grants.resultsTitle': 'Funding Opportunities Found',
        'grants.deadline': 'Deadline',
        'grants.learnMore': 'Learn More',
        'grants.sources': 'Sources:',
    },
    fa: {
        'header.title': 'ابتکار امید سبز',
        'footer.copyright': '© ۲۰۲۴ ابتکار امید سبز. ترویج فردایی سبزتر با راهکارهای هوش مصنوعی.',
        'error': 'خطای غیرمنتظره‌ای رخ داد. لطفاً بعداً دوباره امتحان کنید.',
        'loading': 'در حال بارگذاری...',
        'quotaErrorModal.title': 'سهمیه API تکمیل شده است',
        'quotaErrorModal.body': 'شما به سقف مجاز درخواست‌های API روزانه رسیده‌اید. برای ادامه، لطفاً تنظیمات حساب خود را بررسی نمایید.',
        'quotaErrorModal.cta': 'بررسی صورت‌حساب',
        'quotaErrorModal.close': 'بستن',
        'rateLimitError': ({ seconds }) => `از حد مجاز درخواست فراتر رفته‌اید. لطفاً ${seconds} ثانیه منتظر بمانید.`,
        'networkError': 'مشکل شبکه رخ داده است. لطفاً اتصال خود را بررسی کرده و دوباره تلاش کنید.',
        'mapLegend.title': 'راهنما',
        'homeGardening.conditions.sunnyBalcony': 'بالکن آفتابی',
        'homeGardening.conditions.shadedPatio': 'پاسیو سایه‌دار',
        'homeGardening.conditions.indoorLowLight': 'داخل ساختمان (نور کم)',
        'homeGardening.conditions.indoorHighLight': 'داخل ساختمان (نور زیاد)',
        'homeGardening.title': 'مشاور باغبانی هوشمند',
        'homeGardening.description': 'دریافت توصیه‌های شخصی جهت پرورش گیاهان در محیط خانه.',
        'homeGardening.conditionLabel': 'انتخاب شرایط محیطی',
        'homeGardening.getSuggestions': 'دریافت توصیه‌ها',
        'homeGardening.resultsTitle': 'توصیه‌های شخصی‌سازی شده گیاهان',
        'homeGardening.suitableFor': 'مناسب برای',
        'homeGardening.careInstructions': 'دستورالعمل‌های نگهداری',
        
        // Homepage
        'home.title': 'پیشگیری هوشمند از حریق و حفاظت جنگل',
        'home.subtitle': 'پیش‌بینی و کاهش مخاطرات آتش‌سوزی جنگل با بهره‌گیری از داده‌های ماهواره‌ای و حسگرهای IoT. راهبردهای بهسازی پوشش گیاهی و جنگل‌کاری، در فاز دوم و پس از تأمین امنیت اراضی اجرا خواهند شد.',
        'home.enableGrounding': 'فعال‌سازی جستجوی لحظه‌ای با گوگل',
        'home.groundingSub': 'اتصال به داده‌های برخط (Real-time)',
        'home.sampleLocation': 'نمونه: روستای سالاریه',
        'home.analyzeBtn': 'شروع تحلیل مکان',
        'home.analyzingBtn': 'در حال تحلیل...',
        'home.analysisFailed': 'تحلیل ناموفق بود',
        'home.tabs.reforestation': 'مدیریت احیاء و سلامت جنگل',
        'home.tabs.gardening': 'باغبانی خانگی',
        'home.tabs.grants': 'ممیزی رسمی و گرنت‌ها',
        'home.tabs.water': 'منابع آب زیرزمینی',
        'home.tabs.smartFireSense': 'سامانه هشدار حریق (SmartFireSense)',
        'home.tabs.estimator': 'برآوردگر هزینه‌های پروژه',
        'home.tabs.invest': 'سرمایه‌گذاری سبز',
        'home.tabs.newsletter': 'انتشارات و خبرنامه',
        'home.map.selected': 'مکان انتخابی',
        'home.map.analyzed': 'منطقه تحلیل شده',

        // Analysis Results
        'analysis.weather': 'آب و هوای محلی',
        'analysis.weather.temp': 'دما',
        'analysis.weather.precip': 'بارندگی',
        'analysis.weather.wind': 'باد',
        
        'analysis.vegetation': 'تحلیل پوشش گیاهی',
        'analysis.vegetation.current': 'وضعیت فعلی',
        'analysis.vegetation.dominant': 'گونه‌های غالب',
        'analysis.vegetation.health': 'سلامت',
        'analysis.vegetation.threats': 'تهدیدها',
        'analysis.sources': 'منابع:',
        
        'analysis.strategy': 'استراتژی حفاظت و احیاء جنگل',
        'analysis.strategy.species': 'گونه‌های پیشنهادی',
        'analysis.strategy.techniques': 'تکنیک‌های کاشت',
        'analysis.strategy.benefits': 'مزایای زیست‌محیطی',
        'analysis.strategy.care': 'مراقبت و نگهداری',
        'analysis.strategy.cost': 'هزینه تخمینی',
        'analysis.strategy.cost.tree': 'هزینه درخت',
        'analysis.strategy.cost.watering': 'هزینه آبیاری',
        'analysis.strategy.cost.labor': 'هزینه نیروی کار',
        'analysis.strategy.cost.other': 'سایر هزینه‌ها',
        'analysis.strategy.cost.total': 'کل هزینه تخمینی',
        'analysis.strategy.duration': 'مدت زمان کاشت',
        'analysis.strategy.location': 'محل کاشت',
        'analysis.strategy.area': 'مساحت کاشته شده',
        'analysis.strategy.moreDetails': 'مشاهده جزئیات بیشتر',
        'analysis.strategy.lessDetails': 'مشاهده جزئیات کمتر',
        'analysis.downloadReport': 'دانلود گزارش HTML',
        
        'analysis.risk': 'ارزیابی ریسک',
        'analysis.risk.natural': 'خطرات بلایای طبیعی',
        'analysis.risk.human': 'تأثیر انسانی',
        'analysis.risk.pests': 'آفات و بیماری‌ها',
        'analysis.risk.mitigation': 'کاهش اثرات: ',
        
        'campaign.cta.title': 'آماده اقدام هستید؟',
        'campaign.cta.desc': 'یک کمپین کامل برای جمع‌آوری کمک مالی بر اساس این تحلیل ایجاد کنید.',
        'campaign.cta.btn': 'ایجاد پیش‌نویس کمپین',
        'campaign.cta.generating': 'در حال ایجاد...',
        'campaign.draft': 'پیش‌نویس کمپین',
        'campaign.story': 'داستان',
        'campaign.tiers': 'سطوح کمک مالی',

        // Underground Water
        'water.title': 'تخمین منابع آب زیرزمینی',
        'water.subtitle': 'تخمین پتانسیل آب‌های زیرزمینی با استفاده از داده‌های زمین‌شناسی و آکادمیک.',
        'water.btn.analyze': 'تخمین منابع',
        'water.depth': 'عمق تخمینی',
        'water.aquifer': 'نوع سفره آب',
        'water.yield': 'بازده تخمینی',
        'water.quality': 'کیفیت آب',
        'water.recharge': 'پتانسیل تغذیه',
        'water.sustainability': 'پایداری',
        'water.sources': 'منابع آکادمیک',

        // Grant Finder
        'grants.title': 'یابنده بودجه',
        'grants.subtitle': 'فرصت‌های تأمین مالی پروژه‌های جنگل‌کاری خود را پیدا کنید.',
        'grants.descLabel': 'شرح پروژه',
        'grants.placeholder': 'مثلاً: پروژه محلی جهت درخت‌کاری ۱۰ هکتار زمین...',
        'grants.findBtn': 'یافتن منابع مالی',
        'grants.resultsTitle': 'فرصت‌های مالی یافت شده',
        'grants.deadline': 'مهلت درخواست',
        'grants.learnMore': 'اطلاعات بیشتر',
        'grants.sources': 'منابع:',
    },
    ar: {
        'header.title': 'مبادرة الأمل الأخضر',
        'footer.copyright': '© 2024 مبادرة الأمل الأخضر. تعزيز مستقبل مستدام عبر حلول الذكاء الاصطناعي.',
        'error': 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى لاحقًا.',
        'loading': 'جارٍ التحميل...',
        'quotaErrorModal.title': 'تم استنفاد حصة API',
        'quotaErrorModal.body': 'لقد وصلت إلى حد طلبات API اليومي. لمواصلة استخدام الخدمة، يرجى مراجعة إعدادات الفوترة.',
        'quotaErrorModal.cta': 'مراجعة الفوترة',
        'quotaErrorModal.close': 'إغلاق',
        'rateLimitError': ({ seconds }) => `تم تجاوز حد الطلبات. يرجى الانتظار ${seconds} ثانية قبل المحاولة مجددًا.`,
        'networkError': 'حدث خطأ في الشبكة. يرجى التحقق من اتصالك والمحاولة مرة أخرى.',
        'mapLegend.title': 'مفتاح الخريطة',
        'homeGardening.conditions.sunnyBalcony': 'شرفة مشمسة',
        'homeGardening.conditions.shadedPatio': 'فناء مظلل',
        'homeGardening.conditions.indoorLowLight': 'داخلي (إضاءة منخفضة)',
        'homeGardening.conditions.indoorHighLight': 'داخلي (إضاءة عالية)',
        'homeGardening.title': 'مستشار البستنة الذكي',
        'homeGardening.description': 'احصل على اقتراحات نباتات مخصصة لبيئتك المنزلية.',
        'homeGardening.conditionLabel': 'اختر ظروفك',
        'homeGardening.getSuggestions': 'الحصول على اقتراحات',
        'homeGardening.resultsTitle': 'اقتراحات النباتات المخصصة لك',
        'homeGardening.suitableFor': 'مناسب لـ',
        'homeGardening.careInstructions': 'تعليمات العناية',
        
        // Homepage
        'home.title': 'الوقاية الذكية من الحرائق وحماية الغابات',
        'home.subtitle': 'التنبؤ بمخاطر حرائق الغابات والحد منها باستخدام بيانات الأقمار الصناعية ومستشعرات إنترنت الأشياء الذكية. يتم تنفيذ استراتيجيات إعادة التشجير في مرحلة لاحقة ومؤمنة.',
        'home.enableGrounding': 'تفعيل البحث اللحظي عبر جوجل',
        'home.groundingSub': 'الاتصال بالبيانات المباشرة',
        'home.sampleLocation': 'مثال: قرية سالاريه',
        'home.analyzeBtn': 'بدء تحليل الموقع',
        'home.analyzingBtn': 'جارٍ التحليل...',
        'home.analysisFailed': 'فشل التحليل',
        'home.tabs.reforestation': 'إدارة صحة وحماية الغابات',
        'home.tabs.gardening': 'البستنة المنزلية',
        'home.tabs.grants': 'التدقيق والمنح الرسمية',
        'home.tabs.water': 'المياه الجوفية',
        'home.tabs.smartFireSense': 'نظام مراقبة الحرائق الذكي',
        'home.tabs.estimator': 'تقدير تكاليف المشروع',
        'home.tabs.invest': 'الاستثمارات الخضراء',
        'home.tabs.newsletter': 'مركز الأخبار والتقارير',
        'home.map.selected': 'الموقع المحدد',
        'home.map.analyzed': 'المنطقة المحللة',

        // Analysis Results
        'analysis.weather': 'الطقس المحلي',
        'analysis.weather.temp': 'درجة الحرارة',
        'analysis.weather.precip': 'هطول الأمطار',
        'analysis.weather.wind': 'الرياح',
        
        'analysis.vegetation': 'تحليل الغطاء النباتي',
        'analysis.vegetation.current': 'الوضع الحالي',
        'analysis.vegetation.dominant': 'الأنواع السائدة',
        'analysis.vegetation.health': 'الصحة',
        'analysis.vegetation.threats': 'التهديدات',
        'analysis.sources': 'المصادر:',
        
        'analysis.strategy': 'استراتيجية إعادة التشجير',
        'analysis.strategy.species': 'الأنواع الموصى بها',
        'analysis.strategy.techniques': 'تقنيات الزراعة',
        'analysis.strategy.benefits': 'الفوائد البيئية',
        'analysis.strategy.care': 'العناية والصيانة',
        'analysis.strategy.cost': 'التكلفة التقديرية',
        'analysis.strategy.cost.tree': 'تكلفة الأشجار',
        'analysis.strategy.cost.watering': 'تكلفة الري',
        'analysis.strategy.cost.labor': 'تكلفة العمالة',
        'analysis.strategy.cost.other': 'تكاليف أخرى',
        'analysis.strategy.cost.total': 'إجمالي التكلفة التقديرية',
        'analysis.strategy.duration': 'مدة الزراعة',
        'analysis.strategy.location': 'موقع الزراعة',
        'analysis.strategy.area': 'المساحة المزروعة',
        'analysis.strategy.moreDetails': 'عرض المزيد من التفاصيل',
        'analysis.strategy.lessDetails': 'عرض تفاصيل أقل',
        'analysis.downloadReport': 'تحميل تقرير HTML',
        
        'analysis.risk': 'تقييم المخاطر',
        'analysis.risk.natural': 'مخاطر الكوارث الطبيعية',
        'analysis.risk.human': 'التأثير البشري',
        'analysis.risk.pests': 'الآفات والأمراض',
        'analysis.risk.mitigation': 'التخفيف: ',
        
        'campaign.cta.title': 'مستعد لاتخاذ إجراء؟',
        'campaign.cta.desc': 'أنشئ هيكل حملة تمويل جماعي كامل بناءً على هذا التحليل لبدء جمع الأموال على الفور.',
        'campaign.cta.btn': 'إنشاء مسودة الحملة',
        'campaign.cta.generating': 'جار الإنشاء...',
        'campaign.draft': 'مسودة الحملة',
        'campaign.story': 'القصة',
        'campaign.tiers': 'مستويات التبرع',

        // Underground Water
        'water.title': 'تقدير الموارد الجوفية',
        'water.subtitle': 'تقدير إمكانات المياه الجوفية باستخدام البيانات الجيولوجية والأكاديمية.',
        'water.btn.analyze': 'تقدير الموارد',
        'water.depth': 'العمق المقدر',
        'water.aquifer': 'نوع الخزان الجوفي',
        'water.yield': 'العائد المقدر',
        'water.quality': 'جودة المياه',
        'water.recharge': 'إمكانية التغذية',
        'water.sustainability': 'الاستدامة',
        'water.sources': 'المراجع الأكاديمية',

        // Grant Finder
        'grants.title': 'مكتشف المنح',
        'grants.subtitle': 'اكتشف فرص التمويل لمشروع التشجير الخاص بك.',
        'grants.descLabel': 'وصف المشروع',
        'grants.placeholder': 'على سبيل المثال، مشروع بقيادة المجتمع لتشجير 10 هكتارات...',
        'grants.findBtn': 'البحث عن المنح',
        'grants.resultsTitle': 'فرص التمويل الموجودة',
        'grants.deadline': 'الموعد النهائي',
        'grants.learnMore': 'اعرف المزيد',
        'grants.sources': 'المصادر:',
    },
    tr: {
        'header.title': 'GreenHope Girişimi',
        'footer.copyright': '© 2024 GreenHope Girişimi. AI ile daha yeşil bir gelecek.',
        'error': 'Beklenmedik bir hata oluştu. Lütfen daha sonra tekrar deneyiniz.',
        'loading': 'Yükleniyor...',
        'quotaErrorModal.title': 'API Kotası Doldu',
        'quotaErrorModal.body': 'Bugünkü API istek limitinize ulaştınız.',
        'quotaErrorModal.cta': 'Faturalandırmayı Kontrol Et',
        'quotaErrorModal.close': 'Kapat',
        'rateLimitError': ({ seconds }) => `İstek sınırı aşıldı. Lütfen ${seconds} saniye bekleyin.`,
        'networkError': 'Bir ağ hatası oluştu. Lütfen bağlantınızı kontrol edin.',
        'mapLegend.title': 'Lejant',
        'homeGardening.title': 'Ev Bahçeciliği Danışmanı',
        'homeGardening.description': 'Eviniz için kişiselleştirmiş bitki önerileri alın.',
        'homeGardening.getSuggestions': 'Öneri Al',
        'homeGardening.resultsTitle': 'Kişiselleştirilmiş Bitki Önerileriniz',
        'home.title': 'Yapay Zeka Destekli Orman Koruma',
        'home.subtitle': 'Uydu verileri ve IoT sensörleri ile yangın risklerini önceden tahmin edin.',
        'home.analyzeBtn': 'Konumu Analiz Et',
        'home.analyzingBtn': 'Analiz ediliyor...',
        'home.tabs.reforestation': 'Orman Sağlığı Planlayıcısı',
        'home.tabs.grants': 'Resmi Denetim',
        'home.tabs.water': 'Yeraltı Suyu',
        'home.map.selected': 'Seçili Konum',
        'home.map.analyzed': 'Analiz Edilen Bölge',
        'analysis.weather': 'Yerel Hava Durumu',
        'analysis.vegetation': 'Bitki Örtüsü Analizi',
        'analysis.strategy': 'Koruma ve Yenileme Stratejisi',
        'analysis.risk': 'Risk Değerlendirmesi',
        'grants.title': 'Hibe Bulucu',
        'grants.subtitle': 'Projeniz için fon fırsatlarını keşfedin.',
        'grants.findBtn': 'Hibe Bul',
    }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // Set default language to 'fa' (Farsi)
    const [language, setLanguage] = useState<Language>('fa');

    useEffect(() => {
        document.documentElement.lang = language;
        document.documentElement.dir = (language === 'fa' || language === 'ar') ? 'rtl' : 'ltr';
    }, [language]);

    const t = (key: string, params?: { [key: string]: string | number }): string => {
        const translation = translations[language][key] || translations['en'][key];
        if (typeof translation === 'function') {
            return translation(params || {});
        }
        return translation || key;
    };

    return React.createElement(
        LanguageContext.Provider,
        { value: { language, setLanguage, t } },
        children
    );
};

export const useLanguage = (): LanguageContextType => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};