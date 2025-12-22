
import { GoogleGenAI, Chat, GenerateContentResponse, Modality } from "@google/genai";
import { SYSTEM_INSTRUCTION_AR, SYSTEM_INSTRUCTION_EN } from "../constants";
import { Language } from "../types";

// Always initialize with apiKey in a named parameter
export const getAIInstance = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

let chatInstance: Chat | null = null;

/**
 * Initializes a chat session with a specific system instruction and optional history.
 */
export const initializeChat = async (historyId: string, systemInstruction: string, history: any[] = [], language: Language) => {
    const ai = getAIInstance();
    chatInstance = ai.chats.create({ 
        model: 'gemini-3-pro-preview',
        config: { systemInstruction }
    });
};

/**
 * Generates text content for one-off tasks like sentiment analysis, rephrasing, or rationale generation.
 */
export const generateContent = async (prompt: string, systemInstruction?: string): Promise<string> => {
    const ai = getAIInstance();
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: systemInstruction ? { systemInstruction } : undefined
    });
    return response.text || "";
};

/**
 * Generates embeddings for text to support psychological context retrieval and pattern matching.
 */
export const getEmbedding = async (text: string): Promise<number[] | null> => {
    try {
        const ai = getAIInstance();
        // Use type casting to ensure access to embedContent if standard types are restrictive
        const result = await (ai.models as any).embedContent({
            model: 'text-embedding-004',
            content: { parts: [{ text }] }
        });
        return result.embedding.values;
    } catch (e) {
        console.error("Embedding generation failed:", e);
        return null;
    }
};

/**
 * Generates a clinical rationale for a therapy plan based on assessment answers.
 */
export const generateClinicalRationale = async (category: string, answers: string[], language: Language): Promise<string> => {
    const prompt = `Analyze these assessment answers for the ${category} wing and provide a clinical rationale in ${language === 'ar' ? 'Arabic' : 'English'}: ${answers.join(', ')}`;
    return generateContent(prompt);
};

/**
 * Initializes the relationship mediator state.
 */
export const initializeMediator = (language: Language) => {
    // Placeholder for mediator initialization if specific state management is needed
};

/**
 * Mediate a dialogue between two partners using Gottman principles and empathy-focused reasoning.
 */
export const mediateDialogue = async (partnerA: string, partnerB: string, language: Language): Promise<string> => {
    const prompt = `Mediate this dialogue between Partner A and Partner B in ${language === 'ar' ? 'Arabic' : 'English'}.\nPartner A: ${partnerA}\nPartner B: ${partnerB}`;
    const sys = language === 'ar' ? 
        "أنت وسيط خبير في العلاقات. استخدم مبادئ غوتمان لمساعدة الطرفين على التواصل بشكل صحي." : 
        "You are an expert relationship mediator. Use Gottman principles to help partners communicate healthily.";
    return generateContent(prompt, sys);
};

/**
 * دالة تجعل الذكاء الاصطناعي يبدأ الحوار فوراً بناءً على القسم
 */
export const getInitialAISalutation = async (category: string, language: Language, context?: string): Promise<string> => {
  const ai = getAIInstance();
  const sys = language === 'ar' ? SYSTEM_INSTRUCTION_AR : SYSTEM_INSTRUCTION_EN;
  const prompt = `You are Sakinnah, a human-like digital psychiatrist. Start a session for the [${category}] wing. 
    Context about user: ${context || 'First time session'}. 
    Provide a warm, proactive greeting that invites the user to speak. Do not wait for them. Speak as a human.`;
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { systemInstruction: sys }
    });
    return response.text || "";
  } catch (e) {
    return language === 'ar' ? "أهلاً بك، أنا سكينة. كيف يمكنني دعمك اليوم؟" : "Welcome, I am Sakinnah. How can I support you today?";
  }
};

export async function* sendMessageStreamToGemini(prompt: string, language: Language) {
  if (!chatInstance) {
    const ai = getAIInstance();
    chatInstance = ai.chats.create({ 
        model: 'gemini-3-pro-preview',
        config: { systemInstruction: language === 'ar' ? SYSTEM_INSTRUCTION_AR : SYSTEM_INSTRUCTION_EN }
    });
  }
  const stream = await chatInstance.sendMessageStream({ message: prompt });
  for await (const chunk of stream) {
    const c = chunk as GenerateContentResponse;
    yield c.text || "";
  }
}

/**
 * Generates speech from text using gemini-2.5-flash-preview-tts and returns an AudioBuffer.
 */
export const generateSpeech = async (text: string, voiceName: string = 'Kore'): Promise<{ audioBuffer: AudioBuffer } | null> => {
    try {
        const ai = getAIInstance();
        const response = await ai.models.generateContent({
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

        const decode = (base64: string) => {
            const binaryString = atob(base64);
            const len = binaryString.length;
            const bytes = new Uint8Array(len);
            for (let i = 0; i < len; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }
            return bytes;
        };

        const decodeAudioData = async (
            data: Uint8Array,
            ctx: AudioContext,
            sampleRate: number,
            numChannels: number,
        ): Promise<AudioBuffer> => {
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
        };

        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        const audioBuffer = await decodeAudioData(
            decode(base64Audio),
            audioCtx,
            24000,
            1,
        );

        return { audioBuffer };
    } catch (e) {
        console.error("Speech generation failed:", e);
        return null;
    }
};
