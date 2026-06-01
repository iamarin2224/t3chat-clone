import { OpenRouterModel } from "@/app/api/ai/get-models/route";
import {useQuery} from "@tanstack/react-query";
import axios from "axios";

export const useAIModels = ()=>{
    return useQuery({
        queryKey:["ai-models"],
        queryFn: async () => {
            const response = await axios.get<{models: OpenRouterModel[]}>("/api/ai/get-models");
            return response.data.models;
        },
    })
} 