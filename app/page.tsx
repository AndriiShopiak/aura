"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { getProgress, UserProgress } from "@/lib/progress";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { QuestGrid } from "@/components/features/quests/QuestGrid";
import { useQuests } from "@/hooks/useQuests";

export default function Home() {
  const { quests, isLoading } = useQuests();
  const [progress, setProgress] = useState<UserProgress | null>(null);

  useEffect(() => {
    setProgress(getProgress());
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-rose-50 selection:text-rose-600">
      <Header progress={progress} />

      <main className="max-w-2xl mx-auto px-6 pt-8 pb-24">

        {/* Mascot Banner */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="relative flex items-center justify-between bg-linear-to-r from-amber-400 to-orange-400 rounded-3xl px-7 py-5 mb-8 overflow-hidden shadow-lg shadow-amber-200/50"
        >
          {/* Decorative blob */}
          <div className="absolute right-24 top-0 w-36 h-36 bg-white/10 rounded-full -mt-10 -mr-4" />

          {/* Text */}
          <div className="relative z-10">
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-amber-100 mb-1">
              Hey there! 👋
            </p>
            <h2 className="text-xl font-black text-white leading-tight">
              Ready to<br />practice English?
            </h2>
          </div>

          {/* Lion */}
          <div className="relative z-10 shrink-0">
            <Image
              src="/animals/lion.png"
              alt="Lion mascot"
              width={110}
              height={110}
              className="w-24 h-24 object-contain drop-shadow-lg"
              priority
            />
          </div>
        </motion.div>

        {/* Units heading */}
        <div className="mb-6">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">All units</h2>
          <p className="text-sm text-slate-400 font-medium mt-1">
            {isLoading ? "Loading..." : `${quests.length} unit${quests.length !== 1 ? "s" : ""} available`}
          </p>
        </div>

        <QuestGrid quests={quests} isLoading={isLoading} />
      </main>

      {/* Tutor button */}
      <div className="max-w-2xl mx-auto px-6 pb-8 pt-4">
        <Link
          href="/admin"
          className="flex items-center justify-center gap-2 w-full h-12 rounded-2xl bg-slate-100 hover:bg-slate-200 transition-colors text-sm font-black text-slate-500 hover:text-slate-700 uppercase tracking-widest"
        >
          🎓 Tutor Console
        </Link>
      </div>
    </div>
  );
}
