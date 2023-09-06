#!/usr/bin/node

// controllers/UsersController.js
const RedisClient = require('../utils/redis');
const DBClient = require('../utils/db');

class UsersController {
  async postNew(req, res) {
    const email = req.body.email;
    const password = req.body.password;

    if (!email) {
      return res.status(400).json({ error: 'Missing email' });
    }

    if (!password) {
      return res.status(400).json({ error: 'Missing password' });
    }

    const dbClient = DBClient.getInstance();

    const existingUser = await dbClient.collection('users').findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Already exist' });
    }

    const hashedPassword = await sha1(password);

    const newUser = {
      email,
      password: hashedPassword,
      // _id: uuidv4(),
    };

    await dbClient.collection('users').insertOne(newUser);

    const id = newUser._id;

    return res.status(201).json({
      email,
      id,
    });
  }

  async getMe(req, res) {
    const token = req.headers['x-token'];

    const redisClient = RedisClient.getInstance();

    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const dbClient = DBClient.getInstance();

    const user = await dbClient.collection('users').findOne({ _id: userId });
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    return res.status(200).json({
      email: user.email,
      id: user._id,
    });
  }

  async postWelcome(req, res) {
    const userId = req.params.id;

    // Get the user from the database
    const user = await DBClient.collection('users').findOne({ _id: userId });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Send a welcome email
    console.log('Sending welcome email to', user.email);

    return res.status(200).json(user);
  }

}


module.exports = UsersController;