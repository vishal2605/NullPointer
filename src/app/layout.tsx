import "./globals.css";
import Provider from "./provider";
import Navigation from "./component/layout/navigation";
import { authOptions } from "./lib/auth";
import { getServerSession } from "next-auth";
import { NextAuthOptions } from "next-auth";
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions as NextAuthOptions);

  return (
    <html lang="en">
      <body>
        <Provider session={session}>
          <Navigation />
          {children}
        </Provider>
      </body>
    </html>
  );
}