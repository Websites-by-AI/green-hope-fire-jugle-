import React, { useState } from 'react';
import { PlantingSuggestion, VegetationAnalysis, RiskAnalysis, WeatherData, CrowdfundingCampaign, useLanguage } from '../types';
import { saveAs } from 'file-saver';

export interface SectionCardProps {
    title: string;
    icon: string;
    children: React.ReactNode;
    className?: string;
}

export const SectionCard: React.FC<SectionCardProps> = ({ title, icon, children, className = '' }) => (
    <div className={`bg-slate-800/50 rounded-xl border border-white/10 overflow-hidden shadow-lg hover:shadow-emerald-900/10 transition-shadow ${className}`}>
        <div className="bg-slate-900/50 px-6 py-4 border-b border-white/5 flex items-center">
            <i className={`fas ${icon} text-emerald-400 text-xl mr-3 rtl:mr-0 rtl:ml-3`}></i>
            <h3 className="text-xl font-bold text-white">{title}</h3>
        </div>
        <div className="p-6 text-slate-300">
            {children}
        </div>
    </div>
);

interface AnalysisResultsProps {
  plantingSuggestion: PlantingSuggestion;
  vegetationAnalysis: VegetationAnalysis;
  riskAnalysis: RiskAnalysis;
  weatherData: WeatherData | null;
  crowdfundingCampaign: CrowdfundingCampaign | null;
  onGenerateCampaign: () => void;
  isGeneratingCampaign: boolean;
}

