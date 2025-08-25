import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redisUrl = process.env.UPSTASH_REDIS_REST_URL || process.env.RATE_LIMIT_REDIS_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.RATE_LIMIT_REDIS_TOKEN;

let upstashRedis: Redis | null = null;
if (redisUrl && redisToken) {
	try {
		upstashRedis = new Redis({ url: redisUrl, token: redisToken });
	} catch (e) {
		console.warn("[ratelimit] Failed to init Redis:", e);
	}
} else if (redisUrl || redisToken) {
	console.warn("[ratelimit] Incomplete Redis env. Provide both URL and TOKEN.");
} else {
	console.warn("[ratelimit] No Redis env found. Falling back to in-memory limiter (non-persistent).");
}

export function createLimiter(tokens: number, windowSeconds: number) {
	if (upstashRedis) {
		return new Ratelimit({
			redis: upstashRedis,
			limiter: Ratelimit.slidingWindow(tokens, `${windowSeconds} s`),
			analytics: true,
		});
	}
	// Fallback naive in-memory limiter (per-process, non-persistent)
	const hits = new Map<string, number[]>();
	return {
		limit: async (key: string) => {
			const now = Date.now();
			const windowMs = windowSeconds * 1000;
			const arr = hits.get(key) || [];
			const recent = arr.filter(ts => now - ts < windowMs);
			recent.push(now);
			hits.set(key, recent);
			const remaining = Math.max(0, tokens - recent.length);
			const success = recent.length <= tokens;
			const reset = recent.length ? Math.ceil((windowMs - (now - recent[0]!)) / 1000) : windowSeconds;
			return { success, limit: tokens, remaining, reset } as const;
		},
	};
} 