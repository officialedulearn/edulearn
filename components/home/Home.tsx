"use client";

import type React from "react";

import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  MessageSquare,
  CheckCircle,
  Target,
  Trophy,
} from "lucide-react";
import { useRef, useEffect, useState } from "react";
import { useRouter } from "next/navigation";


export default function Home({ onStartChat }: any) {
  const flowRef = useRef<HTMLDivElement>(null);
  const [scrollY, setScrollY] = useState(0);
  const router = useRouter()

  const scrollToFlow = () => {
    flowRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <main className="relative min-h-screen bg-black text-white overflow-hidden">
      {/* Background Elements */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-0 left-0 size-full opacity-10">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white"
              style={{
                width: Math.random() * 300 + 50 + "px",
                height: Math.random() * 300 + 50 + "px",
                top: Math.random() * 100 + "%",
                left: Math.random() * 100 + "%",
                opacity: Math.random() * 0.05 + 0.02,
                transform: `scale(${Math.random() * 0.5 + 0.5})`,
              }}
            />
          ))}
        </div>
        <div className="absolute top-0 left-0 size-full">
          <svg width="100%" height="100%" className="opacity-5">
            <pattern
              id="grid"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="white"
                strokeWidth="0.5"
              />
            </pattern>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center min-h-screen px-4 z-10">
        <div
          className="absolute top-0 right-0 w-1/2 h-screen border-l border-white/10"
          style={{
            transform: `translateX(${scrollY * 0.1}px)`,
            opacity: 1 - scrollY * 0.001,
          }}
        />
        <div
          className="absolute bottom-0 left-0 w-1/2 h-screen border-r border-white/10"
          style={{
            transform: `translateX(-${scrollY * 0.1}px)`,
            opacity: 1 - scrollY * 0.001,
          }}
        />

        <div className="max-w-4xl mx-auto text-center relative">
          <div className="absolute -top-32 left-1/2 size-64 rounded-full border border-white/10 -translate-x-1/2" />
          <div className="absolute -top-48 left-1/2 size-96 rounded-full border border-white/5 -translate-x-1/2" />

          <h1 className="text-5xl md:text-7xl font-bold mb-8 tracking-tight">
            <span className="block mb-2">Learn smarter</span>
            <span className="block text-4xl md:text-6xl text-white/70">
              with AI.
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-white/70 mb-12 max-w-2xl mx-auto">
            Earn XP, climb the leaderboard, and collect rewards.
          </p>

          <div className="relative inline-block group">
            <div className="absolute -inset-0.5 bg-white rounded-lg blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
            <Button
              onClick={onStartChat}
              className="relative h-16 px-10 text-lg rounded-lg bg-black text-white border border-white/20 hover:bg-white hover:text-black transition-all duration-300"
            >
              Go to Chat
              <ArrowRight className="ml-2 size-5" />
            </Button>
          </div>

          <div className="flex justify-center gap-12 mt-12">
            <button onClick={() => router.push('/leaderboard')} className="relative text-white/50 hover:text-white transition-colors duration-300 after:content-[''] after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:bg-white hover:after:w-full after:transition-all after:duration-300">
              Go to Leaderboard
            </button>
            <button
              className="relative text-white/50 hover:text-white transition-colors duration-300 after:content-[''] after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:bg-white hover:after:w-full after:transition-all after:duration-300"
              onClick={scrollToFlow}
            >
              How it Works
            </button>
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 5V19M12 19L5 12M12 19L19 12"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </section>

      {/* Process Flow Section */}
      <section ref={flowRef} className="relative min-h-screen py-32 z-10">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-24 tracking-tight">
            <span className="relative inline-block">
              How It
              <span className="relative ml-3">
                Works
                <svg
                  className="absolute -bottom-2 left-0 w-full"
                  viewBox="0 0 100 10"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M0,5 Q25,0 50,5 T100,5"
                    fill="none"
                    stroke="white"
                    strokeWidth="1"
                  />
                </svg>
              </span>
            </span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24">
            <FlowStep
              number="01"
              icon={<MessageSquare className="size-6" />}
              title="Chat with the AI"
              description="Pick a topic and start learning through natural conversation. Our AI adapts to your learning style."
            />

            <FlowStep
              number="02"
              icon={<CheckCircle className="size-6" />}
              title="Type /test"
              description="When you're ready, trigger a personalized quiz to test your understanding and reinforce key concepts."
            />

            <FlowStep
              number="03"
              icon={<Target className="size-6" />}
              title="Earn XP"
              description="Complete tests to gain experience points and unlock special rewards as you progress through your learning journey."
            />

            <FlowStep
              number="04"
              icon={<Trophy className="size-6" />}
              title="Type /leaderboard"
              description="See where you rank among other learners and track your growth over time to stay motivated."
            />
          </div>
        </div>

        <div className="absolute bottom-0 right-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      </section>
    </main>
  );
}

interface FlowStepProps {
  number: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}

function FlowStep({ number, icon, title, description }: FlowStepProps) {
  return (
    <div className="group relative">
      <div className="absolute -inset-1 bg-white/5 rounded-lg blur-md opacity-0 group-hover:opacity-100 transition duration-500"></div>
      <div className="relative border border-white/10 rounded-lg p-8 transition-all duration-300 group-hover:border-white/30 bg-black">
        <div className="absolute -top-5 -left-5 size-10 bg-black flex items-center justify-center border border-white/20 rounded-full">
          <span className="text-sm font-mono">{number}</span>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 border border-white/10 rounded-md">{icon}</div>
          <h3 className="text-2xl font-bold">{title}</h3>
        </div>

        <p className="text-white/70 leading-relaxed">{description}</p>

        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-y-1"></div>
      </div>
    </div>
  );
}
