import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { getDataSource } from "@/lib/database/data-source";
import { User } from "./database/entities/User";
import bcrypt from "bcryptjs";


export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }
        // Ensure DB initialized
        const db = await getDataSource();
        const userRepo = db.getRepository(User);
        const user = await userRepo.findOne({
          where: { username: credentials.username as string },
        });

        if (!user) return null;

        const passwordMatch = await bcrypt.compare(credentials.password as string, user.password as string);
        if (!passwordMatch) return null;

        return user;

        // In production, validate against your authentication system
        // For now, accept any credentials (demo mode)
        if (credentials.username && credentials.password) {
          return {
            id: "1",
            name: credentials.username as string,
            email: `${credentials.username}@control-plane.com`,
          };
        }
        return null;
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET || "your-secret-key-change-in-production",
});

