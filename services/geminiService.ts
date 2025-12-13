import { GoogleGenAI, Chat, GenerateContentResponse, Content, Part } from "@google/genai";
import { SYSTEM_INSTRUCTION_AR, SYSTEM_INSTRUCTION_EN } from "../constants";
import { Language } from "../types";

let chatSession: Chat | null = null;
let aiClient: GoogleGenAI | null = null;

// Securely access API key based on environment (Vite or standard process.env)
// Note: In a real production app, use a proxy server. Client-side keys are risky.
const getApiKey = () => {
    try {
        if (typeof process !== 'undefined' && process.env?.API_KEY) return process.env.API_KEY;
    } catch (e) {}
    
    try {
        if (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_KEY) return (import.meta as any).env.VITE_API_KEY;
    } catch (e) {}
    
    return undefined;
};

const apiKey = getApiKey();

// Initialize the API Client
if (apiKey) {
    aiClient = new GoogleGenAI({ apiKey: apiKey });
} else {
    console.warn("⚠️ API_KEY is missing. AI features will not work.");
}

export const initializeChat = async (
  contextPrompt: string, 
  baseInstructionOverride?: string, 
  history?: Content[], 
  language: Language = 'ar'
) => {
  
  const defaultBase = language === 'ar' ? SYSTEM_INSTRUCTION_AR : SYSTEM_INSTRUCTION_EN;
  const baseInstruction = baseInstructionOverride || defaultBase;
  const fullSystemInstruction = `${baseInstruction}\n\n[Context/Session Info]: ${contextPrompt}`;

  if (aiClient) {
      try {
        chatSession = aiClient.chats.create({
          model: "gemini-2.5-flash",
          config: {
            systemInstruction: fullSystemInstruction,
            temperature: 0.7, 
          },
          history: history 
        });
        return chatSession;
      } catch (error) {
        console.error("Failed to initialize chat", error);
        throw error;
      }
  }
  
  return null;
};

export const sendMessageStreamToGemini = async function* (message: string, language: Language = 'ar') {
  if (chatSession) {
    try {
        const result = await chatSession.sendMessageStream({ message });
        for await (const chunk of result) {
          const response = chunk as GenerateContentResponse;
          const text = response.text;
          if (text) yield text;
        }
    } catch (error) {
        console.error("Gemini Error:", error);
        yield language === 'ar' ? "عذراً، حدث خطأ في الاتصال." : "Connection error.";
    }
    return;
  }
  
  // Fallback if no API key
  yield language === 'ar' ? "يرجى إضافة مفتاح API لتمكين المحادثة." : "Please add an API Key to enable chat.";
};

// Helper for single-turn tasks (Journal Analysis, Memory Extraction)
export const generateContent = async (prompt: string, systemInstruction?: string) => {
    if (aiClient) {
        try {
            const response = await aiClient.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
                config: {
                    systemInstruction: systemInstruction,
                    responseMimeType: "application/json" // Force JSON for tools
                }
            });
            return response.text;
        } catch (e) {
            console.error("Generate Content Error", e);
            return null;
        }
    }
    return null;
}

// Embedding Generation for Vector Search (Memory)
export const getEmbedding = async (text: string): Promise<number[] | null> => {
    if (aiClient) {
        try {
            const response = await aiClient.models.embedContent({
                model: 'text-embedding-004',
                contents: text
            });
            return response.embedding?.values || null;
        } catch (e) {
            console.error("Embedding Error", e);
            return null;
        }
    }
    return null;
};