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

export async function GET(request:NextResponse) {
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

            return promptPrice === 0 && completionPrice === 0;
            
            // const isFree = promptPrice === 0 && completionPrice === 0;
            // const hasNoAudio = !model.architecture?.output_modalities?.includes('audio');
            // return isFree && hasNoAudio
        });

        const formattedModels = freeTextModels.map((model: OpenRouterModel) => ({
            id: model.id,
            name: model.name,
            description: model.description,
            context_length: model.context_length,
            architecture: model.architecture,
            pricing: model.pricing,
            top_provider: model.top_provider,
        }));

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