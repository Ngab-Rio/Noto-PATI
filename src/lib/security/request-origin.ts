import { serverEnv } from "@/config/env.server";

/**
 * Checks if the request origin is trusted.
 * 
 * Allowed origins:
 * 1. Same origin as the request URL (always trusted)
 * 2. Additional origins from AI_ANALYSIS_ALLOWED_ORIGINS (TEMPORARY - dev only)
 * 
 * ⚠️ WARNING: AI_ANALYSIS_ALLOWED_ORIGINS is TEMPORARY and used only for
 * development with tunnels (ngrok, localtunnel, VS Code dev tunnels).
 * This variable MUST BE REMOVED in production deployment.
 */
export function hasTrustedRequestOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) {
    return true;
  }

  try {
    const requestOrigin = new URL(request.url).origin;
    const allowedOrigins = new Set([
      requestOrigin,
      // TEMPORARY: Additional origins for development tunnels only
      // TODO: Remove AI_ANALYSIS_ALLOWED_ORIGINS before production deployment
      ...(serverEnv.AI_ANALYSIS_ALLOWED_ORIGINS?.split(",")
        .filter((value) => value.trim())
        .map((value) => new URL(value.trim()).origin) ?? []),
    ]);

    return allowedOrigins.has(new URL(origin).origin);
  } catch {
    return false;
  }
}
