"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { CheckCircle, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { getCurrentUserAndXP, updateUserXPAction } from "@/actions/user-xp";
import Link from "next/link";

interface Question {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

interface TestResultsProps {
  score: {
    correct: number;
    total: number;
    percentage: number;
  };
  questions: Question[];
  answers: Record<number, string>;
}

export default function TestResults({
  score,
  questions,
  answers,
}: TestResultsProps) {
  const router = useRouter();

  const [newXP, setNewXP] = useState(0);
  const [totalXP, setTotalXP] = useState(0);
  const [loading, setLoading] = useState(true);

  // First fetch the current user and their XP
  useEffect(() => {
    const fetchUserData = async () => {
      const { userId, currentXP } = await getCurrentUserAndXP();

      if (userId) {
        const earnedXP = Math.round((score.correct / score.total) * 10);
        setNewXP(earnedXP);
        const updatedTotalXP = await updateUserXPAction(userId, earnedXP);
        setTotalXP(updatedTotalXP);
      }

      setLoading(false);
    };

    fetchUserData();
  }, [score]);

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return "text-green-500";
    if (percentage >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <CardTitle>Test Results</CardTitle>
          <CardDescription>
            You completed the test in time. Here's how you did:
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="flex flex-col items-center justify-center p-6 border rounded-lg">
            <h3 className="text-2xl font-bold mb-2">Your Score</h3>
            <p
              className={`text-4xl font-bold ${getScoreColor(
                score.percentage
              )}`}
            >
              {score.percentage}%
            </p>
            <p className="text-muted-foreground mt-2">
              {score.correct} correct out of {score.total} questions
            </p>
            {loading ? (
              <p className="text-muted-foreground mt-2">Updating XP...</p>
            ) : (
              <>
                <p className="text-muted-foreground mt-2">
                  New XP: {newXP} | Total XP: {totalXP}
                </p>
                <div className="text-green-200">
                  <p>Check your profile for more details!</p>
                  <Link href="/profile">My profile</Link>
                </div>
              </>
            )}
          </div>

          {/* Accordion section would go here (commented as in original) */}
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => router.push("/")}>
            Back to Chat
          </Button>
          <Button onClick={() => router.push("/test")}>
            Take Another Test
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
