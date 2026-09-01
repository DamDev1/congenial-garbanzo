import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../lib/models/User';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/deluv';

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const ownerUsername = 'admin';
    const existingOwner = await User.findOne({ username: ownerUsername });

    if (!existingOwner) {
      // Clean up old email-based owner if it exists (for smooth migration during dev)
      await User.deleteOne({ email: 'owner@deluv.com' }).catch(() => {});

      const hashedPassword = await bcrypt.hash('password123', 10);
      await User.create({
        name: 'System Owner',
        username: ownerUsername,
        phone: '0000000000',
        password: hashedPassword,
        role: 'owner',
      });
      console.log('Created default owner account: admin / password123');
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
