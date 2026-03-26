import IORedis from "ioredis";

const globalForRedis = global as unknown as { redis: IORedis };

const redis =
  globalForRedis.redis ||
  new IORedis(process.env.REDIS_URL!, {
    maxRetriesPerRequest: null, // Required by BullMQ
  });

if (process.env.NODE_ENV !== "production") globalForRedis.redis = redis;

export default redis;
