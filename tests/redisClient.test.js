const RedisClient = require('../utils/redis');

describe('RedisClient', () => {
  it('should be able to connect to Redis', async () => {
    const client = new RedisClient();
    await client.connect();
    expect(client.isConnected).toBe(true);
  });

  it('should be able to set a value', async () => {
    const client = new RedisClient();
    await client.connect();
    await client.set('key', 'value');
    expect(await client.get('key')).toBe('value');
  });

  it('should be able to get a value', async () => {
    const client = new RedisClient();
    await client.connect();
    await client.set('key', 'value');
    expect(await client.get('key')).toBe('value');
  });

  it('should be able to delete a value', async () => {
    const client = new RedisClient();
    await client.connect();
    await client.set('key', 'value');
    await client.del('key');
    expect(await client.get('key')).toBe(null);
  });
});