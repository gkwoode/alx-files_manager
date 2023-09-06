#!/usr/bin/node

const redis = require('redis');

class RedisClient {
    constructor() {
        this.client = redis.createClient();
        this.client.on('error', (err) => {
            console.log('Redis Error ' + err);
        });
    }

    async isAlive() {
      return new Promise((resolve) => {
        this.client.ping('Redis is alive!', (error) => {
          if (error) {
            resolve(false);
          } else {
            resolve(true);
          }
        });
      });
    }
  
    async get(key) {
      return new Promise((resolve, reject) => {
        this.client.get(key, (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        });
      });
    }
  
    async set(key, value, duration) {
      return new Promise((resolve, reject) => {
        this.client.setex(key, duration, value, (error) => {
          if (error) {
            reject(error);
          } else {
            resolve('OK');
          }
        });
      });
    }
  
    async del(key) {
      return new Promise((resolve, reject) => {
        this.client.del(key, (error, count) => {
          if (error) {
            reject(error);
          } else {
            resolve(count);
          }
        });
      });
    }
}

const redisClient = new RedisClient();

module.exports = redisClient;