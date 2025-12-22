
import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
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
