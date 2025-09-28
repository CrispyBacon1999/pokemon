import { createClient, type RedisClientType } from "redis";

const client: RedisClientType = createClient({
  url: process.env.REDIS_URL!
});

async function connectRedis(): Promise<void> {
  await client.connect();
  console.log("Redis connected");
}

client.on("error", (err: Error) => {
  console.error("Redis error:", err);
});

connectRedis().catch(console.error);

export default client;