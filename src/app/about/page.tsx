import { Newspaper, Briefcase, Calendar, Users, Globe, Zap } from "lucide-react";

export const metadata = { title: "About Us" };

const features = [
  { icon: Newspaper, title: "Real-time News", text: "Breaking stories across sports, education, entertainment and more." },
  { icon: Briefcase, title: "Business Hub", text: "Market updates, articles and a local business directory." },
  { icon: Calendar, title: "Events", text: "Discover and RSVP to conferences, concerts and community events." },
  { icon: Users, title: "Community", text: "Comment, react and chat with members in real time." },
  { icon: Globe, title: "Anywhere", text: "A fast, installable PWA optimized for phones and tablets." },
  { icon: Zap, title: "Live Updates", text: "Notifications and chat powered by WebSockets." },
];

export default function AboutPage() {
  return (
    <div className="space-y-6">
      <section className="card overflow-hidden bg-gradient-to-br from-brand-600 to-brand-800 p-6 text-white">
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/15 text-xl font-black">
          S
        </span>
        <h1 className="mt-3 text-2xl font-extrabold">About SandisTech News</h1>
        <p className="mt-2 text-sm text-brand-100">
          SandisTech News is a modern, mobile-first platform bringing together
          real-time news, business listings and events in one premium experience —
          think Google News, BBC and LinkedIn, reimagined for your phone.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-extrabold">What we offer</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {features.map((f) => (
            <div key={f.title} className="card p-4">
              <f.icon className="h-6 w-6 text-brand-600" />
              <p className="mt-2 font-bold">{f.title}</p>
              <p className="text-sm text-muted">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="card p-5">
        <h2 className="mb-2 text-lg font-extrabold">Our mission</h2>
        <p className="text-sm leading-relaxed text-muted">
          To keep our community informed, connected and empowered by delivering
          trustworthy news and opportunities, fast and accessible to everyone.
        </p>
      </section>
    </div>
  );
}
