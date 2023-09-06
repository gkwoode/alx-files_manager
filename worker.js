const Bull = require('bull');
const imageThumbnail = require('image-thumbnail');
const dbClient = require('../utils/db');
const fileQueue = require('./fileQueue');

const worker = new Bull.Worker('fileWorker', {
  queue: fileQueue,
});

worker.process(async (job, done) => {
  const fileId = job.fileId;
  const userId = job.userId;

  if (!fileId) {
    throw new Error('Missing fileId');
  }

  if (!userId) {
    throw new Error('Missing userId');
  }

  const file = await DBClient.collection('files').findOne({ _id: fileId, userId: userId });
  if (!file) {
    throw new Error('File not found');
  }

  const fileName = file.name;

  const thumbnails = [
    imageThumbnail(fileName, 500),
    imageThumbnail(fileName, 250),
    imageThumbnail(fileName, 100),
  ];

  for (const thumbnail of thumbnails) {
    const thumbnailPath = `${fileName}__${thumbnail.width}`;
    fs.writeFileSync(thumbnailPath, thumbnail.data);
  }

  const user = await DBClient.collection('users').findOne({ _id: userId });

  if (!user) {
    throw new Error('User not found');
  }

  // Send a welcome email
  console.log('Sending welcome email to', user.email);

  done();
});

module.exports = worker;