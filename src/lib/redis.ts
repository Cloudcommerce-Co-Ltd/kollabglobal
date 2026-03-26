// Redis connection singleton for BullMQ job queues.
// Env-guarded: callers should check isRedisConfigured() before use.
import IORedis from "ioredis";

export function isRedisConfigured(): boolean {
  return !!process.env.REDIS_URL;
}

const globalForRedis = global as unknown as { redis: IORedis | undefined };

const redis: IORedis =
  globalForRedis.redis ||
  new IORedis(process.env.REDIS_URL ?? "redis://localhost:6379", {
    maxRetriesPerRequest: null, // Required by BullMQ
    lazyConnect: true,          // Defer TCP connect until first command
  });

if (process.env.NODE_ENV !== "production") globalForRedis.redis = redis;

export default redis;
