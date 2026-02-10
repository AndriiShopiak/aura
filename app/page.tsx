"use client";

import React, { useState, useEffect } from "react";
import { BookOpen } from "lucide-react";
import { getProgress, UserProgress } from "@/lib/progress";
import Footer from "@/components/Footer";
import { Header } from "@/components/layout/Header";
import { Hero } from "@/components/features/lessons/Hero";
import { LessonGrid } from "@/components/features/lessons/LessonGrid";
import { useLessons } from "@/hooks/useLessons";

export default function Home() {
  const { lessons, isLoading } = useLessons();
  const [progress, setProgress] = useState<UserProgress | null>(null);

  useEffect(() => {
    setProgress(getProgress());
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-sky-100 selection:text-sky-900">
      {/* Top Navigation / Hero Area */}
      <div className="aura-gradient-primary text-white pb-24 pt-12 relative overflow-hidden">
        {/* Abstract background shapes */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-48 -mt-48 blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-sky-400/20 rounded-full -ml-32 -mb-32 blur-2xl" />

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <Header progress={progress} />
          <Hero />
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-6 -mt-16 relative z-20 pb-20">
        <section>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white shadow-md rounded-xl flex items-center justify-center text-sky-600">
                <BookOpen size={20} />
              </div>
            </div>
          </div>

          <LessonGrid
            lessons={lessons}
            progress={progress}
            isLoading={isLoading}
          />
        </section>
      </main>

      <Footer />

      <style jsx global>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
