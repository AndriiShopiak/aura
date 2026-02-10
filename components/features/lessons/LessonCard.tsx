"use client";

import React from "react";
import { motion } from "framer-motion";
import { BookOpen, Star, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Lesson, LessonProgress } from "@/types";
import { Card } from "@/components/ui/Card";
import { ANIMAL_IMAGES } from "@/lib/constants";

interface LessonCardProps {
    lesson: Lesson;
    progress?: LessonProgress;
    index: number;
}

export const LessonCard: React.FC<LessonCardProps> = ({ lesson, progress, index }) => {
    const stars = progress?.stars || 0;
    const animalImage = ANIMAL_IMAGES[index % ANIMAL_IMAGES.length];

    return (
        <Link href={`/train/${lesson.id}`} className="group">
            <Card
                whileHover={{ y: -6 }}
                className="p-0 h-full flex flex-col items-start bg-white shadow-xl rounded-[2.5rem]"
                gradient
            >
                {/* Animal Image Header */}
                <div className="w-full h-48 relative overflow-hidden p-6 bg-slate-50">
                    <div className="absolute inset-0 aura-gradient-primary opacity-5" />
                    <motion.img
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        src={animalImage}
                        alt={lesson.title}
                        className="w-full h-full object-contain relative z-10 drop-shadow-2xl"
                    />

                    {/* Decorative blobs */}
                    <div className="absolute top-2 right-2 w-12 h-12 bg-yellow-400/20 rounded-full blur-xl" />
                    <div className="absolute bottom-2 left-2 w-16 h-16 bg-pink-400/20 rounded-full blur-xl" />
                </div>

                <div className="p-8 pt-6 w-full flex flex-col grow">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 aura-gradient-primary rounded-xl flex items-center justify-center shadow-lg text-white group-hover:rotate-6 transition-transform">
                            <BookOpen size={20} />
                        </div>
                        <h3 className="text-xl font-black text-slate-900 group-hover:text-primary transition-colors truncate">
                            {lesson.title}
                        </h3>
                    </div>

                    {/* Stars Display */}
                    <div className="flex gap-1 mb-4">
                        {[1, 2, 3].map((s) => (
                            <Star
                                key={s}
                                size={16}
                                className={`${s <= stars
                                    ? "text-amber-400 fill-current"
                                    : "text-slate-200"
                                    }`}
                            />
                        ))}
                    </div>

                    <p className="text-slate-500 text-sm leading-relaxed mb-8 grow font-medium group-hover:text-slate-700">
                        {lesson.description}
                    </p>

                    <div className="w-full flex items-center justify-between pt-6 border-t border-slate-100 group-hover:border-primary/20">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 group-hover:text-primary transition-colors">
                            Play & Learn
                        </span>
                        <div className="w-10 h-10 rounded-xl bg-slate-50 group-hover:aura-gradient-primary flex items-center justify-center text-slate-400 group-hover:text-white transition-all shadow-sm group-hover:shadow-primary/30">
                            <ChevronRight size={18} />
                        </div>
                    </div>
                </div>
            </Card>
        </Link>
    );
};
