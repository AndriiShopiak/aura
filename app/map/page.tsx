"use client"

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Lock, Star, Sparkles, Map as MapIcon, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { getProgress, UserProgress } from '@/lib/progress'
import { Lesson } from '@/types'

const ANIMAL_IMAGES = [
    "/animals/lion.png",
    "/animals/elephant.png",
    "/animals/fox.png",
    "/animals/dino.png",
];

const NODE_COLORS = [
    'from-orange-400 to-amber-500',
    'from-sky-400 to-indigo-500',
    'from-pink-400 to-rose-500',
    'from-emerald-400 to-teal-500',
];

export default function QuestMapPage() {
    const [lessons, setLessons] = useState<Lesson[]>([])
    const [progress, setProgress] = useState<UserProgress | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch('/api/lessons')
                const data = await res.json()
                setLessons(data)
                setProgress(getProgress())
            } catch (err) {
                console.error('Failed to fetch map data', err)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-sky-100">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    // Determine node positions on a custom curved path
    const getNodePosition = (index: number, total: number) => {
        if (total <= 1) return { x: 50, y: 50 };
        // Example: Zig-zagging path from bottom to top
        const zigZagX = [20, 70, 30, 80, 40, 90, 10, 60];
        const x = zigZagX[index % zigZagX.length];
        const y = 85 - (index * (75 / Math.max(1, total - 1)));
        return { x, y };
    };

    return (
        <div className="min-h-screen bg-linear-to-b from-sky-300 via-emerald-100 to-orange-100 dark:from-slate-900 dark:via-indigo-950 dark:to-slate-900 relative overflow-hidden font-sans">
            {/* Background Decor */}
            <div className="absolute top-20 left-10 w-64 h-64 bg-white/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-20 right-10 w-80 h-80 bg-yellow-200/20 rounded-full blur-3xl" />

            {/* Header */}
            <div className="relative z-20 p-6 flex justify-between items-center bg-white/30 backdrop-blur-md border-b border-white/20">
                <Link href="/" className="p-3 bg-white rounded-2xl shadow-lg text-primary hover:scale-110 transition-transform">
                    <ArrowLeft size={24} />
                </Link>
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-amber-400 rounded-2xl shadow-lg border-b-4 border-amber-600">
                        <MapIcon size={24} className="text-amber-900" />
                    </div>
                    <h1 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Мапа Пригод</h1>
                </div>
                <div className="bg-white px-5 py-2 rounded-2xl shadow-lg border-b-4 border-slate-200 flex items-center gap-2">
                    <Star className="text-amber-400 fill-current" size={20} />
                    <span className="font-black text-amber-900">{progress?.totalStars || 0}</span>
                </div>
            </div>

            {/* Map Container */}
            <div className="relative max-w-4xl mx-auto h-[120vh] mt-8 px-4 py-20 overflow-y-auto">
                {/* SVG Path Background */}
                <svg
                    className="absolute inset-0 w-full h-[120vh] pointer-events-none z-0"
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                >
                    {lessons.length > 1 && (
                        <motion.path
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: 1, opacity: 0.4 }}
                            transition={{ duration: 2.5, ease: "easeInOut", delay: 0.5 }}
                            d={lessons.reduce((acc, _, i) => {
                                const pos = getNodePosition(i, lessons.length);
                                if (i === 0) return `M ${pos.x} ${pos.y}`;
                                // Adding a slight curve to the path
                                const prevPos = getNodePosition(i - 1, lessons.length);
                                const midX = (prevPos.x + pos.x) / 2;
                                const midY = (prevPos.y + pos.y) / 2 + (i % 2 === 0 ? 5 : -5);
                                return `${acc} Q ${midX} ${midY}, ${pos.x} ${pos.y}`;
                            }, "")}
                            fill="transparent"
                            stroke="white"
                            strokeWidth="1"
                            strokeDasharray="2 3"
                            strokeLinecap="round"
                        />
                    )}
                </svg>

                {/* Nodes */}
                {lessons.map((lesson, index) => {
                    const pos = getNodePosition(index, lessons.length);
                    const lessonProgress = progress?.lessons[lesson.id];
                    const isUnlocked = index === 0 || progress?.lessons[lessons[index - 1].id]?.completed;
                    const animalImg = ANIMAL_IMAGES[index % ANIMAL_IMAGES.length];
                    const color = NODE_COLORS[index % NODE_COLORS.length];

                    return (
                        <motion.div
                            key={lesson.id}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: "spring", delay: index * 0.2 }}
                            style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                            className="absolute -translate-x-1/2 -translate-y-1/2 z-10"
                        >
                            <div className="flex flex-col items-center">
                                <Link href={isUnlocked ? `/train/${lesson.id}` : '#'}>
                                    <motion.div
                                        whileHover={isUnlocked ? { scale: 1.1, y: -5 } : {}}
                                        whileTap={isUnlocked ? { scale: 0.95 } : {}}
                                        className="relative group curso-pointer"
                                    >
                                        {!isUnlocked ? (
                                            <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-4xl bg-slate-300 border-4 border-slate-400 flex items-center justify-center p-4 grayscale opacity-80 shadow-inner">
                                                <Lock size={32} className="text-slate-500" />
                                            </div>
                                        ) : (
                                            <>
                                                <motion.div
                                                    animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
                                                    transition={{ duration: 2, repeat: Infinity }}
                                                    className={`absolute -inset-4 bg-linear-to-br ${color} blur-2xl rounded-full`}
                                                />
                                                <div className={`w-20 h-20 sm:w-30 sm:h-30 rounded-4xl bg-white border-4 border-white shadow-2xl p-4 overflow-hidden relative group-hover:border-primary transition-colors`}>
                                                    <div className={`w-full h-full rounded-3xl bg-linear-to-br ${color} opacity-10 absolute inset-0`} />
                                                    <img
                                                        src={animalImg}
                                                        alt={lesson.title}
                                                        className="w-full h-full object-contain relative z-10 drop-shadow-lg"
                                                    />

                                                    {/* Star Indicator */}
                                                    <div className="absolute left-1/2 -translate-x-1/2 flex gap-0.5 z-21">
                                                        {[1, 2, 3].map(s => (
                                                            <Star
                                                                size={15}
                                                                key={s}
                                                                className={`${s <= (lessonProgress?.stars || 0) ? 'text-amber-400 fill-current' : 'text-slate-300'}`}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </motion.div>
                                </Link>

                                <div className={`mt-4 px-4 py-2 rounded-full font-black text-xs shadow-md border-b-4 whitespace-nowrap ${!isUnlocked ? 'bg-slate-200 text-slate-500 border-slate-400' : 'bg-white text-slate-900 border-slate-200'}`}>
                                    {lesson.title}
                                </div>
                            </div>
                        </motion.div>
                    );
                })}

                {lessons.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full">
                        <Sparkles size={64} className="text-amber-400 mb-4 animate-bounce" />
                        <h2 className="text-2xl font-black text-slate-800 tracking-tight">Поки немає квестів!</h2>
                        <p className="text-slate-500 font-medium">Зайди пізніше або створи свій перший урок.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
