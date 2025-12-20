
import { GoogleGenAI, Chat, GenerateContentResponse, Modality } from "@google/genai";
import { SYSTEM_INSTRUCTION_AR, SYSTEM_INSTRUCTION_EN } from "../constants";
import { Language } from "../types";

let chatSession: Chat | null = null;

async function callWithRetry<T>(fn: () => Promise<T>, retries = 5, delay = 8000): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    const errorMsg = error?.message || "";
    const isQuotaError = errorMsg.includes('429') || error?.status === 429 || errorMsg.includes('RESOURCE_EXHAUSTED');
    if (isQuotaError && retries > 0) {
      const nextDelay = delay * 1.5; 
      console.warn(`AI Brain is busy. Waiting ${nextDelay}ms...`);
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
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const defaultBase = language === 'ar' ? SYSTEM_INSTRUCTION_AR : SYSTEM_INSTRUCTION_EN;
  const baseInstruction = baseInstructionOverride || defaultBase;
  
  // دمج السياق السريري مع التعليمات الأساسية
  const fullSystemInstruction = `${baseInstruction}\n\n[Clinical Context]: ${contextPrompt}\n[Instruction]: Provide deep, empathetic, and expert-level psychological guidance.`;

  try {
    chatSession = ai.chats.create({
      model: "gemini-3-pro-preview", 
      config: {
        systemInstruction: fullSystemInstruction,
        temperature: 0.75, // درجة حرارة متوازنة لضمان الدقة والتعاطف
        topP: 0.9,
        // تفعيل ميزانية التفكير العميق لتحليل الحالات المعقدة
        thinkingConfig: { thinkingBudget: 32768 } 
      },
      history: history 
    });
    return chatSession;
  } catch (error) {
    console.error("Failed to initialize intelligent chat", error);
    throw error;
  }
};

export const sendMessageStreamToGemini = async function* (message: string, language: Language = 'ar') {
  if (!chatSession) return;

  try {
    const result = (await callWithRetry(() => chatSession!.sendMessageStream({ message }))) as any;
    for await (const chunk of result) {
      const response = chunk as GenerateContentResponse;
      const text = response.text;
      if (text) yield text;
    }
  } catch (error: any) {
    console.error("Intelligent Stream Error:", error);
    yield language === 'ar' ? "أنا معك، أفكر في كلماتك بعمق هادئ..." : "I'm with you, reflecting on your words with calm depth...";
  }
};

// ... بقية الوظائف تظل كما هي مع استخدام موديلات Gemini 3 لضمان الجودة
export const generateContent = async (prompt: string, systemInstruction?: string) => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
        const response = (await callWithRetry(() => ai.models.generateContent({
            model: "gemini-3-pro-preview",
            contents: prompt,
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: "application/json",
                thinkingConfig: { thinkingBudget: 8192 }
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
        return null;
    }
};

export const generateSpeech = async (text: string, voiceName: string = 'kore') => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = (await callWithRetry(() => ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName } },
        },
      },
    }))) as any;
    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) return null;

    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    const buffer = await decodeAudioData(decodeBase64(base64Audio), audioCtx, 24000, 1);
    return { audioBuffer: buffer, audioCtx };
  } catch (error: any) {
    throw error;
  }
};

function decodeBase64(base64: string) {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
  return bytes;
}

async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
  }
  return buffer;
}
