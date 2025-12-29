
import { GoogleGenAI, Chat, GenerateContentResponse, Modality } from "@google/genai";
import { SYSTEM_LOCK_INSTRUCTION, BEHAVIORAL_AXES } from "../constants";
import { Language, Question, CaseReportData, SessionSummary } from "../types";
import { memoryService } from "./memoryService";
import { CLINICAL_CORE } from "../clinical_core";

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
  const lowerCat = category.toLowerCase();
  const coreData = CLINICAL_CORE[lowerCat];
  
  let instruction = SYSTEM_LOCK_INSTRUCTION;
  if (coreData) {
      instruction += `\n[STRICT CLINICAL CORE]: ${JSON.stringify(coreData)}`;
  }
  
  const sys = instruction + `\nLanguage: ${language === 'ar' ? 'Arabic' : 'English'}`;
  const prompt = `As the designated clinical persona, initiate a therapeutic session for ${category}. Context: ${context || 'Initial Session'}.`;
  
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

/**
 * FIXED: Strictly use Clinical Core registry questions.
 * AI localizes/formats but never invents new clinical questions.
 */
export const generateTherapeuticQuestions = async (therapyType: string, language: Language): Promise<Question[]> => {
    const coreKey = therapyType.toLowerCase();
    const coreData = CLINICAL_CORE[coreKey];
    
    if (!coreData) {
        console.warn(`Clinical Core missing for: ${therapyType}. Falling back to default protocol.`);
        return []; 
    }

    const ai = getAIInstance();
    const prompt = `Format these EXACT 10 assessment questions for ${therapyType} into the standard Sakinnah JSON format.
    QUESTIONS FROM CORE: ${JSON.stringify(coreData.assessment_questions)}
    
    Format: [{"id": "q1", "textAr": "...", "textEn": "...", "optionsAr": ["غير موجود", "خفيف", "متوسط", "شديد"], "optionsEn": ["Not at all", "Mild", "Moderate", "Severe"]}]
    RULE: textAr must be provided from Core if available, or translated with extreme precision. 
    Return ONLY JSON.`;

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
        // Ultimate fallback: Direct mapping from core
        return coreData.assessment_questions.map((q: any) => ({
            id: `q${q.id}`,
            textAr: q.question,
            textEn: q.question, // Assuming core might only have one for now, or would need mapping
            optionsAr: ["غير موجود", "خفيف", "متوسط", "شديد"],
            optionsEn: ["Not at all", "Mild", "Moderate", "Severe"]
        }));
    }
};

export const generateCaseReport = async (therapyType: string, answers: {question: string, answer: string}[], language: Language): Promise<CaseReportData | null> => {
    const coreKey = therapyType.toLowerCase();
    const coreData = CLINICAL_CORE[coreKey];
    const ai = getAIInstance();
    
    const prompt = `Analyze these 10 assessment answers using the provided IMMUTABLE CLINICAL CORE.
    [STRICT CLINICAL CORE]: ${JSON.stringify(coreData)}
    [ANSWERS]: ${JSON.stringify(answers)}
    
    MANDATORY BEHAVIORAL PLAN RULES:
    1. "summary": expert case summary using "clinical_definition" from core.
    2. "behavioralGoals": 3 clear goals linked to "therapeutic_models" focus areas.
    3. "practicalSteps": daily actions derived from mapping answers to "maps_to" indicators in core.
    4. "primaryStrategy": Key intervention from core models (CBT/ACT/Exposure).
    5. "nextSessionFocus": Focus derived from core severity logic.
    
    Return ONLY JSON:
    {
      "summary": "...",
      "behavioralGoals": ["...", "...", "..."],
      "practicalSteps": ["...", "..."],
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
    const coreData = CLINICAL_CORE[categoryId.toLowerCase()];
    const prompt = `Summarize this therapeutic session for ${categoryId}. 
    STRICTLY follow this clinical model: ${JSON.stringify(coreData?.therapeutic_models || "Standard CBT")}
    Return ONLY JSON matching SessionSummary schema.`;

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
        // Fix: Use 'content' (singular) for single embedding request and access 'embedding.values' in response.
        // This avoids accessing the method 'values()' on an array, which caused an IterableIterator error.
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
    const coreData = CLINICAL_CORE[categoryId.toLowerCase()];
    const prompt = `Based on these assessment results for ${categoryId}, explain the scientific rationale for the suggested behavioral plan. 
    STRICTLY reference these models: ${JSON.stringify(coreData?.therapeutic_models || "CBT")}
    DO NOT cite the references by name. Use a professional clinical tone. Answers: ${JSON.stringify(answers)}.`;
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

export const initializeMediator = async (language: Language) => {
    const sys = `You are a neutral relationship mediator. Follow NVC (Non-Violent Communication) protocols. Language: ${language === 'ar' ? 'Arabic' : 'English'}`;
    await initializeChat("mediator", sys, [], language);
};

export const mediateDialogue = async (partnerA: string, partnerB: string, language: Language): Promise<string> => {
    const ai = getAIInstance();
    const prompt = `Mediate this conflict using clinical techniques: Partner A: "${partnerA}", Partner B: "${partnerB}". Language: ${language}.`;
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: { systemInstruction: "You are a neutral relationship mediator." }
        });
        return response.text || "";
    } catch (e) {
        return "";
    }
};
