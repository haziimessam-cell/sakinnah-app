
import { GoogleGenAI, Chat, GenerateContentResponse, Modality } from "@google/genai";
import { SYSTEM_INSTRUCTION_AR, SYSTEM_INSTRUCTION_EN } from "../constants";
import { Language } from "../types";
import { ragService } from "./ragService";

export const getAIInstance = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

let chatInstance: Chat | null = null;

export const initializeChat = async (historyId: string, systemInstruction: string, history: any[] = [], language: Language) => {
    const ai = getAIInstance();
    chatInstance = ai.chats.create({ 
        model: 'gemini-3-pro-preview',
        config: { systemInstruction }
    });
};

export const generateContent = async (prompt: string, systemInstruction?: string): Promise<string> => {
    const ai = getAIInstance();
    const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt,
        config: systemInstruction ? { systemInstruction } : undefined
    });
    return response.text || "";
};

// Fixed: Added missing mediator functions for RelationshipMediator component
export const initializeMediator = async (language: Language) => {
    const ai = getAIInstance();
    chatInstance = ai.chats.create({ 
        model: 'gemini-3-pro-preview',
        config: { systemInstruction: language === 'ar' ? SYSTEM_INSTRUCTION_AR : SYSTEM_INSTRUCTION_EN }
    });
};

export const mediateDialogue = async (partnerA: string, partnerB: string, language: Language): Promise<string> => {
    const prompt = `Act as an expert AI Relationship Mediator. 
    Partner A says: "${partnerA}"
    Partner B says: "${partnerB}"
    Based on Gottman principles and Non-Violent Communication (NVC), analyze the interaction, identify underlying needs, and suggest a compassionate path forward in ${language === 'ar' ? 'Arabic' : 'English'}.`;
    
    return generateContent(prompt, language === 'ar' ? SYSTEM_INSTRUCTION_AR : SYSTEM_INSTRUCTION_EN);
};

export const getEmbedding = async (text: string): Promise<number[] | null> => {
    try {
        const ai = getAIInstance();
        const result = await (ai.models as any).embedContent({
            model: 'text-embedding-004',
            content: { parts: [{ text }] }
        });
        return result.embedding.values;
    } catch (e) {
        return null;
    }
};

export const generateClinicalRationale = async (category: string, answers: string[], language: Language): Promise<string> => {
    const prompt = `Based on these clinical assessments for the [${category}] wing, provide a professional psychiatric formulation in ${language === 'ar' ? 'Arabic' : 'English'}: ${answers.join(', ')}`;
    const system = language === 'ar' ? "أنت استشاري طب نفسي، قدم صياغة حالة إكلينيكية دقيقة." : "You are a consultant psychiatrist, provide a precise clinical case formulation.";
    return generateContent(prompt, system);
};

export const getInitialAISalutation = async (category: string, language: Language, context?: string): Promise<string> => {
  const ai = getAIInstance();
  const sys = language === 'ar' ? SYSTEM_INSTRUCTION_AR : SYSTEM_INSTRUCTION_EN;
  const scientificContext = ragService.retrieveContext(category, language);
  
  const prompt = `Start a session for the [${category}] wing. 
    Context: ${context || 'First time'}. 
    Evidence-based guidance: ${scientificContext}.
    Provide a warm, professional, and proactive greeting. No AI mentions.`;
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { systemInstruction: sys }
    });
    return response.text || "";
  } catch (e) {
    return language === 'ar' ? "أهلاً بك، أنا د. سكينة. أنا هنا لأستمع إليك، كيف حالك اليوم؟" : "Welcome, I am Dr. Sakinnah. I am here for you, how are you feeling today?";
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

  // Inject RAG context into the stream request for scientific accuracy
  const clinicalContext = ragService.retrieveContext(prompt, language);
  const enrichedPrompt = clinicalContext ? `[CLINICAL_GUIDANCE]: ${clinicalContext}\n\n[PATIENT_INPUT]: ${prompt}` : prompt;

  const stream = await chatInstance.sendMessageStream({ message: enrichedPrompt });
  for await (const chunk of stream) {
    const c = chunk as GenerateContentResponse;
    yield c.text || "";
  }
}

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
        return null;
    }
};
