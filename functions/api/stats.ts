import { StatsResponse } from "../../types";
// GET /api/stats
// Returns per-certificate visit totals, last-7-days counts, and a country breakdown.
//
// NOTE: this endpoint is unauthenticated in this scaffold. Since the data is just
// "how many times was my own cert page loaded," the stakes of it being public are low —
// but if you want to lock it down later, the simplest option is checking a shared-secret
// query param or header against an environment variable before querying D1.

interface Env {
  DB: D1Database;
}

export async function onRequestGet(context: EventContext<Env, any, Record<string, unknown>>) {
  const { env } = context;
  // env.DB is now correctly typed as D1Database

  try {
    const totals = await env.DB.prepare(
      `SELECT cert_slug, COUNT(*) as total
   FROM visits
   GROUP BY cert_slug`
    ).all<{ cert_slug: string; total: number }>();

    const last7Days = await env.DB.prepare(
      `SELECT cert_slug, COUNT(*) as total
       FROM visits
       WHERE created_at >= datetime('now', '-7 days')
       GROUP BY cert_slug`
    ).all<{ cert_slug: string; total: number }>();

    const byCountry = await env.DB.prepare(
      `SELECT cert_slug, country, COUNT(*) as total
       FROM visits
       WHERE country IS NOT NULL
       GROUP BY cert_slug, country
       ORDER BY total DESC`
    ).all<{ cert_slug: string; country: string; total: number }>();

    const recent = await env.DB.prepare(
      `SELECT cert_slug, country, city, created_at
       FROM visits
       ORDER BY created_at DESC
       LIMIT 20`
    ).all<{ cert_slug: string; country: string; city: string; created_at: string }>();

    // Return the stats in a structured JSON format
    // the object I want to return to stringify is of type StatsResponse
    const data: StatsResponse = {
      totals: totals.results,
      last_7_days: last7Days.results,
      by_country: byCountry.results,
      recent: recent.results,
    };

    return new Response(JSON.stringify(data, null, 2), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return Response.json(
      { error: "Failed to fetch stats", details: message },
      { status: 500 }
    );
  }
}