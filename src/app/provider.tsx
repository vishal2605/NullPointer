"use client"
import { SessionProvider } from "next-auth/react";
import { ProblemProvider } from "./context/ProblemContext";
import { RecoilRoot } from "recoil";
export default function Provider({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <ProblemProvider>
                <RecoilRoot>
                    {children}
                </RecoilRoot>
            </ProblemProvider>
        </SessionProvider>
    )
}