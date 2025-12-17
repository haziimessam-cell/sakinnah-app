import { GoogleGenAI, Chat, GenerateContentResponse, Modality } from "@google/genai";
import { SYSTEM_INSTRUCTION_AR, SYSTEM_INSTRUCTION_EN } from "../constants";
import { Language } from "../types";

// Always use process.env.API_KEY directly as per guidelines
const aiClient = new GoogleGenAI({ apiKey: process.env.API_KEY });

let chatSession: Chat | null = null;

export const initializeChat = async (
  contextPrompt: string, 
  baseInstructionOverride?: string, 
  history?: any[], 
  language: Language = 'ar'
) => {
  const defaultBase = language === 'ar' ? SYSTEM_INSTRUCTION_AR : SYSTEM_INSTRUCTION_EN;
  const baseInstruction = baseInstructionOverride || defaultBase;
  const fullSystemInstruction = `${baseInstruction}\n\n[Context/Session Info]: ${contextPrompt}`;

  try {
    chatSession = aiClient.chats.create({
      model: "gemini-3-flash-preview",
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
};

export const sendMessageStreamToGemini = async function* (message: string, language: Language = 'ar') {
  if (chatSession) {
    try {
        const result = await chatSession.sendMessageStream({ message });
        for await (const chunk of result) {
          const response = chunk as GenerateContentResponse;
          // Use .text property directly as per guidelines
          const text = response.text;
          if (text) yield text;
        }
    } catch (error) {
        console.error("Gemini Error:", error);
        yield language === 'ar' ? "عذراً، حدث خطأ في الاتصال." : "Connection error.";
    }
    return;
  }
  yield language === 'ar' ? "يرجى إضافة مفتاح API لتمكين المحادثة." : "Please add an API Key to enable chat.";
};

export const generateContent = async (prompt: string, systemInstruction?: string) => {
    try {
        const response = await aiClient.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: "application/json"
            }
        });
        // Use .text property directly as per guidelines
        return response.text;
    } catch (e) {
        console.error("Generate Content Error", e);
        return null;
    }
};

// Added getEmbedding export to fix memoryService error
export const getEmbedding = async (text: string) => {
    try {
        const response = await aiClient.models.embedContent({
            model: "text-embedding-004",
            content: text,
        });
        // Returns the embedding values as a number array
        return response.embedding?.values;
    } catch (e) {
        console.error("Embedding Error", e);
        return null;
    }
};

/**
 * HIGH QUALITY GEMINI TTS
 * Decodes raw PCM audio from Gemini for realistic voice output.
 */

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

export const generateSpeech = async (text: string, voiceName: string = 'Aoife') => {
  try {
    const response = await aiClient.models.generateContent({
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
    });

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
  } catch (error) {
    console.error("Gemini TTS Error:", error);
    return null;
  }
};