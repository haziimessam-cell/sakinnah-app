import { Memory } from "../types";
import { generateContent, getEmbedding } from "./geminiService";
import { MEMORY_EXTRACTION_PROMPT } from "../constants";

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
        if (!userText || !username || typeof userText !== 'string' || typeof username !== 'string') {
            console.warn('Invalid input to extractAndSaveMemory');
            return;
        }

        try {
            // 1. Ask Gemini to extract facts
            // We use a cleaner prompt format to ensure JSON validity
            const prompt = `${MEMORY_EXTRACTION_PROMPT}\n\nUser Text to Analyze: "${userText}"`;
            
            const jsonStr = await generateContent(prompt);
            
            if (!jsonStr) return;

            // Clean JSON (remove markdown blocks if present)
            const cleanJson = jsonStr.replace(/```json/g, '').replace(/```/g, '').trim();
            
            let memories: any[] = [];
            try {
                memories = JSON.parse(cleanJson);
            } catch (e) {
                console.warn("Failed to parse memory JSON", e);
                return;
            }

            if (!Array.isArray(memories) || memories.length === 0) return;

            console.log("🧠 Extracted Facts:", memories);

            // 2. Load Existing Memories
            const key = `sakinnah_memories_${username}`;
            const existingMemoriesStr = localStorage.getItem(key);
            let existingMemories: Memory[] = existingMemoriesStr ? JSON.parse(existingMemoriesStr) : [];

            // 3. Process and Embed new memories
            for (const m of memories) {
                // Deduplication: Check if content already exists
                const isDuplicate = existingMemories.some(em => 
                    em.content.toLowerCase().includes(m.content?.toLowerCase()) || 
                    (m.content?.toLowerCase().includes(em.content.toLowerCase()))
                );
                
                if (!isDuplicate && m.content) {
                    // Generate Embedding
                    const embedding = await getEmbedding(m.content);
                    
                    if (embedding) {
                        const newMemory: Memory = {
                            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                            content: m.content,
                            tags: m.tags || [],
                            importance: m.importance || 1,
                            timestamp: new Date().toISOString(),
                            embedding: embedding
                        };
                        existingMemories.push(newMemory);
                    }
                }
            }

            // 4. Save to Storage
            // Limit to last 50 memories to prevent localStorage overflow
            if (existingMemories.length > 50) {
                // Sort by importance, then date, keep top 50
                existingMemories.sort((a, b) => b.importance - a.importance);
                existingMemories = existingMemories.slice(0, 50);
            }
            
            localStorage.setItem(key, JSON.stringify(existingMemories));

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
        if (!userText || !username || typeof userText !== 'string' || typeof username !== 'string') {
            console.warn('Invalid input to retrieveRelevantMemories');
            return "";
        }

        try {
            const key = `sakinnah_memories_${username}`;
            const stored = localStorage.getItem(key);
            if (!stored) return "";

        const memories: Memory[] = JSON.parse(stored);
        if (memories.length === 0) return "";

        // 1. Generate Embedding for current query
        const queryEmbedding = await getEmbedding(userText);

        // Fallback to simple Keyword matching if embedding fails
        if (!queryEmbedding) {
            const userTokens = userText.toLowerCase().split(/\s+/).filter(t => t.length > 3);
            const keywordMatches = memories.filter(mem => {
                return userTokens.some(token => 
                    mem.content.toLowerCase().includes(token) || 
                    mem.tags.some(tag => tag.toLowerCase().includes(token))
                );
            });
            // Also include high importance memories always
            const criticalMemories = memories.filter(mem => mem.importance >= 4);
            const final = [...new Set([...keywordMatches, ...criticalMemories])];
            
            if (final.length === 0) return "";
            return `\n[LONG_TERM_MEMORY (Keyword Match)]:\n${final.map(m => `- ${m.content}`).join('\n')}\n`;
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
        // Threshold 0.6 implies good semantic relevance
        const relevant = scoredMemories
            .filter(item => item.score > 0.55) 
            .sort((a, b) => b.score - a.score)
            .slice(0, 4) // Top 4 relevant facts
            .map(item => item.mem);

        // Always include Critical facts (importance 5) to ensure safety/context
        const critical = memories.filter(m => m.importance === 5);
        
        // Merge and Dedupe
        const uniqueMemories = Array.from(new Set([...relevant, ...critical].map(m => m.id)))
            .map(id => [...relevant, ...critical].find(m => m.id === id));

        if (uniqueMemories.length === 0) return "";

        // Format for System Prompt
        const memoryContext = uniqueMemories.map(m => `- ${m?.content}`).join('\n');

        return `\n[RECALLED_MEMORIES_FROM_VECTOR_DB]:\n${memoryContext}\n`;
        } catch (error) {
            console.error('Error in retrieveRelevantMemories:', error);
            return "";
        }
    }
};
