import React, { useState } from 'react';
import { PlantingSuggestion, VegetationAnalysis, RiskAnalysis, WeatherData, CrowdfundingCampaign, useLanguage } from '../types';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Robust phonetic and key term translator to allow standard Helvetica PDF rendering in non-English contexts without crashing
const cleanPDFText = (text: string | null | undefined): string => {
    if (!text) return 'N/A';
    
    const dict: { [key: string]: string } = {
        'باران': 'Rain',
        'برف': 'Snow',
        'کولاک': 'Blizzard',
        'گرما': 'Heat',
        'سرما': 'Cold',
        'طوفان': 'Storm',
        'خشک': 'Dry',
        'ابری': 'Cloudy',
        'آفتابی': 'Sunny',
        'معتدل': 'Moderate',
        'نرمال': 'Normal',
        'ریسک': 'Risk',
        'بحرانی': 'Critical',
        'بالا': 'High',
        'متوسط': 'Medium',
        'کم': 'Low',
        'سرو': 'Cypress',
        'بلوط': 'Oak',
        'کاج': 'Pine',
        'بادام': 'Almond',
        'پسته': 'Pistachio',
        'وحشی': 'Wild',
        'بومی': 'Native',
        'جنگل': 'Forest',
        'درخت': 'Tree',
        'کاشت': 'Planting',
        'بذر': 'Seeds',
        'آبخوان': 'Aquifer',
        'زاگرس': 'Zagros',
        'البرز': 'Alborz',
        'حریق': 'Fire',
        'آتش': 'Fire',
        'هزینه': 'Cost',
        'مجموع': 'Total',
        'آبپاشی': 'Watering',
        'کارگر': 'Labor',
        'تکنیک': 'Techniques',
        'گونه': 'Species',
        'پیشنهادی': 'Suggested',
        'پایش': 'Monitoring',
        'پتنت': 'Patent',
        'ایده': 'Idea',
        'امید': 'Hope',
        'سبز': 'Green',
        'تومان': 'Toman',
        'ریال': 'Rial',
        'دلار': 'USD',
        'روز': 'Days',
        'ماه': 'Months',
        'هفته': 'Weeks',
        'سال': 'Years',
        'متر': 'Meters',
        'هکتار': 'Hectares',
        'عمق': 'Depth',
        'دما': 'Temperature',
        'بارندگی': 'Precipitation',
        'پوشش': 'Cover',
        'گیاهی': 'Vegetation',
        'سلامت': 'Health',
        'تهدید': 'Threat',
        'تخریب': 'Degradation',
        'سیل': 'Flood',
        'زلزله': 'Earthquake',
        'رانش': 'Landslide',
        'آفات': 'Pests',
        'بیماری': 'Diseases',
        'انسان': 'Human',
        'طبیعت': 'Nature',
        'پایدار': 'Sustainable',
        'توسعه': 'Development',
        'حفاظت': 'Conservation',
    };

    let processed = text;
    // Replace dictionary terms
    Object.keys(dict).forEach(key => {
        const regex = new RegExp(key, 'g');
        processed = processed.replace(regex, dict[key]);
    });

    const latinMap: { [key: string]: string } = {
        'آ': 'A', 'ا': 'a', 'ب': 'b', 'پ': 'p', 'ت': 't', 'ث': 's', 'ج': 'j', 'چ': 'ch', 'ح': 'h', 'خ': 'kh',
        'د': 'd', 'ذ': 'z', 'ر': 'r', 'ز': 'z', 'ژ': 'zh', 'س': 's', 'ش': 'sh', 'ص': 's', 'ض': 'z', 'ط': 't',
        'ظ': 'z', 'ع': 'a', 'غ': 'gh', 'ف': 'f', 'ق': 'gh', 'ک': 'k', 'گ': 'g', 'ل': 'l', 'م': 'm', 'ن': 'n',
        'و': 'v', 'ه': 'h', 'ی': 'y', 'ئ': 'e', 'ي': 'y', 'ك': 'k', 'ة': 'h', 'ء': '\'', 'ٌ': '', 'ً': '', 'ّ': '',
        '۰': '0', '۱': '1', '۲': '2', '۳': '3', '۴': '4', '۵': '5', '۶': '6', '۷': '7', '۸': '8', '۹': '9',
        '،': ',', '؛': ';', '؟': '?'
    };

    const turkishMap: { [key: string]: string } = {
        'ç': 'c', 'Ç': 'C', 'ğ': 'g', 'Ğ': 'G', 'ı': 'i', 'İ': 'I', 'ö': 'o', 'Ö': 'O', 'ş': 's', 'Ş': 'S', 'ü': 'u', 'Ü': 'U'
    };

    let result = '';
    for (let i = 0; i < processed.length; i++) {
        const char = processed[i];
        if (latinMap[char] !== undefined) {
            result += latinMap[char];
        } else if (turkishMap[char] !== undefined) {
            result += turkishMap[char];
        } else {
            if (char.charCodeAt(0) <= 127) {
                result += char;
            } else {
                result += ' ';
            }
        }
    }

    return result.replace(/\s+/g, ' ').trim();
};

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
  selectedLocation?: { lat: number; lng: number } | null;
}

