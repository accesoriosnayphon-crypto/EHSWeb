
import { GoogleGenAI } from "@google/genai";

if (!process.env.API_KEY) {
    console.warn("API_KEY environment variable not set. Gemini features will be disabled.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

export const generateIncidentSummary = async (description: string): Promise<string> => {
    if (!process.env.API_KEY) {
        return "La función de IA está deshabilitada. Configure la variable de entorno API_KEY.";
    }
    try {
        const prompt = `Analiza el siguiente informe de incidente laboral y proporciona un resumen breve y profesional adecuado para una descripción general de la gerencia. Concéntrate en los eventos clave, las posibles causas y las acciones inmediatas tomadas. El resumen debe estar en español.
---
INFORME DE INCIDENTE:
${description}
---
RESUMEN PROFESIONAL:`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                temperature: 0.5,
                topP: 1,
                topK: 32
            }
        });

        return response.text;
    } catch (error) {
        console.error("Error generating incident summary:", error);
        return "No se pudo generar el resumen del incidente. Por favor, inténtelo de nuevo más tarde.";
    }
};
