"use client"
import logo from '@/asset/logo.png'
import Image from 'next/image';
import { Button } from '../ui/Button';
import { useRouter } from "next/navigation";

const Hero= () => {
    const router = useRouter();
    const handleSolving = () => {
        router.push('/dashboard');
    }
    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 z-0 bg-gradient-subtle"/>

            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-glow opacity-50 blur-3xl animate-glow" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-glow opacity-50 blur-3xl animate-glow" style={{ animationDelay: "1s" }} />

            <div className="relative z-10 container mx-auto px-4 text-center animate-fade-in">
                <div className="flex items-center justify-center mb-8 animate-fade-in">
                <Image src={logo} alt="null pointer logo" className="w-32 h-32 md:w-40 md:h-40" />
                </div>

                <h1 className='text-5xl md:text-7xl font-bold mb-6 text-foreground'> null pointer</h1>

                <p  className='text-xl md:text-2xl mb-4 text-muted-foreground max-w-3xl mx-auto animate-fade-in-delay'>
                    Master Data Structure & Algorithms
                </p>
                <p className="text-lg mb-8 text-muted-foreground max-w-2xl mx-auto animate-fade-in-delay">
                    Sharpen your coding skills with hundreds of DSA problems. 
                    From arrays to dynamic programming, level up your problem-solving one commit at a time.
                </p>
                <div>
                    <Button variant="hero" size="lg" className="text-lg px-8" onClick={handleSolving}>
                        Start Solving
                    </Button>
                </div>

                <div className="mt-16 max-w-2xl mx-auto bg-card backdrop-blur-sm rounded-lg border border-border p-6 text-left font-mono text-sm animate-fade-in-delay shadow-lg">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-3 h-3 rounded-full bg-primary" />
                        <div className="w-3 h-3 rounded-full bg-muted-foreground" />
                        <div className="w-3 h-3 rounded-full bg-muted-foreground" />
                    </div>
                    <code className="text-foreground">
                        <span className="text-secondary">function</span> <span className="text-primary">solveProblem</span>() {"{"}<br />
                        &nbsp;&nbsp;<span className="text-muted-foreground">// Your code here</span><br />
                        &nbsp;&nbsp;<span className="text-secondary">return</span> <span className="text-accent">solution</span>;<br />
                        {"}"}
                    </code>
                </div>
            </div>

        </section>
    )
}

export default Hero;
