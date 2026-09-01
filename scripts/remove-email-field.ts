import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/deluv';

async function removeEmailField() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const collection = mongoose.connection.collection('users');
    
    const result = await collection.updateMany(
      { email: { $exists: true } },
      { $unset: { email: "" } }
    );
    
    console.log(`Successfully removed the email field from ${result.modifiedCount} user documents.`);
    
  } catch (error) {
    console.error('Error removing email field:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

removeEmailField();
