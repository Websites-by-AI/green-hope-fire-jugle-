import React, { useState, useCallback } from 'react';
import { useLanguage, UndergroundWaterAnalysis } from '../types';
import { useToast } from './Toast';
import { getUndergroundWaterAnalysis } from '../services/geminiService';
import { addSubmission } from '../services/adminService';
import Map from './Map';
import MapLegend from './MapLegend';
import { SectionCard } from './AnalysisResults';

const UndergroundWaterPage: React.FC = () => {
    const { t, language } = useLanguage();
    const { addToast } = useToast();
    const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [analysis, setAnalysis] = useState<UndergroundWaterAnalysis | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleAnalysis = useCallback(async () => {
        if (!selectedLocation) {
            addToast('Please select a location on the map.', 'info');
            return;
        }
        setIsLoading(true);
        setError(null);
        setAnalysis(null);
        try {
            const result = await getUndergroundWaterAnalysis(selectedLocation, language);
            setAnalysis(result);
            if (result) {
                addSubmission('water', selectedLocation, result);
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : t('error');
            setError(errorMessage);
            addToast(errorMessage, 'error');
        } finally {
            setIsLoading(false);
        }
    }, [selectedLocation, language, addToast, t]);

    return (
        <div className="max-w-6xl mx-auto">
             <div className="text-center mb-10">
                <h2 className="text-3xl font-bold text-white mb-4">
                     <i className="fa-solid fa-water text-blue-400 mr-2 rtl:mr-0 rtl:ml-2"></i>
                    {t('water.title')}
                </h2>
                <p className="max-w-2xl mx-auto text-lg text-slate-300">
                    {t('water.subtitle')}
                </p>
            </div>

            <div className="relative w-full h-96 bg-slate-800 rounded-xl overflow-hidden shadow-2xl border border-slate-600 mb-8">
                <Map 
                    selectedLocation={selectedLocation}
                    onLocationSelect={setSelectedLocation}
                />
                <MapLegend items={[
                    { label: t('home.map.selected'), color: 'bg-blue-500' }
                ]} />
            </div>

            <div className="flex justify-center mb-12">
                <button
                    onClick={handleAnalysis}
                    disabled={!selectedLocation || isLoading}
                    className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full shadow-lg transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                     {isLoading ? (
                         <>
                           <i className="fas fa-circle-notch fa-spin mr-2 rtl:mr-0 rtl:ml-2"></i>
                           {t('home.analyzingBtn')}
                         </>
                     ) : (
                         <>
                            <i className="fas fa-search-location mr-2 rtl:mr-0 rtl:ml-2"></i>
                            {t('water.btn.analyze')}
                         </>
                     )}
                </button>
            </div>

            {error && (
                <div className="mb-8 p-4 bg-red-900/20 border border-red-500/50 rounded-lg text-center text-red-200">
                    {error}
                </div>
            )}

            {analysis && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                    <SectionCard title={t('water.depth')} icon="fa-ruler-vertical">
                         <div className="text-3xl font-bold text-blue-300 mb-2">{analysis.estimatedDepth}</div>
                         <p className="text-slate-400 text-sm">Target depth for drilling or extraction.</p>
                    </SectionCard>

                    <SectionCard title={t('water.aquifer')} icon="fa-layer-group">
                         <div className="text-xl font-medium text-white mb-2">{analysis.aquiferType}</div>
                         <div className="mt-4">
                            <span className="text-xs text-slate-500 uppercase block mb-1">{t('water.yield')}</span>
                            <span className="text-emerald-300 font-mono">{analysis.estimatedYield}</span>
                         </div>
                    </SectionCard>

                    <SectionCard title={t('water.quality')} icon="fa-flask">
                         <p className="text-lg text-white mb-4">{analysis.waterQuality}</p>
                         <div className="grid grid-cols-2 gap-4">
                             <div>
                                 <span className="text-xs text-slate-500 uppercase block mb-1">{t('water.recharge')}</span>
                                 <span className="text-sm text-slate-300">{analysis.rechargePotential}</span>
                             </div>
                             <div>
                                 <span className="text-xs text-slate-500 uppercase block mb-1">{t('water.sustainability')}</span>
                                 <span className="text-sm text-slate-300">{analysis.sustainability}</span>
                             </div>
                         </div>
                    </SectionCard>

                    <SectionCard title={t('water.sources')} icon="fa-book">
                        <ul className="list-disc list-inside space-y-2 text-sm text-slate-300">
                            {analysis.academicSources && analysis.academicSources.length > 0 ? (
                                analysis.academicSources.map((source, idx) => (
                                    <li key={idx} className="hover:text-white transition-colors">{source}</li>
                                ))
                            ) : (
                                <li className="italic text-slate-500">No specific academic sources cited.</li>
                            )}
                        </ul>
                    </SectionCard>
                </div>
            )}
        </div>
    );
};

export default UndergroundWaterPage;