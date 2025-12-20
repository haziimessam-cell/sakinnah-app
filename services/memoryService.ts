
import { Memory, JournalEntry, SessionSummary } from "../types";
import { generateContent, getEmbedding } from "./geminiService";
import { MEMORY_EXTRACTION_PROMPT, INSIGHTS_SYSTEM_PROMPT_AR, INSIGHTS_SYSTEM_PROMPT_EN } from "../constants";

/**
 * محرك الذاكرة العميقة (The Elephant Memory Engine)
 * يقوم بتحليل السياق النفسي وحفظه كمتجهات (Vectors) للرجوع إليها لاحقاً.
 */

const cosineSimilarity = (vecA: number[], vecB: number[]) => {
    if (vecA.length !== vecB.length) return 0;
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }
    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};

export const memoryService = {
    
    async extractAndSaveMemory(userText: string, username: string): Promise<void> {
        try {
            // تحديث البرومبت ليكون أكثر تركيزاً على الحالة النفسية
            const enhancedPrompt = `
            Analyze this therapeutic dialogue. Extract:
            1. Key Emotional Triggers.
            2. Core Beliefs revealed.
            3. Significant Life Events mentioned.
            4. Behavioral Patterns.
            Return as a clean JSON list of memory objects.
            Dialogue: "${userText}"`;

            const jsonStr = await generateContent(enhancedPrompt);
            if (!jsonStr) return;
            const cleanJson = jsonStr.replace(/```json/g, '').replace(/```/g, '').trim();
            let memories: any[] = [];
            try { memories = JSON.parse(cleanJson); } catch (e) { return; }
            if (!Array.isArray(memories) || memories.length === 0) return;

            const key = `sakinnah_memories_${username}`;
            const existingMemoriesStr = localStorage.getItem(key);
            let existingMemories: Memory[] = existingMemoriesStr ? JSON.parse(existingMemoriesStr) : [];

            for (const m of memories) {
                const isDuplicate = existingMemories.some(em => 
                    em.content.toLowerCase().includes(m.content?.toLowerCase()) || 
                    (m.content?.toLowerCase().includes(em.content.toLowerCase()))
                );
                
                if (!isDuplicate && m.content) {
                    const embedding = await getEmbedding(m.content);
                    if (embedding) {
                        existingMemories.push({
                            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                            content: m.content,
                            tags: m.tags || [],
                            importance: m.importance || 1,
                            timestamp: new Date().toISOString(),
                            embedding: embedding
                        });
                    }
                }
            }
            // الاحتفاظ بأهم 100 ذكرى نفسية
            if (existingMemories.length > 100) {
                existingMemories.sort((a, b) => b.importance - a.importance);
                existingMemories = existingMemories.slice(0, 100);
            }
            localStorage.setItem(key, JSON.stringify(existingMemories));
        } catch (e) { console.error("Memory Extraction Failed", e); }
    },

    async retrieveRelevantMemories(userText: string, username: string): Promise<string> {
        const key = `sakinnah_memories_${username}`;
        const stored = localStorage.getItem(key);
        if (!stored) return "";
        const memories: Memory[] = JSON.parse(stored);
        if (memories.length === 0) return "";

        const queryEmbedding = await getEmbedding(userText);
        if (!queryEmbedding) return "";

        const scoredMemories = memories.map(mem => ({
            mem,
            score: mem.embedding ? cosineSimilarity(queryEmbedding, mem.embedding) : 0
        }));

        const relevant = scoredMemories
            .filter(item => item.score > 0.6) // زيادة دقة المطابقة
            .sort((a, b) => b.score - a.score)
            .slice(0, 5)
            .map(item => item.mem);

        if (relevant.length === 0) return "";
        return `\n[PSYCHOLOGICAL_CONTEXT_RECALLED]:\n${relevant.map(m => `- ${m?.content}`).join('\n')}\n`;
    },

    async generateDeepInsights(username: string, language: 'ar' | 'en' = 'ar'): Promise<any[]> {
        try {
            const memories = JSON.parse(localStorage.getItem(`sakinnah_memories_${username}`) || '[]');
            const journals = JSON.parse(localStorage.getItem('sakinnah_journal') || '[]');
            const summaries = JSON.parse(localStorage.getItem('sakinnah_summaries') || '[]');

            if (memories.length < 3 && journals.length < 2) return [];

            const contextData = {
                significantMemories: memories.map((m: any) => m.content),
                journalExcerpts: journals.slice(0, 15).map((j: any) => j.text),
                sessionThemes: summaries.map((s: any) => s.category + ": " + s.points.join(', '))
            };

            const systemPrompt = language === 'ar' ? INSIGHTS_SYSTEM_PROMPT_AR : INSIGHTS_SYSTEM_PROMPT_EN;
            const userPrompt = `PERFORM DEEP BEHAVIORAL ANALYSIS ON THIS DATA:\n${JSON.stringify(contextData)}`;

            const result = await generateContent(userPrompt, systemPrompt);
            if (!result) return [];

            const cleanJson = result.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(cleanJson);
        } catch (e) {
            console.error("Deep Insights Generation Failed", e);
            return [];
        }
    }
};
