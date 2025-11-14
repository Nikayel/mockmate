// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

function json(body: any, init: ResponseInit = {}) {
  return new Response(JSON.stringify(body), { headers: { "content-type": "application/json" }, ...init });
}

function sub(auth?: string | null) {
  if (!auth) return null;
  const t = auth.replace(/^Bearer\s+/i, "");
  const p = t.split('.')
  if (p.length < 2) return null;
  try { return JSON.parse(atob(p[1])).sub ?? null; } catch { return null; }
}

async function getProfile(userId: string) {
  const url = `${Deno.env.get('SUPABASE_URL')}/rest/v1/profiles?id=eq.${userId}`;
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const res = await fetch(url, { headers: { apikey: key, Authorization: `Bearer ${key}` } });
  const rows = await res.json();
  return rows?.[0] ?? null;
}

async function callOpenAI(model: string, system: string | undefined, user: string, maxTokens: number) {
  const key = Deno.env.get('OPENAI_API_KEY')!;
  const messages: any[] = [];
  if (system) messages.push({ role: 'system', content: system });
  messages.push({ role: 'user', content: user });
  const res = await fetch('https://api.openai.com/v1/chat/completions', { method: 'POST', headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ model, messages, max_tokens: maxTokens, temperature: 0.7 }) });
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? '';
}

async function callGemini(model: string, system: string | undefined, user: string, maxTokens: number) {
  const key = Deno.env.get('GOOGLE_API_KEY')!;
  const endpoint = 'https://generativelanguage.googleapis.com/v1beta/models';
  const text = [system, user].filter(Boolean).join('\n\n');
  const url = `${endpoint}/${encodeURIComponent(model)}:generateContent?key=${key}`;
  const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents: [{ parts: [{ text }] }], generationConfig: { maxOutputTokens: maxTokens, temperature: 0.7 } }) });
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
}

serve(async (req) => {
  const userId = sub(req.headers.get('authorization'));
  if (!userId) return json({ ok:false, error:'unauthorized' }, { status: 401 });
  try {
    const body = await req.json();
    const profile = await getProfile(userId);
    const tier = profile?.subscription_tier ?? 'free';
    const persona = body.persona as 'interviewer'|'codingPartner';

    // Simple routing policy on server: mirror client defaults for now
    let provider: 'openai'|'gemini' = 'openai';
    let model = 'gpt-3.5-turbo';
    if (tier === 'pro' && persona === 'codingPartner') { provider = 'openai'; model = 'gpt-4o'; }
    if (tier === 'free') { provider = 'gemini'; model = 'gemini-1.5-flash'; }

    const maxTokens = Math.min(1024, body.maxTokens ?? 1024);
    const text = provider === 'openai'
      ? await callOpenAI(model, body.system, body.user, maxTokens)
      : await callGemini(model, body.system, body.user, maxTokens);

    return json({ ok:true, text, provider, model });
  } catch (e) {
    return json({ ok:false, error: String(e) }, { status: 500 });
  }
});
