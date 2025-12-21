
import { GoogleGenAI, Chat, GenerateContentResponse, Modality, Type, FunctionDeclaration } from "@google/genai";
import { 
  SYSTEM_INSTRUCTION_AR,
  SYSTEM_INSTRUCTION_EN,
  RELATIONSHIP_PROTOCOL_AR,
  RELATIONSHIP_PROTOCOL_EN,
  EMPATHY_TRANSLATOR_PROMPT
} from "../constants";
import { Language } from "../types";

// Singleton Audio Context for low-latency playback
let sharedAudioCtx: AudioContext | null = null;

function getAudioCtx() {
    if (!sharedAudioCtx) {
        sharedAudioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
    return sharedAudioCtx;
}

function decode(base64: string) {
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

export const getAIInstance = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

let chatInstance: Chat | null = null;

export const initializeChat = async (id: string, systemInstruction: string, history?: any[], language?: Language) => {
  const ai = getAIInstance();
  chatInstance = ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: systemInstruction,
    }
  });
};

export async function* sendMessageStreamToGemini(prompt: string, language: Language) {
  if (!chatInstance) {
    const ai = getAIInstance();
    chatInstance = ai.chats.create({ model: 'gemini-3-flash-preview' });
  }
  
  try {
    const stream = await chatInstance.sendMessageStream({ message: prompt });
    for await (const chunk of stream) {
      const c = chunk as GenerateContentResponse;
      yield c.text || "";
    }
  } catch (e: any) {
    console.error("Streaming error:", e);
    if (e.message?.includes('500') || e.message?.includes('Internal')) {
       const streamRetry = await chatInstance.sendMessageStream({ message: prompt });
       for await (const chunk of streamRetry) {
         const c = chunk as GenerateContentResponse;
         yield c.text || "";
       }
    } else {
       throw e;
    }
  }
}

export const generateContent = async (prompt: string, systemInstruction?: string): Promise<string> => {
  const ai = getAIInstance();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { 
          systemInstruction: systemInstruction || undefined,
      }
    });
    return response.text || "";
  } catch (e: any) {
    if (e.message?.includes('500')) {
      const retryResponse = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: { systemInstruction: systemInstruction || undefined }
      });
      return retryResponse.text || "";
    }
    throw e;
  }
};

export const generateSpeech = async (text: string, voiceName: string = 'Kore'): Promise<{ audioBuffer: AudioBuffer } | null> => {
  const ai = getAIInstance();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName } } },
      },
    });
    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
        const uint8 = decode(base64Audio);
        const ctx = getAudioCtx();
        const buffer = await decodeAudioData(uint8, ctx, 24000, 1);
        return { audioBuffer: buffer };
    }
  } catch (e) {
    console.error("Speech gen error:", e);
  }
  return null;
};

export const getNextAdaptiveQuestion = async (category: string, previousAnswers: any[], language: Language) => {
  const ai = getAIInstance();
  const instruction = language === 'ar' ? SYSTEM_INSTRUCTION_AR : SYSTEM_INSTRUCTION_EN;
  const prompt = `Assessment for [${category}]. Answers: ${JSON.stringify(previousAnswers)}. Output JSON: {"text": "...", "options": [...]}`;
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: { systemInstruction: instruction, responseMimeType: "application/json" }
  });
  try { return JSON.parse(response.text || "{}"); } catch (e) { return null; }
};

export const sendMessageWithScientificLogic = async (prompt: string, context: string, language: Language) => {
  const ai = getAIInstance();
  const systemInstruction = language === 'ar' ? SYSTEM_INSTRUCTION_AR : SYSTEM_INSTRUCTION_EN;
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: (context ? `Context: ${context}\n\n` : "") + prompt,
    config: { systemInstruction, tools: [{ googleSearch: {} }], thinkingConfig: { thinkingBudget: 16384 } }
  });
  return { text: response.text, sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || [] };
};

export const getEmbedding = async (text: string): Promise<number[]> => {
  const ai = getAIInstance();
  const response = await ai.models.embedContent({
    model: 'text-embedding-004',
    contents: [{ parts: [{ text }] }],
  });
  return response.embedding.values;
};

export const generateClinicalRationale = async (category: string, answers: any[], language: Language): Promise<string> => {
  const ai = getAIInstance();
  const systemInstruction = language === 'ar' ? SYSTEM_INSTRUCTION_AR : SYSTEM_INSTRUCTION_EN;
  const prompt = `Provide a detailed clinical rationale for a therapy plan based on the following assessment for ${category}. Answers: ${JSON.stringify(answers)}. Language: ${language}.`;
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: { systemInstruction }
  });
  return response.text || "";
};

export const initializeMediator = (language: Language) => {};

export const mediateDialogue = async (partnerA: string, partnerB: string, language: Language): Promise<string> => {
  const ai = getAIInstance();
  const systemInstruction = language === 'ar' ? RELATIONSHIP_PROTOCOL_AR : RELATIONSHIP_PROTOCOL_EN;
  const prompt = `Mediate the following dialogue between two partners. Partner A: "${partnerA}". Partner B: "${partnerB}". Use Gottman principles to analyze and provide a constructive path forward. Language: ${language}.`;
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: { systemInstruction }
  });
  return response.text || "";
};
