import { NextResponse } from "next/server";
import axios from "axios";

export interface OpenRouterModel {
  id: string;
  name: string;
  description: string;
  context_length: number;
  pricing: {
    prompt: string;
    completion: string;
    [key: string]: any; 
  };
  architecture: {
    input_modalities: string[];
    ouput_modalities: string[];
    [key: string]: any; 
  };
  top_provider: {
    context_length: number;
    [key: string]: any;
  }
  [key: string]: any; 
}

export async function GET() {
    try {
        const response = await axios.get('https://openrouter.ai/api/v1/models', {
            headers: {
                'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json',
            },
        });

        const data = await response.data;
        
        const freeTextModels = data.data.filter((model:OpenRouterModel) => {
            const promptPrice = parseFloat(model.pricing?.prompt || '0');
            const completionPrice = parseFloat(model.pricing?.completion || '0');

            // return promptPrice === 0 && completionPrice === 0;
            
            const isFree = promptPrice === 0 && completionPrice === 0;
            const hasNoAudio = !model.architecture?.output_modalities?.includes('audio');
            return isFree && hasNoAudio
        });

        let formattedModels = freeTextModels.map((model: OpenRouterModel) => {
            const isFreeAuto = model.id === "openrouter/free";
            return {
                id: model.id,
                name: isFreeAuto ? "Random" : model.name,
                description: isFreeAuto
                    ? "The Random Model (leveraged via openrouter/free endpoint) automatically selects a free model at random from the available free models on OpenRouter. The router intelligently filters for models that support the features your request needs, such as image understanding, tool calling, and structured outputs."
                    : model.description,
                context_length: model.context_length,
                architecture: model.architecture,
                pricing: model.pricing,
                top_provider: model.top_provider,
            };
        });

        // Pull "openrouter/free" to the top of the list
        const freeAutoIdx = formattedModels.findIndex((m: any) => m.id === "openrouter/free");
        if (freeAutoIdx > -1) {
            const [freeAutoModel] = formattedModels.splice(freeAutoIdx, 1);
            formattedModels.unshift(freeAutoModel);
        } else {
            // Fallback prepend if not returned by the API
            formattedModels.unshift({
                id: "openrouter/free",
                name: "Random",
                description: "The Random Model (leveraged via openrouter/free endpoint) automatically selects a free model at random from the available free models on OpenRouter. The router intelligently filters for models that support the features your request needs, such as image understanding, tool calling, and structured outputs.",
                context_length: 4096,
                architecture: { input_modalities: ["text"], output_modalities: ["text"] },
                pricing: { prompt: "0.0", completion: "0.0" },
                top_provider: { context_length: 4096 }
            });
        }

        return NextResponse.json({
            models: formattedModels,
        });
    } catch (error: any) {
        console.error('Error fetching free models:', error);
    
        return NextResponse.json(
        {
            success: false,
            error: error?.message || 'Failed to fetch free models',
        },
        { status: 500 }
        );
    }
    
}