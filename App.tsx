import React, { useState, useCallback, useEffect } from 'react';
import SiteHeader from './components/Header';
import GreenHopePage from './components/HomePage';
import AdminPanel from './components/AdminPanel';
import QuotaErrorModal from './components/QuotaErrorModal';
import { useLanguage, PlantingSuggestion, VegetationAnalysis, RiskAnalysis, CrowdfundingCampaign, WeatherData, FullAnalysis } from './types';
import { useToast } from './components/Toast';
import { getFullAnalysis, generateCrowdfundingCampaign, getWeatherData } from './services/geminiService';
import { addSubmission } from './services/adminService';
import SiteFooter from './components/Footer';

type LoadingState = 'full-analysis' | 'campaign' | 'areas' | 'weather' | 'reforestation-need' | false;

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'app' | 'admin'>('app');
  const [isQuotaExhausted, setIsQuotaExhausted] = useState(false);
  const { addToast } = useToast();
  const { language, t } = useLanguage();

  const [selectedLocation, setSelectedLocation] = useState<{ lat: number, lng: number } | null>({ lat: 36.175683, lng: 58.465929 });
  const [fullAnalysis, setFullAnalysis] = useState<FullAnalysis | null>(null);
  const [crowdfundingCampaign, setCrowdfundingCampaign] = useState<CrowdfundingCampaign | null>(null);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState<LoadingState>(false);
  const [error, setError] = useState<string | null>(null);
  const [numberOfTrees, setNumberOfTrees] = useState(100);
  const [reforestationGoal, setReforestationGoal] = useState(10000);
  const [analyzeOnLocationSelect, setAnalyzeOnLocationSelect] = useState(false);
  const [useGrounding, setUseGrounding] = useState(true);
  

  const handleApiError = useCallback((error: unknown) => {
    let message = t('error');
    if (error instanceof Error) {
        const errorMessage = error.message;
        if (errorMessage.toLowerCase().includes('429') || errorMessage.toLowerCase().includes('quota')) {
            setIsQuotaExhausted(true);
            message = t('quotaErrorModal.title');
        } else if (errorMessage.startsWith('RATE_LIMIT_EXCEEDED:')) {
            const seconds = errorMessage.split(':')[1] || 'a few';
            message = t('rateLimitError', { seconds });
        } else if (errorMessage.toLowerCase().includes('rpc failed') || errorMessage.toLowerCase().includes('network')) {
            message = t('networkError');
        }
    }
    addToast(message, 'error');
    setError(message);
  }, [addToast, t]);
  
  const resetState = useCallback(() => {
      setSelectedLocation(null);
      setFullAnalysis(null);
      setCrowdfundingCampaign(null);
      setWeatherData(null);
      setError(null);
  }, []);

  const handleFetchWeather = useCallback(async () => {
    if (!selectedLocation) return;
    setIsLoading('weather');
    try {
        const result = await getWeatherData(selectedLocation, language);
        setWeatherData(result);
        if (result.summary.includes("could not be parsed")) {
            addToast(t('error'), 'error');
        }
    } catch (err) {
        handleApiError(err);
        setWeatherData(null);
    } finally {
        setIsLoading(false);
    }
  }, [selectedLocation, language, handleApiError, addToast, t]);

  const handleFullAnalysis = useCallback(async () => {
    if (!selectedLocation) return;
    setIsLoading('full-analysis');
    setError(null);
    setFullAnalysis(null);
    setWeatherData(null);
    
    try {
      const [analysis, weather] = await Promise.all([
        getFullAnalysis(selectedLocation, language, useGrounding),
        getWeatherData(selectedLocation, language),
      ]);
      setFullAnalysis(analysis);
      setWeatherData(weather);
      if (analysis && analysis.plantingSuggestion) {
        addSubmission('reforestation', selectedLocation, analysis.plantingSuggestion);
      }
    } catch (err) {
      handleApiError(err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedLocation, language, handleApiError, useGrounding]);


  const handleGenerateCampaign = useCallback(async () => {
    if (!fullAnalysis?.plantingSuggestion || !selectedLocation) return;
    setIsLoading('campaign');
    setError(null);
    setCrowdfundingCampaign(null);
    try {
      const campaignSuggestionData: PlantingSuggestion = {
          ...fullAnalysis.plantingSuggestion,
          sources: fullAnalysis.sources,
      };
      const result = await generateCrowdfundingCampaign(campaignSuggestionData, selectedLocation, language);
      setCrowdfundingCampaign(result);
    } catch (err) {
      handleApiError(err);
    } finally {
      setIsLoading(false);
    }
  }, [fullAnalysis, selectedLocation, language, handleApiError]);
  
  const handleLocationSelect = useCallback((location: { lat: number, lng: number }, analyze: boolean = false) => {
    setSelectedLocation(location);
    // Reset analyses for new location
    setFullAnalysis(null);
    setCrowdfundingCampaign(null);
    setWeatherData(null);
    setError(null);
    if (analyze) {
        setAnalyzeOnLocationSelect(true);
    }
  }, []);

  useEffect(() => {
    if (selectedLocation && !fullAnalysis && !isLoading) {
      handleFullAnalysis();
    }
  }, []); // Only run once on mount

  useEffect(() => {
    if (analyzeOnLocationSelect && selectedLocation) {
      handleFullAnalysis();
      setAnalyzeOnLocationSelect(false);
    }
  }, [selectedLocation, analyzeOnLocationSelect, handleFullAnalysis]);
  
  // Unpack the fullAnalysis state to pass down as props, adding the top-level sources to each part
  const plantingSuggestionWithSources: PlantingSuggestion | null = fullAnalysis ? { ...fullAnalysis.plantingSuggestion, sources: fullAnalysis.sources } : null;
  const vegetationAnalysisWithSources: VegetationAnalysis | null = fullAnalysis ? { ...fullAnalysis.vegetationAnalysis, sources: fullAnalysis.sources } : null;
  const riskAnalysisWithSources: RiskAnalysis | null = fullAnalysis ? { ...fullAnalysis.riskAnalysis, sources: fullAnalysis.sources } : null;

  return (
      <div className="text-white font-sans">
        <SiteHeader 
          onLogoClick={resetState} 
          currentView={currentView} 
          onAdminClick={(isAdmin) => setCurrentView(isAdmin ? 'admin' : 'app')} 
        />
        <main>
          {currentView === 'admin' ? (
            <AdminPanel onBackToApp={() => setCurrentView('app')} />
          ) : (
            <GreenHopePage
                onLocationSelect={handleLocationSelect}
                selectedLocation={selectedLocation}
                onFullAnalysis={handleFullAnalysis}
                onGenerateCampaign={handleGenerateCampaign}
                onFetchWeather={handleFetchWeather}
                plantingSuggestion={plantingSuggestionWithSources}
                vegetationAnalysis={vegetationAnalysisWithSources}
                riskAnalysis={riskAnalysisWithSources}
                crowdfundingCampaign={crowdfundingCampaign}
                weatherData={weatherData}
                isLoading={isLoading}
                setIsLoading={setIsLoading}
                error={error}
                numberOfTrees={numberOfTrees}
                onNumberOfTreesChange={setNumberOfTrees}
                reforestationGoal={reforestationGoal}
                onReforestationGoalChange={setReforestationGoal}
                useGrounding={useGrounding}
                onUseGroundingChange={setUseGrounding}
            />
          )}
        </main>
        <SiteFooter />
        <QuotaErrorModal isOpen={isQuotaExhausted} onClose={() => setIsQuotaExhausted(false)} />
      </div>
  );
};

export default App;
