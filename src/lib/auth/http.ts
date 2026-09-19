/** First hop from X-Forwarded-For / X-Real-IP. */
export function requestIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first.slice(0, 64);
  }
  return request.headers.get("x-real-ip")?.trim().slice(0, 64) || undefined;
}

export function requestUserAgent(request: Request) {
  return request.headers.get("user-agent")?.slice(0, 255) || undefined;
}

/** Only in-app paths, so verify cannot be used as an open redirect. */
export function safeAppPath(value: unknown, fallback = "/app/dashboard") {
  if (typeof value !== "string" || value.length > 200) return fallback;
  if (!/^\/app\/[a-z0-9/-]+$/i.test(value)) return fallback;
  return value;
}
