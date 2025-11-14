// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

function json(body: any, init: ResponseInit = {}) {
  return new Response(JSON.stringify(body), { headers: { "content-type": "application/json" }, ...init });
}

function decodeSubFromJwt(authHeader?: string | null): string | null {
  if (!authHeader) return null;
  const token = authHeader.replace(/^Bearer\s+/i, "");
  const parts = token.split(".");
  if (parts.length < 2) return null;
  try {
    const payload = JSON.parse(atob(parts[1]));
    return payload.sub ?? null;
  } catch {
    return null;
  }
}

async function getProfile(userId: string) {
  const url = `${Deno.env.get("SUPABASE_URL")}/rest/v1/profiles?id=eq.${userId}`;
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const res = await fetch(url, { headers: { apikey: key, Authorization: `Bearer ${key}` } });
  const rows = await res.json();
  return rows?.[0] ?? null;
}

async function upsertProfile(userId: string, patch: Record<string, unknown>) {
  const url = `${Deno.env.get("SUPABASE_URL")}/rest/v1/profiles?id=eq.${userId}`;
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  await fetch(url, { method: "PATCH", headers: { apikey: key, Authorization: `Bearer ${key}`, "content-type": "application/json" }, body: JSON.stringify(patch) });
}

function nextMonthUtc() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1, 0, 0, 0));
}

serve(async (req) => {
  try {
    const userId = decodeSubFromJwt(req.headers.get("authorization"));
    if (!userId) return json({ ok: false, error: "unauthorized" }, { status: 401 });

    const prof = await getProfile(userId);
    if (!prof) {
      // create minimal profile
      const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      await fetch(`${Deno.env.get("SUPABASE_URL")}/rest/v1/profiles`, { method: "POST", headers: { apikey: key, Authorization: `Bearer ${key}`, "content-type": "application/json" }, body: JSON.stringify({ id: userId, subscription_tier: "free", simulations_used: 0, usage_reset_date: nextMonthUtc().toISOString() }) });
    }

    const profile = prof ?? await getProfile(userId);

    let simulations_used = profile.simulations_used ?? 0;
    let usage_reset_date = profile.usage_reset_date ? new Date(profile.usage_reset_date) : null;
    if (!usage_reset_date || Date.now() >= usage_reset_date.getTime()) {
      simulations_used = 0;
      usage_reset_date = nextMonthUtc();
    }

    const tier = (profile.subscription_tier ?? 'free') as string;
    const limits: Record<string, number> = { free: 3, pro: 30 };
    const limit = limits[tier] ?? 3;

    if (simulations_used >= limit) {
      await upsertProfile(userId, { simulations_used, usage_reset_date: usage_reset_date.toISOString() });
      return json({ ok: false, message: "Monthly free limit reached. Upgrade to continue." }, { status: 402 });
    }

    simulations_used += 1;
    await upsertProfile(userId, { simulations_used, usage_reset_date: usage_reset_date.toISOString() });
    return json({ ok: true, simulations_used, limit });
  } catch (e) {
    return json({ ok: false, error: String(e) }, { status: 500 });
  }
});