const AnalysisResults: React.FC<AnalysisResultsProps> = ({ 
    plantingSuggestion, vegetationAnalysis, riskAnalysis, weatherData, 
    crowdfundingCampaign, onGenerateCampaign, isGeneratingCampaign 
}) => {
    const { t, language } = useLanguage();
    const [showMoreDetails, setShowMoreDetails] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    const handleDownloadReport = async () => {
        setIsExporting(true);
        try {
            const isRtl = language === 'fa' || language === 'ar';
            
            // Translations specifically for the PDF Report sections
            const reportT = {
                en: {
                    reportTitle: 'Reforestation Analysis & Campaign Report',
                    metaLocation: 'Location Details',
                    metaArea: 'Target Area',
                    metaDuration: 'Estimated Duration',
                    sectionEnvMetrics: 'Environmental & Satellite Metrics',
                    sectionReforestPlan: 'Reforestation Strategy & Action Plan',
                    sectionRiskAssessment: 'Risk Assessment & Mitigation Protocols',
                    sectionBudget: 'Reforestation Project Budgeting',
                    sectionCampaign: 'Crowdfunding Campaign Draft',
                    totalCost: 'Total Budget Opportunity',
                    suitabilityTitle: 'Reforestation Suitability',
                    generatedOn: 'Report Generated On',
                    author: 'Green Hope Initiative | AI Environmental Analytics',
                    campaignNotGenerated: 'Crowdfunding campaign draft has not been generated yet. Create one on the dashboard to view details.',
                    donationTiers: 'Support & Donation Tiers',
                    story: 'Project Campaign Story'
                },
                fa: {
                    reportTitle: 'گزارش ارزیابی جنگل‌کاری و مشارکت مردمی',
                    metaLocation: 'مشخصات محل کاشت',
                    metaArea: 'مساحت هدف',
                    metaDuration: 'مدت زمان تخمینی',
                    sectionEnvMetrics: 'شاخص‌های محیطی و داده‌های ماهواره‌ای',
                    sectionReforestPlan: 'طرح استراتژیک جنگل‌کاری و احیاء اراضی',
                    sectionRiskAssessment: 'ارزیابی ریسک و پروتکل‌های کاهش اثرات',
                    sectionBudget: 'بودجه‌بندی و هزینه‌های اجرایی پروژه',
                    sectionCampaign: 'پیش‌نویس کمپین مشارکت مردمی (جذب سرمایه)',
                    totalCost: 'کل هزینه‌های سرمایه‌ای پروژه',
                    suitabilityTitle: 'میزان تناسب جنگل‌کاری اراضی',
                    generatedOn: 'تاریخ صدور گزارش',
                    author: 'سامانه امید سبز | تحلیل هوشمند محیط زیست',
                    campaignNotGenerated: 'پیش‌نویس کمپین مشارکت مردمی هنوز ایجاد نشده است. می‌توانید آن را در پایین همین بخش بسازید.',
                    donationTiers: 'سطوح حمایت مالی و پاداش حامیان',
                    story: 'داستان و بیانیه کمپین'
                },
                ar: {
                    reportTitle: 'تقرير تقييم إعادة التشجير وحملة التمويل',
                    metaLocation: 'تفاصيل الموقع الجغرافي',
                    metaArea: 'المساحة المستهدفة',
                    metaDuration: 'المدة المقدرة للزراعة',
                    sectionEnvMetrics: 'المقاييس البيئية وبيانات الأقمار الصناعية',
                    sectionReforestPlan: 'خطة عمل واستراتيجية إعادة التشجير',
                    sectionRiskAssessment: 'تقييم المخاطر وبروتوكولات التخفيف السليمة',
                    sectionBudget: 'ميزانية وتكاليف مشروع التشجير',
                    sectionCampaign: 'مسودة حملة التمويل الجماعي التشاركية',
                    totalCost: 'إجمالي الميزانية التقديرية',
                    suitabilityTitle: 'ملاءمة إعادة التشجير والإنبات بالمنطقة',
                    generatedOn: 'تاريخ صدور التقرير المعتمد',
                    author: 'مبادرة الأمل الأخضر | التحليلات البيئية الذكية',
                    campaignNotGenerated: 'لم يتم إنشاء مسودة حملة المشاركة بالتمويل بعد. يمكنك توليدها من لوحة التحكم لتظهر في التقرير.',
                    donationTiers: 'مستويات الدعم والجوائز التقديرية لشركائنا',
                    story: 'قصة الحملة والبيان التعريفي'
                }
            };

            const langKey = (language as 'en' | 'fa' | 'ar') || 'en';
            const rt = reportT[langKey];
            const timestamp = new Date().toLocaleDateString(language === 'fa' ? 'fa-IR' : language === 'ar' ? 'ar-SA' : 'en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });

            // Prepare species list
            const speciesListHtml = (plantingSuggestion.suggestedSpecies || []).map(s => `
                <div class="species-card animate-print">
                    <div class="species-header">${s.name}</div>
                    <div class="species-desc">${s.reason}</div>
                </div>
            `).join('');

            // Prepare risks list
            const risksHtml = (riskAnalysis.naturalDisasters || []).map(r => `
                <div class="risk-item animate-print">
                    <div class="risk-title-row">
                        <span class="risk-type">${r.type}</span>
                        <span class="risk-badge ${r.riskLevel.toLowerCase().includes('high') ? 'risk-high' : 'risk-med'}">${r.riskLevel}</span>
                    </div>
                    <div class="risk-mitigation"><strong>${t('analysis.risk.mitigation', { defaultValue: 'Mitigation: ' })}</strong> ${r.mitigation}</div>
                </div>
            `).join('');

            // Prepared dominant species
            const domSpeciesHtml = (vegetationAnalysis.dominantSpecies || []).map(s => `
                <span class="pill">${s}</span>
            `).join('');

            // Prepare campaign HTML if exists
            let campaignHtml = `
                <div class="no-campaign-wrapper">
                    <p>${rt.campaignNotGenerated}</p>
                </div>
            `;
            if (crowdfundingCampaign) {
                const tiersHtml = (crowdfundingCampaign.donationTiers || []).map(tier => `
                    <div class="tier-card">
                        <div class="tier-amount">$${tier.amount}</div>
                        <div class="tier-reward">${tier.reward}</div>
                    </div>
                `).join('');

                campaignHtml = `
                    <div class="campaign-box">
                        <div class="campaign-header">
                            <div class="campaign-title">${crowdfundingCampaign.title}</div>
                            <div class="campaign-tagline">${crowdfundingCampaign.tagline}</div>
                        </div>
                        <div class="campaign-body">
                            <h4 class="sub-section-title">${rt.story}</h4>
                            <p class="campaign-story">${crowdfundingCampaign.story.replace(/\n/g, '<br>')}</p>
                            
                            <h4 class="sub-section-title" style="margin-top: 25px;">${rt.donationTiers}</h4>
                            <div class="tiers-grid">
                                ${tiersHtml}
                            </div>
                        </div>
                    </div>
                `;
            }

            // Create suitability gauge properties
            let gaugeColor = '#10b981'; // Emerald
            let gaugeBg = '#ecfdf5';
            let suitClass = 'suit-high';
            const score = plantingSuggestion.suitabilityScore ?? 80;
            if (score < 50) {
                gaugeColor = '#ef4444'; // Rose
                gaugeBg = '#fef2f2';
                suitClass = 'suit-low';
            } else if (score < 80) {
                gaugeColor = '#f59e0b'; // Amber
                gaugeBg = '#fffbeb';
                suitClass = 'suit-med';
            }

            const printContent = `
                <!DOCTYPE html>
                <html lang="${language}" dir="${isRtl ? 'rtl' : 'ltr'}">
                <head>
                    <meta charset="UTF-8">
                    <title>${rt.reportTitle}</title>
                    <style>
                        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Vazirmatn:wght@400;500;700;800&display=swap');
                        
                        * {
                            box-sizing: border-box;
                        }

                        body {
                            font-family: 'Vazirmatn', 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                            padding: 0;
                            margin: 0;
                            color: #1e293b;
                            line-height: 1.6;
                            background-color: #ffffff;
                            -webkit-print-color-adjust: exact;
                            print-color-adjust: exact;
                        }

                        .report-wrapper {
                            max-width: 900px;
                            margin: 0 auto;
                            padding: 40px;
                        }

                        /* Header design */
                        header {
                            border-bottom: 2px solid #e2e8f0;
                            padding-bottom: 25px;
                            margin-bottom: 30px;
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                        }

                        .header-left {
                            flex: 1;
                        }

                        .sub-brand {
                            font-size: 11px;
                            font-weight: 700;
                            text-transform: uppercase;
                            letter-spacing: 0.1em;
                            color: #059669;
                            margin-bottom: 5px;
                        }

                        h1 {
                            font-size: 24px;
                            font-weight: 800;
                            color: #0f172a;
                            margin: 0 0 10px 0;
                            line-height: 1.25;
                        }

                        .meta-info {
                            font-size: 12px;
                            color: #64748b;
                            display: flex;
                            gap: 20px;
                            flex-wrap: wrap;
                        }

                        /* Suitability widget in header */
                        .suitability-header-badge {
                            background-color: ${gaugeBg};
                            border: 1px solid ${gaugeColor}20;
                            padding: 12px 18px;
                            border-radius: 12px;
                            display: flex;
                            align-items: center;
                            gap: 15px;
                            text-align: center;
                            min-width: 220px;
                        }

                        .score-ring {
                            width: 50px;
                            height: 50px;
                            border-radius: 50%;
                            border: 4px solid #e2e8f0;
                            border-top-color: ${gaugeColor};
                            border-right-color: ${score >= 50 ? gaugeColor : '#e2e8f0'};
                            border-bottom-color: ${score >= 80 ? gaugeColor : '#e2e8f0'};
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            font-size: 14px;
                            font-weight: 800;
                            color: ${gaugeColor};
                            position: relative;
                            flex-shrink: 0;
                        }

                        .suit-label-container {
                            display: flex;
                            flex-direction: column;
                            text-align: ${isRtl ? 'right' : 'left'};
                        }

                        .suit-title {
                            font-size: 10px;
                            font-weight: 700;
                            color: #475569;
                            text-transform: uppercase;
                        }

                        .suit-val {
                            font-size: 15px;
                            font-weight: 800;
                            color: #0f172a;
                        }

                        /* Section block styling */
                        .section-title {
                            font-size: 16px;
                            font-weight: 700;
                            color: #0f172a;
                            border-bottom: 2px solid #cbd5e1;
                            padding-bottom: 5px;
                            margin: 25px 0 15px 0;
                            display: flex;
                            align-items: center;
                            gap: 10px;
                            page-break-after: avoid;
                        }

                        .section-title::before {
                            content: "";
                            display: inline-block;
                            width: 4px;
                            height: 16px;
                            background-color: #059669;
                            border-radius: 2px;
                        }

                        /* Metadata grid */
                        .meta-grid {
                            display: grid;
                            grid-template-columns: repeat(3, 1fr);
                            gap: 15px;
                            margin-bottom: 20px;
                        }

                        .meta-card {
                            background-color: #f8fafc;
                            border: 1px solid #f1f5f9;
                            padding: 12px 15px;
                            border-radius: 8px;
                        }

                        .meta-card-label {
                            font-size: 10px;
                            text-transform: uppercase;
                            color: #64748b;
                            font-weight: 700;
                            margin-bottom: 4px;
                        }

                        .meta-card-value {
                            font-size: 13px;
                            font-weight: 600;
                            color: #334155;
                        }

                        /* Weather grid */
                        .weather-grid {
                            display: grid;
                            grid-template-columns: repeat(3, 1fr);
                            gap: 15px;
                            margin-bottom: 15px;
                        }

                        .weather-stat {
                            background-color: #f8fafc;
                            border: 1px solid #e2e8f0;
                            border-radius: 8px;
                            padding: 12px;
                            text-align: center;
                        }

                        .weather-label {
                            font-size: 10px;
                            color: #64748b;
                            text-transform: uppercase;
                            font-weight: 600;
                        }

                        .weather-val {
                            font-size: 13px;
                            font-weight: 700;
                            color: #0f172a;
                        }

                        .weather-summary-box {
                            background-color: #f0fdf4;
                            border: 1px dashed #bbf7d0;
                            border-radius: 8px;
                            padding: 12px 15px;
                            font-size: 12.5px;
                            color: #166534;
                            font-style: italic;
                            margin-bottom: 15px;
                        }

                        /* Species Cards */
                        .species-grid {
                            display: grid;
                            grid-template-columns: repeat(2, 1fr);
                            gap: 15px;
                            margin-bottom: 20px;
                        }

                        .species-card {
                            background-color: #ffffff;
                            border: 1px solid #e2e8f0;
                            border-left: 3px solid #10b981;
                            border-radius: 8px;
                            padding: 12px 15px;
                        }

                        html[dir="rtl"] .species-card {
                            border-left: none;
                            border-right: 3px solid #10b981;
                        }

                        .species-header {
                            font-weight: 700;
                            font-size: 13px;
                            color: #0f172a;
                            margin-bottom: 4px;
                        }

                        .species-desc {
                            font-size: 11.5px;
                            color: #475569;
                            line-height: 1.5;
                        }

                        /* Cost Table */
                        .cost-table-container {
                            border: 1px solid #cbd5e1;
                            border-radius: 8px;
                            overflow: hidden;
                            margin-bottom: 25px;
                        }

                        .cost-table {
                            width: 100%;
                            border-collapse: collapse;
                            font-size: 12.5px;
                        }

                        .cost-table th, .cost-table td {
                            padding: 10px 14px;
                            text-align: ${isRtl ? 'right' : 'left'};
                        }

                        .cost-table th {
                            background-color: #f1f5f9;
                            font-weight: 700;
                            color: #334155;
                            border-bottom: 1px solid #cbd5e1;
                        }

                        .cost-table td {
                            border-bottom: 1px solid #e2e8f0;
                            color: #475569;
                        }

                        .cost-table tr:last-child td {
                            border-bottom: none;
                        }

                        .cost-table tr.total-row {
                            background-color: #ecfdf5;
                            font-weight: 700;
                        }

                        .cost-table tr.total-row td {
                            color: #065f46;
                            font-size: 14px;
                        }

                        /* Risks and Mitigations */
                        .risks-container {
                            display: flex;
                            flex-direction: column;
                            gap: 12px;
                            margin-bottom: 20px;
                        }

                        .risk-item {
                            background-color: #fffaf0;
                            border: 1px solid #feebc8;
                            border-radius: 8px;
                            padding: 12px 15px;
                        }

                        .risk-title-row {
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                            margin-bottom: 5px;
                        }

                        .risk-type {
                            font-weight: 700;
                            font-size: 13px;
                            color: #7b341e;
                        }

                        .risk-badge {
                            font-size: 10px;
                            font-weight: 800;
                            padding: 2px 8px;
                            border-radius: 9999px;
                        }

                        .risk-high {
                            background-color: #fee2e2;
                            color: #991b1b;
                        }

                        .risk-med {
                            background-color: #fef3c7;
                            color: #92400e;
                        }

                        .risk-mitigation {
                            font-size: 12px;
                            color: #475569;
                        }

                        /* Crowdfunding Campaign Draft Box */
                        .campaign-box {
                            background-color: #fcfdfd;
                            border: 2px dashed #b2f5ea;
                            border-radius: 12px;
                            padding: 25px;
                            margin-top: 15px;
                            page-break-inside: avoid;
                        }

                        .campaign-header {
                            text-align: center;
                            border-bottom: 1px dashed #cbd5e1;
                            padding-bottom: 15px;
                            margin-bottom: 15px;
                        }

                        .campaign-title {
                            font-size: 20px;
                            font-weight: 800;
                            color: #0d9488;
                            margin-bottom: 5px;
                        }

                        .campaign-tagline {
                            font-size: 13px;
                            color: #4f46e5;
                            font-style: italic;
                        }

                        .sub-section-title {
                            font-size: 12px;
                            text-transform: uppercase;
                            color: #475569;
                            font-weight: 700;
                            border-bottom: 1px solid #f1f5f9;
                            padding-bottom: 3px;
                            margin-bottom: 8px;
                        }

                        .campaign-story {
                            font-size: 12px;
                            color: #334155;
                            line-height: 1.6;
                            text-align: justify;
                        }

                        .tiers-grid {
                            display: grid;
                            grid-template-columns: repeat(3, 1fr);
                            gap: 12px;
                            margin-top: 10px;
                        }

                        .tier-card {
                            background-color: #ffffff;
                            border: 1px solid #e2e8f0;
                            border-radius: 8px;
                            padding: 12px;
                            text-align: center;
                        }

                        .tier-amount {
                            font-size: 16px;
                            font-weight: 800;
                            color: #0d9488;
                            margin-bottom: 4px;
                        }

                        .tier-reward {
                            font-size: 11px;
                            color: #64748b;
                        }

                        .no-campaign-wrapper {
                            text-align: center;
                            color: #94a3b8;
                            font-style: italic;
                            padding: 30px;
                            border: 1px dashed #e2e8f0;
                            border-radius: 8px;
                            font-size: 12.5px;
                        }

                        /* Helpers & Layout items */
                        .text-grid-cols-2 {
                            display: grid;
                            grid-template-columns: repeat(2, 1fr);
                            gap: 20px;
                        }

                        .detail-block {
                            font-size: 12.5px;
                        }

                        .detail-block strong {
                            color: #0f172a;
                        }

                        .pills-container {
                            display: flex;
                            flex-wrap: wrap;
                            gap: 6px;
                            margin-top: 5px;
                        }

                        .pill {
                            background-color: #f0fdf4;
                            border: 1px solid #dcfce7;
                            color: #15803d;
                            font-size: 11px;
                            font-weight: 500;
                            padding: 2px 8px;
                            border-radius: 4px;
                        }

                        footer {
                            text-align: center;
                            font-size: 10.5px;
                            color: #94a3b8;
                            border-top: 1px solid #f1f5f9;
                            padding-top: 15px;
                            margin-top: 40px;
                        }

                        /* Print-specific layout optimizations */
                        @media print {
                            body {
                                padding: 0px;
                                font-size: 11px;
                            }
                            .report-wrapper {
                                padding: 10px;
                                max-width: 100%;
                            }
                            .section-title, .campaign-box {
                                page-break-inside: avoid;
                            }
                        }
                    </style>
                </head>
                <body>
                    <div class="report-wrapper">
                        <header>
                            <div class="header-left">
                                <div class="sub-brand">${rt.author}</div>
                                <h1>${t('header.title', { defaultValue: 'Green Hope Initiative' })}</h1>
                                <div class="meta-info">
                                    <span><strong>${rt.generatedOn}:</strong> ${timestamp}</span>
                                    <span><strong>LANG:</strong> ${language.toUpperCase()}</span>
                                </div>
                            </div>
                            <div class="suitability-header-badge">
                                <div class="score-ring">
                                    ${score}%
                                </div>
                                <div class="suit-label-container">
                                    <span class="suit-title">${rt.suitabilityTitle}</span>
                                    <span class="suit-val ${suitClass}">
                                        ${score >= 80 ? (isRtl ? 'بسیار مناسب' : 'High') : score >= 50 ? (isRtl ? 'متوسط' : 'Moderate') : (isRtl ? 'ضعيف' : 'Low')}
                                    </span>
                                </div>
                            </div>
                        </header>

                        <!-- Section 1 -->
                        <div class="section-title">${rt.sectionEnvMetrics}</div>
                        
                        <div class="weather-summary-box">
                            "${weatherData ? weatherData.summary : 'Local climate metrics are highly stable and suitable for reforestation planning.'}"
                        </div>

                        <div class="weather-grid">
                            <div class="weather-stat">
                                <div class="weather-label">${t('analysis.weather.temp')}</div>
                                <div class="weather-val">${weatherData ? weatherData.temperature : 'N/A'}</div>
                            </div>
                            <div class="weather-stat">
                                <div class="weather-label">${t('analysis.weather.precip')}</div>
                                <div class="weather-val">${weatherData ? weatherData.precipitation : 'N/A'}</div>
                            </div>
                            <div class="weather-stat">
                                <div class="weather-label">${t('analysis.weather.wind')}</div>
                                <div class="weather-val">${weatherData ? weatherData.wind : 'N/A'}</div>
                            </div>
                        </div>

                        <div class="text-grid-cols-2" style="margin-top: 15px; margin-bottom: 20px;">
                            <div class="detail-block">
                                <p><strong>${t('analysis.vegetation.current')}:</strong> ${vegetationAnalysis.currentVegetation}</p>
                                <p><strong>${t('analysis.vegetation.health')}:</strong> ${vegetationAnalysis.healthStatus}</p>
                            </div>
                            <div class="detail-block">
                                <p><strong>${t('analysis.vegetation.dominant')}:</strong></p>
                                <div class="pills-container">
                                    ${domSpeciesHtml}
                                </div>
                                <p style="margin-top: 12px;"><strong>${t('analysis.vegetation.threats')}:</strong> <span style="color:#b91c1c;">${vegetationAnalysis.deforestationThreat}</span></p>
                            </div>
                        </div>

                        <!-- Section 2 -->
                        <div class="section-title">${rt.sectionReforestPlan}</div>
                        
                        <div class="meta-grid">
                            <div class="meta-card">
                                <div class="meta-card-label">${rt.metaLocation}</div>
                                <div class="meta-card-value">${plantingSuggestion.locationDetails || 'Selected Site'}</div>
                            </div>
                            <div class="meta-card">
                                <div class="meta-card-label">${rt.metaArea}</div>
                                <div class="meta-card-value">${plantingSuggestion.areaPlanted || 'N/A'}</div>
                            </div>
                            <div class="meta-card">
                                <div class="meta-card-label">${rt.metaDuration}</div>
                                <div class="meta-card-value">${plantingSuggestion.plantingDuration || 'N/A'}</div>
                            </div>
                        </div>

                        <h4 class="sub-section-title" style="margin-top:20px; margin-bottom: 10px;">${t('analysis.strategy.species')}</h4>
                        <div class="species-grid">
                            ${speciesListHtml}
                        </div>

                        <div class="text-grid-cols-2" style="margin-top: 15px;">
                            <div class="detail-block">
                                <strong>${t('analysis.strategy.techniques')}:</strong>
                                <p style="margin-top: 5px; font-size: 12px; color: #475569;">${plantingSuggestion.plantingTechniques}</p>
                            </div>
                            <div class="detail-block">
                                <strong>${t('analysis.strategy.benefits', { defaultValue: 'Environmental Benefits' })}:</strong>
                                <p style="margin-top: 5px; font-size: 12px; color: #475569;">${plantingSuggestion.environmentalBenefits || 'Carbon sequestration, bio-habitat restoration, watershed optimization, and long-term soil structure rebuild.'}</p>
                            </div>
                        </div>

                        <div class="detail-block" style="margin-top: 15px;">
                            <strong>${t('analysis.strategy.care')}:</strong>
                            <p style="margin-top: 5px; font-size: 12px; color: #475569;">${plantingSuggestion.careAndMaintenance}</p>
                        </div>

                        <!-- Section 3 -->
                        <div class="section-title">${rt.sectionBudget}</div>
                        <div class="cost-table-container">
                            <table class="cost-table">
                                <thead>
                                    <tr>
                                        <th>Itemized Expense Header</th>
                                        <th>Estimated Valuation</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>${t('analysis.strategy.cost.tree')}</td>
                                        <td>${plantingSuggestion.estimatedCost?.treeCost}</td>
                                    </tr>
                                    <tr>
                                        <td>${t('analysis.strategy.cost.watering')}</td>
                                        <td>${plantingSuggestion.estimatedCost?.wateringCost}</td>
                                    </tr>
                                    <tr>
                                        <td>${t('analysis.strategy.cost.labor')}</td>
                                        <td>${plantingSuggestion.estimatedCost?.laborCost}</td>
                                    </tr>
                                    <tr>
                                        <td>${t('analysis.strategy.cost.other')}</td>
                                        <td>${plantingSuggestion.estimatedCost?.otherCosts}</td>
                                    </tr>
                                    <tr class="total-row">
                                        <td>${rt.totalCost} (${t('analysis.strategy.cost.total')})</td>
                                        <td>${plantingSuggestion.estimatedCost?.totalCost}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <!-- Section 4 -->
                        <div class="section-title">${rt.sectionRiskAssessment}</div>
                        <div class="risks-container">
                            ${risksHtml}
                        </div>
                        <div class="text-grid-cols-2" style="margin-top: 10px;">
                            <div class="detail-block">
                                <strong>${t('analysis.risk.human')}:</strong>
                                <p style="margin-top: 4px; font-size: 12px; color: #475569;">${riskAnalysis.humanActivityImpact}</p>
                            </div>
                            <div class="detail-block">
                                <strong>${t('analysis.risk.pests')}:</strong>
                                <p style="margin-top: 4px; font-size: 12px; color: #475569;">${riskAnalysis.pestAndDiseaseThreats}</p>
                            </div>
                        </div>

                        <!-- Section 5 -->
                        <div class="section-title">${rt.sectionCampaign}</div>
                        ${campaignHtml}

                        <footer>
                            <p>Powered by Green Hope Initiative AI Engine - Deep satellite scan and ecological recommendation models.</p>
                            <p>&copy; 2026 Green Hope Initiative. All rights under active environmental preservation frameworks.</p>
                        </footer>
                    </div>

                    <script>
                        window.onload = function() {
                            window.focus();
                            setTimeout(function() {
                                window.print();
                            }, 500);
                        };
                    </script>
                </body>
                </html>
            `;

            // Open a dynamic print frame, inject content, and trigger the native browser print dialogue
            const iframe = document.createElement('iframe');
            iframe.style.position = 'fixed';
            iframe.style.bottom = '0';
            iframe.style.right = '0';
            iframe.style.width = '0';
            iframe.style.height = '0';
            iframe.style.border = 'none';
            iframe.id = 'report-print-iframe';
            
            document.body.appendChild(iframe);
            
            const iframeDoc = iframe.contentWindow?.document || iframe.contentDocument;
            if (iframeDoc) {
                iframeDoc.open();
                iframeDoc.write(printContent);
                iframeDoc.close();
                
                // Cleanup frame after dialog closes (1 minute is very safe and standard)
                setTimeout(() => {
                    if (document.getElementById('report-print-iframe')) {
                        document.body.removeChild(iframe);
                    }
                }, 60000);
            } else {
                throw new Error("Could not access dynamic print system.");
            }
        } catch (error) {
            console.error('PDF export process error:', error);
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header with Download Button */}
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">{t('home.tabs.reforestation')}</h2>
                <button 
                    onClick={handleDownloadReport}
                    disabled={isExporting}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg border border-slate-600 transition disabled:opacity-50"
                >
                    {isExporting ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-download"></i>}
                    {t('analysis.downloadReport', { defaultValue: 'Download HTML Report' })}
                </button>
            </div>
            {/* Weather & Vegetation Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {weatherData && (
                    <SectionCard title={t('analysis.weather')} icon="fa-cloud-sun">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2 text-lg italic text-slate-200 mb-2">"{weatherData.summary}"</div>
                            <div>
                                <span className="block text-xs text-slate-500 uppercase">{t('analysis.weather.temp')}</span>
                                <span className="text-white font-medium">{weatherData.temperature}</span>
                            </div>
                             <div>
                                <span className="block text-xs text-slate-500 uppercase">{t('analysis.weather.precip')}</span>
                                <span className="text-white font-medium">{weatherData.precipitation}</span>
                            </div>
                             <div>
                                <span className="block text-xs text-slate-500 uppercase">{t('analysis.weather.wind')}</span>
                                <span className="text-white font-medium">{weatherData.wind}</span>
                            </div>
                        </div>
                    </SectionCard>
                 )}

                 <SectionCard title={t('analysis.vegetation')} icon="fa-leaf">
                    <div className="space-y-4">
                        <div>
                            <span className="block text-xs text-slate-500 uppercase mb-1">{t('analysis.vegetation.current')}</span>
                            <p>{vegetationAnalysis.currentVegetation}</p>
                        </div>
                        <div>
                            <span className="block text-xs text-slate-500 uppercase mb-1">{t('analysis.vegetation.dominant')}</span>
                            <div className="flex flex-wrap gap-2">
                                {(vegetationAnalysis.dominantSpecies || []).map((s, i) => (
                                    <span key={i} className="bg-emerald-900/30 text-emerald-300 px-2 py-1 rounded text-xs border border-emerald-800">{s}</span>
                                ))}
                            </div>
                        </div>
                         <div className="flex gap-4">
                            <div className="flex-1">
                                <span className="block text-xs text-slate-500 uppercase mb-1">{t('analysis.vegetation.health')}</span>
                                <p className="font-medium text-white">{vegetationAnalysis.healthStatus}</p>
                            </div>
                            <div className="flex-1">
                                <span className="block text-xs text-slate-500 uppercase mb-1">{t('analysis.vegetation.threats')}</span>
                                <p className="text-red-300">{vegetationAnalysis.deforestationThreat}</p>
                            </div>
                        </div>
                         {vegetationAnalysis.sources && vegetationAnalysis.sources.length > 0 && (
                            <div className="pt-2 border-t border-white/5">
                                <span className="text-xs text-slate-500 block mb-1">{t('analysis.sources')}</span>
                                <ul className="text-xs text-emerald-400 space-y-1">
                                    {(vegetationAnalysis.sources || []).map((src, i) => (
                                        <li key={i}><a href={src.uri} target="_blank" rel="noreferrer" className="hover:underline truncate block">{src.title}</a></li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                 </SectionCard>
            </div>

            {/* Planting Suggestions */}
            <SectionCard title={t('analysis.strategy')} icon="fa-seedling" className="border-emerald-500/30 ring-1 ring-emerald-500/10">
                <div className="space-y-6">
                    {plantingSuggestion.suitabilityScore !== undefined && (() => {
                        const isFarsi = language === 'fa';
                        const isArabic = language === 'ar';

                        let suitabilityLabel = 'Reforestation Suitability';
                        let suitabilityDesc = 'Based on satellite vegetation data, localized moisture dynamics, soil chemistry, and microclimate suitability.';
                        let levelLabel = 'High';

                        if (isFarsi) {
                            suitabilityLabel = 'شاخص تناسب جنگل‌کاری اراضی';
                            suitabilityDesc = 'بر اساس پوشش گیاهی ماهواره‌ای، شرایط رطوبت موضعی خاک، جنس بستر و سازگاری اقلیمی منطقه.';
                            levelLabel = plantingSuggestion.suitabilityScore >= 80 ? 'بسیار مناسب (بالا)' : plantingSuggestion.suitabilityScore >= 50 ? 'مناسب (متوسط)' : 'کافی نیست (پایین)';
                        } else if (isArabic) {
                            suitabilityLabel = 'مؤشر ملاءمة إعادة التشجير';
                            suitabilityDesc = 'بناءً على الغطاء النباتي للأقمار الصناعية، المحتوى المائي للتربة والظروف المناخية الحالية.';
                            levelLabel = plantingSuggestion.suitabilityScore >= 80 ? 'مناسب جداً (مرتفع)' : plantingSuggestion.suitabilityScore >= 50 ? 'متوسط الملاءمة' : 'ملاءمة منخفضة';
                        } else {
                            levelLabel = plantingSuggestion.suitabilityScore >= 80 ? 'High' : plantingSuggestion.suitabilityScore >= 50 ? 'Moderate' : 'Low';
                        }

                        // Gauge circular properties
                        const radius = 28;
                        const strokeWidth = 5;
                        const circumference = 2 * Math.PI * radius;
                        const offset = circumference * (1 - plantingSuggestion.suitabilityScore / 100);

                        return (
                            <div className="bg-slate-900/40 p-4 sm:p-5 rounded-xl border border-emerald-500/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div className="text-center sm:text-left rtl:sm:text-right">
                                    <h4 className="text-md font-bold text-slate-100 flex items-center justify-center sm:justify-start gap-2">
                                        <i className="fas fa-chart-line text-emerald-400"></i>
                                        {suitabilityLabel}
                                    </h4>
                                    <p className="text-xs text-slate-400 mt-1 max-w-xl leading-relaxed">{suitabilityDesc}</p>
                                </div>
                                <div className="flex items-center gap-4 flex-shrink-0">
                                    <div className="relative flex items-center justify-center w-16 h-16">
                                        <svg className="w-16 h-16 transform -rotate-90">
                                            <circle cx="32" cy="32" r={radius} fill="transparent" stroke="#1e293b" strokeWidth={strokeWidth} />
                                            <circle cx="32" cy="32" r={radius} fill="transparent" 
                                                stroke={plantingSuggestion.suitabilityScore >= 80 ? '#10b981' : plantingSuggestion.suitabilityScore >= 50 ? '#f59e0b' : '#ef4444'} 
                                                strokeWidth={strokeWidth} 
                                                strokeDasharray={circumference}
                                                strokeDashoffset={offset}
                                                strokeLinecap="round"
                                            />
                                        </svg>
                                        <span className="absolute text-sm font-extrabold text-white">{plantingSuggestion.suitabilityScore}%</span>
                                    </div>
                                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                                        plantingSuggestion.suitabilityScore >= 80 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                        plantingSuggestion.suitabilityScore >= 50 ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                                        'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                    }`}>
                                        {levelLabel}
                                    </span>
                                </div>
                            </div>
                        );
                    })()}

                    <div>
                        <h4 className="font-bold text-white mb-3 flex items-center">
                            <i className="fas fa-check-circle text-emerald-500 mr-2 rtl:mr-0 rtl:ml-2"></i>
                            {t('analysis.strategy.species')}
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {(plantingSuggestion.suggestedSpecies || []).map((species, i) => (
                                <div key={i} className="bg-slate-900/50 p-3 rounded-lg border border-white/5">
                                    <div className="font-bold text-emerald-300 mb-1">{species.name}</div>
                                    <div className="text-xs text-slate-400 leading-relaxed">{species.reason}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                             <h4 className="font-bold text-white mb-2">{t('analysis.strategy.techniques')}</h4>
                             <p className="text-sm leading-relaxed">{plantingSuggestion.plantingTechniques}</p>
                        </div>
                        <div>
                             <h4 className="font-bold text-white mb-2">{t('analysis.strategy.benefits')}</h4>
                             <p className="text-sm leading-relaxed">{plantingSuggestion.environmentalBenefits}</p>
                        </div>
                    </div>

                    {/* Cost Section - Always Visible Summary */}
                    <div className="bg-slate-900/40 p-5 rounded-xl border border-emerald-500/20">
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="font-bold text-white flex items-center">
                                <i className="fas fa-coins text-amber-400 mr-2 rtl:mr-0 rtl:ml-2"></i>
                                {t('analysis.strategy.cost')}
                            </h4>
                            <div className="text-xl font-bold text-emerald-400">
                                {plantingSuggestion.estimatedCost?.totalCost}
                            </div>
                        </div>
                        
                        <button 
                            onClick={() => setShowMoreDetails(!showMoreDetails)}
                            className="text-emerald-400 text-sm font-medium hover:text-emerald-300 transition-colors flex items-center gap-1"
                        >
                            {showMoreDetails ? t('analysis.strategy.lessDetails') : t('analysis.strategy.moreDetails')}
                            <i className={`fas fa-chevron-${showMoreDetails ? 'up' : 'down'} text-xs`}></i>
                        </button>

                        {showMoreDetails && (
                            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in">
                                <div className="bg-slate-900/60 p-3 rounded-lg border border-white/5">
                                    <span className="block text-xs text-slate-500 uppercase mb-1">{t('analysis.strategy.cost.tree')}</span>
                                    <span className="text-white font-medium">{plantingSuggestion.estimatedCost?.treeCost}</span>
                                </div>
                                <div className="bg-slate-900/60 p-3 rounded-lg border border-white/5">
                                    <span className="block text-xs text-slate-500 uppercase mb-1">{t('analysis.strategy.cost.watering')}</span>
                                    <span className="text-white font-medium">{plantingSuggestion.estimatedCost?.wateringCost}</span>
                                </div>
                                <div className="bg-slate-900/60 p-3 rounded-lg border border-white/5">
                                    <span className="block text-xs text-slate-500 uppercase mb-1">{t('analysis.strategy.cost.labor')}</span>
                                    <span className="text-white font-medium">{plantingSuggestion.estimatedCost?.laborCost}</span>
                                </div>
                                <div className="bg-slate-900/60 p-3 rounded-lg border border-white/5">
                                    <span className="block text-xs text-slate-500 uppercase mb-1">{t('analysis.strategy.cost.other')}</span>
                                    <span className="text-white font-medium">{plantingSuggestion.estimatedCost?.otherCosts}</span>
                                </div>
                                <div className="bg-slate-900/60 p-3 rounded-lg border border-white/5">
                                    <span className="block text-xs text-slate-500 uppercase mb-1">{t('analysis.strategy.duration')}</span>
                                    <span className="text-white font-medium">{plantingSuggestion.plantingDuration}</span>
                                </div>
                                <div className="bg-slate-900/60 p-3 rounded-lg border border-white/5">
                                    <span className="block text-xs text-slate-500 uppercase mb-1">{t('analysis.strategy.area')}</span>
                                    <span className="text-white font-medium">{plantingSuggestion.areaPlanted}</span>
                                </div>
                                <div className="col-span-1 sm:col-span-2 bg-slate-900/60 p-3 rounded-lg border border-white/5">
                                    <span className="block text-xs text-slate-500 uppercase mb-1">{t('analysis.strategy.location')}</span>
                                    <span className="text-white font-medium">{plantingSuggestion.locationDetails}</span>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="bg-emerald-900/10 p-4 rounded-lg border border-emerald-900/30">
                        <h4 className="font-bold text-emerald-400 mb-2 text-sm">{t('analysis.strategy.care')}</h4>
                        <p className="text-sm text-slate-300">{plantingSuggestion.careAndMaintenance}</p>
                    </div>
                    
                    {plantingSuggestion.sources && plantingSuggestion.sources.length > 0 && (
                        <div className="pt-2 border-t border-white/5">
                            <span className="text-xs text-slate-500 block mb-1">{t('analysis.sources')}</span>
                            <ul className="text-xs text-emerald-400 space-y-1">
                                {(plantingSuggestion.sources || []).map((src, i) => (
                                    <li key={i}><a href={src.uri} target="_blank" rel="noreferrer" className="hover:underline truncate block">{src.title}</a></li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </SectionCard>

            {/* Risk Analysis */}
            <SectionCard title={t('analysis.risk')} icon="fa-triangle-exclamation">
                <div className="space-y-4">
                    <div>
                         <span className="block text-xs text-slate-500 uppercase mb-2">{t('analysis.risk.natural')}</span>
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {(riskAnalysis.naturalDisasters || []).map((risk, i) => (
                                <div key={i} className="flex flex-col bg-slate-900/30 p-3 rounded border border-white/5">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="font-medium text-white">{risk.type}</span>
                                        <span className={`text-xs px-2 py-0.5 rounded ${risk.riskLevel.toLowerCase().includes('high') ? 'bg-red-900/50 text-red-200' : 'bg-yellow-900/50 text-yellow-200'}`}>
                                            {risk.riskLevel}
                                        </span>
                                    </div>
                                    <span className="text-xs text-slate-400 mt-1">{t('analysis.risk.mitigation')}{risk.mitigation}</span>
                                </div>
                            ))}
                         </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <span className="block text-xs text-slate-500 uppercase mb-1">{t('analysis.risk.human')}</span>
                            <p className="text-sm">{riskAnalysis.humanActivityImpact}</p>
                        </div>
                         <div>
                            <span className="block text-xs text-slate-500 uppercase mb-1">{t('analysis.risk.pests')}</span>
                            <p className="text-sm">{riskAnalysis.pestAndDiseaseThreats}</p>
                        </div>
                    </div>
                </div>
            </SectionCard>

            {/* Campaign Generation Section */}
            <div className="flex flex-col items-center justify-center py-8 border-t border-slate-700 w-full animate-fade-in">
                {!crowdfundingCampaign ? (
                    <div className="text-center w-full">
                        <h3 className="text-2xl font-bold text-white mb-2">{t('campaign.cta.title')}</h3>
                        <p className="text-slate-400 mb-6 max-w-lg mx-auto">{t('campaign.cta.desc')}</p>
                        <button 
                            onClick={onGenerateCampaign}
                            disabled={isGeneratingCampaign}
                            className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-full shadow-lg transition transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isGeneratingCampaign ? (
                                <>
                                    <i className="fas fa-spinner fa-spin mr-2 rtl:mr-0 rtl:ml-2"></i> {t('campaign.cta.generating')}
                                </>
                            ) : (
                                <>
                                    <i className="fas fa-bullhorn mr-2 rtl:mr-0 rtl:ml-2"></i> {t('campaign.cta.btn')}
                                </>
                            )}
                        </button>

                        {isGeneratingCampaign && (
                            <div className="w-full mt-8 bg-slate-800/30 rounded-xl border border-amber-500/10 overflow-hidden shadow-xl animate-pulse text-left rtl:text-right">
                                <div className="bg-slate-900/40 p-8 text-center space-y-3">
                                    <div className="h-7 w-2/3 bg-emerald-400/20 rounded mx-auto"></div>
                                    <div className="h-5 w-1/2 bg-amber-400/10 rounded mx-auto"></div>
                                </div>
                                <div className="p-8 space-y-4">
                                    <div className="h-3 w-16 bg-amber-500/20 rounded"></div>
                                    <div className="space-y-2">
                                        <div className="h-4 bg-slate-700/40 rounded w-full"></div>
                                        <div className="h-4 bg-slate-700/40 rounded w-11/12"></div>
                                        <div className="h-4 bg-slate-700/40 rounded w-4/5"></div>
                                    </div>
                                    <div className="h-3 w-16 bg-amber-500/20 rounded mx-auto pt-4"></div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {[1, 2, 3].map((i) => (
                                            <div key={i} className="bg-slate-900/20 p-4 rounded-lg border border-slate-700 text-center space-y-2">
                                                <div className="h-6 w-12 bg-slate-700/50 rounded mx-auto"></div>
                                                <div className="h-3 w-20 bg-slate-700/30 rounded mx-auto"></div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="w-full bg-slate-800 rounded-xl border-2 border-amber-500/30 overflow-hidden shadow-2xl relative">
                        <div className="absolute top-0 right-0 rtl:right-auto rtl:left-0 bg-amber-500 text-slate-900 font-bold px-3 py-1 text-xs rounded-bl-lg rtl:rounded-bl-none rtl:rounded-br-lg z-10">{t('campaign.draft')}</div>
                        <div className="bg-gradient-to-b from-slate-900 to-slate-800 p-8 text-center relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                            <h2 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-amber-200 mb-2 relative z-10">{crowdfundingCampaign.title}</h2>
                            <p className="text-xl text-emerald-300 italic relative z-10">{crowdfundingCampaign.tagline}</p>
                        </div>
                        <div className="p-8">
                            <div className="prose prose-invert max-w-none mb-8">
                                <h4 className="text-amber-400 uppercase tracking-widest text-sm font-bold mb-3">{t('campaign.story')}</h4>
                                <p className="text-slate-300 whitespace-pre-line">{crowdfundingCampaign.story}</p>
                            </div>
                            
                            <h4 className="text-amber-400 uppercase tracking-widest text-sm font-bold mb-4 text-center">{t('campaign.tiers')}</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {(crowdfundingCampaign.donationTiers || []).map((tier, i) => (
                                    <div key={i} className="bg-slate-900/50 p-4 rounded-lg border border-slate-700 hover:border-amber-500/50 transition-colors text-center group">
                                        <div className="text-2xl font-bold text-white mb-1 group-hover:text-amber-400 transition-colors">${tier.amount}</div>
                                        <div className="h-px w-12 bg-slate-700 mx-auto mb-3"></div>
                                        <div className="text-sm text-slate-400">{tier.reward}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AnalysisResults;