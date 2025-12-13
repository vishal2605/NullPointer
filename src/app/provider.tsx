"use client";
import { SessionProvider } from "next-auth/react";
import { ProblemProvider } from "./context/ProblemContext";
import { RecoilRoot } from "recoil";
import { Session } from "next-auth";

export default function Provider({ 
  children, 
  session 
}: { 
  children: React.ReactNode; 
  session: Session | null;
}) {
  return (
    <SessionProvider session={session}>
      <ProblemProvider>
        <RecoilRoot>
          {children}
        </RecoilRoot>
      </ProblemProvider>
    </SessionProvider>
  );
}