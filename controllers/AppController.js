#!/usr/bin/node

// controllers/AppController.js
const RedisClient = require('../utils/redis');
const DBClient = require('../utils/db');

class AppController {
  async getStatus() {
    const redisClient = RedisClient.getInstance();
    const dbClient = DBClient.getInstance();

    const isRedisAlive = await redisClient.isAlive();
    const isDbAlive = await dbClient.isAlive();

    return {
      redis: isRedisAlive,
      db: isDbAlive,
    };
  }

  async getStats() {
    const dbClient = DBClient.getInstance();

    const nbUsers = await dbClient.nbUsers();
    const nbFiles = await dbClient.nbFiles();

    return {
      users: nbUsers,
      files: nbFiles,
    };
  }
}

module.exports = AppController;