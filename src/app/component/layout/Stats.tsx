
const stats = [
    { label: "Problems", value: "500+", color: "text-primary" },
    { label: "Users", value: "10K+", color: "text-secondary" },
    { label: "Solutions", value: "50K+", color: "text-accent" },
    { label: "Languages", value: "5+", color: "text-primary" },
  ];

const Stats =() => {

    return (
        <section className="py-24 px-4 border-y border-border">
            <div className="container mx-auto">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                {stats.map((stat, index) => (
                    <div 
                    key={index} 
                    className="text-center animate-fade-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                    >
                    <div className={`text-4xl md:text-5xl font-bold mb-2 ${stat.color}`}>
                        {stat.value}
                    </div>
                    <div className="text-muted-foreground text-sm md:text-base uppercase tracking-wider">
                        {stat.label}
                    </div>
                    </div>
                ))}
                </div>
            </div>
        </section>
    )
}

export default Stats;