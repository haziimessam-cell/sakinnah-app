
import { GoogleGenAI, Chat, GenerateContentResponse, Modality, Type, FunctionDeclaration } from "@google/genai";
import { 
  SYSTEM_INSTRUCTION_AR,
  SYSTEM_INSTRUCTION_EN,
  RELATIONSHIP_PROTOCOL_AR,
  RELATIONSHIP_PROTOCOL_EN,
  EMPATHY_TRANSLATOR_PROMPT
} from "../constants";
import { Language } from "../types";

// Manual base64 decode following Google GenAI guidelines
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Manual audio decoding following Google GenAI guidelines
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
    model: 'gemini-3-pro-preview',
    config: {
      systemInstruction: systemInstruction,
      thinkingConfig: { thinkingBudget: 32768 }
    }
  });
};

export async function* sendMessageStreamToGemini(prompt: string, language: Language) {
  if (!chatInstance) {
    const ai = getAIInstance();
    chatInstance = ai.chats.create({ model: 'gemini-3-flash-preview' });
  }
  
  const stream = await chatInstance.sendMessageStream({ message: prompt });
  for await (const chunk of stream) {
    const c = chunk as GenerateContentResponse;
    yield c.text || "";
  }
}

// وظيفة لتوليد السؤال التكيفي التالي (Adaptive Assessment)
export const getNextAdaptiveQuestion = async (category: string, previousAnswers: any[], language: Language) => {
  const ai = getAIInstance();
  const instruction = language === 'ar' ? SYSTEM_INSTRUCTION_AR : SYSTEM_INSTRUCTION_EN;
  
  const prompt = `
  Context: Clinical Assessment for [${category}].
  Previous Answers: ${JSON.stringify(previousAnswers)}.
  
  Task:
  Based on the answers, generate the NEXT most relevant clinical question to narrow down the diagnosis.
  Follow DSM-5 criteria. 
  Output MUST be in JSON format: 
  {
    "text": "Question text here",
    "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
    "rationale": "Why this question is next"
  }
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: {
      systemInstruction: instruction,
      responseMimeType: "application/json",
      thinkingConfig: { thinkingBudget: 8192 }
    }
  });

  try {
      return JSON.parse(response.text || "{}");
  } catch (e) {
      return null;
  }
};

export const initializeMediator = async (language: Language) => {
  const ai = getAIInstance();
  const systemInstruction = language === 'ar' ? RELATIONSHIP_PROTOCOL_AR : RELATIONSHIP_PROTOCOL_EN;
  chatInstance = ai.chats.create({
    model: 'gemini-3-pro-preview',
    config: {
      systemInstruction: systemInstruction,
      thinkingConfig: { thinkingBudget: 32768 }
    }
  });
};

export const mediateDialogue = async (partnerA: string, partnerB: string, language: Language) => {
  if (!chatInstance) await initializeMediator(language);
  const prompt = `Partner A says: "${partnerA}"\nPartner B says: "${partnerB}"\nPlease mediate this dialogue between two partners. Provide empathetic guidance.`;
  const response = await chatInstance!.sendMessage({ message: prompt });
  return response.text;
};

export const sendMessageWithScientificLogic = async (prompt: string, context: string, language: Language) => {
  const ai = getAIInstance();
  const systemInstruction = language === 'ar' ? SYSTEM_INSTRUCTION_AR : SYSTEM_INSTRUCTION_EN;
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: (context ? `Relevant context: ${context}\n\n` : "") + prompt,
    config: {
      systemInstruction,
      tools: [{ googleSearch: {} }],
      thinkingConfig: { thinkingBudget: 16384 },
      temperature: 0.2
    }
  });

  return {
    text: response.text,
    sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
  };
};

export const generateContent = async (prompt: string, systemInstruction?: string): Promise<string> => {
  const ai = getAIInstance();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: { 
        systemInstruction: systemInstruction || undefined,
        thinkingConfig: { thinkingBudget: 4096 }
    }
  });
  return response.text || "";
};

export const generateClinicalRationale = async (catId: string, answers: string[], language: Language) => {
  const ai = getAIInstance();
  const baseInstruction = language === 'ar' ? SYSTEM_INSTRUCTION_AR : SYSTEM_INSTRUCTION_EN;

  const prompt = `
  Analyze the following assessment for category [${catId}].
  User Answers: ${JSON.stringify(answers)}
  
  Requirement:
  Explain the clinical reasoning behind the proposed plan. 
  Identify which specific answers indicate a clinical pattern.
  Suggest the primary evidence-based protocol (e.g., CBT-D, ERP, IPSRT).
  Output should be structured and professional.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: {
      systemInstruction: baseInstruction,
      thinkingConfig: { thinkingBudget: 32768 },
      temperature: 0.1
    }
  });

  return response.text;
};

export const getEmbedding = async (text: string): Promise<number[] | undefined> => {
  const ai = getAIInstance();
  try {
    const result = await (ai as any).models.embedContent({
      model: "text-embedding-004",
      content: { parts: [{ text }] },
    });
    return (result as any).embedding.values;
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
      const uint8 = decode(base64Audio);
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      const buffer = await decodeAudioData(uint8, ctx, 24000, 1);
      return { audioBuffer: buffer };
  }
  return null;
};
