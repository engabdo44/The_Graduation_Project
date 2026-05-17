import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export const summarizeHealthRecord = async (medicalHistory) => {
  try {
    const prompt = `Analyze the following medical history entries for a citizen of Somalia and provide a professional, concise summary of their health status, primary risks, and recommended actions. Medical History: ${medicalHistory.join(', ')}`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 0 }
      }
    });

    return response.text || "Summary unavailable.";
  } catch (error) {
    console.error("Gemini analysis failed:", error);
    return "Failed to generate AI summary.";
  }
};

export const generateBirthCertificateCopy = async (data) => {
  try {
    const prompt = `Generate a formal birth announcement description for the Ministry of Health Somalia official records based on this data: ${JSON.stringify(data)}`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "";
  } catch (error) {
    console.error("Gemini birth copy failed:", error);
    return "Error generating formal copy.";
  }
};
