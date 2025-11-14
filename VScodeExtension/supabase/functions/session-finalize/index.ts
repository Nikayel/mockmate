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

serve(async (req) => {
  const userId = sub(req.headers.get('authorization'));
  if (!userId) return json({ ok:false, error:'unauthorized' }, { status: 401 });
  try {
    const body = await req.json();
    const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const url = `${Deno.env.get('SUPABASE_URL')}/rest/v1/interview_sessions?id=eq.${body.session_id}&user_id=eq.${userId}`;
    const res = await fetch(url, { method: 'PATCH', headers: { apikey: key, Authorization: `Bearer ${key}`, 'content-type': 'application/json' }, body: JSON.stringify({ status: body.status ?? 'completed', ended_at: new Date().toISOString() }) });
    if (!res.ok) return json({ ok:false, error: await res.text() }, { status: 400 });
    return json({ ok:true });
  } catch (e) {
    return json({ ok:false, error: String(e) }, { status: 500 });
  }
});
