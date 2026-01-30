import { useState, useEffect } from "react";

const CountdownSection = () => {
  const targetDate = new Date("2026-02-19T00:00:00");
  
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = targetDate.getTime() - new Date().getTime();
      
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    
    return () => clearInterval(timer);
  }, []);

  const formatNumber = (num: number) => num.toString().padStart(2, "0");

  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-deep-black">
      {/* Stars background */}
      <div className="stars pointer-events-none" />
      
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 py-20">
        {/* Header */}
        <p className="mb-6 font-body text-sm tracking-[0.4em] text-gold/80">
          THE WAIT IS ALMOST OVER
        </p>
        
        <h2 className="mb-4 font-heading text-5xl font-medium italic text-cream md:text-6xl lg:text-7xl text-shadow-gold">
          Zygon X Noesis
        </h2>
        
        <div className="mb-16 flex items-center gap-4">
          <div className="h-px w-12 bg-gold/50" />
          <span className="font-display text-sm tracking-[0.3em] text-cream/70">PREMIER 2026</span>
          <div className="h-px w-12 bg-gold/50" />
        </div>

        {/* Countdown Timer */}
        <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8">
          {[
            { value: timeLeft.days, label: "DAYS" },
            { value: timeLeft.hours, label: "HOURS" },
            { value: timeLeft.minutes, label: "MINUTES" },
            { value: timeLeft.seconds, label: "SECONDS" },
          ].map((item, index) => (
            <div key={item.label} className="flex items-center">
              <div className="flex flex-col items-center">
                <span className="font-heading text-6xl font-bold text-cream md:text-7xl lg:text-8xl text-shadow-gold">
                  {formatNumber(item.value)}
                </span>
                <span className="mt-2 font-body text-xs tracking-[0.2em] text-cream/60 md:text-sm">
                  {item.label}
                </span>
              </div>
              {index < 3 && (
                <span className="mx-2 font-heading text-5xl text-cream/40 md:mx-4 md:text-6xl lg:text-7xl">
                  :
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Location */}
        <p className="mt-16 font-body text-sm tracking-[0.2em] text-muted-foreground">
          SILICON UNIVERSITY • ODISHA
        </p>
      </div>
    </section>
  );
};

export default CountdownSection;
