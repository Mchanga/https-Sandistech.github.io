import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Github } from "lucide-react";

const Projects = () => {
  const [filter, setFilter] = useState("All");

  const categories = ["All", "Software", "Graphics", "Database", "Network"];

  const projects = [
    {
      title: "FitMeal AI",
      category: "Software",
      description: "AI-powered meal planning and fitness tracking application with personalized recommendations",
      tech: ["Android", "TensorFlow Lite", "Firebase"],
      image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085",
      github: "#",
      demo: "#"
    },
    {
      title: "Tujenge Wallet",
      category: "Software",
      description: "Mobile financial management platform for community savings and investment groups",
      tech: ["React Native", "Node.js", "MongoDB"],
      image: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d",
      github: "#",
      demo: "#"
    },
    {
      title: "Brand Identity Suite",
      category: "Graphics",
      description: "Complete brand identity design including logos, color schemes, and marketing materials",
      tech: ["Photoshop", "Illustrator", "Figma"],
      image: "https://images.unsplash.com/photo-1561070791-2526d30994b5",
      demo: "#"
    },
    {
      title: "NWTS Dashboard",
      category: "Database",
      description: "Network and warehouse tracking system with real-time analytics and reporting",
      tech: ["Vue.js", "MySQL", "Redis"],
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f",
      github: "#",
      demo: "#"
    },
    {
      title: "Enterprise Network Setup",
      category: "Network",
      description: "Complete network infrastructure design and implementation for corporate environment",
      tech: ["Cisco", "LAN/WAN", "Security"],
      image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31",
    },
    {
      title: "UI/UX Portfolio",
      category: "Graphics",
      description: "Collection of modern interface designs for web and mobile applications",
      tech: ["Figma", "Adobe XD", "Sketch"],
      image: "https://images.unsplash.com/photo-1561070791-36c11767b26a",
      demo: "#"
    }
  ];

  const filteredProjects = filter === "All" 
    ? projects 
    : projects.filter(p => p.category === filter);

  return (
    <section id="projects" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Projects
            </h2>
            <div className="w-20 h-1 bg-accent mx-auto mb-8" />
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A showcase of my professional work across different domains
            </p>
          </div>

          {/* Filter tabs */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {categories.map((category) => (
              <Button
                key={category}
                variant={filter === category ? "default" : "outline"}
                onClick={() => setFilter(category)}
                className={filter === category ? "bg-accent hover:bg-accent/90" : ""}
              >
                {category}
              </Button>
            ))}
          </div>

          {/* Projects grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProjects.map((project, index) => (
              <Card
                key={index}
                className="overflow-hidden group hover:shadow-glow transition-all duration-300 border-border hover:border-accent animate-scale-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-70 transition-opacity duration-300" />
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant="secondary" className="bg-accent/10 text-accent hover:bg-accent/20">
                      {project.category}
                    </Badge>
                    <div className="flex gap-2">
                      {project.github && (
                        <a href={project.github} className="text-muted-foreground hover:text-accent transition-colors">
                          <Github className="h-5 w-5" />
                        </a>
                      )}
                      {project.demo && (
                        <a href={project.demo} className="text-muted-foreground hover:text-accent transition-colors">
                          <ExternalLink className="h-5 w-5" />
                        </a>
                      )}
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    {project.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {project.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {project.tech.map((tech, idx) => (
                      <span
                        key={idx}
                        className="text-xs px-2 py-1 bg-secondary rounded text-secondary-foreground"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Projects;
