import connectDB from '../lib/db/mongoose';
import User from '../lib/models/User';

async function check() {
  await connectDB();
  const users = await User.find({ role: 'owner' });
  console.log("Found owners:", JSON.stringify(users, null, 2));
  process.exit(0);
}

check();
