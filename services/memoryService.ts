
import { Memory, JournalEntry, SessionSummary } from "../types";
import { generateContent, getEmbedding } from "./geminiService";
import { MEMORY_EXTRACTION_PROMPT, INSIGHTS_SYSTEM_PROMPT_AR, INSIGHTS_SYSTEM_PROMPT_EN } from "../constants";

/**
 * ELEPHANT MEMORY SERVICE (Local Vector Store)
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
            const prompt = `${MEMORY_EXTRACTION_PROMPT}\n\nUser Text to Analyze: "${userText}"`;
            const jsonStr = await generateContent(prompt);
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
            if (existingMemories.length > 50) {
                existingMemories.sort((a, b) => b.importance - a.importance);
                existingMemories = existingMemories.slice(0, 50);
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
            .filter(item => item.score > 0.55) 
            .sort((a, b) => b.score - a.score)
            .slice(0, 4)
            .map(item => item.mem);

        const critical = memories.filter(m => m.importance === 5);
        const uniqueMemories = Array.from(new Set([...relevant, ...critical].map(m => m.id)))
            .map(id => [...relevant, ...critical].find(m => m.id === id));

        if (uniqueMemories.length === 0) return "";
        return `\n[RECALLED_MEMORIES]:\n${uniqueMemories.map(m => `- ${m?.content}`).join('\n')}\n`;
    },

    /**
     * HYPER-CONTEXTUAL INSIGHTS ENGINE
     * Connects Dots between Journals, Dreams, and Past Sessions
     */
    async generateDeepInsights(username: string, language: 'ar' | 'en' = 'ar'): Promise<any[]> {
        try {
            // 1. Collect all raw context
            const memories = JSON.parse(localStorage.getItem(`sakinnah_memories_${username}`) || '[]');
            const journals = JSON.parse(localStorage.getItem('sakinnah_journal') || '[]');
            const summaries = JSON.parse(localStorage.getItem('sakinnah_summaries') || '[]');

            if (memories.length < 3 && journals.length < 2) return [];

            // 2. Prepare data for Gemini (Aggregated String)
            const contextData = {
                significantMemories: memories.map((m: any) => m.content),
                journalExcerpts: journals.slice(0, 10).map((j: any) => j.text),
                sessionThemes: summaries.map((s: any) => s.category + ": " + s.points.join(', '))
            };

            const systemPrompt = language === 'ar' ? INSIGHTS_SYSTEM_PROMPT_AR : INSIGHTS_SYSTEM_PROMPT_EN;
            const userPrompt = `DATA TO ANALYZE:\n${JSON.stringify(contextData)}`;

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
