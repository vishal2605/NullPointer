import 'next-auth';

declare module 'next-auth' {
    interface User {
        id:    string;
        username: string;
        name?: string | null;
        image?: string | null;
        role:  string;
      }

  interface Session {
    user: {
      id: string;
      role: string;
      username: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
  interface Credentials {
    username : string;
    password : string,
    isSignup : string | null
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    username: string;
    role: string;
  }
}