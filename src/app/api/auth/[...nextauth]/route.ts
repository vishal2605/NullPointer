import CredentialsProvider from "next-auth/providers/credentials";
import NextAuth from "next-auth";
import { verifyPassword } from "@/app/lib/auth";


const users = [
  {
    id: 1,
    email: "admin@admin.com",
    password: "admin",
    name: "Admin"
  }
]
export default NextAuth({

providers: [
  CredentialsProvider({
    // The name to display on the sign in form (e.g. "Sign in with...")
    name: "Credentials",
    credentials: {
      username: { label: "Username", type: "text", placeholder: "jsmith" },
      password: { label: "Password", type: "password" }
    },
    async authorize(credentials, req) {
      if (!credentials?.username || !credentials?.password) {
        throw new Error("Invalid credentials");
      }
      const user = users.find(user => user.email === credentials.username && user.password === credentials.password);
      if (!user) {
        throw new Error("No user found with this email")
      }

      // Verify password
      const isValid = await verifyPassword(credentials.password, user.password)

      if (!isValid) {
        throw new Error("Invalid password")
      }
      return {
        id: String(user.id),
        email: user.email,
        name: user.name,
        role: 'user'
      }
    }
  })
],
session: {
  strategy: "jwt"
},
callbacks: {
  async jwt({ token, user }) {
    if (user) {
      token.id = user.id
      token.role = user.role
    }
    return token
  },
  async session({ session, token }) {
    if (token) {
      session.user.id = token.id
      session.user.role = token.role as string
    }
    return session
  }
},
pages: {
  signIn: "/signin",
},

})