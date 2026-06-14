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
            const content = `
                <!DOCTYPE html>
                <html lang="${language}" dir="${language === 'fa' || language === 'ar' ? 'rtl' : 'ltr'}">
                <head>
                    <meta charset="UTF-8">
                    <title>${t('header.title')} Report</title>
                    <style>
                        body { font-family: sans-serif; padding: 40px; line-height: 1.6; color: #1e293b; }
                        h1 { color: #059669; border-bottom: 2px solid #059669; padding-bottom: 10px; }
                        h2 { color: #10b981; margin-top: 30px; }
                        h3 { color: #0f766e; }
                        .cost-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                        .cost-table td, .cost-table th { border: 1px solid #e2e8f0; padding: 12px; text-align: left; }
                        .cost-table th { bg-color: #f8fafc; }
                        .total { font-weight: bold; font-size: 1.2em; color: #059669; }
                    </style>
                </head>
                <body>
                    <h1>${t('header.title')} - ${t('home.tabs.reforestation')}</h1>
                    
                    <h2>${t('analysis.strategy')}</h2>
                    <h3>${t('analysis.strategy.species')}</h3>
                    <ul>
                        ${(plantingSuggestion.suggestedSpecies || []).map(s => `<li><strong>${s.name}</strong>: ${s.reason}</li>`).join('')}
                    </ul>
                    
                    <h3>${t('analysis.strategy.cost')}</h3>
                    <table class="cost-table">
                        <tr><td>${t('analysis.strategy.cost.tree')}</td><td>${plantingSuggestion.estimatedCost?.treeCost}</td></tr>
                        <tr><td>${t('analysis.strategy.cost.watering')}</td><td>${plantingSuggestion.estimatedCost?.wateringCost}</td></tr>
                        <tr><td>${t('analysis.strategy.cost.labor')}</td><td>${plantingSuggestion.estimatedCost?.laborCost}</td></tr>
                        <tr><td>${t('analysis.strategy.cost.other')}</td><td>${plantingSuggestion.estimatedCost?.otherCosts}</td></tr>
                        <tr class="total"><td>${t('analysis.strategy.cost.total')}</td><td>${plantingSuggestion.estimatedCost?.totalCost}</td></tr>
                    </table>
                    
                    <p><strong>${t('analysis.strategy.duration')}</strong>: ${plantingSuggestion.plantingDuration}</p>
                    <p><strong>${t('analysis.strategy.location')}</strong>: ${plantingSuggestion.locationDetails}</p>
                    <p><strong>${t('analysis.strategy.area')}</strong>: ${plantingSuggestion.areaPlanted}</p>

                    <h3>${t('analysis.strategy.techniques')}</h3>
                    <p>${plantingSuggestion.plantingTechniques}</p>
                    
                    <h3>${t('analysis.strategy.care')}</h3>
                    <p>${plantingSuggestion.careAndMaintenance}</p>
                    
                    <h2>${t('analysis.vegetation')}</h2>
                    <p><strong>${t('analysis.vegetation.current')}</strong>: ${vegetationAnalysis.currentVegetation}</p>
                    <p><strong>${t('analysis.vegetation.health')}</strong>: ${vegetationAnalysis.healthStatus}</p>
                    <p><strong>${t('analysis.vegetation.threats')}</strong>: ${vegetationAnalysis.deforestationThreat}</p>
                    
                    <h2>${t('analysis.risk')}</h2>
                    ${(riskAnalysis.naturalDisasters || []).map(r => `<p><strong>${r.type}</strong> (${r.riskLevel}): ${r.mitigation}</p>`).join('')}
                </body>
                </html>
            `;
            
            const blob = new Blob([content], { type: 'text/html;charset=utf-8' });
            saveAs(blob, `GreenHope_Report_${new Date().toISOString().split('T')[0]}.html`);
        } catch (error) {
            console.error('Export failed:', error);
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
            <div className="flex flex-col items-center justify-center py-8 border-t border-slate-700">
                {!crowdfundingCampaign ? (
                    <div className="text-center">
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