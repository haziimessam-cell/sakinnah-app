import { GoogleGenAI, Chat, GenerateContentResponse, Content } from "@google/genai";
import { SYSTEM_INSTRUCTION_AR, SYSTEM_INSTRUCTION_EN } from "../constants";
import { Language } from "../types";

let chatSession: Chat | null = null;
let genAI: GoogleGenAI | null = null;

// --- SECURITY ARCHITECTURE ---
// In a real production environment, this should point to a secure backend endpoint
// (e.g. AWS Lambda, Firebase Functions, or Next.js API route)
// that handles the actual API call to Google.
// The Client Key should NEVER be exposed.
//
// Current Mode: HYBRID DEMO
// If PROXY_URL is defined, it uses it. If not, it falls back to Client-Side key for functionality.
const PROXY_URL = ""; // process.env.REACT_APP_API_PROXY; 

export const initializeChat = async (
  contextPrompt: string, 
  baseInstructionOverride?: string, 
  history?: Content[], 
  language: Language = 'ar'
) => {
  
  // 1. Security Check
  if (!process.env.API_KEY && !PROXY_URL) {
    console.error("CRITICAL: No API Key or Proxy URL found.");
    throw new Error("Service Configuration Error");
  }

  // 2. Initialize Client (Fallback Mode)
  // In a full secure setup, we wouldn't init GoogleGenAI here, 
  // we would just prepare the state for the fetch call to the proxy.
  if (process.env.API_KEY) {
      genAI = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
  
  const defaultBase = language === 'ar' ? SYSTEM_INSTRUCTION_AR : SYSTEM_INSTRUCTION_EN;
  const baseInstruction = baseInstructionOverride || defaultBase;
  const fullSystemInstruction = `${baseInstruction}\n\n[Context/Session Info]: ${contextPrompt}`;

  try {
    if (genAI) {
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
    } else {
        // Mock session object for Proxy Mode
        // Logic would be handled in sendMessageStreamToGemini via fetch(PROXY_URL)
        return null; 
    }
  } catch (error) {
    console.error("Failed to initialize chat", error);
    throw error;
  }
};

export const sendMessageStreamToGemini = async function* (message: string, language: Language = 'ar') {
  if (!chatSession && !PROXY_URL) {
    throw new Error("Chat session not initialized");
  }

  try {
    if (chatSession) {
        // --- DIRECT CLIENT-SIDE CALL (DEMO MODE) ---
        const result = await chatSession.sendMessageStream({ message });
        for await (const chunk of result) {
          const response = chunk as GenerateContentResponse;
          const text = response.text;
          if (text) {
            yield text;
          }
        }
    } else {
        // --- SECURE PROXY CALL (PRODUCTION MODE) ---
        // Example implementation of how it would look:
        /*
        const response = await fetch(PROXY_URL, {
            method: 'POST',
            body: JSON.stringify({ message, language })
        });
        const reader = response.body.getReader();
        while(true) {
            const {done, value} = await reader.read();
            if (done) break;
            yield new TextDecoder().decode(value);
        }
        */
       throw new Error("Proxy not implemented in demo environment");
    }
  } catch (error) {
    console.error("Error sending message to Gemini", error);
    yield language === 'ar' ? "عذراً، واجهت مشكلة تقنية." : "Sorry, I encountered a technical issue.";
  }
};