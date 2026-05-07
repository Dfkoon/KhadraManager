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

        // Nuclear Fix: Self-Healing Full Schema Creation
        try {
          const setupSql = `
            CREATE TABLE IF NOT EXISTS "User" ("id" TEXT NOT NULL, "name" TEXT NOT NULL, "username" TEXT NOT NULL, "password" TEXT NOT NULL, "role" TEXT NOT NULL, "isActive" BOOLEAN NOT NULL DEFAULT true, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "User_pkey" PRIMARY KEY ("id"));
            CREATE UNIQUE INDEX IF NOT EXISTS "User_username_key" ON "User"("username");

            CREATE TABLE IF NOT EXISTS "Worker" ("id" TEXT NOT NULL, "name" TEXT NOT NULL, "phone" TEXT, "qrCode" TEXT, "workerType" TEXT NOT NULL DEFAULT 'PIECE', "hourlyRate" DOUBLE PRECISION, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "Worker_pkey" PRIMARY KEY ("id"));
            CREATE UNIQUE INDEX IF NOT EXISTS "Worker_qrCode_key" ON "Worker"("qrCode");

            CREATE TABLE IF NOT EXISTS "Product" ("id" TEXT NOT NULL, "name" TEXT NOT NULL, "price" DOUBLE PRECISION NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "Product_pkey" PRIMARY KEY ("id"));
            CREATE UNIQUE INDEX IF NOT EXISTS "Product_name_key" ON "Product"("name");

            CREATE TABLE IF NOT EXISTS "DailyEntry" ("id" TEXT NOT NULL, "boxes" INTEGER NOT NULL DEFAULT 0, "amount" DOUBLE PRECISION NOT NULL DEFAULT 0, "date" TEXT NOT NULL, "time" TEXT NOT NULL, "status" TEXT NOT NULL DEFAULT 'PENDING', "isPaid" BOOLEAN NOT NULL DEFAULT false, "startTime" TEXT, "endTime" TEXT, "breakMinutes" INTEGER DEFAULT 0, "workerId" TEXT NOT NULL, "productId" TEXT, "supervisorId" TEXT NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "DailyEntry_pkey" PRIMARY KEY ("id"));

            CREATE TABLE IF NOT EXISTS "Attendance" ("id" TEXT NOT NULL, "date" TEXT NOT NULL, "status" TEXT NOT NULL, "workerId" TEXT NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "Attendance_pkey" PRIMARY KEY ("id"));
            CREATE UNIQUE INDEX IF NOT EXISTS "Attendance_workerId_date_key" ON "Attendance"("workerId", "date");

            CREATE TABLE IF NOT EXISTS "Expense" ("id" TEXT NOT NULL, "category" TEXT NOT NULL, "amount" DOUBLE PRECISION NOT NULL, "date" TEXT NOT NULL, "description" TEXT, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "Expense_pkey" PRIMARY KEY ("id"));

            CREATE TABLE IF NOT EXISTS "InventoryItem" ("id" TEXT NOT NULL, "name" TEXT NOT NULL, "quantity" INTEGER NOT NULL DEFAULT 0, "minQuantity" INTEGER NOT NULL DEFAULT 10, "unit" TEXT NOT NULL DEFAULT 'قطعة', "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "InventoryItem_pkey" PRIMARY KEY ("id"));
            CREATE UNIQUE INDEX IF NOT EXISTS "InventoryItem_name_key" ON "InventoryItem"("name");
          `;
          
          const statements = setupSql.split(';').filter(s => s.trim());
          for (const statement of statements) {
            await prisma.$executeRawUnsafe(statement);
          }
          
          const userCount = await prisma.user.count();
          if (userCount === 0) {
            const hashedPassword = await bcrypt.hash('khadra2026', 10);
            await prisma.user.create({
              data: {
                id: 'admin-id',
                username: 'admin',
                password: hashedPassword,
                name: 'المدير الرئيسي',
                role: 'ADMIN'
              }
            });
          }
        } catch (e) {
          console.error("Setup error:", e);
        }

        let user = await prisma.user.findUnique({
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
