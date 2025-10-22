import { Code, Palette, Database, Network } from "lucide-react";
import { Button } from "@/components/ui/button";

const About = () => {
  const expertise = [
    {
      icon: Code,
      title: "Software Development",
      description: "Web, Mobile, and AI systems with modern frameworks and technologies"
    },
    {
      icon: Palette,
      title: "Graphics Design",
      description: "Branding, UI/UX design, and digital creative solutions"
    },
    {
      icon: Network,
      title: "Network Management",
      description: "System optimization, security, and infrastructure administration"
    },
    {
      icon: Database,
      title: "Data Administration",
      description: "Data modeling, optimization, backup strategies, and analytics"
    }
  ];

  return (
    <section id="about" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              About Me
            </h2>
            <div className="w-20 h-1 bg-accent mx-auto mb-8" />
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              I'm a passionate technologist with a mission to create innovative solutions 
              that bridge the gap between cutting-edge technology and real-world applications. 
              With expertise spanning software development, creative design, and data systems, 
              I bring a holistic approach to every project.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {expertise.map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={index}
                  className="bg-card p-6 rounded-lg border border-border hover:border-accent transition-all duration-300 hover:shadow-glow animate-scale-in group"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                    <Icon className="h-6 w-6 text-accent" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="text-center">
            <Button 
              size="lg"
              className="bg-gradient-primary hover:opacity-90 text-primary-foreground shadow-md transition-all duration-300 hover:scale-105"
            >
              <Download className="mr-2 h-5 w-5" />
              Download Full Resume
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

const Download = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" x2="12" y1="15" y2="3" />
  </svg>
);

export default About;
