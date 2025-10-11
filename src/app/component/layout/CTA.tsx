import { ArrowRight } from "lucide-react";
import { Button } from "../ui/Button";

const CTA = () => {
  return (
    <section className="py-24 px-4 relative overflow-hidden">
      {/* Glow Effects */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-glow opacity-30 blur-3xl" />
      
      <div className="container mx-auto text-center relative z-10 animate-fade-in">
        <h2 className="text-4xl md:text-5xl font-bold mb-6">
          Ready to Level Up Your Coding Skills?
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
          Join thousands of developers mastering data structures and algorithms. 
          Start solving problems today—no experience required.
        </p>
        <Button variant="hero" size="lg" className="text-lg px-8 group">
          Get Started Now
          <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </section>
  );
};

export default CTA;
