import { FullAnalysis, CrowdfundingCampaign, WeatherData, PlantingSuggestion, HomePlant, Grant, Source, UndergroundWaterAnalysis } from '../types';
import { canMakeApiCall, recordApiCall } from './rateLimiter';

// Use secure local proxy rather than direct external API calls
async function performApiCall<T>(prompt: string, schema?: any, useGrounding: boolean = false, systemInstruction?: string): Promise<T> {
    const rateLimitCheck = canMakeApiCall();
    if (!rateLimitCheck.allowed) {
        throw new Error(`RATE_LIMIT_EXCEEDED:${rateLimitCheck.retryAfter}`);
    }
    recordApiCall();

    try {
        const response = await fetch("/api/completion", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                prompt,
                systemInstruction
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const msg = errorData.error || "Unknown server error";
            throw new Error(`API error (${response.status}): ${typeof msg === 'string' ? msg : JSON.stringify(msg)}`);
        }

        const data = await response.json();
        const content = data.choices[0].message.content.trim();
        
        // Clean up potential markdown formatting if the model ignores the system instruction
        const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/```\n([\s\S]*?)\n```/);
        const jsonText = jsonMatch ? jsonMatch[1] : content;
        
        try {
            return JSON.parse(jsonText);
        } catch (e) {
            console.error("Failed to parse JSON from OpenRouter response:", jsonText);
            throw new Error("Invalid JSON response from model.");
        }
    } catch (error) {
        console.error('API call failed:', error);
        throw error;
    }
}

export const getFullAnalysis = async (
    location: { lat: number, lng: number },
    language: string,
    useGrounding: boolean
): Promise<FullAnalysis> => {
    const prompt = `
        Analyze the location at latitude ${location.lat} and longitude ${location.lng} for a reforestation project.
        Provide a detailed analysis in ${language}.
        Return a JSON object with this exact structure:
        {
          "plantingSuggestion": {
            "suggestedSpecies": [{"name": "string", "reason": "string"}],
            "plantingTechniques": "string",
            "careAndMaintenance": "string",
            "environmentalBenefits": "string",
            "estimatedCost": {
              "treeCost": "string",
              "wateringCost": "string",
              "laborCost": "string",
              "otherCosts": "string",
              "totalCost": "string"
            },
            "plantingDuration": "string",
            "locationDetails": "string",
            "areaPlanted": "string"
          },
          "vegetationAnalysis": {
            "currentVegetation": "string",
            "dominantSpecies": ["string"],
            "healthStatus": "string",
            "deforestationThreat": "string"
          },
          "riskAnalysis": {
            "naturalDisasters": [{"type": "string", "riskLevel": "string", "mitigation": "string"}],
            "humanActivityImpact": "string",
            "pestAndDiseaseThreats": "string"
          },
          "sources": [{"uri": "string", "title": "string"}]
        }
    `;
    return performApiCall<FullAnalysis>(prompt);
};

export const generateCrowdfundingCampaign = async (
    suggestion: PlantingSuggestion,
    location: { lat: number, lng: number },
    language: string
): Promise<CrowdfundingCampaign> => {
    const prompt = `
        Generate a crowdfunding campaign concept based on the following reforestation plan for location ${location.lat}, ${location.lng}.
        The plan suggests planting: ${(suggestion.suggestedSpecies || []).map(s => s.name).join(', ')}.
        The environmental benefits are: ${suggestion.environmentalBenefits}.
        Generate the campaign materials in ${language}.
        Return a JSON object with this exact structure:
        {
          "title": "string",
          "tagline": "string",
          "story": "string",
          "donationTiers": [{"amount": number, "reward": "string"}]
        }
    `;
    return performApiCall<CrowdfundingCampaign>(prompt);
};

export const getWeatherData = async (
    location: { lat: number, lng: number },
    language: string
): Promise<WeatherData> => {
    const prompt = `
        Describe the typical current weather conditions for a location at latitude ${location.lat} and longitude ${location.lng} in ${language}.
        Return a JSON object with this exact structure:
        {
          "summary": "string",
          "temperature": "string",
          "precipitation": "string",
          "wind": "string"
        }
    `;
    try {
        return await performApiCall<WeatherData>(prompt);
    } catch(e) {
        return {
            summary: "Weather data unavailable",
            temperature: "N/A",
            precipitation: "N/A",
            wind: "N/A",
        };
    }
};

export const getHomeGardeningSuggestions = async (
    condition: string,
    language: string,
): Promise<HomePlant[]> => {
    const prompt = `
        Suggest 3-5 suitable home gardening plants for the following condition: "${condition}" in ${language}.
        Return a JSON array of objects with this structure:
        [{"name": "string", "type": "string", "suitableFor": "string", "careInstructions": "string"}]
    `;
    return performApiCall<HomePlant[]>(prompt);
};

export const findGrants = async (
    projectDescription: string,
    language: string,
): Promise<{grants: Grant[], sources?: Source[]}> => {
     const prompt = `
        Find 3-5 suitable real-world funding grants for this reforestation project: "${projectDescription}" in ${language}.
        Return a JSON object with this structure:
        {
          "grants": [{"name": "string", "description": "string", "deadline": "string", "link": "string"}],
          "sources": [{"uri": "string", "title": "string"}]
        }
    `;
    return performApiCall<{grants: Grant[], sources?: Source[]}>(prompt);
};

export const getUndergroundWaterAnalysis = async (
    location: { lat: number, lng: number },
    language: string,
): Promise<UndergroundWaterAnalysis> => {
    const prompt = `
        Analyze the underground water potential for location at latitude ${location.lat} and longitude ${location.lng} in ${language}.
        Return a JSON object with this structure:
        {
          "estimatedDepth": "string",
          "aquiferType": "string",
          "estimatedYield": "string",
          "waterQuality": "string",
          "rechargePotential": "string",
          "sustainability": "string",
          "academicSources": ["string"]
        }
    `;
    return performApiCall<UndergroundWaterAnalysis>(prompt);
};
