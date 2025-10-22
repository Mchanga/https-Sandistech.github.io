import { Code2, Palette, Network, Database } from "lucide-react";
import { Card } from "@/components/ui/card";

const Services = () => {
  const services = [
    {
      icon: Code2,
      title: "Software Development",
      description: "Custom web and mobile applications built with modern technologies. From Android apps to AI-powered systems, I create scalable solutions tailored to your needs.",
      features: ["Web Applications", "Android Development", "AI Integration", "API Development"]
    },
    {
      icon: Palette,
      title: "Graphics Design",
      description: "Creative visual solutions that bring your brand to life. Professional designs for digital and print media with a focus on user experience and visual impact.",
      features: ["Logo Design", "UI/UX Design", "Brand Identity", "Digital Marketing"]
    },
    {
      icon: Network,
      title: "Network Management",
      description: "Reliable network infrastructure setup and maintenance. Ensuring secure, optimized, and efficient network systems for your business operations.",
      features: ["Network Setup", "Security Configuration", "Performance Optimization", "LAN/WAN Management"]
    },
    {
      icon: Database,
      title: "Data Administration",
      description: "Professional database management and data analytics services. Ensuring data integrity, performance optimization, and strategic insights from your data.",
      features: ["Database Design", "Data Optimization", "Backup Strategies", "Analytics & Reports"]
    }
  ];

  return (
    <section id="services" className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Services
            </h2>
            <div className="w-20 h-1 bg-accent mx-auto mb-8" />
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Comprehensive technology solutions tailored to your business needs
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <Card
                  key={index}
                  className="p-8 hover:shadow-glow transition-all duration-300 border-border hover:border-accent group animate-scale-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-14 h-14 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-accent/20 transition-colors">
                      <Icon className="h-7 w-7 text-accent" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-semibold text-foreground mb-2">
                        {service.title}
                      </h3>
                    </div>
                  </div>
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    {service.description}
                  </p>
                  <ul className="space-y-2">
                    {service.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center text-sm text-muted-foreground">
                        <div className="w-1.5 h-1.5 bg-accent rounded-full mr-3" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Services;
