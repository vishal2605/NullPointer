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
      async jwt ({token, user}){
        if(user) {
          token.id = user.id;
          token.username = user.username;
        }
        if(token.sub){
          token.id= token.sub
        }
        return token;
      },
      async session ({ session, token }) {
        if(token) {
          console.log("session ",session);
          session.user.id = token.id;
          session.user.username = token.username;
        }
        return session;
      }
    }
  }
