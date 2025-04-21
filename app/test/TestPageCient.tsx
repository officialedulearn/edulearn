"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import QuestionCard from "./question-card";
import TestResults from "./test-results";
import { Loader2 } from "lucide-react";
import { getUser } from "@/actions/login";

interface Question {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export default function TestPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const chatId = searchParams.get("chatId");
  const { toast } = useToast();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState(180); // 3 minutes in seconds
  const [testCompleted, setTestCompleted] = useState(false);

  useEffect(() => {
    if (!chatId) {
      toast({
        title: "Error",
        description: "No chat ID provided",
        variant: "destructive",
      });
      router.push("/");
      return;
    }

    async function fetchQuestions() {
      try {
        setLoading(true);
        const response = await fetch("/api/quiz", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ chatId }),
        });

        if (!response.ok) {
          throw new Error("Failed to generate questions");
        }

        const data = await response.json();
        setQuestions(data);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to generate questions",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchQuestions();
  }, [chatId, router, toast]);

  // Timer effect
  useEffect(() => {
    if (loading || testCompleted) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setTestCompleted(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [loading, testCompleted]);

  // useEffect(() => {
  //   const setUserCurrentXP = async () => {
  //     const user = await getUser();
  //     const userId = user?.sub as string;
  //     const currentXP = (await getUserXP(userId)) || 0;

  //     setUserXP(currentXP);
  //     setUserId(userId);
  //   };
  //   setUserCurrentXP();
  // }, [userXP]);

  const handleAnswer = (answer: string) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestionIndex]: answer,
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      setTestCompleted(true);
      console.log("okayyy")
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const calculateScore = () => {
    let correct = 0;
    Object.entries(answers).forEach(([index, answer]) => {
      if (answer === questions[Number(index)].correctAnswer) {
        correct++;
      }
    });

    return {
      correct,
      total: questions.length,
      percentage: Math.round((correct / questions.length) * 100),
    };
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-2xl p-6">
          <div className="flex flex-col items-center justify-center space-y-4">
            <Loader2 className="size-8 animate-spin text-primary" />
            <p className="text-lg font-medium">
              Generating your test questions...
            </p>
            <p className="text-sm text-muted-foreground">
              This may take a moment as we analyze your chat history.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  if (testCompleted) {
    return (
      <TestResults
        score={calculateScore()}
        questions={questions}
        answers={answers}
      />
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-2xl p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="text-sm font-medium">
            Question {currentQuestionIndex + 1} of {questions.length}
          </div>
          <div className="text-sm font-medium text-red-500">
            Time left: {formatTime(timeLeft)}
          </div>
        </div>

        <Progress
          value={(currentQuestionIndex / questions.length) * 100}
          className="h-2 mb-6"
        />

        {questions.length > 0 && (
          <QuestionCard
            question={questions[currentQuestionIndex]}
            selectedAnswer={answers[currentQuestionIndex]}
            onSelectAnswer={handleAnswer}
          />
        )}

        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
          >
            Previous
          </Button>

          <Button onClick={handleNext}>
            {currentQuestionIndex < questions.length - 1 ? "Next" : "Finish"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
