"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import CTA from "@/component/layout/CTA";
import Features from "@/component/layout/Features";
import Footer from "@/component/layout/Footer";
import Hero from "@/component/layout/Hero";
import Stats from "@/component/layout/Stats";

export default function Home() {
    return (
        <div className="min-h-screen">
            <Hero/>
            <Stats />
            <Features />
            <CTA />
            <Footer/>
        </div>
    );
}
