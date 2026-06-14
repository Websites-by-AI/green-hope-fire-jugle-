import React, { useState, useCallback } from 'react';
import { useLanguage, Grant, Source } from '../types';
import { useToast } from './Toast';
import { findGrants } from '../services/geminiService';

const GrantFinderPage: React.FC = () => {
    const { t, language } = useLanguage();
    const { addToast } = useToast();
    const [description, setDescription] = useState('');
    const [grants, setGrants] = useState<Grant[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [sources, setSources] = useState<Source[]>([]);

    const handleFindGrants = useCallback(async () => {
        if (!description) {
            addToast('Please enter a project description.', 'info');
            return;
        }
        setIsLoading(true);
        setError(null);
        setGrants([]);
        setSources([]);
        try {
            const result = await findGrants(description, language);
            setGrants(result.grants || []);
            if (result.sources) {
                setSources(result.sources);
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : t('error');
            setError(errorMessage);
            addToast(errorMessage, 'error');
        } finally {
            setIsLoading(false);
        }
    }, [description, language, addToast, t]);

    return (
        <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
                <i className="fa-solid fa-hand-holding-dollar text-5xl text-emerald-400 mb-4"></i>
                <h2 className="text-3xl font-bold text-white">Grant Finder</h2>
                <p className="mt-2 text-slate-300">Discover funding opportunities for your reforestation project.</p>
            </div>

            <div className="bg-slate-800/50 p-6 rounded-lg border border-white/10">
                <div className="grid grid-cols-1 gap-4 items-end">
                    <div>
                        <label htmlFor="description-textarea" className="block text-sm font-medium text-slate-300 mb-2">
                            Project Description
                        </label>
                        <textarea
                            id="description-textarea"
                            rows={4}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full bg-slate-900/50 border border-slate-600 rounded-md py-2 px-3 text-white focus:ring-emerald-500 focus:border-emerald-500"
                            placeholder="e.g., A community-led project to reforest 10 hectares of degraded land in coastal Kenya with native mangrove species."
                        />
                    </div>
                    <button
                        onClick={handleFindGrants}
                        disabled={isLoading}
                        className="w-full py-2 px-4 bg-emerald-600 text-white font-semibold rounded-md hover:bg-emerald-700 transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                        {isLoading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-dashed rounded-full animate-spin border-white mr-2 rtl:ml-2"></div>
                                {t('loading')}
                            </>
                        ) : 'Find Grants'}
                    </button>
                </div>
            </div>

            <div className="mt-8">
                {error && <div className="text-red-400 p-4 bg-red-900/50 rounded-md text-center">{error}</div>}

                {grants.length > 0 && (
                     <div className="border-t border-slate-700 pt-8 mt-8">
                        <h3 className="text-2xl font-bold text-center text-white mb-6">Funding Opportunities Found</h3>
                        <div className="space-y-4">
                            {grants.map((grant, index) => (
                                <div key={index} className="bg-slate-800/50 rounded-lg border border-white/10 p-5 animate-fade-in" style={{animationDelay: `${index * 100}ms`}}>
                                     <h4 className="text-xl font-bold text-emerald-300 mb-2">{grant.name}</h4>
                                     <p className="text-sm text-slate-300 mb-3">{grant.description}</p>
                                     <div className="flex justify-between items-center flex-wrap gap-2">
                                         <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-amber-300 bg-amber-900/50">
                                             Deadline: {grant.deadline}
                                         </span>
                                         <a href={grant.link} target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:text-emerald-300 text-sm font-semibold">
                                            Learn More &rarr;
                                         </a>
                                     </div>
                                 </div>
                            ))}
                        </div>
                    </div>
                )}
                 {sources.length > 0 && (
                    <div className="mt-6 text-xs text-slate-400 border-t border-slate-700 pt-4">
                        <h4 className="font-bold mb-2">Sources:</h4>
                        <ul className="list-disc list-inside space-y-1">
                            {sources.map((source, index) => (
                                <li key={index} className="truncate">
                                    <a href={source.uri} target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400" title={source.uri}>
                                        {source.title || source.uri}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                 )}
            </div>
        </div>
    );
};

export default GrantFinderPage;
