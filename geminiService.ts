import { GoogleGenAI } from "@google/genai";

// Initialize the client
// The API key is injected via process.env.API_KEY environment variable.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateSpaceBackground = async (prompt: string): Promise<string | null> => {
  try {
    const fullPrompt = `A high quality, atmospheric, cinematic, soft lighting background image for a mobile app. Theme: ${prompt}. No text, no people faces close up. Abstract or scenic.`;
    
    // Using gemini-2.5-flash-image for efficient image generation
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: fullPrompt }],
      },
      config: {
        // Nano banana models do not support responseMimeType or responseSchema
        // Just standard generation
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Failed to generate background:", error);
    return null;
  }
};

export const generateItemImage = async (itemDescription: string, context: string): Promise<string | null> => {
  try {
    const fullPrompt = `A single object representing "${itemDescription}" to be placed in a scene described as "${context}". The object should be isolated or have a simple composition. High quality, artistic style.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: fullPrompt }],
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Failed to generate item image:", error);
    return null;
  }
};