const DBClient = require('../utils/db');

describe('DBClient', () => {
  it('should be able to connect to MongoDB', async () => {
    const client = new DBClient();
    await client.connect();
    expect(client.isConnected).toBe(true);
  });

  it('should be able to insert a document', async () => {
    const client = new DBClient();
    await client.connect();
    const collection = client.collection('files');
    await collection.insertOne({ name: 'test' });
    const documents = await collection.find().toArray();
    expect(documents[0].name).toBe('test');
  });

  it('should be able to update a document', async () => {
    const client = new DBClient();
    await client.connect();
    const collection = client.collection('files');
    await collection.insertOne({ name: 'test' });
    const document = await collection.findOne({ name: 'test' });
    document.name = 'test2';
    await collection.updateOne({ _id: document._id }, { $set: document });
    const updatedDocument = await collection.findOne({ name: 'test2' });
    expect(updatedDocument.name).toBe('test2');
  });

  it('should be able to delete a document', async () => {
    const client = new DBClient();
    await client.connect();
    const collection = client.collection('files');
    await collection.insertOne({ name: 'test' });
    const document = await collection.findOne({ name: 'test' });
    await collection.deleteOne({ _id: document._id });
    const documents = await collection.find().toArray();
    expect(documents.length).toBe(0);
  });
});