import mongoose from 'mongoose';
import User from '../lib/models/User';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/deluv';

async function dropIndex() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Mongoose connection collection
    const collection = mongoose.connection.collection('users');
    
    // Check if the index exists
    const indexes = await collection.indexes();
    console.log('Current indexes:', indexes.map(i => i.name));
    
    const emailIndexExists = indexes.some(i => i.name === 'email_1');
    
    if (emailIndexExists) {
      await collection.dropIndex('email_1');
      console.log('Successfully dropped the email_1 index.');
    } else {
      console.log('Index email_1 not found. It may have already been dropped.');
    }
    
  } catch (error) {
    console.error('Error dropping index:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

dropIndex();
