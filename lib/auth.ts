import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import connectToDatabase from '@/lib/db/mongoose';
import User from '@/lib/models/User';
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text', placeholder: 'jsmith' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials, req) {
        if (!credentials?.username || !credentials?.password) {
          throw new Error('Please enter a username and password');
        }
        await connectToDatabase();

        const searchUsername = credentials.username.trim().toLowerCase();
        const user = await User.findOne({ 
          username: { $regex: new RegExp(`^${searchUsername}$`, 'i') } 
        }).select('+password');

        if (!user || !user.password) {
          throw new Error('No user found');
        }

        if (!user.isActive) {
          throw new Error('Account is deactivated. Please contact your manager.');
        }

        const passwordMatch = await bcrypt.compare(credentials.password, user.password);

        if (!passwordMatch) {
          throw new Error('Incorrect password');
        }

        return {
          id: user._id.toString(),
          name: user.name,
          username: user.username,
          role: user.role,
          branchId: user.branchId ? user.branchId.toString() : undefined,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
        token.username = user.username;
        token.branchId = user.branchId;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.role = token.role;
        session.user.id = token.id;
        session.user.username = token.username;
        session.user.branchId = token.branchId;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login', // We will build a custom login page
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
};
