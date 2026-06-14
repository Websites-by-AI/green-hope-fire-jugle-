import React, { useState } from 'react';
import { PlantingSuggestion, VegetationAnalysis, RiskAnalysis, CrowdfundingCampaign, WeatherData, useLanguage } from '../types';
import HomeGardeningPage from './HomeGardeningPage';
import GrantFinderPage from './GrantFinderPage';
import UndergroundWaterPage from './UndergroundWaterPage';
import SmartFireSensePage from './SmartFireSensePage';
import MapLegend from './MapLegend';
import Map from './Map';
import AnalysisResults from './AnalysisResults';

interface GreenHopePageProps {
    onLocationSelect: (location: { lat: number; lng: number }, analyze: boolean) => void;
    selectedLocation: { lat: number; lng: number } | null;
    onFullAnalysis: () => void;
    onGenerateCampaign: () => void;
    onFetchWeather: () => void;
    plantingSuggestion: PlantingSuggestion | null;
    vegetationAnalysis: VegetationAnalysis | null;
    riskAnalysis: RiskAnalysis | null;
    crowdfundingCampaign: CrowdfundingCampaign | null;
    weatherData: WeatherData | null;
    isLoading: 'full-analysis' | 'campaign' | 'areas' | 'weather' | 'reforestation-need' | false;
    setIsLoading: (state: 'full-analysis' | 'campaign' | 'areas' | 'weather' | 'reforestation-need' | false) => void;
    error: string | null;
    useGrounding: boolean;
    onUseGroundingChange: (use: boolean) => void;
    numberOfTrees: number;
    onNumberOfTreesChange: (num: number) => void;
    reforestationGoal: number;
    onReforestationGoalChange: (num: number) => void;
}

