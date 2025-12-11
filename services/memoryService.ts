
import { Memory } from "../types";
import { generateContent } from "./geminiService";
import { MEMORY_EXTRACTION_PROMPT } from "../constants";
import { supabase } from "./supabaseClient";

/**
 * ELEPHANT MEMORY SERVICE (Simulated RAG)
 * 
 * In a real production environment with pgvector:
 * 1. We would generate an embedding for the user's input (using OpenAI or Gemini Embedding API).
 * 2. We would query Supabase: `rpc('match_documents', { query_embedding: ... })`.
 * 
 * Since we are in a client-side environment without a dedicated embedding server,
 * we use "Keyword/Tag Matching" + "LLM Extraction" to simulate this effect perfectly for the user.
 */

export const memoryService = {
    
    /**
     * EXTRACT (Write):
     * Runs in the background after the user speaks.
     * Uses Gemini to find "Permanent Facts" and saves them.
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
                // Sometime AI returns non-json text if no facts found
                return;
            }

            if (!Array.isArray(memories) || memories.length === 0) return;

            console.log("🐘 Memories Extracted:", memories);

            // 2. Save to Storage (Supabase or Local)
            const existingMemoriesStr = localStorage.getItem(`sakinnah_memories_${username}`);
            let existingMemories: Memory[] = existingMemoriesStr ? JSON.parse(existingMemoriesStr) : [];

            memories.forEach(m => {
                // Avoid duplicates based on content similarity (simple check)
                const isDuplicate = existingMemories.some(em => em.content.includes(m.content || '###'));
                if (!isDuplicate && m.content) {
                    const newMemory: Memory = {
                        id: Date.now().toString() + Math.random(),
                        content: m.content || '',
                        tags: m.tags || [],
                        importance: m.importance || 1,
                        timestamp: new Date().toISOString()
                    };
                    existingMemories.push(newMemory);
                }
            });

            localStorage.setItem(`sakinnah_memories_${username}`, JSON.stringify(existingMemories));

            // Sync to Cloud (Silent) in a real app
            // supabase.from('memories').insert(...)

        } catch (e) {
            console.error("Memory Extraction Failed", e);
        }
    },

    /**
     * RECALL (Read):
     * Runs BEFORE the AI answers.
     * Finds relevant memories based on the user's current text.
     */
    retrieveRelevantMemories(userText: string, username: string): string {
        const stored = localStorage.getItem(`sakinnah_memories_${username}`);
        if (!stored) return "";

        const memories: Memory[] = JSON.parse(stored);
        if (memories.length === 0) return "";

        // Enhanced Semantic/Keyword Matching (Simulation of Vector Search)
        // Normalize text: lowercase, remove punctuation, split by space
        const userTokens = userText.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, ' ').split(/\s+/).filter(t => t.length > 2);
        
        const relevant = memories.filter(mem => {
            // 1. Tag Match
            const tagMatch = mem.tags.some(tag => userTokens.some(token => tag.toLowerCase().includes(token) || token.includes(tag.toLowerCase())));
            
            // 2. Content Keyword Match (for names not in tags)
            const contentMatch = userTokens.some(token => mem.content.toLowerCase().includes(token));

            return tagMatch || contentMatch;
        });

        // Always include very high importance memories (Level 5) to maintain context continuity
        const criticalMemories = memories.filter(mem => mem.importance === 5);
        
        // Merge and unique
        const allRelevantIds = new Set([...relevant, ...criticalMemories].map(m => m.id));
        const finalMemories = memories.filter(m => allRelevantIds.has(m.id));

        if (finalMemories.length === 0) return "";

        // Format for System Prompt
        const memoryContext = finalMemories.map(m => `- [FACT]: ${m.content} (Tags: ${m.tags.join(', ')})`).join('\n');
        
        return `\n[LONG_TERM_MEMORY_DATABASE_RESULT]:\n${memoryContext}\n`;
    }
};
