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
    const url = `${Deno.env.get('SUPABASE_URL')}/rest/v1/interview_sessions`;
    const payload = { user_id: userId, company: body.company, role: body.role, level: body.level, task_types: body.task_types, interviewer_persona: body.interviewer_persona, partner_persona: body.partner_persona, routing_policy: body.routing_policy };
    const res = await fetch(url, { method: 'POST', headers: { apikey: key, Authorization: `Bearer ${key}`, 'content-type': 'application/json', Prefer:'return=representation' }, body: JSON.stringify(payload) });
    const rows = await res.json();
    const id = rows?.[0]?.id;
    if (!id) return json({ ok:false, error:'insert failed' }, { status: 400 });
    return json({ ok:true, session_id: id });
  } catch (e) {
    return json({ ok:false, error: String(e) }, { status: 500 });
  }
});
