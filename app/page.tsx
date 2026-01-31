"use client";

import React from "react";
import { motion } from "framer-motion";
import { Mic, BookOpen, Settings, ChevronRight, Activity, Zap, Play, Trophy } from "lucide-react";
import Link from "next/link";
import { Lesson } from "@/types";
import Footer from "@/components/Footer";

export default function Home() {
  const [lessons, setLessons] = React.useState<Lesson[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchLessons = async () => {
      try {
        const res = await fetch("/api/lessons");
        const data = await res.json();
        setLessons(data);
      } catch (err) {
        console.error("Failed to fetch lessons:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLessons();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-sky-100 selection:text-sky-900">
      {/* Top Navigation / Hero Area */}
      <div className="aura-gradient-primary text-white pb-24 pt-12 relative overflow-hidden">
        {/* Abstract background shapes */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-48 -mt-48 blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-sky-400/20 rounded-full -ml-32 -mb-32 blur-2xl" />

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <header className="flex justify-between items-center mb-16">
            <div className="flex items-center gap-4 group">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-sky-600 aura-logo-shadow transition-transform">
                <Mic size={24} />
              </div>
              <div className="flex flex-col">
                <h1 className="text-2xl font-black tracking-tight leading-none">Aura</h1>
                <span className="text-[10px] font-bold uppercase tracking-widest text-sky-100 mt-1 opacity-80">Speech App</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/leaderboard"
                className="px-5 py-2.5 rounded-xl bg-amber-400 border border-amber-500 text-amber-900 hover:bg-amber-300 transition-all font-black text-sm shadow-[0_4px_0_0_#B45309] active:shadow-none active:translate-y-1 flex items-center gap-2"
              >
                <Trophy size={18} />
                <span>Stars</span>
              </Link>

              <Link
                href="/admin"
                className="px-5 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white hover:bg-white hover:text-sky-600 transition-all font-bold text-sm backdrop-blur-md flex items-center gap-2"
              >
                <Settings size={18} />
                <span className="hidden sm:inline">Teacher</span>
              </Link>
            </div>
          </header>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
          >
            <div className="max-w-xl text-center lg:text-left">
              <h2 className="text-4xl md:text-6xl font-black leading-[1.1] mb-6 tracking-tight">
                Master English <br />
                <span className="text-sky-200">Pronunciation</span>
              </h2>
            </div>
          </motion.div>
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

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-72 aura-card animate-pulse" />
              ))}
            </div>
          ) : lessons.length === 0 ? (
            <div className="text-center py-24 aura-card bg-white/50 backdrop-blur-sm border-dashed border-sky-200">
              <p className="text-slate-400 font-bold text-lg mb-6">No lessons published yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {lessons.map((lesson) => (
                <Link key={lesson.id} href={`/train/${lesson.id}`} className="group">
                  <motion.div
                    whileHover={{ y: -6 }}
                    className="aura-card aura-card-hover p-8 h-full flex flex-col items-start relative overflow-hidden bg-white"
                  >
                    {/* Decorative pattern */}
                    <div className="absolute top-0 right-0 w-24 h-24 bg-sky-50 rounded-bl-[4rem] group-hover:bg-sky-100 transition-colors -mr-8 -mt-8" />

                    <div className="w-16 h-16 bg-slate-50 group-hover:aura-gradient-primary rounded-2xl flex items-center justify-center text-3xl transition-all mb-8 shadow-inner group-hover:text-white group-hover:scale-110 group-hover:rotate-3">
                      <BookOpen size={32} />
                    </div>

                    <h3 className="text-xl font-black text-slate-900 mb-3 group-hover:text-sky-600 transition-colors">
                      {lesson.title}
                    </h3>

                    <p className="text-slate-500 text-sm leading-relaxed mb-8 grow font-medium">
                      {lesson.description}
                    </p>

                    <div className="w-full flex items-center justify-between pt-6 border-t border-slate-50 group-hover:border-sky-50">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 group-hover:text-sky-400 transition-colors">
                        Start Session
                      </span>
                      <div className="w-10 h-10 rounded-xl bg-slate-50 group-hover:bg-sky-600 flex items-center justify-center text-slate-400 group-hover:text-white transition-all">
                        <ChevronRight size={18} />
                      </div>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          )}
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
