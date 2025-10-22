const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary text-primary-foreground py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto text-center space-y-4">
          <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
            <a href="#" className="hover:text-accent transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-accent transition-colors">
              Resume
            </a>
            <a href="#contact" className="hover:text-accent transition-colors">
              Contact
            </a>
          </div>
          <div className="w-full h-px bg-primary-foreground/20" />
          <p className="text-primary-foreground/80">
            © {currentYear} Sandistech. Designed & Developed by Paschal Masanja George.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
