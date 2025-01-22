import { createClient, RedisClientType } from 'redis';
import debugLibrary from 'debug';

const debug = debugLibrary('redis');
let client: ReturnType<typeof createClient>;

const createRedisClient = async () => {
  const client = await createClient({
    url: 'redis://127.0.0.1:6379',
    password: process.env.REDIS_PASSWORD,
  })
    .on('error', err => debug('Redis Client Error:', err))
    .connect();

  debug('Redis Client Created');
  return client;
};

const getRedisClient = async () => {
  if (!client) {
    client = await createRedisClient();
  }
  return client;
};

class RedisService {
  static async keys(key?: string) {
    await getRedisClient();
    return key ? await client.keys(key) : await client.keys('*');
  }

  static async hGet(key: string, field?: string) {
    await getRedisClient();
    return field ? await client.hGet(key, field) : await client.hGetAll(key);
  }

  static async hSet(key: string, value: Record<string, any>, ttl?: number) {
    await getRedisClient();
    await client.hSet(key, value);

    if (ttl) {
      await client.expire(key, ttl);
    }
  }

  // set add
  static async sAdd(key: string, value: string | string[], ttl?: number) {
    await getRedisClient();
    await client.sAdd(key, value);

    if (ttl) {
      await client.expire(key, ttl);
    }
  }

  // set remove
  static async sRem(key: string, value: string | string[]) {
    await getRedisClient();
    await client.sRem(key, value);
  }

  static async sIsMember(key: string, value: string) {
    await getRedisClient();
    return await client.sIsMember(key, value);
  }
}

export { getRedisClient, client, RedisService };
