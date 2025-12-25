
import { GoogleGenAI, Chat, GenerateContentResponse, Modality } from "@google/genai";
import { SYSTEM_LOCK_INSTRUCTION, BEHAVIORAL_AXES } from "../constants";
import { Language, Question, CaseReportData, SessionSummary } from "../types";
import { memoryService } from "./memoryService";

export const getAIInstance = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

let chatInstance: Chat | null = null;

export const initializeChat = async (historyId: string, baseInstruction: string, history: any[] = [], language: Language, username: string = "default_user") => {
    const ai = getAIInstance();
    const memoryContext = await memoryService.retrieveRelevantMemories("", username);
    const finalInstruction = `${baseInstruction}\n\n[MEMORY_CONTEXT]:\n${memoryContext}`;

    chatInstance = ai.chats.create({ 
        model: 'gemini-3-pro-preview',
        config: { 
            systemInstruction: finalInstruction,
            temperature: 0.7,
            topP: 0.9
        }
    });
};

export const getInitialAISalutation = async (category: string, language: Language, context?: string): Promise<string> => {
  const ai = getAIInstance();
  const sys = SYSTEM_LOCK_INSTRUCTION + `\nLanguage: ${language === 'ar' ? 'Arabic' : 'English'}`;
  const prompt = `As the designated persona (Sakinnah or Mama Mai), initiate a natural human-like therapeutic session for ${category}. 
  Apply relevant scientific protocols internally but DO NOT mention them. Speak naturally. Context: ${context || 'Initial Consultation'}.`;
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { systemInstruction: sys }
    });
    return response.text || (language === 'ar' ? "أهلاً بك. أنا هنا معك." : "Welcome. I am here with you.");
  } catch (e) {
    return language === 'ar' ? "مرحباً بك. لنبدأ جلستنا." : "Welcome. Let's begin our session.";
  }
};

export async function* sendMessageStreamToGemini(prompt: string, language: Language, username: string = "default_user") {
  if (!chatInstance) {
    const sys = SYSTEM_LOCK_INSTRUCTION + `\nLanguage: ${language === 'ar' ? 'Arabic' : 'English'}`;
    await initializeChat("default", sys, [], language, username);
  }
  memoryService.extractAndSaveMemory(prompt, username);
  const stream = await chatInstance!.sendMessageStream({ message: prompt });
  for await (const chunk of stream) {
    const c = chunk as GenerateContentResponse;
    yield c.text || "";
  }
}

export const generateTherapeuticQuestions = async (therapyType: string, language: Language): Promise<Question[]> => {
    const ai = getAIInstance();
    const axes = BEHAVIORAL_AXES.join(", ");
    const prompt = `Act as a senior clinical professional (Sakinnah or Mama Mai). Generate EXACTLY 10 specific scientific evaluation questions for ${therapyType}.
    MANDATORY MAPPING: Each question MUST map to one of these 10 behavioral axes: ${axes}.
    These questions MUST be derived from the specific references provided in your system instructions for this disorder.
    NEVER mention the references in the questions. Sound like a human doctor.
    Return ONLY a valid JSON array: 
    [{"id": "q1", "textAr": "...", "textEn": "...", "optionsAr": ["...", "..."], "optionsEn": ["...", "..."]}]`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: prompt,
            config: { 
                systemInstruction: SYSTEM_LOCK_INSTRUCTION,
                responseMimeType: "application/json" 
            }
        });
        const cleaned = (response.text || "[]").replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleaned);
    } catch (e) {
        console.error("Failed to generate clinical questions", e);
        return [];
    }
};

export const generateCaseReport = async (therapyType: string, answers: {question: string, answer: string}[], language: Language): Promise<CaseReportData | null> => {
    const ai = getAIInstance();
    const prompt = `Act as a senior clinical professional. Analyze these 10 assessment answers: ${JSON.stringify(answers)} for ${therapyType}.
    MANDATORY 5-PART BEHAVIORAL PLAN:
    1. "summary": A short, non-diagnostic case summary (human tone).
    2. "behavioralGoals": 3 clear behavioral goals based on the answers.
    3. "practicalSteps": 3-5 practical daily steps linked directly to the answers.
    4. "primaryStrategy": One primary coping or confrontation strategy.
    5. "nextSessionFocus": A specific focus point for the next session.
    
    STRICT RULES:
    - NO diagnosis.
    - NO scores or severity labels.
    - Behavior-focused only.
    - Language: ${language}.
    
    Return ONLY JSON:
    {
      "summary": "...",
      "behavioralGoals": ["...", "...", "..."],
      "practicalSteps": ["...", "...", "..."],
      "primaryStrategy": "...",
      "nextSessionFocus": "..."
    }`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: prompt,
            config: { 
                systemInstruction: SYSTEM_LOCK_INSTRUCTION,
                responseMimeType: "application/json" 
            }
        });
        const cleaned = (response.text || "{}").replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleaned);
        return { ...parsed, category: therapyType, timestamp: new Date().toISOString() };
    } catch (e) {
        console.error("Failed to generate report", e);
        return null;
    }
};

