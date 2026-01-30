import HeroSection from "@/components/HeroSection";
import LoginSection from "@/components/LoginSection";
import CountdownSection from "@/components/CountdownSection";
import FooterSection from "@/components/FooterSection";

const Index = () => {
  return (
    <main className="bg-background">
      <HeroSection />
      <LoginSection />
      <CountdownSection />
      <FooterSection />
    </main>
  );
};

export default Index;
