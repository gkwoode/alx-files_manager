// controllers/FilesController.js
const RedisClient = require('../utils/redis');
const DBClient = require('../utils/db');
const fs = require('fs');
const mimeTypes = require('mime-types');
// const Bull = require('bull');
// const imageThumbnail = require('image-thumbnail');
// const fileQueue = new Bull('fileQueue');

const FOLDER_PATH = process.env.FOLDER_PATH || '/tmp/files_manager';

class FilesController {
  async postUpload(req, res) {
    const token = req.headers['x-token'];

    const redisClient = RedisClient.getInstance();

    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { name, type, parentId, isPublic, data } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Missing name' });
    }

    if (!type || ['folder', 'file', 'image'].indexOf(type) === -1) {
      return res.status(400).json({ error: 'Missing type' });
    }

    if (type !== 'folder' && !data) {
      return res.status(400).json({ error: 'Missing data' });
    }

    if (parentId) {
      const parent = await DBClient.collection('files').findOne({ _id: parentId });
      if (!parent) {
        return res.status(400).json({ error: 'Parent not found' });
      }

      if (parent.type !== 'folder') {
        return res.status(400).json({ error: 'Parent is not a folder' });
      }
    }

    const localPath = `${FOLDER_PATH}/${uuidv4()}`;

    const fileData = Buffer.from(atob(data), 'base64');

    fs.writeFileSync(localPath, fileData);

    const file = {
      userId,
      name,
      type,
      isPublic,
      parentId,
      localPath,
    };

    await DBClient.collection('files').insertOne(file);

    return res.status(201).json(file);
  }

  async getShow(req, res) {
    const token = req.headers['x-token'];

    const redisClient = RedisClient.getInstance();

    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const id = req.params.id;

    const file = await DBClient.collection('files').findOne({ _id: id });
    if (!file) {
      return res.status(404).json({ error: 'Not found' });
    }

    if (file.userId !== userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    return res.status(200).json(file);
  }

  async getIndex(req, res) {
    const token = req.headers['x-token'];

    const redisClient = RedisClient.getInstance();

    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const page = Number(req.query.page) || 0;

    const parentId = Number(req.query.parentId) || 0;

    const files = await DBClient.collection('files').aggregate([
      {
        $match: { userId: userId },
      },
      {
        $sort: { name: 1 },
      },
      {
        $skip: page * 20,
      },
      {
        $limit: 20,
      },
    ]);

    return res.status(200).json(files);
  }

  async putPublish(req, res) {
    const token = req.headers['x-token'];

    const redisClient = RedisClient.getInstance();

    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const id = req.params.id;

    const file = await DBClient.collection('files').findOne({ _id: id });
    if (!file) {
      return res.status(404).json({ error: 'Not found' });
    }

    if (file.userId !== userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    file.isPublic = true;

    await DBClient.collection('files').updateOne({ _id: id }, { $set: { isPublic: true } });

    return res.status(200).json(file);
  }

  async putUnpublish(req, res) {
    const token = req.headers['x-token'];

    const redisClient = RedisClient.getInstance();

    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const id = req.params.id;

    const file = await DBClient.collection('files').findOne({ _id: id });
    if (!file) {
      return res.status(404).json({ error: 'Not found' });
    }

    if (file.userId !== userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    file.isPublic = false;

    await DBClient.collection('files').updateOne({ _id: id }, { $set: { isPublic: false } });

    return res.status(200).json(file);
  }

  async getFile(req, res) {
    const token = req.headers['x-token'];

    const redisClient = RedisClient.getInstance();

    const userId = await redisClient.get(`auth_${token}`);

    const id = req.params.id;

    const file = await DBClient.collection('files').findOne({ _id: id });
    if (!file) {
      return res.status(404).json({ error: 'Not found' });
    }

    if (!file.isPublic && !userId) {
      return res.status(404).json({ error: 'Not found' });
    }

    if (file.type !== 'file') {
      return res.status(400).json({ error: 'A folder doesn\'t have content' });
    }

    if (!fs.existsSync(file.localPath)) {
      return res.status(404).json({ error: 'Not found' });
    }

    const mimeType = mimeTypes.lookup(file.name);

    res.setHeader('Content-Type', mimeType);
    res.sendFile(file.localPath);
  }
}

module.exports = FilesController;