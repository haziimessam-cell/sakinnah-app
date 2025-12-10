
import { GoogleGenAI, Chat, GenerateContentResponse, Content } from "@google/genai";
import { SYSTEM_INSTRUCTION_AR, SYSTEM_INSTRUCTION_EN } from "../constants";
import { Language } from "../types";

/* 
   ================================================================
   DEPLOYMENT INSTRUCTIONS (FREE & SECURE):
   ================================================================
   1. Create 'api/chat.js' in your project or Vercel dashboard.
   2. Paste this code into 'api/chat.js':

   // --- api/chat.js ---
   const { GoogleGenerativeAI } = require('@google/generative-ai');
   export const config = { runtime: 'edge' };

   export default async function handler(req) {
     if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });
     try {
       const { message, history, systemInstruction } = await req.json();
       const genAI = new GoogleGenerativeAI(process.env.API_KEY);
       const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash', systemInstruction });
       
       // Handle streaming for chat
       if (history) {
           const chat = model.startChat({ history: history || [] });
           const result = await chat.sendMessageStream(message);
           const stream = new ReadableStream({
             async start(controller) {
               for await (const chunk of result.stream) {
                 const text = chunk.text();
                 controller.enqueue(new TextEncoder().encode(text));
               }
               controller.close();
             },
           });
           return new Response(stream, { headers: { 'Content-Type': 'text/plain' } });
       } 
       // Handle single generation (for journal/analysis)
       else {
           const result = await model.generateContent(message);
           return new Response(result.response.text(), { headers: { 'Content-Type': 'text/plain' } });
       }

     } catch (e) {
       return new Response(JSON.stringify({ error: e.message }), { status: 500 });
     }
   }
   // --------------------

   3. Set PROXY_URL below to your deployed URL (e.g. 'https://myapp.vercel.app/api/chat').
   4. Remove process.env.API_KEY usage for production safety.
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
