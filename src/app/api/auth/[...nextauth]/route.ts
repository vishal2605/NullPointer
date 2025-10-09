import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { hashPassword, verifyPassword } from "@/app/lib/auth";

const users = [
  {
    id: 1,
    username: "admin@admin.com",
    password: "admin",
    name: "Admin"
  }
]
const handler = NextAuth({
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
        const user = users.find(user => user.username===credentials.username);
        if(!user) {
          throw new Error("No user found with this username");
        }
        // const isValid = await verifyPassword(credentials.password, user.password);
        // if(!isValid) {
        //   throw new Error("Invalid password");
        // }
        return {
          id: String(user.id),
          username: user.username,
          name: user.name,
          role: 'admin'
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
        token.role = user.role;
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
        session.user.role = token.role;
      }
      return session;
    }
  }
})

export { handler as GET, handler as POST };
