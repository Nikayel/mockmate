import fetch from 'node-fetch';

export function createGeminiClient() {
    const apiKey = process.env.GOOGLE_API_KEY;
    const endpoint = 'https://generativelanguage.googleapis.com/v1beta/models';
    return {
        async chat(input: { system?: string; user: string; model: string; maxTokens: number; stream: boolean; }): Promise<string> {
            if (!apiKey) { throw new Error('GOOGLE_API_KEY not set'); }
            // Using text-only prompt for MVP
            const prompt = [input.system, input.user].filter(Boolean).join('\n\n');
            const url = `${endpoint}/${encodeURIComponent(input.model)}:generateContent?key=${apiKey}`;
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: { maxOutputTokens: input.maxTokens, temperature: 0.7 }
                })
            });
            if (!res.ok) { throw new Error(`Gemini error: ${res.status} ${res.statusText}`); }
            const data = await res.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
            return text;
        }
    };
}


