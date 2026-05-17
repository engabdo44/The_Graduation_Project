import { GoogleGenAI, Type } from "@google/genai";
const API_KEY = process.env.API_KEY || "";
export const analyzeCriminalRecord = async citizen => {
  if (!API_KEY) return "AI services currently unavailable (Missing API Key).";
  const ai = new GoogleGenAI({
    apiKey: API_KEY
  });
  const recordsSummary = citizen.records.map(r => `- ${r.date}: ${r.type} (${r.severity}) - ${r.description}`).join('\n');
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analyze the following criminal records for a citizen named ${citizen.firstName} ${citizen.lastName}. Provide a risk assessment summary (High, Medium, Low) and highlight any recurring patterns or serious threats. 
      
      Records:
      ${recordsSummary || "No previous records found."}`,
      config: {
        systemInstruction: "You are a senior criminal profiler for the Somali Police Force. Provide professional, objective, and concise risk assessments in English."
      }
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return "Error generating AI analysis.";
  }
};
export const suggestCrimeClassification = async description => {
  const ai = new GoogleGenAI({
    apiKey: API_KEY
  });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Based on this crime description: "${description}", suggest a legal classification (e.g., Theft, Assault, Traffic Violation) and a severity level.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            classification: {
              type: Type.STRING
            },
            severity: {
              type: Type.STRING,
              description: "LOW, MEDIUM, HIGH, CRITICAL"
            },
            reasoning: {
              type: Type.STRING
            }
          },
          required: ["classification", "severity", "reasoning"]
        }
      }
    });
    return JSON.parse(response.text);
  } catch (error) {
    return null;
  }
};
