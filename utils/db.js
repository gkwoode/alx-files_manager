#!/usr/bin/node

const { MongoClient } = require('mongodb');

class DBClient {
  constructor() {
    this.DB_HOST = process.env.DB_HOST || 'localhost';
    this.DB_PORT = process.env.DB_PORT || 27017;
    this.DB_DATABASE = process.env.DB_DATABASE || 'files_manager';
    this.client = new MongoClient(`mongodb://${this.DB_HOST}:${this.DB_PORT}`, {
      useUnifiedTopology: true,
      useNewUrlParser: true
    });
    this.client.connect((err) => {
      if (err) console.log(err);
      else console.log('Database connected!');
    });
  }

  isAlive() {
    return this.client.isConnected();
  }

  async nbUsers() {
    return this.client.db(this.DB_DATABASE).collection('users').countDocuments();
  }

  async nbFiles() {
    return this.client.db(this.DB_DATABASE).collection('files').countDocuments();
  }
}

const dbClient = new DBClient();

module.exports = dbClient;