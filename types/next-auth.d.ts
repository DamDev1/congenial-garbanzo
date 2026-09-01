import NextAuth, { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      username: string;
      role: string;
      branchId?: string;
    } & DefaultSession['user'];
  }

  interface User {
    id: string;
    username: string;
    role: string;
    branchId?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    username: string;
    role: string;
    branchId?: string;
  }
}
