import heroBackground from "@/assets/hero-background.jpg";
import { Menu } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen w-full overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroBackground})` }}
      />
      
      {/* Gradient Overlay */}
      <div className="hero-overlay absolute inset-0" />

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-6 md:px-12">
        <div className="flex items-center gap-2">
          <span className="font-display text-xl font-bold tracking-wider text-cream">SSC</span>
          <span className="hidden text-xs font-light tracking-widest text-cream/80 md:block">
            SILICON STUDENTS' COUNCIL
          </span>
        </div>
        <button className="text-cream transition-colors hover:text-gold">
          <Menu size={28} strokeWidth={1.5} />
        </button>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 flex min-h-[calc(100vh-100px)] flex-col items-center justify-center px-6 text-center">
        <div className="animate-float">
          <p className="mb-4 font-body text-xs font-light tracking-[0.3em] text-gold-light md:text-sm">
            25 YEARS • SILICON
          </p>
          <h1 className="font-display text-6xl font-bold tracking-wide text-cream md:text-8xl lg:text-9xl text-shadow-gold">
            ZYGON
          </h1>
          <div className="mt-2 flex items-center justify-center gap-4">
            <span className="text-xs tracking-[0.2em] text-gold/80">THE TECHNO CULTURAL EXTRAVAGANZA</span>
          </div>
          <h2 className="mt-2 font-display text-4xl font-medium tracking-widest text-cream/90 md:text-5xl lg:text-6xl">
            NOESIS
          </h2>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2">
        <div className="flex flex-col items-center gap-2">
          <span className="text-xs tracking-widest text-cream/60">SCROLL</span>
          <div className="h-8 w-px animate-pulse bg-gradient-to-b from-gold to-transparent" />
        </div>
      </div>

      {/* Audio controls placeholder */}
      <div className="fixed bottom-6 left-6 z-20 flex items-center gap-2 rounded-full border border-gold/30 bg-background/80 px-4 py-2 backdrop-blur-sm">
        <div className="flex gap-0.5">
          <div className="h-4 w-1 animate-pulse rounded-full bg-gold" style={{ animationDelay: '0ms' }} />
          <div className="h-3 w-1 animate-pulse rounded-full bg-gold" style={{ animationDelay: '150ms' }} />
          <div className="h-5 w-1 animate-pulse rounded-full bg-gold" style={{ animationDelay: '300ms' }} />
          <div className="h-2 w-1 animate-pulse rounded-full bg-gold" style={{ animationDelay: '450ms' }} />
        </div>
        <div className="ml-1 h-4 w-4 rounded-full border border-gold/50" />
      </div>
    </section>
  );
};

export default HeroSection;
