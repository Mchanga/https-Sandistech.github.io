import { Card } from "@/components/ui/card";

const Skills = () => {
  const skillCategories = [
    {
      title: "Programming Languages",
      skills: ["Java", "Python", "PHP", "JavaScript",  "SQL"]
    },
    {
      title: "Frameworks & Libraries",
      skills: ["Android SDK", "Node.js", "React", "Vue.js", "Express", "TailwindCSS"]
    },
    {
      title: "Design Tools",
      skills: ["Adobe Photoshop", "Illustrator", "Figma", "Adobe After Effects" ]
    },
    {
      title: "Database Management",
      skills: ["MySQL", "Firebase", "MongoDB", ]
    },
    {
      title: "Networking",
      skills: ["Cisco Basics", "LAN/WAN Setup", "IP Management", "Network Security", "Routing"]
    },
    {
      title: "Data Administration",
      skills: ["System Administration"]
    },
    {
      title: "Development Tools",
      skills: ["Git", "VS Code", "Android Studio"]
    },
    {
      title: "Other Technologies",
      skills: ["TensorFlow Lite", "Firebase Console", "REST APIs",  "Linux"]
    }
  ];

  return (
    <section id="skills" className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Skills & Expertise
            </h2>
            <div className="w-20 h-1 bg-accent mx-auto mb-8" />
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A comprehensive toolkit for building modern technology solutions
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {skillCategories.map((category, index) => (
              <Card
                key={index}
                className="p-6 hover:shadow-glow transition-all duration-300 border-border hover:border-accent animate-scale-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <h3 className="text-lg font-semibold text-foreground mb-4 pb-2 border-b border-accent/20">
                  {category.title}
                </h3>
                <ul className="space-y-2">
                  {category.skills.map((skill, idx) => (
                    <li
                      key={idx}
                      className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <div className="w-1.5 h-1.5 bg-accent rounded-full mr-3 flex-shrink-0" />
                      {skill}
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Skills;
