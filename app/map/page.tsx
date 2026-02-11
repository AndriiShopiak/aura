"use client"

import React, { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Star, Sparkles, Map as MapIcon, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { getProgress, UserProgress } from '@/lib/progress'
import { Lesson } from '@/types'
import { MapNode } from '@/components/features/map/MapNode'
import { MapPath } from '@/components/features/map/MapPath'
import { LessonSidebar } from '@/components/features/map/LessonSidebar'

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
    const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null)
    const mapRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch('/api/lessons')
                const data = await res.json()
                setLessons(data)
                const userProgress = getProgress()
                setProgress(userProgress)

                // Find current lesson (first incomplete one)
                const currentLesson = data.find((l: Lesson) => !userProgress.lessons[l.id]?.completed) || data[0]
                if (currentLesson) {
                    // Slight delay to ensure layout is ready
                    setTimeout(() => {
                        const index = data.indexOf(currentLesson)
                        const pos = getNodePosition(index, data.length)
                        if (mapRef.current) {
                            const scrollY = (pos.y / 100) * mapRef.current.scrollHeight - window.innerHeight / 2
                            mapRef.current.scrollTo({ top: scrollY, behavior: 'smooth' })
                        }
                    }, 500)
                }
            } catch (err) {
                console.error('Failed to fetch map data', err)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    const getNodePosition = (index: number, total: number) => {
        if (total <= 1) return { x: 50, y: 50 };
        const zigZagX = [25, 75, 30, 70, 40, 60, 20, 80];
        const x = zigZagX[index % zigZagX.length];
        const y = 85 - (index * (75 / Math.max(1, total - 1)));
        return { x, y };
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-sky-100">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    const points = lessons.map((_, i) => getNodePosition(i, lessons.length))

    return (
        <div className="min-h-screen bg-linear-to-b from-[#0c4a6e] via-[#075985] to-[#0ea5e9] dark:from-slate-950 dark:via-indigo-950 dark:to-slate-900 relative overflow-hidden font-sans">
            {/* Sea Background Decor */}
            <div className="absolute inset-0 opacity-20 pointer-events-none overflow-hidden">
                {/* Animated Waves Surface */}
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
            </div>

            {/* Background Glows (Nearby Islands) */}
            <div className="absolute top-1/4 right-1/4 w-[600px] h-[600px] bg-emerald-400/10 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-1/4 left-1/4 w-[700px] h-[700px] bg-amber-200/5 rounded-full blur-[150px]" />

            {/* Animated Clouds/Mist */}
            <motion.div
                animate={{ x: [-200, 2000] }}
                transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
                className="absolute top-10 pointer-events-none z-10 opacity-20"
            >
                <div className="w-96 h-32 bg-white blur-3xl rounded-full" />
            </motion.div>

            {/* Header */}
            <div className="fixed top-0 left-0 w-full z-40 p-4 sm:p-6 flex justify-between items-center backdrop-blur-md bg-[#0c4a6e]/40 border-b border-white/10">
                <Link href="/" className="p-3 bg-white/90 backdrop-blur-md rounded-2xl shadow-xl text-[#0c4a6e] hover:scale-110 transition-transform active:scale-95 border-b-4 border-slate-200">
                    <ArrowLeft size={24} />
                </Link>
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-amber-400 rounded-2xl shadow-lg border-b-4 border-amber-600 hidden sm:block">
                        <MapIcon size={24} className="text-amber-900" />
                    </div>
                    <div className="flex flex-col text-left">
                        <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight drop-shadow-md">Морська Експедиція</h1>
                        <span className="text-[10px] text-sky-200 font-bold uppercase tracking-widest hidden sm:block">Відкрий таємниці архіпелагу</span>
                    </div>
                </div>
                <div className="bg-amber-50/90 backdrop-blur-md px-5 py-2 rounded-2xl shadow-xl border-b-4 border-amber-200 flex items-center gap-2">
                    <Star className="text-amber-500 fill-current" size={20} />
                    <span className="font-black text-amber-900">{progress?.totalStars || 0}</span>
                </div>
            </div>

            {/* Map Container */}
            <div
                ref={mapRef}
                className="relative h-screen overflow-y-auto pt-32 pb-40 px-4 custom-scrollbar scroll-smooth"
            >
                <div className="relative max-w-4xl mx-auto h-[120vh]">
                    <MapPath points={points} />

                    {lessons.map((lesson, index) => {
                        const pos = getNodePosition(index, lessons.length);
                        const lessonProgress = progress?.lessons[lesson.id];
                        const isUnlocked = index === 0 || progress?.lessons[lessons[index - 1].id]?.completed;

                        return (
                            <MapNode
                                key={lesson.id}
                                lesson={lesson}
                                index={index}
                                pos={pos}
                                isUnlocked={isUnlocked || false}
                                isSelected={selectedLesson?.id === lesson.id}
                                progress={lessonProgress}
                                animalImg={ANIMAL_IMAGES[index % ANIMAL_IMAGES.length]}
                                color={NODE_COLORS[index % NODE_COLORS.length]}
                                onSelect={(l) => setSelectedLesson(l)}
                            />
                        );
                    })}

                    {lessons.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full">
                            <Sparkles size={64} className="text-amber-400 mb-4 animate-bounce" />
                            <h2 className="text-2xl font-black text-white tracking-tight">Поки немає островів!</h2>
                            <p className="text-sky-200 font-medium">Зайди пізніше або створи свій перший урок.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Details Sidebar */}
            <LessonSidebar
                lesson={selectedLesson}
                progress={selectedLesson ? progress?.lessons[selectedLesson.id] : undefined}
                isUnlocked={selectedLesson ? (lessons.indexOf(selectedLesson) === 0 || progress?.lessons[lessons[lessons.indexOf(selectedLesson) - 1].id]?.completed || false) : false}
                onClose={() => setSelectedLesson(null)}
            />

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 8px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: rgba(0, 0, 0, 0.1);
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.2);
                }
            `}</style>
        </div>
    )
}
