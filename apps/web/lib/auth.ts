import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { userSignInSchema } from "@/lib/schema";
import { prisma } from "@repo/db";
import bcrypt from "bcryptjs";


export const authOptions: NextAuthOptions = {
    providers: [
      CredentialsProvider({
        name: "Email",
        credentials: {
          username: { label: "Username", type: "text", placeholder: "jsmith" },
          password: { label: "Password", type: "password", placeholder: "password"},
        },
        async authorize(credentials) {
          if (!credentials?.username || !credentials?.password) {
            throw new Error("Missing username or password");
          }

          const validatedData = userSignInSchema.parse({
            username: credentials.username,
            password: credentials.password,
          });

          // Find user
          const user = await prisma.user.findUnique({
            where: { username: validatedData.username },
          });

          if (!user) {
            throw new Error("Invalid credentials");
          }

          const isPasswordCorrect = await bcrypt.compare(credentials.password, user.password);

          if (!isPasswordCorrect) {
            throw new Error("Incorrect Password");
          }

          return {
            id: String(user.id),
            username: user.username,
            role: "user", // Default role, update if your User model has a role field
          }
        }
      })
    ],
    secret: process.env.NEXTAUTH_SECRET,
    callbacks: {

      async jwt({ token, user }) {
        if (user) {
          token.id = user.id;
          token.username = (user as any).username;
          token.role = (user as any).role;
        }
    
        if (token.sub) {
          token.id = token.sub;
        }
    
        return token;
      },
    
      async session({ session, token }) {
    
        return {
          ...session,
          user: {
            id: token.id as string,
            username: token.username as string,
            role: token.role as string,
          }
        }
      }
    }
    
  }
