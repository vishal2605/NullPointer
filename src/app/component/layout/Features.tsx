import { Code, Layers, TrendingUp, Users } from "lucide-react";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    icon: Code,
    title: "Curated Problems",
    description: "Handpicked DSA problems covering arrays, trees, graphs, and more. Each problem designed to strengthen your foundation.",
  },
  {
    icon: Layers,
    title: "Difficulty Levels",
    description: "Progress from Easy to Hard at your own pace. Track your growth as you conquer increasingly complex challenges.",
  },
  {
    icon: TrendingUp,
    title: "Real-time Feedback",
    description: "Instant code execution and test results. Debug efficiently with detailed error messages and test case analysis.",
  },
  {
    icon: Users,
    title: "Community Solutions",
    description: "Learn from others' approaches. Compare your solution with the community's best practices and optimizations.",
  },
];

const Features = () => {
  return (
    <section className="py-24 px-4 bg-gradient-subtle relative">
      <div className="container mx-auto">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Why <span className="text-primary">null pointer</span>?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to ace your coding interviews and become a better problem solver
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="bg-card/50 backdrop-blur-sm border border-border hover:border-primary/50 transition-all duration-300 hover:scale-105 animate-fade-in p-6 rounded-lg"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
