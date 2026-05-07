import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        let user = await prisma.user.findUnique({
          where: { username: credentials.username }
        });

        // Auto-seed: If database is empty and user is trying to login as admin
        if (!user && credentials.username === 'admin') {
          const userCount = await prisma.user.count();
          if (userCount === 0) {
            const hashedPassword = await bcrypt.hash('khadra2026', 10);
            user = await prisma.user.create({
              data: {
                username: 'admin',
                password: hashedPassword,
                name: 'المدير الرئيسي',
                role: 'ADMIN'
              }
            });
          }
        }

        if (!user) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

        if (!isPasswordValid) {
          return null;
        }

        if (user.isActive === false) {
          throw new Error("ACCOUNT_DEACTIVATED");
        }

        return {
          id: user.id,
          name: user.name,
          username: user.username,
          role: user.role,
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.role = user.role;
        token.username = user.username;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }: any) {
      if (session?.user) {
        session.user.role = token.role;
        session.user.username = token.username;
        session.user.id = token.id;
      }
      return session;
    }
  },
  pages: {
    signIn: '/sign-in-screen',
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET || "fallback_secret_khadramanager_2026",
};
