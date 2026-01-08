
import { GoogleGenAI, Type } from "@google/genai";

/**
 * REVA AI CORE SERVICE
 * Integrated with Gemini 3 Pro and Gemini 2.5 Flash for advanced reasoning 
 * and real-world spatial grounding.
 */

// Schema for structured navigation responses (Legacy support for existing bot UI)
const navigatorSchema = {
  type: Type.OBJECT,
  properties: {
    user_message: { 
      type: Type.STRING, 
      description: "A clear Arabic message informing the user about the chalet or area." 
    },
    target_chalet: { 
      type: Type.STRING, 
      description: "The name of the chalet being discussed." 
    },
    internal_url: { 
      type: Type.STRING, 
      description: "The internal website path." 
    },
    google_maps_url: { 
      type: Type.STRING, 
      description: "The direct Google Maps URL." 
    }
  },
  required: ["user_message", "target_chalet", "internal_url", "google_maps_url"]
};

/**
 * Main AI Chatbot logic using Gemini 3 Pro Preview
 */
export const getGeminiResponse = async (userMessage: string, chatHistory: { role: string, text: string }[]) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const systemInstruction = `
      You are the "Reva Elite Concierge" powered by Gemini 3 Pro. 
      You help users find luxury chalets in Jordan.
      You can provide details about local attractions, travel tips, and property features.
      If you discuss specific chalets, try to provide an internal link and a Maps link in your response.
      Always respond in a professional and helpful tone, primarily in Arabic as per the user's preference.
    `;

    const contents = [
      ...chatHistory.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      })),
      { role: 'user', parts: [{ text: userMessage }] }
    ];

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents,
      config: { 
        systemInstruction,
        tools: [{ googleSearch: {} }] // Add search grounding for real-time info
      }
    });

    return {
      text: response.text || "I apologize, I couldn't process that request.",
      grounding: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
    };
  } catch (err) {
    console.error("Concierge Error:", err);
    return {
      text: "عذراً، واجهت مشكلة في الاتصال بالنظام الذكي.",
      grounding: []
    };
  }
};

/**
 * Spatial Discovery Service using Gemini 2.5 Flash with Google Maps Grounding
 */
export const getNearbyAttractions = async (lat: number, lng: number, chaletName: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const prompt = `What are the best high-end restaurants, viewpoints, and luxury activities near ${chaletName}? Provide a curated list in Arabic.`;
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: {
          retrievalConfig: {
            latLng: {
              latitude: lat,
              longitude: lng
            }
          }
        }
      },
    });

    return {
      text: response.text,
      links: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
    };
  } catch (error) {
    console.error("Maps Grounding Error:", error);
    return { text: null, links: [] };
  }
};

export const getOwnerInsights = async (propertyData: any) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Analyze this property data for a Reva Chalet owner: ${JSON.stringify(propertyData)}. 
      Provide a strategic tip in Arabic about pricing or occupancy optimization based on luxury trends in Jordan.`,
    });
    return response.text;
  } catch (e) {
    return "لا توجد نصائح استراتيجية متاحة حالياً.";
  }
};
