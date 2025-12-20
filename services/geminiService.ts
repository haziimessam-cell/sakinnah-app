
import { GoogleGenAI, Chat, GenerateContentResponse, Modality, Type, FunctionDeclaration } from "@google/genai";
import { 
  SYSTEM_INSTRUCTION_AR,
  SYSTEM_INSTRUCTION_EN,
  RELATIONSHIP_PROTOCOL_AR,
  RELATIONSHIP_PROTOCOL_EN,
  EMPATHY_TRANSLATOR_PROMPT
} from "../constants";
import { Language } from "../types";

// Initialize AI client using the environment variable API_KEY
export const getAIInstance = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

// Global chat instance for stateful conversations across components
let chatInstance: any = null;

// Initialize a chat session with specific system instructions
export const initializeChat = async (id: string, systemInstruction: string, history?: any[], language?: Language) => {
  const ai = getAIInstance();
  chatInstance = ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: systemInstruction
    }
  });
};

// Stream responses from the model using the initialized chat instance
export const sendMessageStreamToGemini = async function* (message: string, language: Language) {
  if (!chatInstance) {
    await initializeChat("default", language === 'ar' ? SYSTEM_INSTRUCTION_AR : SYSTEM_INSTRUCTION_EN);
  }
  const stream = await chatInstance.sendMessageStream({ message });
  for await (const chunk of stream) {
    yield chunk.text || "";
  }
};

// Send message with Google Search grounding enabled
export const sendMessageWithGrounding = async (prompt: string, context: string, language: Language) => {
  const ai = getAIInstance();
  const systemInstruction = language === 'ar' ? SYSTEM_INSTRUCTION_AR : SYSTEM_INSTRUCTION_EN;
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: (context ? `Context: ${context}\n\n` : "") + prompt,
    config: {
      systemInstruction,
      tools: [{ googleSearch: {} }]
    }
  });
  return {
    text: response.text,
    sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
  };
};

// Stream responses with tools capability (used for grounding or future tool extensions)
export const sendMessageStreamWithTools = async function* (message: string, language: Language) {
  if (!chatInstance) {
    await initializeChat("default", language === 'ar' ? SYSTEM_INSTRUCTION_AR : SYSTEM_INSTRUCTION_EN);
  }
  const stream = await chatInstance.sendMessageStream({ message });
  for await (const chunk of stream) {
    yield chunk.text || "";
  }
};

// Placeholder for mediator initialization if persistent state is needed later
export const initializeMediator = (language: Language) => {
    // Current implementation uses stateless generateContent for mediation
};

// Perform specialized relationship mediation between two parties
export const mediateDialogue = async (pA: string, pB: string, language: Language) => {
  const ai = getAIInstance();
  const systemInstruction = language === 'ar' ? RELATIONSHIP_PROTOCOL_AR : RELATIONSHIP_PROTOCOL_EN;
  const prompt = `Partner A: ${pA}\nPartner B: ${pB}\n\nPlease mediate this situation objectively using Gottman principles.`;
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: { systemInstruction }
  });
  return response.text;
};

// وظيفة التحليل السريري المعمق
export const generateClinicalAnalysis = async (catId: string, answers: string[], language: Language) => {
  const ai = getAIInstance();
  const baseInstruction = language === 'ar' ? SYSTEM_INSTRUCTION_AR : SYSTEM_INSTRUCTION_EN;

  const prompt = `
  USER_ANSWERS: ${JSON.stringify(answers)}
  CATEGORY: ${catId}
  
  مطلوب: 
  1. تحليل 'المنطق السريري' (Clinical Reasoning) خلف هذه الإجابات.
  2. تحديد احتمالية وجود اضطراب مقابل ردود فعل عاطفية طبيعية.
  3. اقتراح مسار علاجي مبني على بروتوكولات (CBT) أو (IPSRT).
  4. قدم التحليل بلهجة دافئة ولكن احترافية جداً.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: {
      systemInstruction: baseInstruction,
      thinkingConfig: { thinkingBudget: 32768 }, // أقصى ميزانية تفكير للتحليل الطبي المعقد
      temperature: 0.3
    }
  });

  return response.text;
};

// بقية الخدمات...
export const generateContent = async (prompt: string, systemInstruction?: string): Promise<string> => {
  const ai = getAIInstance();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: { systemInstruction: systemInstruction || undefined }
  });
  return response.text || "";
};

export const getEmbedding = async (text: string): Promise<number[] | undefined> => {
  const ai = getAIInstance();
  try {
    const result = await (ai as any).models.embedContent({
      model: "text-embedding-004",
      content: { parts: [{ text }] },
    });
    return result.embedding.values;
  } catch (e) { return undefined; }
};

export const generateSpeech = async (text: string, voiceName: string = 'Kore'): Promise<{ audioBuffer: AudioBuffer } | null> => {
  const ai = getAIInstance();
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
      const uint8 = new Uint8Array(atob(base64Audio).split("").map(c => c.charCodeAt(0)));
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      const dataInt16 = new Int16Array(uint8.buffer);
      const buffer = ctx.createBuffer(1, dataInt16.length, 24000);
      buffer.getChannelData(0).set(Array.from(dataInt16).map(v => v / 32768.0));
      return { audioBuffer: buffer };
  }
  return null;
};
