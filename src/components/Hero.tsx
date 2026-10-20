import { Button } from "@/components/ui/button";
import { Brain, Sparkles, Target } from "lucide-react";

interface HeroProps {
  onGetStarted: () => void;
}

export const Hero = ({ onGetStarted }: HeroProps) => {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-background" />
      
      <div className="container relative z-10 px-4 py-20 mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-primary/10 text-primary animate-in fade-in slide-in-from-bottom-4 duration-700">
          <Sparkles className="w-4 h-4" />
          <span className="text-sm font-medium">AI-Powered Learning</span>
        </div>

        <h1 className="mb-6 text-5xl font-bold leading-tight tracking-tight md:text-7xl lg:text-8xl animate-in fade-in slide-in-from-bottom-6 duration-700 delay-150">
          Master Exams with
          <span className="block mt-2 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Intelligent Practice
          </span>
        </h1>

        <p className="max-w-2xl mx-auto mb-12 text-lg md:text-xl text-muted-foreground animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
          Generate custom question papers on any topic. Get instant hints and explanations. 
          Learn smarter with AI-powered exam preparation.
        </p>

        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row animate-in fade-in slide-in-from-bottom-10 duration-700 delay-500">
          <Button 
            size="lg" 
            onClick={onGetStarted}
            className="relative overflow-hidden group px-8 py-6 text-lg shadow-[var(--shadow-medium)] hover:shadow-[var(--shadow-strong)] transition-all duration-300"
          >
            <span className="relative z-10 flex items-center gap-2">
              Get Started
              <Brain className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </span>
          </Button>
          
          <Button 
            size="lg" 
            variant="outline"
            className="px-8 py-6 text-lg border-2 hover:bg-accent hover:text-accent-foreground hover:border-accent transition-all duration-300"
          >
            Learn More
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-6 mt-20 md:grid-cols-3 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-12 duration-700 delay-700">
          <FeatureCard
            icon={<Target className="w-6 h-6" />}
            title="Targeted Practice"
            description="Generate questions for specific topics and difficulty levels"
          />
          <FeatureCard
            icon={<Sparkles className="w-6 h-6" />}
            title="Smart Hints"
            description="Get contextual hints when you need a nudge in the right direction"
          />
          <FeatureCard
            icon={<Brain className="w-6 h-6" />}
            title="Detailed Explanations"
            description="Understand every answer with AI-powered explanations"
          />
        </div>
      </div>
    </section>
  );
};

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => {
  return (
    <div className="p-6 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-[var(--shadow-soft)] group">
      <div className="inline-flex items-center justify-center w-12 h-12 mb-4 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
        {icon}
      </div>
      <h3 className="mb-2 text-lg font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
};
