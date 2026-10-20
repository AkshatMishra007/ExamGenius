import { useState } from "react";
import { Hero } from "@/components/Hero";
import { QuestionGenerator } from "@/components/QuestionGenerator";
import { QuestionDisplay } from "@/components/QuestionDisplay";
import { AuthGuard } from "@/components/AuthGuard";
import { Navbar } from "@/components/Navbar";
import { generateQuestions, Question } from "@/lib/api";
import { useNavigate } from "react-router-dom";


const Index = () => {
  const [view, setView] = useState<"hero" | "generator" | "questions">("hero");
  const [generatedQuestions, setGeneratedQuestions] = useState<Question[]>([]);
  const [examConfig, setExamConfig] = useState({ topic: "", difficulty: "" });

  const handleGetStarted = () => {
    setView("generator");
  };

  const handleGenerate = async (topic: string, difficulty: string, count: number) => {
    const response = await generateQuestions(topic, difficulty, count);
    
    if (!response.success) {
      throw new Error(response.error || "Failed to generate questions");
    }

    setGeneratedQuestions(response.questions);
    setExamConfig({ topic, difficulty });
    setView("questions");
  };

  const handleBack = () => {
    setView("generator");
  };
  const navigate = useNavigate();

  const handleQuizSubmit = (
  score: number,
  total: number,
  topic: string,
  difficulty: string,
  reviewData: any[]
) => {
  navigate("/score", {
    state: { score, total, topic, difficulty, reviewData },
  });
};


  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container px-4 py-8 mx-auto">
          {view === "hero" && <Hero onGetStarted={handleGetStarted} />}
          {view === "generator" && <QuestionGenerator onGenerate={handleGenerate} />}
          {view === "questions" && (
          <QuestionDisplay
    topic={examConfig.topic}
    difficulty={examConfig.difficulty}
    questions={generatedQuestions}
    onBack={handleBack}
    onSubmit={handleQuizSubmit} 
  />
          )}
        </div>
      </div>
    </AuthGuard>
  );
};

export default Index;
