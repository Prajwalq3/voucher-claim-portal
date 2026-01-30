import { Instagram, Linkedin, ExternalLink, Eye } from "lucide-react";

const FooterSection = () => {
  const visitorCount = 7985;

  return (
    <footer className="relative w-full overflow-hidden bg-deep-black">
      {/* Stars background */}
      <div className="stars pointer-events-none opacity-50" />
      
      <div className="relative z-10 px-6 py-16 md:px-12 lg:px-20">
        <div className="mx-auto grid max-w-7xl gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <h3 className="font-heading text-3xl font-medium italic text-gold md:text-4xl">
              Zygon X Noesis
            </h3>
            <p className="mt-4 font-body text-sm leading-relaxed text-cream/70">
              The techno cultural festival of Silicon University — where mythology meets modern expression.
            </p>
            
            {/* Visitor Counter */}
            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-gold/30 px-4 py-2">
              <Eye className="h-4 w-4 text-cream/60" />
              <span className="text-sm text-cream/60">Visitors</span>
              <span className="font-display text-sm font-semibold text-gold">
                {visitorCount.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Resources */}
          <div>
            <h4 className="mb-6 font-display text-lg tracking-wider text-gold">
              Resources
            </h4>
            <ul className="space-y-4">
              <li>
                <a
                  href="#"
                  className="group flex items-center gap-2 font-body text-sm text-cream/70 transition-colors hover:text-cream"
                >
                  Silicon University
                  <ExternalLink className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="font-body text-sm text-cream/70 transition-colors hover:text-cream"
                >
                  Contact Us
                </a>
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h4 className="mb-6 font-display text-lg tracking-wider text-gold">
              Connect
            </h4>
            <p className="mb-4 text-sm text-cream/70">Follow Silicon University</p>
            <div className="flex gap-4">
              <a
                href="#"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-gold/30 text-cream/70 transition-all hover:border-gold hover:text-gold"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-gold/30 text-cream/70 transition-all hover:border-gold hover:text-gold"
              >
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Organized By */}
          <div className="text-center lg:text-right">
            <div className="mb-4 flex justify-center lg:justify-end">
              {/* Stylized Logo */}
              <div className="relative h-20 w-16">
                <div className="absolute right-0 top-0 h-16 w-3 rounded-full bg-gradient-to-b from-blue-500 to-blue-600" />
                <div className="absolute bottom-0 left-0 h-4 w-4 rounded-full bg-cream/80" />
                <div className="absolute bottom-4 left-2 h-8 w-2 rounded-full bg-gradient-to-b from-blue-400 to-blue-500 rotate-12" />
              </div>
            </div>
            <p className="font-body text-xs tracking-[0.2em] text-cream/50">
              ORGANIZED BY
            </p>
            <p className="mt-1 font-display text-sm tracking-wider text-gold">
              Silicon University, Odisha
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 border-t border-gold/10 pt-8 text-center">
          <p className="font-body text-xs text-cream/40">
            © 2026 Zygon X Noesis. All rights reserved. Silicon Students' Council.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;
