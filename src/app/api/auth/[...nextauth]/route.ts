import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions = {
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

        const user = await prisma.user.findUnique({
          where: { username: credentials.username }
        });

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

const handler = NextAuth(authOptions as any);
export { handler as GET, handler as POST };
