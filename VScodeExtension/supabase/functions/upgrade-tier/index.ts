// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

function json(body: any, init: ResponseInit = {}) {
  return new Response(JSON.stringify(body), { headers: { "content-type": "application/json" }, ...init });
}

function subFromAuth(auth?: string | null) {
  if (!auth) return null;
  const token = auth.replace(/^Bearer\s+/i, "");
  const p = token.split(".");
  if (p.length < 2) return null;
  try { return JSON.parse(atob(p[1])).sub ?? null; } catch { return null; }
}

serve(async (req) => {
  const userId = subFromAuth(req.headers.get('authorization'));
  if (!userId) return json({ ok: false, error: 'unauthorized' }, { status: 401 });
  try {
    const url = `${Deno.env.get('SUPABASE_URL')}/rest/v1/profiles?id=eq.${userId}`;
    const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const res = await fetch(url, { method: 'PATCH', headers: { apikey: key, Authorization: `Bearer ${key}`, 'content-type': 'application/json' }, body: JSON.stringify({ subscription_tier: 'pro' }) });
    if (!res.ok) {
      const text = await res.text();
      return json({ ok: false, error: text || res.statusText }, { status: 400 });
    }
    return json({ ok: true, subscription_tier: 'pro' });
  } catch (e) {
    return json({ ok: false, error: String(e) }, { status: 500 });
  }
});