const AnalysisResults: React.FC<AnalysisResultsProps> = ({ 
    plantingSuggestion, vegetationAnalysis, riskAnalysis, weatherData, 
    crowdfundingCampaign, onGenerateCampaign, isGeneratingCampaign,
    selectedLocation
}) => {
    const { t, language } = useLanguage();
    const [showMoreDetails, setShowMoreDetails] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [copiedMD, setCopiedMD] = useState(false);
    const [copiedJSON, setCopiedJSON] = useState(false);


    const getMarkdownTemplate = () => {
        const specs = (plantingSuggestion.suggestedSpecies || []).map(s => `- **${s.name}**: ${s.reason}`).join('\n');
        const risks = (riskAnalysis.naturalDisasters || []).map(r => `- **${r.type}** (${r.riskLevel}): Mitigation: ${r.mitigation}`).join('\n');
        const dominant = (vegetationAnalysis.dominantSpecies || []).join(', ');

        return `# ${t('header.title')} - ${t('home.tabs.reforestation')}
        
## ${t('analysis.weather')}
- **Summary**: ${weatherData?.summary || 'N/A'}
- **${t('analysis.weather.temp')}**: ${weatherData?.temperature || 'N/A'}
- **${t('analysis.weather.precip')}**: ${weatherData?.precipitation || 'N/A'}
- **${t('analysis.weather.wind')}**: ${weatherData?.wind || 'N/A'}

## ${t('analysis.vegetation')}
- **${t('analysis.vegetation.current')}**: ${vegetationAnalysis.currentVegetation}
- **${t('analysis.vegetation.dominant')}**: ${dominant}
- **${t('analysis.vegetation.health')}**: ${vegetationAnalysis.healthStatus}
- **${t('analysis.vegetation.threats')}**: ${vegetationAnalysis.deforestationThreat}

## ${t('analysis.strategy')}
### ${t('analysis.strategy.species')}
${specs}

### ${t('analysis.strategy.techniques')}
${plantingSuggestion.plantingTechniques}

### ${t('analysis.strategy.benefits')}
${plantingSuggestion.environmentalBenefits}

### ${t('analysis.strategy.cost')}
- ${t('analysis.strategy.cost.tree')}: ${plantingSuggestion.estimatedCost?.treeCost || 'N/A'}
- ${t('analysis.strategy.cost.watering')}: ${plantingSuggestion.estimatedCost?.wateringCost || 'N/A'}
- ${t('analysis.strategy.cost.labor')}: ${plantingSuggestion.estimatedCost?.laborCost || 'N/A'}
- ${t('analysis.strategy.cost.other')}: ${plantingSuggestion.estimatedCost?.otherCosts || 'N/A'}
- **${t('analysis.strategy.cost.total')}**: ${plantingSuggestion.estimatedCost?.totalCost || 'N/A'}

- **${t('analysis.strategy.duration')}**: ${plantingSuggestion.plantingDuration || 'N/A'}
- **${t('analysis.strategy.area')}**: ${plantingSuggestion.areaPlanted || 'N/A'}
- **${t('analysis.strategy.location')}**: ${plantingSuggestion.locationDetails || 'N/A'}

### ${t('analysis.strategy.care')}
${plantingSuggestion.careAndMaintenance}

## ${t('analysis.risk')}
### ${t('analysis.risk.natural')}
${risks}

### ${t('analysis.risk.human')}
${riskAnalysis.humanActivityImpact}

### ${t('analysis.risk.pests')}
${riskAnalysis.pestAndDiseaseThreats}
`;
    };

    const getJSONTemplate = () => {
        return JSON.stringify({
            title: `${t('header.title')} - ${t('home.tabs.reforestation')}`,
            weather: weatherData,
            vegetation: {
                current: vegetationAnalysis.currentVegetation,
                dominantSpecies: vegetationAnalysis.dominantSpecies,
                health: vegetationAnalysis.healthStatus,
                threats: vegetationAnalysis.deforestationThreat
            },
            strategy: {
                species: plantingSuggestion.suggestedSpecies,
                techniques: plantingSuggestion.plantingTechniques,
                benefits: plantingSuggestion.environmentalBenefits,
                costs: plantingSuggestion.estimatedCost,
                duration: plantingSuggestion.plantingDuration,
                area: plantingSuggestion.areaPlanted,
                location: plantingSuggestion.locationDetails,
                care: plantingSuggestion.careAndMaintenance
            },
            risks: {
                naturalDisasters: riskAnalysis.naturalDisasters,
                humanImpact: riskAnalysis.humanActivityImpact,
                pestsAndDiseases: riskAnalysis.pestAndDiseaseThreats
            }
        }, null, 2);
    };

    const handleCopyMarkdown = () => {
        navigator.clipboard.writeText(getMarkdownTemplate());
        setCopiedMD(true);
        setTimeout(() => setCopiedMD(false), 2500);
    };

    const handleCopyJSON = () => {
        navigator.clipboard.writeText(getJSONTemplate());
        setCopiedJSON(true);
        setTimeout(() => setCopiedJSON(false), 2500);
    };

    const getCopyMDLabel = () => {
        if (language === 'fa') return copiedMD ? 'مارک‌داون کپی شد!' : 'کپی مارک‌داون (Markdown)';
        if (language === 'ar') return copiedMD ? 'تم النسخ!' : 'نسخ Markdown';
        return copiedMD ? 'Markdown Copied!' : 'Copy Markdown';
    };

    const getCopyJSONLabel = () => {
        if (language === 'fa') return copiedJSON ? 'JSON کپی شد!' : 'کپی جی‌سان (JSON)';
        if (language === 'ar') return copiedJSON ? 'تم النسخ!' : 'نسخ JSON';
        return copiedJSON ? 'JSON Copied!' : 'Copy JSON';
    };

    const handleDownloadPDF = async () => {
        setIsExporting(true);
        try {
            const doc = new jsPDF();
            
            // Draw branding header bar (Emerald Green Theme)
            doc.setFillColor(16, 185, 129); // emerald-500
            doc.rect(0, 0, 210, 40, 'F');
            
            // Overlay thin accent bar (Teal)
            doc.setFillColor(15, 118, 110); // teal-700
            doc.rect(0, 40, 210, 4, 'F');

            // Header text
            doc.setTextColor(255, 255, 255);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(22);
            doc.text('GREENHOPE GUARDIAN ECO-REPORT', 14, 20);
            
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(11);
            doc.setTextColor(204, 251, 241); // cyan-100
            doc.text('Autonomous Satellite Surveillance & Reforestation Blueprint', 14, 28);
            doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 35);
            
            // Section coordinates / Metadata Panel
            doc.setTextColor(30, 41, 59); // slate-800
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(14);
            doc.text('1. REPORT METADATA & FIELD COORDINATES', 14, 55);
            
            // Create field details metadata table
            const latVal = selectedLocation ? selectedLocation.lat.toFixed(6) : '36.175683';
            const lngVal = selectedLocation ? selectedLocation.lng.toFixed(6) : '58.465929';
            const cleanLocationDetails = cleanPDFText(plantingSuggestion.locationDetails);
            const cleanAreaPlanted = cleanPDFText(plantingSuggestion.areaPlanted);
            const cleanDuration = cleanPDFText(plantingSuggestion.plantingDuration);

            (doc as any).autoTable({
                startY: 60,
                theme: 'striped',
                headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontStyle: 'bold' },
                bodyStyles: { font: 'helvetica', fontSize: 9 },
                head: [['Metadata Field', 'Value / Details']],
                body: [
                    ['Target Coordinate (latitude)', latVal],
                    ['Target Coordinate (longitude)', lngVal],
                    ['Designated Region & Watershed', cleanLocationDetails],
                    ['Target Planting Coverage Area', cleanAreaPlanted],
                    ['Planned Reforestation Duration', cleanDuration]
                ]
            });

            // 2. Weather & Climate Profile Section
            let currentY = (doc as any).previousAutoTable.finalY + 12;
            doc.setTextColor(30, 41, 59);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(14);
            doc.text('2. WEATHER METRICS & MICROCLIMATE PROFILE', 14, currentY);
            
            const cleanSummary = weatherData ? cleanPDFText(weatherData.summary) : 'N/A';
            const cleanTemp = weatherData ? cleanPDFText(weatherData.temperature) : 'N/A';
            const cleanPrecip = weatherData ? cleanPDFText(weatherData.precipitation) : 'N/A';
            const cleanWind = weatherData ? cleanPDFText(weatherData.wind) : 'N/A';

            (doc as any).autoTable({
                startY: currentY + 5,
                theme: 'striped',
                headStyles: { fillColor: [15, 118, 110], textColor: [255, 255, 255], fontStyle: 'bold' },
                bodyStyles: { font: 'helvetica', fontSize: 9 },
                head: [['Climate Parameter', 'Metric Assessment / Observations']],
                body: [
                    ['Microclimate Summary Indicator', cleanSummary],
                    ['Ambient Air Temperature Forecast', cleanTemp],
                    ['Historical / Expected Precipitation', cleanPrecip],
                    ['Winds & Local Airflow Dynamics', cleanWind]
                ]
            });

            // 3. Existing Soil & Canopy Vegetation Analysis Section
            currentY = (doc as any).previousAutoTable.finalY + 12;
            doc.setTextColor(30, 41, 59);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(14);
            doc.text('3. CANOPY HEALTH & VEGETATION DIAGNOSTICS', 14, currentY);

            const cleanCurrentVeg = cleanPDFText(vegetationAnalysis.currentVegetation);
            const cleanVegHealth = cleanPDFText(vegetationAnalysis.healthStatus);
            const cleanVegThreats = cleanPDFText(vegetationAnalysis.deforestationThreat);
            const cleanDominant = cleanPDFText((vegetationAnalysis.dominantSpecies || []).join(', '));

            (doc as any).autoTable({
                startY: currentY + 5,
                theme: 'striped',
                headStyles: { fillColor: [15, 118, 110], textColor: [255, 255, 255], fontStyle: 'bold' },
                bodyStyles: { font: 'helvetica', fontSize: 9 },
                head: [['Vegetor Metric', 'Analytical Diagnostics']],
                body: [
                    ['Current Ground Vegetation Cover', cleanCurrentVeg],
                    ['Canopy & Soil Biological Health', cleanVegHealth],
                    ['Recorded Degradation / Deforestation Threat', cleanVegThreats],
                    ['Predefined / Dominant Ecosystem Species', cleanDominant]
                ]
            });

            // Page Break for strategies, costs, and risks
            doc.addPage();
            
            // Beautiful green top banner on secondary pages
            doc.setFillColor(15, 118, 110);
            doc.rect(0, 0, 210, 15, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            doc.text('GREENHOPE GUARDIAN ECO-REPORT | Page 2', 14, 10);

            // 4. Strategic Planting blueprint
            doc.setTextColor(30, 41, 59);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(14);
            doc.text('4. REFORESTATION BLUEPRINT & TAXONOMY PLAN', 14, 28);

            const speciesList = (plantingSuggestion.suggestedSpecies || []).map(s => [
                cleanPDFText(s.name), 
                cleanPDFText(s.reason)
            ]);

            (doc as any).autoTable({
                startY: 33,
                theme: 'striped',
                headStyles: { fillColor: [15, 118, 110], textColor: [255, 255, 255], fontStyle: 'bold' },
                bodyStyles: { font: 'helvetica', fontSize: 9 },
                head: [['Native Bio-Species', 'Structural / Environmental Planting Reason']],
                body: speciesList.length > 0 ? speciesList : [['No Species Suggestions Available', 'N/A']]
            });

            // Techniques, Benefits, Care
            currentY = (doc as any).previousAutoTable.finalY + 10;
            const cleanTechniques = cleanPDFText(plantingSuggestion.plantingTechniques);
            const cleanBenefits = cleanPDFText(plantingSuggestion.environmentalBenefits);
            const cleanCare = cleanPDFText(plantingSuggestion.careAndMaintenance);

            (doc as any).autoTable({
                startY: currentY,
                theme: 'grid',
                headStyles: { fillColor: [15, 118, 110], textColor: [255, 255, 255], fontStyle: 'bold' },
                bodyStyles: { font: 'helvetica', fontSize: 9 },
                head: [['Field Protocol', 'Execution Guidelines']],
                body: [
                    ['Specialized Re-planting Techniques', cleanTechniques],
                    ['Target Ecosystem Benefits', cleanBenefits],
                    ['Long-term Care & Irrigation Maintenance Plan', cleanCare]
                ]
            });

            // 5. Financial Forecast & Cost Analytics Section
            currentY = (doc as any).previousAutoTable.finalY + 12;
            doc.setTextColor(30, 41, 59);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(14);
            doc.text('5. THEMED BUDGET FORECAST & DEPLOYMENT COST', 14, currentY);

            const treeCost = cleanPDFText(plantingSuggestion.estimatedCost?.treeCost);
            const waterCost = cleanPDFText(plantingSuggestion.estimatedCost?.wateringCost);
            const laborCost = cleanPDFText(plantingSuggestion.estimatedCost?.laborCost);
            const otherCosts = cleanPDFText(plantingSuggestion.estimatedCost?.otherCosts);
            const totalCost = cleanPDFText(plantingSuggestion.estimatedCost?.totalCost);

            (doc as any).autoTable({
                startY: currentY + 5,
                theme: 'striped',
                headStyles: { fillColor: [15, 118, 110], textColor: [255, 255, 255], fontStyle: 'bold' },
                bodyStyles: { font: 'helvetica', fontSize: 9 },
                head: [['Budget Categorization', 'Projected Costs / Allocation Details']],
                body: [
                    ['Saplings / Native Seeds Cost', treeCost],
                    ['Primary Watering & Aquifer Irrigation Cost', waterCost],
                    ['Local Community Labor and Training Cost', laborCost],
                    ['Operations, Logistics & Satellite Supervision Cost', otherCosts],
                    ['TOTAL REFORESTATION CAPITAL NEEDED', totalCost]
                ]
            });

            // 6. Natural & Anthropogenic Risk Assessment Section
            currentY = (doc as any).previousAutoTable.finalY + 12;
            
            // Check if Y is too close to bottom of page (e.g. 250+) 
            if (currentY > 240) {
                doc.addPage();
                doc.setFillColor(15, 118, 110);
                doc.rect(0, 0, 210, 15, 'F');
                doc.setTextColor(255, 255, 255);
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(10);
                doc.text('GREENHOPE GUARDIAN ECO-REPORT | Page 3', 14, 10);
                currentY = 28;
            }

            doc.setTextColor(30, 41, 59);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(14);
            doc.text('6. COMPREHENSIVE ECO-RISK ASSESSMENT', 14, currentY);

            const risksBody = (riskAnalysis.naturalDisasters || []).map(r => [
                cleanPDFText(r.type),
                cleanPDFText(r.riskLevel),
                cleanPDFText(r.mitigation)
            ]);

            (doc as any).autoTable({
                startY: currentY + 5,
                theme: 'striped',
                headStyles: { fillColor: [15, 118, 110], textColor: [255, 255, 255], fontStyle: 'bold' },
                bodyStyles: { font: 'helvetica', fontSize: 9 },
                head: [['Identified Hazard', 'Risk Level', 'Active Mitigation Standard Protocol']],
                body: risksBody.length > 0 ? risksBody : [['No natural risks cataloged', 'N/A', 'N/A']]
            });

            // Human Activity and Pests
            currentY = (doc as any).previousAutoTable.finalY + 8;
            if (currentY > 260) {
                doc.addPage();
                doc.setFillColor(15, 118, 110);
                doc.rect(0, 0, 210, 15, 'F');
                doc.setTextColor(255, 255, 255);
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(10);
                doc.text('GREENHOPE GUARDIAN ECO-REPORT | Appendix', 14, 10);
                currentY = 28;
            }

            const cleanHumanImpact = cleanPDFText(riskAnalysis.humanActivityImpact);
            const cleanPests = cleanPDFText(riskAnalysis.pestAndDiseaseThreats);

            (doc as any).autoTable({
                startY: currentY,
                theme: 'grid',
                headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontStyle: 'bold' },
                bodyStyles: { font: 'helvetica', fontSize: 9 },
                head: [['Socio-Environmental Threat Area', 'Detailed Risk Analysis & Mitigation Impact']],
                body: [
                    ['Anthropogenic / Human Activity Ecological Impact', cleanHumanImpact],
                    ['Pathological / Insect & Pest Infestation Threats', cleanPests]
                ]
            });

            // Save PDF
            doc.save(`GreenHope_Eco_Report_${new Date().toISOString().split('T')[0]}.pdf`);
        } catch (error) {
            console.error('Export failed:', error);
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header with Download & Copy Buttons */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-2xl font-bold text-white">{t('home.tabs.reforestation')}</h2>
                <div className="flex flex-wrap gap-2.5 w-full sm:w-auto">
                    <button 
                        onClick={handleCopyMarkdown}
                        className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg border transition duration-200 ${
                            copiedMD 
                                ? 'bg-emerald-950/80 text-emerald-400 border-emerald-500/30' 
                                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700 hover:border-slate-600'
                        }`}
                    >
                        {copiedMD ? <i className="fas fa-check text-emerald-400"></i> : <i className="fas fa-file-alt text-indigo-400"></i>}
                        {getCopyMDLabel()}
                    </button>
                    
                    <button 
                        onClick={handleCopyJSON}
                        className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg border transition duration-200 ${
                            copiedJSON 
                                ? 'bg-emerald-950/80 text-emerald-400 border-emerald-500/30' 
                                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700 hover:border-slate-600'
                        }`}
                    >
                        {copiedJSON ? <i className="fas fa-check text-emerald-400"></i> : <i className="fas fa-file-code text-amber-400"></i>}
                        {getCopyJSONLabel()}
                    </button>

                    <button 
                        onClick={handleDownloadPDF}
                        disabled={isExporting}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg border border-emerald-500 transition disabled:opacity-50"
                    >
                        {isExporting ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-download"></i>}
                        {t('analysis.downloadReport', { defaultValue: 'Download PDF Report' })}
                    </button>
                </div>
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