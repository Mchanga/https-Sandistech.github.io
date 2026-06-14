import Link from "next/link";

const links = [
  { href: "/", label: "Home" },
  { href: "/news", label: "News" },
  { href: "/business", label: "Business" },
  { href: "/events", label: "Events" },
  { href: "/about", label: "About Us" },
];

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-8 border-t">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-3 px-4 py-6 text-center text-sm text-muted md:flex-row md:justify-between md:text-left">
        <p className="font-semibold text-brand-600">SandisTech News</p>
        <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-brand-600">
              {l.label}
            </Link>
          ))}
        </nav>
        <p>
          &copy; {year} &middot; Developed by{" "}
          <span className="font-semibold">Paschal Masanja George</span>
        </p>
      </div>
    </footer>
  );
}
