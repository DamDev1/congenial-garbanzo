import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../lib/models/User';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/deluv';

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Create an owner if one doesn't exist
    const ownerEmail = 'owner@deluv.com';
    const existingOwner = await User.findOne({ email: ownerEmail });

    if (!existingOwner) {
      const hashedPassword = await bcrypt.hash('password123', 10);
      await User.create({
        name: 'System Owner',
        email: ownerEmail,
        password: hashedPassword,
        role: 'owner',
      });
      console.log('Created default owner account: owner@deluv.com / password123');
    } else {
      console.log('Owner account already exists');
    }

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

seed();
