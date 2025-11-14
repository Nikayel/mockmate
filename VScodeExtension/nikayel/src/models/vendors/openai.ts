import fetch from 'node-fetch';

export function createOpenAIClient() {
    const apiKey = process.env.OPENAI_API_KEY;
    return {
        async chat(input: { system?: string; user: string; model: string; maxTokens: number; stream: boolean; }): Promise<string> {
            if (!apiKey) { throw new Error('OPENAI_API_KEY not set'); }
            const messages: Array<{ role: 'system' | 'user'; content: string; }> = [];
            if (input.system) { messages.push({ role: 'system', content: input.system }); }
            messages.push({ role: 'user', content: input.user });
            const res = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: input.model,
                    messages,
                    max_tokens: input.maxTokens,
                    temperature: 0.7,
                    stream: false
                })
            });
            if (!res.ok) { throw new Error(`OpenAI error: ${res.status} ${res.statusText}`); }
            const data = await res.json();
            return data.choices?.[0]?.message?.content ?? '';
        }
    };
}


