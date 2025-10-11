"use client";

import CTA from "@/app/component/layout/CTA";
import Features from "@/app/component/layout/Features";
import Footer from "@/app/component/layout/Footer";
import Hero from "@/app/component/layout/Hero";
import Stats from "@/app/component/layout/Stats";


export default function Dashboard(){

    return (
        <div className="min-h-screen">
            <Hero/>
            <Stats />
            <Features />
            <CTA />
            <Footer/>
        </div>
    )
}