const GreenHopePage: React.FC<GreenHopePageProps> = (props) => {
    const { t } = useLanguage();
    const [activeTab, setActiveTab] = useState('smartfiresense');

    const getEstimatedRadius = (areaStr: string | undefined): number | undefined => {
        if (!areaStr) return undefined;
        // Try to find a number in the string
        const match = areaStr.match(/(\d+(\.\d+)?)/);
        if (!match) return 50; // Default 50m if we can't parse but have a string
        
        const value = parseFloat(match[1]);
        if (areaStr.toLowerCase().includes('hectare')) {
            // Area = PI * r^2 => r = sqrt(Area / PI)
            // 1 hectare = 10,000 m^2
            return Math.sqrt((value * 10000) / Math.PI);
        }
        if (areaStr.toLowerCase().includes('square meter') || areaStr.toLowerCase().includes('m2') || areaStr.toLowerCase().includes('متر مربع')) {
            return Math.sqrt(value / Math.PI);
        }
        if (areaStr.toLowerCase().includes('acre')) {
            // 1 acre = 4046.86 m^2
            return Math.sqrt((value * 4046.86) / Math.PI);
        }
        return 50; // Default fallback
    };

    const areaRadius = props.plantingSuggestion ? getEstimatedRadius(props.plantingSuggestion.areaPlanted) : undefined;

    const renderReforestationTab = () => (
        <div className="animate-fade-in">
            <div className="text-center mb-10">
                <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-4">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-300">
                        {t('home.title')}
                    </span>
                </h1>
                <p className="max-w-2xl mx-auto text-lg text-slate-300">
                    {t('home.subtitle')}
                </p>
            </div>
            
            <div className="relative w-full mb-8">
                <Map 
                    selectedLocation={props.selectedLocation}
                    onLocationSelect={(loc) => props.onLocationSelect(loc, false)}
                    areaRadius={areaRadius}
                />
                <MapLegend items={[
                    { label: t('home.map.selected'), color: 'bg-blue-500' },
                    { label: t('home.map.analyzed'), color: 'bg-emerald-500' }
                ]} />
            </div>

            <div className="bg-slate-800/50 rounded-xl p-6 border border-white/10 backdrop-blur-sm mb-12">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                         <label className="flex items-center cursor-pointer group">
                             <div className="relative">
                                <input 
                                    type="checkbox" 
                                    className="sr-only" 
                                    checked={props.useGrounding} 
                                    onChange={(e) => props.onUseGroundingChange(e.target.checked)} 
                                />
                                <div className={`block w-12 h-7 rounded-full transition-colors ${props.useGrounding ? 'bg-emerald-500' : 'bg-slate-600'}`}></div>
                                <div className={`absolute left-1 top-1 bg-white w-5 h-5 rounded-full transition-transform ${props.useGrounding ? 'translate-x-5' : ''}`}></div>
                            </div>
                            <div className="ml-3 text-slate-300 text-sm font-medium group-hover:text-white transition-colors">
                                {t('home.enableGrounding')}
                                <span className="block text-xs text-slate-500 font-normal">{t('home.groundingSub')}</span>
                            </div>
                        </label>
                    </div>

                    <div className="flex flex-wrap gap-3 justify-center">
                         <button
                            onClick={() => props.onLocationSelect({ lat: 36.175683, lng: 58.465929 }, true)}
                            disabled={!!props.isLoading}
                            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm font-semibold rounded-lg transition disabled:opacity-50"
                         >
                            {t('home.sampleLocation')}
                         </button>
                         <button
                            onClick={props.onFullAnalysis}
                            disabled={!props.selectedLocation || !!props.isLoading}
                            className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-lg shadow-lg shadow-emerald-500/20 transition transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center"
                         >
                             {props.isLoading === 'full-analysis' ? (
                                 <>
                                   <i className="fas fa-circle-notch fa-spin mr-2 rtl:mr-0 rtl:ml-2"></i>
                                   {t('home.analyzingBtn')}
                                 </>
                             ) : (
                                 <>
                                    <i className="fas fa-wand-magic-sparkles mr-2 rtl:mr-0 rtl:ml-2"></i>
                                    {t('home.analyzeBtn')}
                                 </>
                             )}
                        </button>
                    </div>
                </div>
            </div>

            {props.error && (
                <div className="mb-8 p-4 bg-red-900/20 border border-red-500/50 rounded-lg flex items-start gap-3 text-red-200">
                    <i className="fas fa-circle-exclamation mt-1"></i>
                    <div>
                        <h4 className="font-bold">{t('home.analysisFailed')}</h4>
                        <p className="text-sm opacity-80">{props.error}</p>
                    </div>
                </div>
            )}

            {/* Analysis Results */}
            {props.plantingSuggestion && props.vegetationAnalysis && props.riskAnalysis && (
                <AnalysisResults 
                    plantingSuggestion={props.plantingSuggestion}
                    vegetationAnalysis={props.vegetationAnalysis}
                    riskAnalysis={props.riskAnalysis}
                    weatherData={props.weatherData}
                    crowdfundingCampaign={props.crowdfundingCampaign}
                    onGenerateCampaign={props.onGenerateCampaign}
                    isGeneratingCampaign={props.isLoading === 'campaign'}
                />
            )}
        </div>
    );

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
            <div className="mb-8 border-b border-slate-700 flex justify-center overflow-x-auto">
                <nav className="-mb-px flex space-x-8 rtl:space-x-reverse" aria-label="Tabs">
                    <button
                        onClick={() => setActiveTab('reforestation')}
                        className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-all duration-200 ${activeTab === 'reforestation' ? 'border-emerald-500 text-emerald-400 scale-105' : 'border-transparent text-slate-400 hover:text-white hover:border-slate-500'}`}
                    >
                        <i className="fas fa-tree mr-2 rtl:ml-2"></i>
                        {t('home.tabs.reforestation')}
                    </button>
                    <button
                        onClick={() => setActiveTab('smartfiresense')}
                        className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-all duration-200 ${activeTab === 'smartfiresense' ? 'border-rose-500 text-rose-455 scale-105' : 'border-transparent text-slate-400 hover:text-white hover:border-slate-500'}`}
                    >
                        <i className="fas fa-fire mr-2 rtl:ml-2 text-rose-500"></i>
                        {t('home.tabs.smartFireSense')}
                    </button>
                     <button
                        onClick={() => setActiveTab('water')}
                        className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-all duration-200 ${activeTab === 'water' ? 'border-blue-500 text-blue-400 scale-105' : 'border-transparent text-slate-400 hover:text-white hover:border-slate-500'}`}
                    >
                        <i className="fas fa-water mr-2 rtl:ml-2"></i>
                        {t('home.tabs.water')}
                    </button>
                    <button
                        onClick={() => setActiveTab('gardening')}
                        className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-all duration-200 ${activeTab === 'gardening' ? 'border-emerald-500 text-emerald-400 scale-105' : 'border-transparent text-slate-400 hover:text-white hover:border-slate-500'}`}
                    >
                        <i className="fas fa-seedling mr-2 rtl:ml-2"></i>
                        {t('home.tabs.gardening')}
                    </button>
                    <button
                        onClick={() => setActiveTab('grants')}
                        className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-all duration-200 ${activeTab === 'grants' ? 'border-emerald-500 text-emerald-400 scale-105' : 'border-transparent text-slate-400 hover:text-white hover:border-slate-500'}`}
                    >
                        <i className="fas fa-hand-holding-dollar mr-2 rtl:ml-2"></i>
                        {t('home.tabs.grants')}
                    </button>
                </nav>
            </div>
            
            <div className="min-h-[500px]">
                {activeTab === 'reforestation' && renderReforestationTab()}
                {activeTab === 'smartfiresense' && <SmartFireSensePage />}
                {activeTab === 'water' && <UndergroundWaterPage />}
                {activeTab === 'gardening' && <HomeGardeningPage />}
                {activeTab === 'grants' && <GrantFinderPage />}
            </div>
        </div>
    );
};

export default GreenHopePage;