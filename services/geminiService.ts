
import { GoogleGenAI, Chat, GenerateContentResponse, Content } from "@google/genai";
import { SYSTEM_INSTRUCTION_AR, SYSTEM_INSTRUCTION_EN } from "../constants";
import { Language } from "../types";

/* 
   ================================================================
   DEPLOYMENT INSTRUCTIONS (FREE & SECURE):
   ================================================================
   ... (Same as before)
*/

let chatSession: Chat | null = null;
let genAI: GoogleGenAI | null = null;

// Set this to your deployed backend URL for production security
const PROXY_URL = ""; 

// Local state for Proxy Mode (Stateless)
let localHistory: Content[] = [];
let localSystemInstruction: string = "";

export const initializeChat = async (
  contextPrompt: string, 
  baseInstructionOverride?: string, 
  history?: Content[], 
  language: Language = 'ar'
) => {
  
  const defaultBase = language === 'ar' ? SYSTEM_INSTRUCTION_AR : SYSTEM_INSTRUCTION_EN;
  const baseInstruction = baseInstructionOverride || defaultBase;
  const fullSystemInstruction = `${baseInstruction}\n\n[Context/Session Info]: ${contextPrompt}`;

  // 1. PROXY MODE SETUP
  if (PROXY_URL) {
      localSystemInstruction = fullSystemInstruction;
      // Reset history on new session init, or use provided
      localHistory = history || [];
      return { mock: true }; // Return mock object to satisfy caller
  }

  // 2. CLIENT-SIDE DEMO MODE
  if (process.env.API_KEY) {
      genAI = new GoogleGenAI({ apiKey: process.env.API_KEY });
      try {
        chatSession = genAI.chats.create({
          model: "gemini-2.5-flash",
          config: {
            systemInstruction: fullSystemInstruction,
            temperature: 0.7, 
            maxOutputTokens: 2000,
          },
          history: history 
        });
        return chatSession;
      } catch (error) {
        console.error("Failed to initialize chat", error);
        throw error;
      }
  }
  
  console.warn("No API Key or Proxy URL found. App will run in offline/preview mode.");
  return null;
};

export const sendMessageStreamToGemini = async function* (message: string, language: Language = 'ar') {
  
  // --- OPTION A: DIRECT CLIENT-SIDE CALL (DEMO) ---
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

  // --- OPTION B: SECURE PROXY CALL (PRODUCTION) ---
  if (PROXY_URL) {
      try {
          // Prepare payload: Message + History + System Instruction
          const payload = {
              message,
              history: localHistory,
              systemInstruction: localSystemInstruction
          };

          // Optimistic update of local history
          localHistory.push({ role: 'user', parts: [{ text: message }] });

          const response = await fetch(PROXY_URL, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
          });

          if (!response.ok) throw new Error(`Proxy Error: ${response.status}`);
          if (!response.body) throw new Error("No response body");

          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          let fullResponseText = "";

          while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              const chunk = decoder.decode(value, { stream: true });
              fullResponseText += chunk;
              yield chunk;
          }

          // Update history with model response
          localHistory.push({ role: 'model', parts: [{ text: fullResponseText }] });

      } catch (error) {
          console.error("Proxy Fetch Error:", error);
          yield language === 'ar' ? "عذراً، الخادم لا يستجيب." : "Server error.";
      }
      return;
  }

  throw new Error("Configuration Error: No API Key or Proxy URL configured.");
};

// --- NEW: Helper for single-turn tasks (Journal Analysis, etc.) ---
export const generateContent = async (prompt: string, systemInstruction?: string) => {
    // Proxy Mode
    if (PROXY_URL) {
        try {
            const response = await fetch(PROXY_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: prompt, systemInstruction }) // No history
            });
            if (!response.ok) throw new Error('Proxy Error');
            return await response.text();
        } catch(e) { return null; }
    }
    
    // Client Mode
    if (process.env.API_KEY) {
        try {
            const genAI = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await genAI.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
                config: {
                    systemInstruction: systemInstruction
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

// --- NEW: Embedding Generation for Vector Search ---
export const getEmbedding = async (text: string): Promise<number[] | null> => {
    if (process.env.API_KEY) {
        try {
            const genAI = new GoogleGenAI({ apiKey: process.env.API_KEY });
            // Using the latest embedding model
            const response = await genAI.models.embedContent({
                model: 'text-embedding-004',
                contents: text
            });
            return response.embedding.values;
        } catch (e) {
            console.error("Embedding Error", e);
            return null;
        }
    }
    // Proxy fallback would be added here in production
    return null;
};
