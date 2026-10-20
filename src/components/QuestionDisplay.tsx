import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { HelpCircle, CheckCircle2, ChevronLeft, Lightbulb, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Question } from "@/lib/api";

interface QuestionDisplayProps {
  topic: string;
  difficulty: string;
  questions: Question[];
  onBack: () => void;
  onSubmit: (
    score: number,
    total: number,
    topic: string,
    difficulty: string,
    reviewData: { question: string; correct: string; selected: string }[]
  ) => void;
}

const CORRECT_ANSWER_MARKER = " **correct answer**";

export const QuestionDisplay = ({
  topic,
  difficulty,
  questions,
  onBack,
  onSubmit,
}: QuestionDisplayProps) => {
  // 🧠 All hooks inside the component
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [answered, setAnswered] = useState<Set<number>>(new Set());
  const [score, setScore] = useState(0);

  // 🆕 Store all selected answers for final review
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: string }>({});

  if (!questions || questions.length === 0) {
    return (
      <div className="w-full max-w-4xl mx-auto text-center">
        <p className="text-lg text-destructive">
          The model failed to generate questions for this topic. Please try again.
        </p>
        <Button variant="outline" onClick={onBack} className="gap-2 mt-4">
          <ChevronLeft className="w-4 h-4" />
          Back to Generator
        </Button>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  const correctAnswer = useMemo(() => {
    return currentQuestion.options?.find(opt => opt.includes(CORRECT_ANSWER_MARKER)) || "";
  }, [currentQuestion]);

  const cleanOption = (option: string) => option.replace(CORRECT_ANSWER_MARKER, "");

  const handleOptionClick = (option: string) => {
    if (showAnswer) return;

    setSelectedOption(option);
    setShowAnswer(true);
    setAnswered(new Set(answered).add(currentIndex));
    setSelectedAnswers(prev => ({ ...prev, [currentIndex]: option })); // ✅ record selection

    const isCorrect = option.includes(CORRECT_ANSWER_MARKER);
    if (isCorrect) setScore(prev => prev + 1);
  };

  const handleShowHint = () => setShowHint(!showHint);

  const handleShowAnswer = () => {
    if (showAnswer) return;
    setShowAnswer(true);
    setAnswered(new Set(answered).add(currentIndex));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowHint(false);
      setShowAnswer(false);
      setSelectedOption(null);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setShowHint(false);
      setShowAnswer(false);
      setSelectedOption(null);
    }
  };

  const handleSubmit = () => {
    const reviewData = questions.map((q, i) => ({
      question: q.question,
      correct:
        q.options.find(opt => opt.includes(CORRECT_ANSWER_MARKER))?.replace(CORRECT_ANSWER_MARKER, "") ||
        "N/A",
      selected: selectedAnswers[i]
        ? selectedAnswers[i].replace(CORRECT_ANSWER_MARKER, "")
        : "Not Answered",
    }));

    onSubmit(score, questions.length, topic, difficulty, reviewData);
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff.toLowerCase()) {
      case "easy":
        return "bg-success text-success-foreground";
      case "medium":
        return "bg-warning text-warning-foreground";
      case "hard":
        return "bg-destructive text-destructive-foreground";
      default:
        return "bg-primary text-primary-foreground";
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ChevronLeft className="w-4 h-4" />
          Back to Generator
        </Button>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="text-sm px-4 py-2">{topic}</Badge>
          <Badge className={cn("text-sm px-4 py-2", getDifficultyColor(difficulty))}>{difficulty}</Badge>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Question {currentIndex + 1} of {questions.length}</span>
          <span>{answered.size} answered</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <Card className="shadow-[var(--shadow-strong)] border-2">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between gap-4">
            <h3 className="text-2xl font-bold leading-tight">{currentQuestion.question}</h3>
            {answered.has(currentIndex) && <CheckCircle2 className="w-6 h-6 text-success flex-shrink-0" />}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => {
              const isSelected = selectedOption === option;
              const isCorrect = option === correctAnswer;

              return (
                <Button
                  key={index}
                  variant="outline"
                  size="lg"
                  className={cn(
                    "w-full justify-start text-left h-auto py-3 whitespace-normal",
                    showAnswer && isCorrect && "bg-success/20 border-success hover:bg-success/20",
                    showAnswer && isSelected && !isCorrect && "bg-destructive/20 border-destructive hover:bg-destructive/20"
                  )}
                  onClick={() => handleOptionClick(option)}
                  disabled={showAnswer}
                >
                  <span className="flex-1">{cleanOption(option)}</span>
                  {showAnswer && isCorrect && <CheckCircle2 className="w-5 h-5 text-success" />}
                  {showAnswer && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-destructive" />}
                </Button>
              );
            })}
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              onClick={handleShowHint}
              variant="outline"
              className="gap-2 border-warning/50 hover:bg-warning hover:text-warning-foreground hover:border-warning transition-all duration-300"
              disabled={showHint}
            >
              <Lightbulb className="w-4 h-4" />
              {showHint ? "Hint Shown" : "Show Hint"}
            </Button>
            <Button
              onClick={handleShowAnswer}
              variant="outline"
              className="gap-2 border-success/50 hover:bg-success hover:text-success-foreground hover:border-success transition-all duration-300"
              disabled={showAnswer}
            >
              <CheckCircle2 className="w-4 h-4" />
              {showAnswer ? "Answer Shown" : "Show Answer"}
            </Button>
          </div>

          {showHint && (
            <Card className="border-warning/50 bg-warning/5 animate-in fade-in slide-in-from-top-2 duration-300">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2 text-warning">
                  <Lightbulb className="w-5 h-5" />
                  <h4 className="font-semibold">Hint</h4>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{currentQuestion.hint}</p>
              </CardContent>
            </Card>
          )}

          {showAnswer && (
            <Card className="border-success/50 bg-success/5 animate-in fade-in slide-in-from-top-2 duration-300">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2 text-success">
                  <CheckCircle2 className="w-5 h-5" />
                  <h4 className="font-semibold">Answer</h4>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="font-semibold">{cleanOption(correctAnswer)}</p>
                <div className="pt-2 border-t border-success/20">
                  <p className="text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground">Explanation: </span>
                    {currentQuestion.explanation}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-between pt-4">
            <Button
              onClick={handlePrevious}
              variant="outline"
              disabled={currentIndex === 0}
              className="gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>

            {currentIndex < questions.length - 1 ? (
              <Button onClick={handleNext} className="gap-2">
                Next
                <HelpCircle className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                className="bg-green-600 hover:bg-green-700 text-white gap-2"
              >
                Submit
                <CheckCircle2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
