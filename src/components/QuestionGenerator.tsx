import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface QuestionGeneratorProps {
  onGenerate: (topic: string, difficulty: string, count: number) => Promise<void>;
}

export const QuestionGenerator = ({ onGenerate }: QuestionGeneratorProps) => {
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [count, setCount] = useState("5");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!topic || !difficulty || !count) {
      toast.error("Please fill in all fields");
      return;
    }

    const questionCount = parseInt(count);
    if (questionCount < 1 || questionCount > 20) {
      toast.error("Please enter between 1 and 20 questions");
      return;
    }

    setIsGenerating(true);
    
    try {
      console.log("Calling onGenerate with:", { topic, difficulty, count: questionCount });
      await onGenerate(topic, difficulty, questionCount);
      toast.success("Questions generated successfully!");
    } catch (error) {
      console.error("Generation failed:", error);
      toast.error(error instanceof Error ? error.message : "Failed to generate questions");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-[var(--shadow-medium)] border-2">
      <CardHeader>
        <CardTitle className="text-3xl flex items-center gap-2">
          <Sparkles className="w-7 h-7 text-primary" />
          Generate Questions
        </CardTitle>
        <CardDescription className="text-base">
          Create a custom exam paper tailored to your needs
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="topic" className="text-base font-semibold">Topic</Label>
            <Input
              id="topic"
              placeholder="e.g., Cloud Computing, DBMS, AI Ethics"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="h-12 text-base border-2 focus:border-primary"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="difficulty" className="text-base font-semibold">Difficulty Level</Label>
            <Select value={difficulty} onValueChange={setDifficulty}>
              <SelectTrigger id="difficulty" className="h-12 text-base border-2">
                <SelectValue placeholder="Select difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="count" className="text-base font-semibold">Number of Questions</Label>
            <Input
              id="count"
              type="number"
              min="1"
              max="20"
              placeholder="e.g., 10"
              value={count}
              onChange={(e) => setCount(e.target.value)}
              className="h-12 text-base border-2 focus:border-primary"
            />
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full h-14 text-lg shadow-[var(--shadow-medium)] hover:shadow-[var(--shadow-strong)] transition-all duration-300"
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Generating Questions...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Generate Questions
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
