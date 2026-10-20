import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Trophy, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useEffect, useRef, useState } from "react";
import confetti from "canvas-confetti";

// ---------- 3D Donut Component ----------
function Donut3D({ score, total }: { score: number; total: number }) {
  const percentage = score / total;
  const meshRef = useRef<any>();

  useEffect(() => {
    let frameId: number;
    const animate = () => {
      if (meshRef.current) meshRef.current.rotation.y += 0.01;
      frameId = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(frameId);
  }, []);

  return (
    <Canvas style={{ height: 260 }}>
      <ambientLight intensity={0.8} />
      <directionalLight position={[5, 5, 5]} intensity={0.7} />
      <mesh ref={meshRef}>
        <torusGeometry args={[2, 0.5, 64, 100, Math.PI * 2]} />
        <meshStandardMaterial
          color="#e5e7eb"
          metalness={0.3}
          roughness={0.4}
        />
      </mesh>
      <mesh rotation={[0, 0, -Math.PI * percentage * 2]}>
        <torusGeometry args={[2, 0.5, 64, 100, Math.PI * percentage * 2]} />
        <meshStandardMaterial
          color="#22c55e"
          emissive="#16a34a"
          emissiveIntensity={0.2}
          metalness={0.6}
          roughness={0.2}
        />
      </mesh>
      <OrbitControls enableZoom={false} enablePan={false} autoRotate />
    </Canvas>
  );
}

// ---------- Utility Functions ----------
const getPerformance = (pct: number) => {
  if (pct >= 90)
    return { label: "Excellent 🎯", color: "from-green-500 to-emerald-400", glow: "shadow-green-300" };
  if (pct >= 70)
    return { label: "Good 💪", color: "from-blue-500 to-cyan-400", glow: "shadow-blue-300" };
  if (pct >= 50)
    return { label: "Average ⚙️", color: "from-yellow-500 to-amber-400", glow: "shadow-yellow-300" };
  return { label: "Needs Improvement 📘", color: "from-rose-500 to-pink-400", glow: "shadow-rose-300" };
};

export default function ScorePage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [animatedScore, setAnimatedScore] = useState(0);
  const [animatedAccuracy, setAnimatedAccuracy] = useState(0);

  if (!state) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-6 text-center">
          <h2 className="text-xl font-semibold mb-2">No score data found</h2>
          <Button onClick={() => navigate("/")}>Back to Home</Button>
        </Card>
      </div>
    );
  }

  const { score, total, topic, difficulty, reviewData = [] } = state;
  const accuracy = Math.round((score / total) * 100);
  const performance = getPerformance(accuracy);

  // Animate counters
  useEffect(() => {
    let step = 0;
    const timer = setInterval(() => {
      step += 1;
      if (step <= score) setAnimatedScore(step);
      if (step <= accuracy) setAnimatedAccuracy(step);
      if (step >= Math.max(score, accuracy)) clearInterval(timer);
    }, 25);
    return () => clearInterval(timer);
  }, [score, accuracy]);

  // Confetti for high scores
  useEffect(() => {
    if (accuracy >= 80) {
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  }, [accuracy]);

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 py-10 px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Button>

          <div className="flex gap-2">
            <Badge variant="outline" className="px-3 py-1 text-base">{topic}</Badge>
            <Badge className="bg-blue-600 text-white px-3 py-1 text-base capitalize">
              {difficulty}
            </Badge>
          </div>
        </div>

        {/* Main Section */}
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Scorecard */}
          <motion.div
            className="relative border-0 backdrop-blur-2xl bg-white/60 shadow-xl rounded-3xl p-6"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-3xl font-bold flex items-center gap-2">
                <Trophy className="text-yellow-500" /> Scorecard
              </h2>
              <span
                className={`text-sm font-medium bg-gradient-to-r ${performance.color} text-white px-3 py-1 rounded-full shadow-md ${performance.glow}`}
              >
                {performance.label}
              </span>
            </div>

            <p className="text-muted-foreground mb-3">
              Your performance summary for this quiz.
            </p>

            <div className="flex justify-between text-lg">
              <div>
                <p className="text-slate-600 font-medium">Score</p>
                <motion.p
                  key={animatedScore}
                  className="text-4xl font-extrabold text-slate-900"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                >
                  {animatedScore} / {total}
                </motion.p>
              </div>

              <div className="text-right">
                <p className="text-slate-600 font-medium">Accuracy</p>
                <motion.p
                  key={animatedAccuracy}
                  className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-cyan-400 bg-clip-text text-transparent"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                >
                  {animatedAccuracy}%
                </motion.p>
              </div>
            </div>

            <div className="grid grid-cols-2 text-center mt-5">
              <div>
                <p className="text-green-600 font-bold text-xl">{score}</p>
                <p className="text-xs text-muted-foreground">Correct</p>
              </div>
              <div>
                <p className="text-rose-600 font-bold text-xl">{total - score}</p>
                <p className="text-xs text-muted-foreground">Incorrect</p>
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <Button
                variant="outline"
                className="flex-1 hover:bg-slate-100"
                onClick={() => navigate(-1)}
              >
                Retake Quiz
              </Button>
              <Button
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                onClick={() => navigate("/")}
              >
                Back to Generator
              </Button>
            </div>
          </motion.div>

          {/* 3D Donut Chart */}
          <motion.div
            className="rounded-3xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 shadow-lg p-6"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Donut3D score={score} total={total} />
            <p className="text-center text-sm text-muted-foreground mt-2">
              {score} Correct • {total - score} Incorrect
            </p>
          </motion.div>
        </div>

        {/* Review Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-2 shadow-md rounded-3xl">
            <CardHeader>
              <h3 className="text-xl font-semibold">Question Review</h3>
              <p className="text-sm text-muted-foreground">
                Compare your answers with the correct ones.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {reviewData.map((q: any, i: number) => {
                const isCorrect =
                  q.selected.trim().toLowerCase() === q.correct.trim().toLowerCase();
                return (
                  <div
                    key={i}
                    className={`p-4 border rounded-2xl ${
                      isCorrect
                        ? "border-green-200 bg-green-50/70"
                        : "border-rose-200 bg-rose-50/70"
                    }`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-semibold">{i + 1}. {q.question}</h4>
                      {isCorrect ? (
                        <CheckCircle2 className="text-green-600" />
                      ) : (
                        <XCircle className="text-rose-600" />
                      )}
                    </div>
                    <div className="text-sm space-y-1">
                      <p>
                        <span className="font-medium">Your answer:</span>{" "}
                        <span className={isCorrect ? "text-green-700" : "text-rose-700"}>
                          {q.selected}
                        </span>
                      </p>
                      {!isCorrect && (
                        <p>
                          <span className="font-medium">Correct answer:</span>{" "}
                          <span className="text-green-700">{q.correct}</span>
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
