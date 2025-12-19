
import { GoogleGenAI, Chat, GenerateContentResponse, Modality } from "@google/genai";
import { SYSTEM_INSTRUCTION_AR, SYSTEM_INSTRUCTION_EN } from "../constants";
import { Language } from "../types";

let chatSession: Chat | null = null;
let currentContext = { prompt: '', instruction: '', history: [] as any[], lang: 'ar' as Language };

/**
 * Utility to wrap API calls with a smart retry mechanism.
 * Increased delays for 429 errors to respect Google's stricter rate limits for TTS.
 */
async function callWithRetry<T>(fn: () => Promise<T>, retries = 5, delay = 8000): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    const errorMsg = error?.message || "";
    const isQuotaError = errorMsg.includes('429') || error?.status === 429 || errorMsg.includes('RESOURCE_EXHAUSTED');
    
    if (isQuotaError && retries > 0) {
      // Exponential backoff for quota errors
      const nextDelay = delay * 1.5; 
      console.warn(`API Rate Limit. Waiting ${nextDelay}ms before retry... (${retries} retries left)`);
      await new Promise(resolve => setTimeout(resolve, nextDelay));
      return callWithRetry(fn, retries - 1, nextDelay);
    }
    throw error;
  }
}

export const initializeChat = async (
  contextPrompt: string, 
  baseInstructionOverride?: string, 
  history?: any[], 
  language: Language = 'ar'
) => {
  currentContext = { prompt: contextPrompt, instruction: baseInstructionOverride || '', history: history || [], lang: language };
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const defaultBase = language === 'ar' ? SYSTEM_INSTRUCTION_AR : SYSTEM_INSTRUCTION_EN;
  const baseInstruction = baseInstructionOverride || defaultBase;
  const fullSystemInstruction = `${baseInstruction}\n\n[Context]: ${contextPrompt}`;

  try {
    chatSession = ai.chats.create({
      model: "gemini-3-pro-preview", // Upgraded for complex reasoning
      config: {
        systemInstruction: fullSystemInstruction,
        temperature: 0.8,
        thinkingConfig: { thinkingBudget: 2048 } // Allow model to plan suspenseful plots
      },
      history: history 
    });
    return chatSession;
  } catch (error) {
    console.error("Failed to initialize chat", error);
    throw error;
  }
};

export const sendMessageStreamToGemini = async function* (message: string, language: Language = 'ar') {
  if (!chatSession) {
    yield language === 'ar' ? "يرجى تسجيل الدخول أولاً." : "Please log in first.";
    return;
  }

  try {
    const result = (await callWithRetry(() => chatSession!.sendMessageStream({ message }))) as any;
    for await (const chunk of result) {
      const response = chunk as GenerateContentResponse;
      const text = response.text;
      if (text) yield text;
    }
  } catch (error: any) {
    console.error("Gemini Stream Error:", error);
    yield language === 'ar' ? "عذراً، الخادم مشغول حالياً. سنحاول مرة أخرى." : "Server busy. Retrying...";
  }
};

function decodeBase64(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export const generateSpeech = async (text: string, voiceName: string = 'kore') => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = (await callWithRetry(() => ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName },
          },
        },
      },
    }))) as any;

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) return null;

    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    const audioBuffer = await decodeAudioData(
      decodeBase64(base64Audio),
      audioCtx,
      24000,
      1,
    );

    return { audioBuffer, audioCtx };
  } catch (error: any) {
    console.error("Gemini TTS Error:", error);
    throw error;
  }
};

export const generateContent = async (prompt: string, systemInstruction?: string) => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
        const response = (await callWithRetry(() => ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: "application/json"
            }
        }))) as GenerateContentResponse;
        return response.text;
    } catch (e: any) {
        console.error("Generate Content Error", e);
        return null;
    }
};

export const getEmbedding = async (text: string) => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
        const response = (await callWithRetry(() => ai.models.embedContent({
            model: "text-embedding-004",
            content: text,
        }))) as any;
        return response.embedding?.values;
    } catch (e) {
        console.error("Embedding Error", e);
        return null;
    }
};