export const generateSessionSummary = async (categoryId: string, messages: any[], language: Language): Promise<SessionSummary | null> => {
    const ai = getAIInstance();
    const prompt = `Summarize this session for ${categoryId}. History: ${JSON.stringify(messages.map(m => m.text).slice(-20))}
    Return ONLY JSON:
    {
      "observations": ["observation 1", "observation 2"],
      "symptoms": ["symptom 1", "symptom 2"],
      "recommendations": ["evidence-based recommendation 1", "recommendation 2"]
    }
    Language: ${language}.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: { 
                systemInstruction: SYSTEM_LOCK_INSTRUCTION,
                responseMimeType: "application/json" 
            }
        });
        const cleaned = (response.text || "{}").replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleaned);
        return {
            id: Date.now().toString(),
            category: categoryId,
            date: new Date().toISOString(),
            observations: parsed.observations || [],
            symptoms: parsed.symptoms || [],
            recommendations: parsed.recommendations || [],
            type: 'SESSION'
        };
    } catch (e) {
        console.error("Failed to generate session summary", e);
        return null;
    }
};

export const generateContent = async (prompt: string, systemInstruction?: string): Promise<string> => {
    const ai = getAIInstance();
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: { systemInstruction: systemInstruction || SYSTEM_LOCK_INSTRUCTION }
        });
        return response.text || "";
    } catch (e) {
        return "";
    }
};

export const getEmbedding = async (text: string): Promise<number[] | undefined> => {
    const ai = getAIInstance();
    try {
        const result = await ai.models.embedContent({
            model: 'text-embedding-004',
            content: { parts: [{ text }] }
        });
        return result.embedding.values;
    } catch (e) {
        return undefined;
    }
};

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
        const audioBuffer = await decodeAudioData(decode(base64Audio), audioCtx, 24000, 1);
        return { audioBuffer };
    } catch (e) {
        return null;
    }
};

export const generateClinicalRationale = async (categoryId: string, answers: string[], language: Language): Promise<string> => {
    const ai = getAIInstance();
    const prompt = `As a senior clinical professional, based on these assessment answers for ${categoryId}: ${JSON.stringify(answers)}, provide a professional clinical rationale for the proposed care plan. STRICTLY follow the references but speak naturally. DO NOT mention the references by name. Language: ${language}.`;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: { systemInstruction: SYSTEM_LOCK_INSTRUCTION }
        });
        return response.text || "";
    } catch (e) {
        return "";
    }
};

// Add missing initializeMediator and mediateDialogue functions used by RelationshipMediator.

/**
 * Initializes the mediator chat session.
 * @param language The language for the session.
 */
export const initializeMediator = async (language: Language) => {
    const sys = `You are a neutral relationship mediator. Analyze arguments and help find common ground. Language: ${language === 'ar' ? 'Arabic' : 'English'}`;
    await initializeChat("mediator", sys, [], language);
};

/**
 * Mediates a dialogue between two partners.
 * @param partnerA Text from partner A.
 * @param partnerB Text from partner B.
 * @param language The language of the mediation.
 * @returns A string containing the mediation analysis.
 */
export const mediateDialogue = async (partnerA: string, partnerB: string, language: Language): Promise<string> => {
    const ai = getAIInstance();
    const prompt = `Analyze this conflict and mediate between Partner A and Partner B. Provide a neutral observation and a constructive path forward.
    Partner A says: "${partnerA}"
    Partner B says: "${partnerB}"
    Language: ${language}.`;
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: { systemInstruction: "You are a neutral relationship mediator." }
        });
        return response.text || "";
    } catch (e) {
        console.error("Mediation failed", e);
        return "";
    }
};
