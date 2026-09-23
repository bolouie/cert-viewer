
// Runs before every request to this Pages project.
// Logs visits to /brainstation and /george-brown (and their .html variants),
// then lets the request continue through to the static file as normal.
// /api/* requests are skipped here — those are handled by functions/api/*.js directly.

const TRACKED_SLUGS: Record<string, string> = {
  "/brainstation": "brainstation",
  "/brainstation.html": "brainstation",
  "/george-brown": "george-brown",
  "/george-brown.html": "george-brown",
};

interface Env {
  DB: D1Database;
}

export async function onRequest(context: EventContext<Env, any, Record<string, unknown>>) {
  const { request, env, next } = context;
  const url = new URL(request.url);

  const slug = TRACKED_SLUGS[url.pathname];

  if (slug) {
    // Cloudflare attaches geo/request metadata to request.cf — no external API call needed.
    const country = request.cf?.country || null;
    const city = request.cf?.city || null;
    const userAgent = request.headers.get("User-Agent") || null;
    const referrer = request.headers.get("Referer") || null;

    // Fire-and-forget style, but awaited so Workers doesn't kill it before it completes.
    // If this fails, we log it but never block the actual page from loading.
    try {
      await env.DB.prepare(
        `INSERT INTO visits (cert_slug, path, country, city, user_agent, referrer)
         VALUES (?, ?, ?, ?, ?, ?)`
      )
        .bind(slug, url.pathname, country, city, userAgent, referrer)
        .run();
    } catch (err) {
      console.error("Failed to log visit:", err);
    }
  }

  return next();
}
