import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage, localizeNumber } from '../types';

interface TooltipProps {
    text: string;
    children: React.ReactNode;
}

const Tooltip: React.FC<TooltipProps> = ({ text, children }) => {
    return (
        <div className="relative group inline-block">
            {children}
            <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1 bg-slate-900 border border-white/10 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl">
                {text}
            </div>
        </div>
    );
};

export const CooperationRoadmap: React.FC = () => {
    const { language } = useLanguage();
    const isFa = language === 'fa';
    const [activeWeek, setActiveWeek] = useState<number>(1);
    const [checkedItems, setCheckedItems] = useState<{ [key: string]: boolean }>(() => {
        try {
            const saved = localStorage.getItem('greenhope_roadmap_checkpoints');
            return saved ? JSON.parse(saved) : {};
        } catch {
            return {};
        }
    });
    const [copiedPromptId, setCopiedPromptId] = useState<number | null>(null);

    // Sandbox States
    const [region, setRegion] = useState<string>('bolkar');
    const [firmsConnected, setFirmsConnected] = useState<boolean>(true);
    const [isSimulating, setIsSimulating] = useState<boolean>(false);
    const [smi, setSmi] = useState<number>(28);
    const [aquifer, setAquifer] = useState<number>(-5.4);
    const [hotspots, setHotspots] = useState<number>(2);
    const [risk, setRisk] = useState<number>(79);
    const [logs, setLogs] = useState<string[]>(() => [
        'Cooperative Convergence Station initialized.',
        'Ping target: Taurus & Bolkar Mountain Karsts.',
        'Ready for vital environmental data injection.'
    ]);
    const [catalystType, setCatalystType] = useState<string>('podcast');
    const [catalystInput, setCatalystInput] = useState<string>('');
    const [isGeneratingCatalyst, setIsGeneratingCatalyst] = useState<boolean>(false);
    const [catalystOutput, setCatalystOutput] = useState<string>(() => 
        isFa 
            ? 'برای شروع پردازش، روی دکمه اجرای کاتالیزور کلیک کنید...' 
            : 'Click Execute Catalyst to generate contextual assets...'
    );

    const triggerLog = (msg: string) => {
        const time = new Date().toLocaleTimeString('fa-IR');
        setLogs(prev => [`[${time}] ${msg}`, ...prev.slice(0, 15)]);
    };

    const handleInjectSimulation = () => {
        setIsSimulating(true);
        triggerLog(isFa ? 'برقراری ارتباط با ایستگاه‌های داده زمینی سازمان محیط‌زیست...' : 'Opening telemetry connection to Dept of Environment stations...');
        setTimeout(() => {
            triggerLog(isFa ? 'کالبره کردن شاخص کسر آب سفره‌های کارستی زیرزمینی...' : 'Calibrating subsurface GIS karstic database depth indexes...');
            setTimeout(() => {
                if (firmsConnected) {
                    triggerLog(isFa ? 'دریافت فرکانس فیرم مودی/ویرز ناسا...' : 'Receiving NASA FIRMS MODIS/VIIRS infrared bandwidths...');
                }
                triggerLog(isFa ? 'محاسبه خطر حریق با مدل هوش‌مصنوعی FireNet با دقت ۹۸٪' : 'Recalculating FireNet predictive models with 98% convergence metrics');
                setIsSimulating(false);
                // Randomize slightly
                setSmi(prev => Math.max(10, Math.min(95, prev + Math.floor(Math.random() * 11) - 5)));
                setAquifer(prev => Math.max(-15, Math.min(5, Number((prev + (Math.random() * 2 - 1)).toFixed(1)))));
                setRisk(prev => Math.max(10, Math.min(100, prev + Math.floor(Math.random() * 15) - 7)));
                setHotspots(prev => Math.max(0, Math.min(10, prev + (Math.random() > 0.6 ? 1 : Math.random() < 0.4 ? -1 : 0))));
            }, 800);
        }, 800);
    };

    const handleRunCatalyst = () => {
        setIsGeneratingCatalyst(true);
        setCatalystOutput(isFa ? 'در حال برقراری تفکر عمیق هوش مصنوعی محلی...' : 'Deep-thinking AI synthesizer running local pipeline...');
        setTimeout(() => {
            let output = '';
            if (catalystType === 'podcast') {
                output = isFa 
                    ? `🎙️ [اسکریپت پادکست - هفته دوم: مهاجرت ترکیه]\n\nامیر (ایده‌پرداز): خوشحالم رفیق که رسیدی آنکارا! دکل‌های سنسور چطوره؟\nسعید (توسعه‌دهنده): سلام داداش. کار بگم یا خستگی؟ روز دارم روی سقف هتل کار تاسیساتی می‌کنم و شب‌ها تا ساعت ۳ با چای داغ ترکی روی کدهای FireNet کار می‌کنم تا پهنای باند را به رطوبت زاگرس وصل کنم!\nامیر: دمت گرم. این تضاد روزانه/شبانه توی پادکست عالی در میاد!`
                    : `🎙️ [WEEK 2 CO-OP PODCAST SCRIPT]\n\nAmir (Ideator): Unbelievable! You made it to Ankara. How is the on-site node?\nSaeed (Dev): Hey man. Physically exhausted but coding is supreme. Climbing rooftops by day for living wage, and running local FireNet tests till 3 AM with Turkish tea. The local satellite feeds are beautiful!\nAmir: Magnificent dynamic content for our Week 2 podcast episode!`;
            } else if (catalystType === 'readme') {
                output = `# 🌲 GreenHope - Deep Karst & Wildfire Sentinel\n\nApache 2.0 Open-Source Climate Intelligence Project\n\n## 🛠️ Combined Four-Core Modules:\n1. **PROVISIONAL-USPTO-IP**: Auto provisional document compilers.\n2. **TURKEY-BRIDGE-CONTRACTS**: MOU partner agreement matrices.\n3. **FIRENET-COLAB-INF**: Multispectral segmentation torch pipelines.\n4. **GOV-SATELLITE-GIS**: High-availability soil moisture index APIs.`;
            } else {
                output = isFa 
                    ? `📊 [آنالیز تخصصی امور مالی و سهام ائتلاف]\n\n- جریان تأمین بودجه اولیه: ۵۵ میلیون تومان\n- سهم ایده‌پردازان ایران: ۲۰ میلیون تومان (ثبت پتنت / وکیل)\n- سهم درآمدی ترکیه: ۳۵ میلیون تومان (هزینه‌های پرواز و مسکن توسعه‌دهنده)\n- ساختار نهایی تقسیم سهام:\n  * ۲۰٪ توسعه‌دهنده نرم‌افزار (در پاسخ به کدنویسی فشرده)\n  * ۵ الی ۱۰٪ نماینده سازمان محیط‌زیست (تطابق داده بومی)\n  * مابقی: سرمایه‌گذار خارجی ترکیه‌ای و ایده‌پرداز.`
                    : `📊 [FINANCIAL & EQUITY STRUCTURE BLUEPRINT]\n\n- Target Initial Pool: 55,000,000 Tomans\n- Iran Ideation Allocation: 20M Toman (Provisional patent filing)\n- Turkey Contractor Support: 35M Toman (Developer flight & life expenses)\n- Equity Distribution Breakdown:\n  * 20% Lead Developer (Strict 4-week active contribution value)\n  * 5% to 10% Environment Consultant (For governmental data feed access)\n  * Remaining: Distributed between seed ideators and Turkey agency partners.`;
            }
            setCatalystOutput(output);
            setIsGeneratingCatalyst(false);
            triggerLog(`AI Catalyst successfully generated asset for type: ${catalystType}`);
        }, 1200);
    };

    useEffect(() => {
        try {
            localStorage.setItem('greenhope_roadmap_checkpoints', JSON.stringify(checkedItems));
        } catch (e) {
            console.error('Failed to save checkpoints', e);
        }
    }, [checkedItems]);

    const handleToggleCheck = (key: string) => {
        setCheckedItems(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const handleCopyPrompt = (text: string, id: number) => {
        navigator.clipboard.writeText(text);
        setCopiedPromptId(id);
        setTimeout(() => setCopiedPromptId(null), 2500);
    };

    const roles = isFa ? [
        { name: 'عضو ۱ (ایده‌پرداز ایران)', role: 'ثبت پتنت + ارسال گرانت بین‌المللی', deliveries: 'ثبت موقت پتنت + ارسال فرم‌ها به ۱۰۰ گرانت مستقل', color: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/5', icon: 'fa-user-tie' },
        { name: 'عضو ۲ (ایده‌پرداز ترکیه)', role: 'رایزنی با ثبت شرکت ترکیه‌ای + ارتباط سرمایه‌گذاران', deliveries: 'جلسات سرمایه‌گذاری خارج از بستر ایران + تفاهم‌نامه', color: 'border-blue-500/30 text-blue-400 bg-blue-500/5', icon: 'fa-user-tag' },
        { name: 'عضو ۳ (توسعه‌دهنده - شما)', role: 'توسعه APIها + کدهای مدل + نوتبوک گوگل کولب', deliveries: 'توسعه FastAPI + نوتبوک‌های آزمایشی + انتشار گیت‌هاب', color: 'border-rose-500/30 text-rose-400 bg-rose-500/5', icon: 'fa-laptop-code' },
        { name: 'عضو ۴ (نماینده محیط‌زیست)', role: 'تامین داده‌های ماهواره‌ای زنده + مجوزها', deliveries: 'اتصال داده‌های بومی ایستگاهی + تاییدیه اراضی دولتی', color: 'border-amber-500/30 text-amber-400 bg-amber-500/5', icon: 'fa-shield-halved' }
    ] : [
        { name: 'Member 1 (Iran Ideator)', role: 'Patent Draft + Global Grant Submission', deliveries: 'Provisional patent registration & 100 grants targeted', color: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/5', icon: 'fa-user-tie' },
        { name: 'Member 2 (Turkey Ideator)', role: 'Turkey Corporate Shield + Venture Matchmaking', deliveries: 'Investment pitch in Ankara/Istanbul and tech-transfer MOU', color: 'border-blue-500/30 text-blue-400 bg-blue-500/5', icon: 'fa-user-tag' },
        { name: 'Member 3 (Lead Developer - You)', role: 'API Core + FireNet ML Training + Google Colab', deliveries: 'Robust interactive APIs + executed Colab sandbox + GitHub tags', color: 'border-rose-500/30 text-rose-400 bg-rose-500/5', icon: 'fa-laptop-code' },
        { name: 'Member 4 (Department of Environment)', role: 'Active Satellite Imagery & Soil GIS Data', deliveries: 'Ground-truthing data coordinates and government permissions', color: 'border-amber-500/30 text-amber-400 bg-amber-500/5', icon: 'fa-shield-halved' }
    ];

    const weeksData = [
        {
            week: 1,
            titleFa: 'هفته اول: طراحی معماری API و ساخت نمونه اولیه کدهای کولب',
            titleEn: 'Week 1: API Architecture, Patents & Content Prep',
            outcomesFa: [
                'مستندات تعاملی Swagger API با ۵ اندپوینت پایه',
                'ساختار پیش‌نویس موقت پتنت پروژه گارد سبز',
                'اولین اپیزود پادکست صوتی ۱۵ دقیقه‌ای',
                'برندینگ و لوگو پیش‌فرض ویدئوها'
            ],
            outcomesEn: [
                'Interactive Swagger API docs with 5 basic endpoints',
                'Provisional Climate Patent draft initialized',
                'First 15-minute introductory podcast script',
                'Visual branding blueprints for video production'
            ],
            days: [
                { day: 1, textFa: 'طراحی معماری API (با FastAPI) + مستندات Swagger مقدماتی', textEn: 'Architect primary FastAPI modules & Swagger specs' },
                { day: 2, textFa: 'انتخاب پروژه‌های هوشمند آتش‌سوزی اوپن‌سورس و تست پایه‌ای', textEn: 'Scan open-source wildfire GitHub repos & do initial tests' },
                { day: 3, textFa: 'راه‌اندازی پایگاه داده Postgres موقت و اتصال به API داده هوایی', textEn: 'Spawn temporary Postgres instance & connect weather feeds' },
                { day: 4, textFa: 'کدنویسی اندپوینت‌های نقشه، کاربران و گزارش‌های حریق', textEn: 'Write API endpoints for maps, users, and hazard reporting' },
                { day: 5, textFa: 'دموی API با شبیه‌سازی داده برای اعضای تیم + ثبت پتنت موقت با شماره ثبت رسمی', textEn: 'Deliver local Mock API demo & submit provisional patent application' },
                { day: 6, textFa: 'تست جامع امنیت اندپوینت‌ها + ادیت و ضبط اولین پادکست معرفی ۱۵ دقیقه‌ای تیم', textEn: 'Security-scan endpoints & record the first 15m team podcast' },
                { day: 7, textFa: 'استراحت + انتشار اولین ویدئو و پادکست معرفی در فضای اجتماعی', textEn: 'Rest & publish teaser content on social channels' }
            ]
        },
        {
            week: 2,
            titleFa: 'هفته دوم: پیاده‌سازی APIهای اختصاصی و راه‌اندازی در ترکیه',
            titleEn: 'Week 2: Core Wildfire API, Turkey Migration & Launch',
            outcomesFa: [
                'سرویس وب کامل احراز هویت با ساختار JWT امن',
                'اتصال مستقیم به مدل بازنشر داده‌های حریق FireNet',
                'حقوق اولیه تامین مالی خارجی از پروژه فرعی ترکیه',
                'دومین پادکست ضبط شده به زبان فارسی/ترکی'
            ],
            outcomesEn: [
                'Complete secure JWT user-session authorization APIs',
                'Successful connection to live open-source FireNet models',
                'Primary external contractor revenue established',
                'Second dual-language podcast episode published'
            ],
            days: [
                { day: 8, textFa: 'مهاجرت و انتقال محیط کار توسعه به ترکیه و برپایی دکل‌های تست', textEn: 'Establish server environments on-site in Turkey' },
                { day: 9, textFa: 'شروع کارهای فنی جانبی + شب: توسعه پورتال احراز هویت اختصاصی', textEn: 'Kickstart project work; develop token authentication' },
                { day: 10, textFa: 'اتصال سیستم به هسته شبکه هوشمند FireNet برای پردازش هوش‌مصنوعی', textEn: 'Integrate the backend to the live FireNet core model' },
                { day: 11, textFa: 'ساخت ابزار پیش‌بینی حریق با ترکیب داده دمای محلی', textEn: 'Implement predictive wildfire risk indexing algorithms' },
                { day: 12, textFa: 'اتصال جریان داده‌های کاداستر اراضی دولتی به دیتابیس نقشه پایانی', textEn: 'Map state cadastre land-use databases to our coordinate tables' },
                { day: 13, textFa: 'اجرای تست‌های نهایی ارتباط دیتابیس و هسته FireNet', textEn: 'Run continuous stress and integration tests across endpoints' },
                { day: 14, textFa: 'دریافت دستمزد کارهای جنبی ترکیه + کامیت و پوش نهایی کدهای هفته', textEn: 'Process contractor earnings & push clean commits to GitHub repository' }
            ]
        },
        {
            week: 3,
            titleFa: 'هفته سوم: ماژول‌های هوشمند بین‌المللی و نوتبوک تعاملی گوگل کولب',
            titleEn: 'Week 3: AI Models Core, Colab Sandbox & Grants Lookup',
            outcomesFa: [
                'آدرس‌دهی گرنت‌های فعال بین‌المللی محیط زیستی',
                'نوتبوک زنده گوگل کولب برای پایش و آموزش مدل',
                'تست یکپارچه ارسال ایده پتنت متصل به USPTO',
                'پادکست تخصصی تحلیل چالش فناوری پایش'
            ],
            outcomesEn: [
                'Live search & registry query of international climate grants',
                'Fully runnable, self-contained Google Colab ML model notebook',
                'Integrated USPTO patent draft compiler API',
                'Third 18-minute deep-tech podcast production'
            ],
            days: [
                { day: 15, textFa: 'طراحی API یافتن گرنت‌های زنده متصل به Grants.gov با ابزار وب', textEn: 'Implement automated API connectors to query Grants.gov directly' },
                { day: 16, textFa: 'پیاده‌سازی درگاه پیش‌نویس پتنت بر اساس فرم‌های USPTO آمریکا', textEn: 'Build programmatic document generation for USPTO templates' },
                { day: 17, textFa: 'تکمیل نوتبوک گوگل کولب برای لود و تست مدل با تصاویر ماهواره‌ای', textEn: 'Write Python Colab template to analyze live satellite multispectral images' },
                { day: 18, textFa: 'اتصال API جستجوی پارتنر و استارتاپ بر پایه پروفایل‌های گیت‌هاب', textEn: 'Create partners recommendation API based on GitHub tags' },
                { day: 19, textFa: 'تست یکپارچه و بهینه‌سازی کوئری‌های مکانی هوایی', textEn: 'Optimize heavy spatial and geographic queries on Postgres' },
                { day: 20, textFa: 'آپلود مدل نهایی به دایرکتوری درایو کولب و مستندسازی گام‌های اجرا', textEn: 'Save refined model checkpoints to cloud storage & write tutorials' },
                { day: 21, textFa: 'استراحت + انتشار پادکست و ویدئوی هفته سوم با دموی کامل نوتبوک', textEn: 'Write social articles & release weekly podcast with Colab walk-through' }
            ]
        },
        {
            week: 4,
            titleFa: 'هفته چهارم: انتشار متن‌باز، گواهی فنی و تاییدیه مالی',
            titleEn: 'Week 4: Apache License Publication, PDF Blueprint & Pitch',
            outcomesFa: [
                'ریپازیتوری عمومی گیت‌هاب با لایسنس بین‌المللی Apache 2.0',
                'دفترچه گزارش فنی ۱۰ صفحه‌ای با کتب معتبر',
                'ارائه پاورپوینت فاخر ۱۵ اسلایدی جذب سرمایه‌گذار',
                'مستند نهائی ۱۰ دقیقه‌ای تیمی'
            ],
            outcomesEn: [
                'Public GitHub repository with clean Apache 2.0 open-source licensing',
                'Elegant 10-page technical PDF report featuring scholarly footnotes',
                'Comprehensive 15-slide investment slide deck',
                'Completed 10-minute cinematic team documentary'
            ],
            days: [
                { day: 22, textFa: 'پاکسازی کامپلکس کدهای ریپازیتوری و نوشتن برگه راهنمای کدهای گیت‌هاب', textEn: 'Refactor production code and author a comprehensive README.md' },
                { day: 23, textFa: 'انتشار عمومی کاتالوگ ابزار تحت لایسنس Apache 2.0 در گیت‌هاب تیمی', textEn: 'Publish all technical repos under open-source Apache 2.0 guidelines' },
                { day: 24, textFa: 'طراحی ساختار گزارش تحلیلی ۱۰ صفحه‌ای با جزییات کارستی و ماهواره‌ای', textEn: 'Compile complete 10-page expert technical report in PDF format' },
                { day: 25, textFa: 'گردآوری اسلایدهای ارائه پاورپوینت با تحلیل مالی و چارت هزینه‌ها', textEn: 'Build 15-slide investment deck with unit economics & growth charts' },
                { day: 26, textFa: 'تست نهایی پورتال کدهای کولب و تست نفوذ امنیتی روی دیتابیس لوکال', textEn: 'Confirm final integrity of Colab hooks & patch local Postgres vulnerabilities' },
                { day: 27, textFa: 'تگ نسخه ۱.۰ رسمی در گیت‌هاب و ویرایش نهایی فیلم مستند تیمی', textEn: 'Tag formal v1.0.0 release on GitHub & compile the 10-minute documentary' },
                { day: 28, textFa: 'ارائه پایانی به شتاب‌دهنده‌ها و امضای رسمی سند ائتلاف دولتی', textEn: 'Pitch to regional and international hubs & finalize government MOUs' }
            ]
        }
    ];

    const prompts = [
        {
            id: 1,
            titleFa: 'پرامپت ۱: تولید مستندات تعاملی Swagger/OpenAPI',
            titleEn: 'Prompt 1: Interactive Swagger/OpenAPI Documentation Generator',
            icon: 'fa-file-code',
            text: `You are an expert technical API documentarian. Analyze our reforestation and wildfire tracking backend APIs and produce a clean, self-contained OpenAPI 3.0.0 schema in YAML.

Features to document:
1. User registration & secure JWT login (/api/auth/register, /api/auth/login).
2. Live fire detection logs feed (/api/sensors/fires) with location coordinates and alert levels.
3. Subterranean karstic aquifer depth measurements (/api/water/aquifers).
4. Automated USPTO patent draft submissions status tracker.

Ensure you provide detailed schemas for JSON request bodies, success headers, validation rules, HTTP 401/403/422 status codes, and clear description fields translated nicely.`
        },
        {
            id: 2,
            titleFa: 'پرامپت ۲: کدهای آماده نوتبوک Google Colab به زبان پایتون',
            titleEn: 'Prompt 2: Google Colab Wildfire Segmentation Pipeline (Python)',
            icon: 'fa-brain',
            text: `You are a Senior Machine Learning Engineer specializing in remote sensing. Cleanly write a complete, runnable Python script for a Google Colab notebook to detect and segment active forest fires using satellite indices.

The code must use standard packages: torch, torchvision, numpy, pillow, and matplotlib. Include:
1. Shell commands to pull sample multispectral imagery of the Zagros forest zone.
2. Code to calculate NBR (Normalized Burn Ratio) from near-infrared and shortwave-infrared bands.
3. An active threshold mask to isolate burned acreage vs healthy vegetation canopy.
4. Beautiful plotting cells with color legends denoting 'High Severity Burn', 'Moderate Recovery', or 'Intact Oak Cover'.
5. Dynamic export hooks saving the generated PNG charts back to connected Google Drive directories.`
        },
        {
            id: 3,
            titleFa: 'پرامپت ۳: سناریو نویسی پادکست‌های روتین خلاق هفته دوم',
            titleEn: 'Prompt 3: Team Podcast Script Creator (Farsi/English)',
            icon: 'fa-microphone',
            text: `شما یک سناریونویس خلاق و مجری حرفه‌ای پادکست هستید. بر اساس تجارب کاری تیم ما در ترکیه و تلفیق کدهای پایتون با دلالت‌های مالی، یک اسکریپت پادکست صوتی ۱۵ دقیقه‌ای بنویسید.

جزئیات هفته دوم:
- تجربه مهاجرت موقت توسعه‌دهنده به ترکیه، اشتغال روزانه و تامین مخارج.
- فرآیند فنی اتصال ماهواره Sentinel به مدل آتش‌شناسی FireNet به صورت ساده‌فهم.
- تضاد فانی کارگری روزانه و برنامه‌نویسی شبانه کدهای پیش‌بینی.

لحن باید پویا، صمیمانه، همراه با اندکی طنز و کاملاً باانگیزه باشد. دیالوگ‌های بین ۲ گوینده فرضی (یک برنامه‌نویس خسته و یک ایده پرداز پرتلاش) را توسعه دهید.`
        },
        {
            id: 4,
            titleFa: 'پرامپت ۴: تدوین تیزر و مستند نهایی ۱۰ دقیقه‌ای پروژه',
            titleEn: 'Prompt 4: Final 10m Documentary Storyboard & Screenplay',
            icon: 'fa-video',
            text: `You are a film director and digital storyteller tracking tech impact start-ups. Script a detailed storyboard for a 10-minute concluding documentary outlining our 4-week unified reforestation project.

Present the screenplay as a table with columns: [Scene No, Scene Description, Audio/Voiceover cues, Text Overlays, On-Screen emotional beats].
The film must capture the 4 chapters:
1. Pre-production planning & patent anxiety in Iran.
2. The Turkey work phase (physically exhausting daylight tasks meets high-energy nighttime server deployment).
3. The AI breakthrough: running the first satellite inference on Google Colab.
4. Global launch, open sourcing the project, and getting replies for 100+ grants.`
        },
        {
            id: 5,
            titleFa: 'پرامپت ۵: محتوای کلی گزارش توجیهی فنی پروژه',
            titleEn: 'Prompt 5: 10-Page Expert Technical Report Structure',
            icon: 'fa-file-pdf',
            text: `You are a scholar in land management and environmental engineering. Write an in-depth, structured outline for a 10-page master technical report documenting the 'GreenHope Initiative'.

Use scientific terms, professional headings, and suggest formal footnotes referring to GIS databases, IPCC protocols, and Sentinel-2 spectral indices.
Structure:
- Abstract & Executive Summary (1 page)
- Soil hydrology, aquifers, and regional climate threat profile (2 pages)
- Wildfire detection modeling using deep neural layers & Google Colab (2 pages)
- IP strategy, provisional patents formulation, and global grants targeting (2 pages)
- Community-led reforestation: local plant nursery logistics, sapling costs, and watering schemas (2 pages)
- Future scaling with decentralized sovereign credits (1 page).`
        },
        {
            id: 6,
            titleFa: 'پرامپت ۶: طراحی اسلایدهای پاورپوینت سرمایه‌گذاری برای بورس کربن',
            titleEn: 'Prompt 6: 15-Slide Carbon Finance Pitch Deck Outline',
            icon: 'fa-images',
            text: `You are a fintech and climate-venture consultant. Author a precise copy and slide layout schema for a 15-slide investment slide deck aimed at securing pre-seed funding.

Theme: Elegant slate background, neon green labels, rich tabular data, clean typographic layout.
Include the slide titles and actual bullet points for:
- Slide 1: Front Page (GreenHope: Tech-Driven Carbon Sovereign Initiative)
- Slide 2: The Forest Crisis (Zagros & Alborz wildfires draining localized ecosystems)
- Slide 3: AI-Led Fire Vigilance (Our Sentinel-2 predictive pipeline)
- Slide 4: Unified Team Structure (The four members roles and actions)
- Slide 5: Path to Open-Source (Apache 2.0 repository validation)
- Slide 6: Financial Projections & Carbon Trading models (B+ rating credit bourses).
Give mock graphics suggestions and chart mockups for each slide.`
        },
        {
            id: 7,
            titleFa: 'پرامپت ۷: پست و کپشن‌های روزانه شبکه‌های اجتماعی',
            titleEn: 'Prompt 7: Strategic Multi-Platform Social Media Posts Creator',
            icon: 'fa-hashtag',
            text: `You are a digital marketing strategist. For Week 3 Day 17 of our initiative, draft three distinct, engaging posts for social media sharing.

Platform guidelines:
1. LinkedIn Post (300 words): Professional tone, talking about open innovation, Google Colab ML integrations, and seeking climate grant partnerships in Ankara/Istanbul. Include emojis and spacing.
2. X Page (280 chars): Bold, high-signal, linking to our open code repositories with hot hashtags.
3. Instagram Caption (150 words): Catchy, visual-focused, celebrating the fusion of physical environmental work with high-tech satellite monitoring. Provide scenic description ideas for the carousel post.`
        }
    ];

    const currentWeekDetails = weeksData.find(w => w.week === activeWeek) || weeksData[0];

    const getCompletedCount = (wNum: number) => {
        let count = 0;
        const total = 7; // 7 days
        for (let i = 1; i <= 7; i++) {
            const dayId = `${wNum}-${i}`;
            if (checkedItems[dayId]) count++;
        }
        return { count, total, percent: Math.round((count / total) * 100) };
    };

    return (
        <div className="space-y-12 pb-12 text-right rtl:text-right text-slate-200" dir={isFa ? 'rtl' : 'ltr'}>
            
            {/* Top Info Banner */}
            <div className="relative overflow-hidden bg-gradient-to-r from-teal-950/40 via-emerald-950/40 to-slate-900/60 p-8 rounded-3xl border border-emerald-500/10 shadow-2xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[90px] pointer-events-none"></div>
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
                    <div className="space-y-2">
                        <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-wider">
                            {isFa ? 'نقشه راه ائتلاف ۴ نفره' : 'Unified 4-Member Collaboration System'}
                        </span>
                        <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                            {isFa ? 'برنامه جامع توسعه، نوتبوک کُلب و گزارش‌های فنی محتوا' : 'Consolidated Development, Colab & Media Media Master Plan'}
                        </h2>
                        <p className="text-xs md:text-sm text-slate-300 max-w-4xl leading-relaxed">
                            {isFa 
                              ? 'نقشه راه پیشرفت ۴ هفته‌ای تیمی برای تلفیق کامل توسعه فنی API با تولید محتوای صوتی پادکست، ویدیو، ثبت بین‌المللی پتنت و پیگیری ۱۰۰ گرنت رسمی به همراه پرامپت‌های میانبر هوش‌مصنوعی.'
                              : 'Integrated 4-week timeline fusing professional FastAPI codebase, runnable machine learning notebooks, dual-language podcasts/vlogs, IP protections, and automated grant processing.'}
                        </p>
                    </div>
                    <div className="flex-shrink-0 bg-slate-950/40 p-4 rounded-2xl border border-white/5 text-center">
                        <div className="text-xs text-slate-400 font-bold mb-1">{isFa ? 'پیشرفت کل پروژه' : 'Total Project Progress'}</div>
                        <div className="text-2xl font-black text-emerald-400">
                            {localizeNumber(
                                Math.round(
                                    (Object.values(checkedItems).filter(Boolean).length / 28) * 100
                                ),
                                language
                            )}%
                        </div>
                        <div className="text-[10px] text-slate-500 font-bold mt-1">
                            {localizeNumber(Object.values(checkedItems).filter(Boolean).length, language)} {isFa ? 'از ۲۸ گام عملیاتی' : 'of 28 Action Steps'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Matrix of Roles */}
            <div className="space-y-4">
                <h3 className="text-lg font-extrabold text-white flex items-center gap-2 flex-row-reverse">
                    <i className="fa-solid fa-users text-sm text-emerald-400"></i>
                    <span>{isFa ? 'ماتریس مسئولیت‌ها و ساختار ائتلاف ۴ نفره' : 'Team Roles Responsibility Matrix (4 Members)'}</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {roles.map((member, idx) => (
                        <div key={idx} className={`p-4 rounded-2xl border ${member.color} flex flex-col justify-between transition-all hover:scale-[1.02]`}>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between flex-row-reverse">
                                    <span className="text-xs font-black text-white opacity-90">{member.name}</span>
                                    <i className={`fa-solid ${member.icon} opacity-60 text-sm`}></i>
                                </div>
                                <div className="space-y-1">
                                    <div className="text-[10px] text-slate-400 font-bold uppercase">{isFa ? 'وظیفه اصلی' : 'Core Focus Area'}</div>
                                    <p className="text-xs text-slate-200 font-bold leading-relaxed">{member.role}</p>
                                </div>
                            </div>
                            <div className="mt-4 pt-3 border-t border-white/5 space-y-1">
                                <div className="text-[10px] text-slate-400 font-bold uppercase">{isFa ? 'تعهد تحویلی نهایی' : 'Final Tangible Outcome'}</div>
                                <p className="text-[11px] text-emerald-300 font-extrabold">{member.deliveries}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Weeks Timeline Controls */}
            <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-white/5 pb-2 flex-row-reverse">
                    <h3 className="text-lg font-extrabold text-white flex items-center gap-2 flex-row-reverse">
                        <i className="fa-solid fa-calendar-days text-sm text-emerald-400"></i>
                        <span>{isFa ? 'روزشمار فازبندی شده عملیاتی توسعه و محتوا' : 'Chronological R&D Weekly Pipeline'}</span>
                    </h3>
                    <div className="text-xs text-slate-400 font-bold">{isFa ? 'برای جزییات کامل روی هفته‌ها کلیک کنید' : 'Click on any week to expand detail panels'}</div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[1, 2, 3, 4].map(wNum => {
                        const progress = getCompletedCount(wNum);
                        const isSelected = activeWeek === wNum;
                        return (
                            <button
                                key={wNum}
                                type="button"
                                onClick={() => setActiveWeek(wNum)}
                                className={`p-4 rounded-2xl border text-right transition-all flex flex-col justify-between ${
                                    isSelected 
                                        ? 'bg-slate-900 border-emerald-500/40 ring-1 ring-emerald-500/20 shadow-xl shadow-emerald-900/10' 
                                        : 'bg-slate-950/40 border-white/5 hover:border-white/10 hover:bg-slate-900/50'
                                }`}
                            >
                                <div className="space-y-1 w-full flex flex-col">
                                    <div className="flex justify-between items-center w-full flex-row-reverse">
                                        <span className={`text-[10px] font-black uppercase ${isSelected ? 'text-emerald-400' : 'text-slate-500'}`}>
                                            {isFa ? `هفته ${localizeNumber(wNum, language)}` : `Week ${wNum}`}
                                        </span>
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" style={{ opacity: isSelected ? 1 : 0.2 }}></div>
                                    </div>
                                    <div className="text-xs font-black text-white truncate text-right">
                                        {isFa ? `فاز عملیاتی ${localizeNumber(wNum, language)}` : `Phase Module ${wNum}`}
                                    </div>
                                </div>
                                <div className="mt-4 w-full">
                                    <div className="flex justify-between text-[9px] text-slate-500 font-bold mb-1 flex-row-reverse">
                                        <span>{localizeNumber(progress.count, language)}/{localizeNumber(progress.total, language)} {isFa ? 'گام تایید شده' : 'done'}</span>
                                        <span>{localizeNumber(progress.percent, language)}%</span>
                                    </div>
                                    <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                                        <div 
                                            className="bg-emerald-400 h-full transition-all duration-500" 
                                            style={{ width: `${progress.percent}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* Selected Week Panels */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeWeek}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-900/30 p-6 md:p-8 rounded-3xl border border-white/5 text-right rtl:text-right"
                    >
                        {/* Weekly Title Header */}
                        <div className="md:col-span-3 pb-4 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4 flex-row-reverse">
                            <div className="space-y-1">
                                <span className="text-[10px] font-black uppercase text-emerald-400 tracking-wider">
                                    {isFa ? `جزئیات کامل اهداف هفته ${localizeNumber(activeWeek, language)}` : `Detailed Overview for Week ${activeWeek}`}
                                </span>
                                <h4 className="text-lg font-extrabold text-white leading-tight">
                                    {isFa ? currentWeekDetails.titleFa : currentWeekDetails.titleEn}
                                </h4>
                            </div>
                            <div className="px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-black">
                                {isFa ? `گام‌های تایید شده: ${localizeNumber(getCompletedCount(activeWeek).count, language)} از ۷ روز` : `Completed: ${getCompletedCount(activeWeek).count} of 7 days`}
                            </div>
                        </div>

                        {/* Outcomes list and info */}
                        <div className="space-y-6">
                            <div className="bg-slate-950/40 p-5 rounded-2xl border border-white/5">
                                <h5 className="text-xs font-black text-white uppercase tracking-wider mb-3 flex items-center gap-1.5 flex-row-reverse">
                                    <i className="fa-solid fa-bullseye text-[10px] text-emerald-400"></i>
                                    <span>{isFa ? 'خروجی‌های تحویلی پایان هفته' : 'End-of-Week Tangible Deliveries'}</span>
                                </h5>
                                <ul className="space-y-2.5">
                                    {(isFa ? currentWeekDetails.outcomesFa : currentWeekDetails.outcomesEn).map((outcome, oIdx) => (
                                        <li key={oIdx} className="text-xs text-slate-300 flex items-start gap-2.5 flex-row-reverse">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0"></span>
                                            <span className="leading-relaxed">{outcome}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="bg-emerald-950/10 p-5 rounded-2xl border border-emerald-500/10 text-right">
                                <h5 className="text-xs font-black text-emerald-400 uppercase tracking-widest mb-2">
                                    {isFa ? '💡 راهنمای اقدام و پایش عملیاتی' : '💡 Interactive Progress Checklist'}
                                </h5>
                                <p className="text-[11px] text-slate-300 leading-relaxed mb-1">
                                    {isFa ? 'شما و اعضای تیم می‌توانید به صورت زنده پیشرفت هر روز را کلیک کنید تا گام برداشته شده در حافظه مرورگر امن شما ثبت شده و پیش‌برد پروژه را لمس کنید' : 'Check the steps as you complete them to track your 4-week unified roadmap in real-time.'}
                                </p>
                            </div>
                        </div>

                        {/* 7 Days checklist */}
                        <div className="md:col-span-2 space-y-3">
                            <h5 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-2 flex-row-reverse">
                                <i className="fa-solid fa-list-check text-[10px] text-emerald-400"></i>
                                <span>{isFa ? 'روزشمار انفرادی گام‌های هفته' : 'Chronological Action Item Checklist'}</span>
                            </h5>
                            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
                                {currentWeekDetails.days.map((dayObj) => {
                                    const dayId = `${activeWeek}-${dayObj.day}`;
                                    const isDone = !!checkedItems[dayId];
                                    return (
                                        <div 
                                            key={dayObj.day}
                                            onClick={() => handleToggleCheck(dayId)}
                                            className={`p-3.5 rounded-xl border text-right transition-all flex items-start gap-3 select-none flex-row-reverse cursor-pointer ${
                                                isDone 
                                                    ? 'bg-emerald-950/20 border-emerald-500/30' 
                                                    : 'bg-slate-950/30 border-white/5 hover:border-white/10 hover:bg-slate-950/50'
                                            }`}
                                        >
                                            <div className="flex-shrink-0 mt-0.5">
                                                <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                                                    isDone 
                                                        ? 'bg-emerald-500 border-emerald-400 text-slate-950' 
                                                        : 'border-white/20 text-transparent hover:border-white/40'
                                                }`}>
                                                    <i className="fa-solid fa-check text-xs font-black"></i>
                                                </div>
                                            </div>
                                            <div className="flex-2 text-right">
                                                <span className={`text-[10px] font-black uppercase block ${isDone ? 'text-emerald-400' : 'text-slate-500'}`}>
                                                    {isFa ? `روز ${localizeNumber(dayObj.day, language)} فاز` : `Day ${dayObj.day} of Phase`}
                                                </span>
                                                <p className={`text-xs leading-relaxed mt-0.5 font-bold ${isDone ? 'text-slate-400 line-through' : 'text-slate-200'}`}>
                                                    {isFa ? dayObj.textFa : dayObj.textEn}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                    </motion.div>
                </AnimatePresence>
            </div>

            {/* UNIFIED CO-OP SANDBOX CONTROL ROOM */}
            <div className="relative overflow-hidden bg-gradient-to-b from-slate-950 to-slate-900 border border-emerald-500/20 rounded-3xl p-6 md:p-8 shadow-2xl">
                <div className="absolute top-0 left-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none"></div>
                <div className="absolute bottom-0 right-0 w-80 h-80 bg-blue-500/5 rounded-full blur-[100px] pointer-events-none"></div>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-6 mb-6 flex-row-reverse">
                    <div className="space-y-1">
                        <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-wider">
                            {isFa ? 'شبیه‌ساز و اتاق فرمان ائتلاف زنده' : 'Cooperative Convergence Sandbox'}
                        </span>
                        <h3 className="text-xl font-black text-white flex items-center gap-2 flex-row-reverse">
                            <i className="fa-solid fa-tower-broadcast text-emerald-400"></i>
                            <span>{isFa ? 'مرکز فرماندهی و تست اتصال ماژول‌های چهارگانه' : 'Unified Multi-Node Simulation Terminal'}</span>
                        </h3>
                        <p className="text-xs text-slate-400">
                            {isFa 
                              ? 'یکپارچه‌سازی و شبیه‌سازی زنده ارتباط داده‌های سازمان محیط‌زیست، پتنت USPTO آمریکا، اتصال ماهواره‌ای NASA FIRMS و مدل هوش‌مصنوعی FireNet.'
                              : 'Real-time testbed integrating Ministry GIS satellite feeds, USPTO provisional registration, and thermal telemetry routing.'}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Column 1: Nodes Control & Region Selection */}
                    <div className="bg-slate-950/60 p-5 rounded-2xl border border-white/5 space-y-4 text-right">
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">
                                {isFa ? '۱. انتخاب موقعیت جغرافیایی نقشه پایش' : '1. Core Regional GIS Target'}
                            </label>
                            <select 
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setRegion(val);
                                    triggerLog(`Switched target monitor coordinate to ${val === 'bolkar' ? 'Turkey Taurus/Bolkar' : val === 'zagros' ? 'Iran Mid-Zagros' : val === 'alborz' ? 'Iran Caspian-Alborz' : 'Turkey Lake Van Forest'}`);
                                    // Update random values based on selection
                                    if (val === 'bolkar') { setSmi(28); setAquifer(-5.4); setRisk(79); setHotspots(2); }
                                    else if (val === 'zagros') { setSmi(19); setAquifer(-8.1); setRisk(91); setHotspots(5); }
                                    else if (val === 'alborz') { setSmi(42); setAquifer(-2.3); setRisk(41); setHotspots(0); }
                                    else { setSmi(31); setAquifer(-4.0); setRisk(63); setHotspots(1); }
                                }}
                                className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer text-center"
                            >
                                <option value="bolkar">{isFa ? 'ناحیه کارستی کوهستان بولکار (ترکیه) - ۳۷.۳۸° Nord' : 'Bolkar Karstic Range (Turkey) - 37.38° N'}</option>
                                <option value="zagros">{isFa ? 'منطقه حفاظت‌شده زاگرس مرکزی (ایران) - ۳۱.۵۴° Nord' : 'Zagros Protected Reserve (Iran) - 31.54° N'}</option>
                                <option value="alborz">{isFa ? 'دامنه جنگل‌های بلوط گیلان/البرز (ایران) - ۳۶.۸۲° Nord' : 'Alborz Oak Foothills (Iran) - 36.82° N'}</option>
                                <option value="van">{isFa ? 'حوضه کوهستانی وان ارزروم (ترکیه) - ۳۸.۴۹° Nord' : 'Lake Van Forest Basin (Turkey) - 38.49° N'}</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">
                                {isFa ? '۲. سوئیچ‌های ادغام عملیاتی ماهواره' : '2. NASA FIRMS Uplink Switch'}
                            </label>
                            <div className="p-3 bg-slate-900/60 rounded-xl border border-white/5 flex items-center justify-between flex-row-reverse">
                                <div className="text-right">
                                    <div className="text-xs font-bold text-white">{isFa ? 'اتصال زنده NASA FIRMS' : 'NASA FIRMS Stream'}</div>
                                    <div className="text-[9px] text-slate-500">{isFa ? 'بستر اتصال حرارتی مادون قرمز' : 'MODIS/VIIRS infrared feed'}</div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        checked={firmsConnected} 
                                        onChange={() => {
                                            setFirmsConnected(!firmsConnected);
                                            triggerLog(!firmsConnected ? "NASA MODIS/VIIRS telemetry routing activated on port 3000." : "NASA FIRMS telemetry feed closed.");
                                        }}
                                        className="sr-only peer" 
                                    />
                                    <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-slate-400 after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500 peer-checked:after:bg-slate-950"></div>
                                </label>
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                                onClick={handleInjectSimulation}
                                disabled={isSimulating}
                                className={`w-full py-2.5 px-4 rounded-xl font-black text-xs text-slate-950 transition-all flex items-center justify-center gap-2 ${
                                    isSimulating 
                                        ? 'bg-slate-800 text-slate-400 cursor-not-allowed' 
                                        : 'bg-gradient-to-r from-emerald-400 via-teal-400 to-blue-400 hover:opacity-90 active:scale-95 shadow-md shadow-emerald-500/10'
                                }`}
                            >
                                {isSimulating ? (
                                    <>
                                        <i className="fa-solid fa-spinner animate-spin"></i>
                                        <span>{isFa ? 'در حال برقراری لینک ائتلاف...' : 'Synchronizing Nodes...'}</span>
                                    </>
                                ) : (
                                    <>
                                        <i className="fa-solid fa-satellite-dish"></i>
                                        <span>{isFa ? 'تزریق یکپارچه داده‌های ماهواره‌ای' : 'Inject Satellite & Ground Data'}</span>
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Node status tags */}
                        <div className="border-t border-white/5 pt-3 space-y-2">
                            <div className="text-[10px] font-extrabold text-slate-500 tracking-wider">
                                {isFa ? 'پینگ اندپوینت‌های فعال کلید چهارگانه' : 'ACTIVE CO-OP STATIONS'}
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-[9px] font-bold">
                                <div className="flex items-center gap-1.5 justify-end p-1 rounded bg-black/20">
                                    <span className="text-slate-300">USPTO (M1)</span>
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                </div>
                                <div className="flex items-center gap-1.5 justify-end p-1 rounded bg-black/20">
                                    <span className="text-slate-300">Venture (M2)</span>
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                                </div>
                                <div className="flex items-center gap-1.5 justify-end p-1 rounded bg-black/20">
                                    <span className="text-slate-300">ML-Host (M3)</span>
                                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                                </div>
                                <div className="flex items-center gap-1.5 justify-end p-1 rounded bg-black/20">
                                    <span className="text-slate-300">Gov-GIS (M4)</span>
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Column 2: Live Metrics Visualizer & Console Terminal */}
                    <div className="bg-slate-950/60 p-5 rounded-2xl border border-white/5 space-y-4 flex flex-col justify-between">
                        {/* Live dials/stats */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 bg-slate-900 rounded-xl border border-white/5 text-center relative overflow-hidden">
                                <span className="text-[9px] text-slate-500 font-bold block uppercase">{isFa ? 'رطوبت خاک (SMI)' : 'Soil Moisture Index'}</span>
                                <div className="text-xl font-black text-emerald-400 mt-1">{isFa ? `${localizeNumber(smi, language)}٪` : `${smi}%`}</div>
                                <div className="text-[9px] text-slate-400 mt-1">
                                    {smi < 30 ? (isFa ? '🔴 بحرانی / خشک' : '🔴 Critical / Dry') : (isFa ? '🟢 مطلوب' : '🟢 Hydrated')}
                                </div>
                            </div>
                            <div className="p-3 bg-slate-900 rounded-xl border border-white/5 text-center relative overflow-hidden">
                                <span className="text-[9px] text-slate-500 font-bold block uppercase">{isFa ? 'تغییرات سفره کارستی' : 'Karstic Crypt Depth'}</span>
                                <div className="text-xl font-black text-blue-400 mt-1">{isFa ? `${localizeNumber(aquifer, language)}m` : `${aquifer}m`}</div>
                                <div className="text-[9px] text-slate-400 mt-1">
                                    {aquifer < -5 ? (isFa ? '⚠️ کسری آب' : '⚠️ Deficit') : (isFa ? '🟢 ایمن' : '🟢 Recharge')}
                                </div>
                            </div>
                            <div className="p-3 bg-slate-900 rounded-xl border border-white/5 text-center relative overflow-hidden">
                                <span className="text-[9px] text-slate-500 font-bold block uppercase">{isFa ? 'آتش حرارتی (NASA)' : 'Active Hotspots'}</span>
                                <div className="text-xl font-black text-rose-400 mt-1">{localizeNumber(hotspots, language)}</div>
                                <div className="text-[9px] text-slate-400 mt-1">
                                    {hotspots > 0 ? (isFa ? '🔥 نیاز به هشدار' : '🔥 Detected') : (isFa ? '❄️ بدون حریق' : '❄️ Clear')}
                                </div>
                            </div>
                            <div className="p-3 bg-slate-900 rounded-xl border border-white/5 text-center relative overflow-hidden">
                                <span className="text-[9px] text-slate-500 font-bold block uppercase">{isFa ? 'ریسک حریق تا ۲۴ ساعت' : 'Fire Risk Index'}</span>
                                <div className="text-xl font-black text-amber-400 mt-1">{isFa ? `${localizeNumber(risk, language)}٪` : `${risk}%`}</div>
                                <div className="text-[9px] text-slate-400 mt-1">
                                    {risk > 70 ? (isFa ? '🌋 بسیار مبرم' : '🌋 Extreme') : (isFa ? '🟢 کم‌خطر' : '🟢 Moderate')}
                                </div>
                            </div>
                        </div>

                        {/* Real-time Logger component */}
                        <div className="space-y-2 mt-2 flex-grow flex flex-col">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block text-right">
                                {isFa ? 'لاگ اتصال سیستم و پینگ شبکه‌سازی' : 'SANDBOX LOG TERMINAL'}
                            </span>
                            <div className="bg-black/80 font-mono text-[9px] text-slate-400 p-3 rounded-xl border border-white/5 flex-grow overflow-y-auto max-h-36 min-h-[90px] h-full text-left space-y-1.5 custom-scrollbar">
                                {logs.map((logStr, lIdx) => (
                                    <div key={lIdx} className="leading-relaxed">
                                        <span className="text-emerald-500">➜</span> {logStr}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Column 3: AI Catalyst Sandbox (Member 5) */}
                    <div className="bg-slate-950/60 p-5 rounded-2xl border border-white/5 space-y-4 text-right flex flex-col justify-between">
                        <div className="space-y-3">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">
                                    {isFa ? '۳. کاتالیزور هوش مصنوعی (عضو ۵)' : '3. AI Catalyst (Virtual Member 5)'}
                                </label>
                                <select 
                                    value={catalystType}
                                    onChange={(e) => setCatalystType(e.target.value)}
                                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                                >
                                    <option value="podcast">{isFa ? '🎙️ سناریونویس صوتی پادکست (هفته ۲)' : '🎙️ Climate Tech Co-op Podcast'}</option>
                                    <option value="readme">{isFa ? '📄 همگردان کدهای رسمی گیت‌هاب (هفته ۴)' : '📄 Repo Manifest Config README'}</option>
                                    <option value="pitch">{isFa ? '💰 اسلایدهای هم‌افزایی سرمایه‌گذاران' : '💰 Investment Unit Economics Slide'}</option>
                                </select>
                            </div>

                            <div>
                                <input 
                                    type="text" 
                                    value={catalystInput}
                                    onChange={(e) => setCatalystInput(e.target.value)}
                                    placeholder={
                                        catalystType === 'podcast'
                                          ? (isFa ? 'مثال: ضبط فرودگاه ترکیه و برنامه‌نویسی...' : 'e.g. airport recordings, night coding...')
                                          : (catalystType === 'readme'
                                              ? (isFa ? 'ویژگی جدید: اتصال سنسورهای رطوبت...' : 'e.g. soil moisture sensor models...')
                                              : (isFa ? 'مثال: تقسیم سهام ۲۰٪ توسعه‌دهنده...' : 'e.g. 20% equity, 35M Toman budget...'))
                                    }
                                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-center"
                                />
                            </div>

                            <button
                                onClick={handleRunCatalyst}
                                disabled={isGeneratingCatalyst}
                                className="w-full bg-emerald-500 hover:bg-emerald-400 hover:text-slate-950 text-slate-950 font-black text-xs py-2 rounded-xl transition-all shadow-lg active:scale-95 flex items-center justify-center gap-1.5"
                            >
                                {isGeneratingCatalyst ? (
                                    <>
                                        <i className="fa-solid fa-spinner animate-spin"></i>
                                        <span>{isFa ? 'در حال تولید ساختار با هوش‌مصنوعی...' : 'Synthesizing Catalyst copy...'}</span>
                                    </>
                                ) : (
                                    <>
                                        <i className="fa-solid fa-microchip"></i>
                                        <span>{isFa ? 'پردازش نهایی هوش مصنوعی بومی' : 'Execute Catalyst Pipeline'}</span>
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Interactive Text Display with Copy */}
                        <div className="bg-black/40 border border-white/5 p-3 rounded-xl flex-grow overflow-y-auto max-h-[160px] min-h-[110px] flex flex-col justify-between text-left h-full">
                            <pre className="font-mono text-[9px] text-slate-300 whitespace-pre-wrap flex-grow custom-scrollbar overflow-y-auto" dir="ltr">
                                {catalystOutput}
                            </pre>
                            {catalystOutput && (
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(catalystOutput);
                                        alert(isFa ? 'محتوای هوش مصنوعی کپی شد!' : 'Copied output to clipboard!');
                                    }}
                                    className="self-end bg-white/10 hover:bg-white/20 text-slate-200 font-extrabold text-[8px] py-1 px-2 rounded-md uppercase tracking-wider block mt-2"
                                >
                                    {isFa ? 'کپی خروجی' : 'Copy copy'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* AI Custom-engineered Prompts for the user's weekly workflows */}
            <div className="space-y-6">
                <div className="border-b border-white/5 pb-2 flex justify-between items-center flex-row-reverse">
                    <h3 className="text-lg font-extrabold text-white flex items-center gap-2 flex-row-reverse">
                        <i className="fa-solid fa-robot text-sm text-emerald-400"></i>
                        <span>{isFa ? 'زرادخانه پرامپت‌های میانبر هوش‌مصنوعی با یک کلیک' : 'Premium AI Copire-ready Prompts Boilerplates'}</span>
                    </h3>
                    <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full uppercase tracking-widest font-black">
                        {isFa ? 'برای کپی کلیک کنید' : 'Click to Instant Copy'}
                    </span>
                    <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full uppercase tracking-widest font-black">
                        {isFa ? 'برای کپی کلیک کنید' : 'Click to Instant Copy'}
                    </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {prompts.map(prompt => {
                        const isCopied = copiedPromptId === prompt.id;
                        return (
                            <div 
                                key={prompt.id} 
                                className="bg-slate-900/40 border border-white/5 rounded-3xl p-6 flex flex-col justify-between text-right rtl:text-right hover:border-white/10 transition-all shadow-xl"
                            >
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between flex-row-reverse">
                                        <div className="flex items-center gap-2 flex-row-reverse">
                                            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                                                <i className={`fa-solid ${prompt.icon} text-xs`}></i>
                                            </div>
                                            <h4 className="text-xs font-black text-white leading-tight">
                                                {isFa ? prompt.titleFa : prompt.titleEn}
                                            </h4>
                                        </div>
                                    </div>

                                    <div className="relative">
                                        <pre className="p-4 bg-black/40 rounded-2xl border border-white/5 font-mono text-[9px] text-slate-400 whitespace-pre-wrap max-h-48 overflow-y-auto text-left custom-scrollbar scrollbar-thin" dir="ltr">
                                            {prompt.text}
                                        </pre>
                                        <div className="absolute top-2 right-2 z-10">
                                            <button
                                                type="button"
                                                onClick={() => handleCopyPrompt(prompt.text, prompt.id)}
                                                className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all flex items-center gap-1.5 ${
                                                    isCopied 
                                                        ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20' 
                                                        : 'bg-white/5 text-slate-300 hover:bg-white/10'
                                                }`}
                                            >
                                                {isCopied ? (
                                                    <>
                                                        <i className="fa-solid fa-check text-[10px]"></i>
                                                        <span>{isFa ? 'کپی شد!' : 'COPIED!'}</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <i className="fa-solid fa-copy text-[10px]"></i>
                                                        <span>{isFa ? 'کپی پرامپت' : 'COPY PROMPT'}</span>
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-4 pt-3 border-t border-white/5 text-[9px] text-slate-500 font-medium">
                                    {isFa 
                                      ? '* این پرامپت سفارشی را کپی کرده و در چت سیستم هوش مصنوعی بارگذاری کنید تا فایل خروجی را تولید کند.'
                                      : '* Copy this optimized chunk and paste inside any major LLM window to synthesize exact formatted delivery outputs.'}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Quick Action Summary Banner */}
            <div className="bg-slate-950/40 p-6 rounded-3xl border border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 text-right rtl:text-right">
                <div className="space-y-1">
                    <h4 className="text-sm font-black text-white">{isFa ? 'همین حالا گام‌های اجرایی طرح خود را آغاز کنید' : 'Ready to transition into the execution phase?'}</h4>
                    <p className="text-xs text-slate-400 leading-relaxed max-w-3xl">
                        {isFa 
                          ? 'توسعه فنی گام‌های هفته به هفته می‌تواند بستر همکاری تیمی شما را منظم نگاهداشته و شانس پذیرش گرانتهای بین‌المللی را صد پله بالاتر ببرد.'
                          : 'Maintaining dynamic week-by-week checkpoints is highly proven to strengthen venture applications and increase technical grant approvals.'}
                    </p>
                </div>
                <div className="flex-shrink-0 flex gap-2">
                    <button
                        onClick={() => {
                            if (window.confirm(isFa ? 'آیا مایلید تمام تسک‌های پیشرفت به حالت پیش‌فرض (کامل نشده) بازگردند؟' : 'Reset all checked milestones?')) {
                                setCheckedItems({});
                            }
                        }}
                        className="px-4 py-2 rounded-xl text-xs font-black text-rose-400 border border-rose-500/20 hover:bg-rose-500/5 transition-all"
                    >
                        {isFa ? 'ریست کامل پیشرفت' : 'Reset Progress'}
                    </button>
                </div>
            </div>
            
        </div>
    );
};
