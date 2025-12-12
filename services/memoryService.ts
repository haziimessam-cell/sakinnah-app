
import { Memory } from "../types";
import { generateContent, getEmbedding } from "./geminiService";
import { MEMORY_EXTRACTION_PROMPT } from "../constants";
import { supabase } from "./supabaseClient";

/**
 * ELEPHANT MEMORY SERVICE (Local Vector Store)
 * 
 * This service implements a "Long-Term Memory" using a client-side Vector Database approach.
 * 1. Facts are extracted from conversation using Gemini Flash.
 * 2. Embeddings are generated using `text-embedding-004`.
 * 3. Memories + Embeddings are stored in `localStorage` (persisted).
 * 4. Retrieval uses Cosine Similarity to find relevant facts based on user query semantic meaning.
 */

// Utility: Calculate Cosine Similarity between two vectors
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
    
    /**
     * EXTRACT (Write):
     * Runs in the background after the user speaks.
     * Uses Gemini to find "Permanent Facts" and saves them with embeddings.
     */
    async extractAndSaveMemory(userText: string, username: string): Promise<void> {
        try {
            // 1. Ask Gemini to extract facts
            const prompt = `${MEMORY_EXTRACTION_PROMPT}\nUser Text: "${userText}"`;
            const jsonStr = await generateContent(prompt);
            
            if (!jsonStr) return;

            // Clean JSON
            const cleanJson = jsonStr.replace(/```json/g, '').replace(/```/g, '').trim();
            let memories: Partial<Memory>[] = [];
            try {
                memories = JSON.parse(cleanJson);
            } catch (e) {
                return;
            }

            if (!Array.isArray(memories) || memories.length === 0) return;

            console.log("🐘 Memories Extracted:", memories);

            // 2. Load Existing Memories
            const existingMemoriesStr = localStorage.getItem(`sakinnah_memories_${username}`);
            let existingMemories: Memory[] = existingMemoriesStr ? JSON.parse(existingMemoriesStr) : [];

            // 3. Process and Embed new memories
            for (const m of memories) {
                // Deduplication: Simple content check
                const isDuplicate = existingMemories.some(em => em.content.toLowerCase().includes(m.content?.toLowerCase() || '###'));
                
                if (!isDuplicate && m.content) {
                    // Generate Embedding
                    const embedding = await getEmbedding(m.content);
                    
                    const newMemory: Memory = {
                        id: Date.now().toString() + Math.random(),
                        content: m.content || '',
                        tags: m.tags || [],
                        importance: m.importance || 1,
                        timestamp: new Date().toISOString(),
                        embedding: embedding || undefined
                    };
                    existingMemories.push(newMemory);
                }
            }

            // 4. Save to Storage
            // Note: localStorage has 5MB limit. In production, move to Supabase/IndexedDB.
            localStorage.setItem(`sakinnah_memories_${username}`, JSON.stringify(existingMemories));

        } catch (e) {
            console.error("Memory Extraction Failed", e);
        }
    },

    /**
     * RECALL (Read):
     * Runs BEFORE the AI answers.
     * Finds relevant memories based on semantic similarity to the user's current input.
     */
    async retrieveRelevantMemories(userText: string, username: string): Promise<string> {
        const stored = localStorage.getItem(`sakinnah_memories_${username}`);
        if (!stored) return "";

        const memories: Memory[] = JSON.parse(stored);
        if (memories.length === 0) return "";

        // 1. Generate Embedding for current query
        const queryEmbedding = await getEmbedding(userText);

        // Fallback to simple Keyword matching if embedding fails or not available
        if (!queryEmbedding) {
            console.warn("⚠️ Embedding failed, falling back to keyword search.");
            const userTokens = userText.toLowerCase().split(/\s+/).filter(t => t.length > 2);
            const keywordMatches = memories.filter(mem => {
                return userTokens.some(token => mem.content.toLowerCase().includes(token) || mem.tags.some(tag => tag.includes(token)));
            });
            const criticalMemories = memories.filter(mem => mem.importance === 5);
            const final = [...new Set([...keywordMatches, ...criticalMemories])];
            if (final.length === 0) return "";
            return `\n[LONG_TERM_MEMORY (Keyword Fallback)]:\n${final.map(m => `- ${m.content}`).join('\n')}\n`;
        }

        // 2. Vector Search (Cosine Similarity)
        const scoredMemories = memories.map(mem => {
            if (!mem.embedding) return { mem, score: 0 };
            return {
                mem,
                score: cosineSimilarity(queryEmbedding, mem.embedding)
            };
        });

        // 3. Filter and Sort
        // Threshold 0.5 usually implies moderate relevance in semantic space
        const relevant = scoredMemories
            .filter(item => item.score > 0.5) 
            .sort((a, b) => b.score - a.score)
            .slice(0, 5) // Top 5 relevant facts
            .map(item => item.mem);

        // Always include Critical facts (e.g. medical info, major trauma) even if low similarity
        const critical = memories.filter(m => m.importance === 5);
        const uniqueMemories = [...new Set([...relevant, ...critical])];

        if (uniqueMemories.length === 0) return "";

        // Format for System Prompt
        const memoryContext = uniqueMemories.map(m => `- [FACT]: ${m.content}`).join('\n');
        
        return `\n[PERSONAL_KNOWLEDGE_BASE (Vector Match)]:\n${memoryContext}\n`;
    }
};
