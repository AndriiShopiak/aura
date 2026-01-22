"use client";

import React from "react";
import { motion } from "framer-motion";
import { Mic, BookOpen, Settings, ChevronRight } from "lucide-react";
import Link from "next/link";
import { MOCK_LESSONS } from "@/data/mockLessons";
import { Lesson } from "@/types";

export default function Home() {
  const [lessons, setLessons] = React.useState<Lesson[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchLessons = async () => {
      try {
        const res = await fetch("/api/lessons");
        const data = await res.json();
        // Since the API returns meta info, we might need to mock words length if not returned
        // Actually the API should return lesson meta data.
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
    <div className="min-h-screen bg-neutral-50 text-neutral-900 flex flex-col items-center p-6 font-sans">
      <div className="w-full max-w-4xl">
        <header className="flex justify-between items-center mb-12 mt-8">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-neutral-800 flex items-center gap-3">
              <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100 text-white">
                <Mic size={24} />
              </div>
              Aura
            </h1>
            <p className="text-neutral-400 mt-2 font-medium">Welcome back! Ready to practice?</p>
          </div>
          <Link
            href="/admin"
            className="p-3 rounded-2xl bg-white border border-neutral-200 text-neutral-400 hover:text-indigo-600 hover:border-indigo-100 hover:bg-indigo-50 transition-all shadow-sm"
            title="Admin Panel"
          >
            <Settings size={20} />
          </Link>
        </header>

        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <BookOpen size={20} className="text-indigo-600" />
            <h2 className="text-xl font-bold text-neutral-800">Available Lessons</h2>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-64 bg-white animate-pulse rounded-3xl border border-neutral-100" />
              ))}
            </div>
          ) : lessons.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-4xl border border-dashed border-neutral-200">
              <p className="text-neutral-400 font-medium">No lessons published yet.</p>
              <Link href="/admin" className="text-indigo-600 font-bold mt-4 inline-block hover:underline">Create your first lesson</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {lessons.map((lesson) => (
                <Link key={lesson.id} href={`/train/${lesson.id}`}>
                  <motion.div
                    whileHover={{ y: -4, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-sm hover:shadow-xl hover:shadow-indigo-50/50 hover:border-indigo-100 transition-all cursor-pointer group flex flex-col h-full"
                  >
                    <div className="w-12 h-12 bg-neutral-50 group-hover:bg-indigo-50 rounded-2xl flex items-center justify-center text-neutral-400 group-hover:text-indigo-600 transition-colors mb-4 text-xl font-bold">
                      {lesson.icon || "🎓"}
                    </div>
                    <h3 className="text-lg font-bold text-neutral-800 mb-2 group-hover:text-indigo-700 transition-colors">
                      {lesson.title}
                    </h3>
                    <p className="text-neutral-400 text-sm mb-6 grow leading-relaxed">
                      {lesson.description}
                    </p>
                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-neutral-50 group-hover:border-indigo-50 transition-colors">
                      <span className="text-[10px] uppercase font-black tracking-widest text-neutral-300 group-hover:text-indigo-300">
                        Explore Lesson
                      </span>
                      <div className="w-8 h-8 rounded-full bg-neutral-100 group-hover:bg-indigo-600 flex items-center justify-center text-neutral-400 group-hover:text-white transition-all shadow-sm">
                        <ChevronRight size={16} />
                      </div>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          )}
        </section>

        <footer className="mt-20 py-8 border-t border-neutral-200 flex flex-col items-center">
          <p className="text-neutral-300 text-[10px] font-bold uppercase tracking-[0.2em]">
            English Speech Trainer v2.1 • Aura Platform
          </p>
        </footer>
      </div>
    </div>
  );
}
