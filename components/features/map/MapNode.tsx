"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { Lock, Star } from 'lucide-react'
import { LessonProgress } from '@/lib/progress'
import { Lesson } from '@/types'

interface MapNodeProps {
    lesson: Lesson
    index: number
    pos: { x: number, y: number }
    isUnlocked: boolean
    isSelected: boolean
    progress?: LessonProgress
    animalImg: string
    color: string
    onSelect: (lesson: Lesson) => void
}

export const MapNode: React.FC<MapNodeProps> = ({
    lesson,
    index,
    pos,
    isUnlocked,
    isSelected,
    progress,
    animalImg,
    color,
    onSelect
}) => {
    return (
        <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", delay: index * 0.1 }}
            style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 z-10"
        >
            <div className="flex flex-col items-center">
                <button
                    onClick={() => onSelect(lesson)}
                    className="relative focus:outline-hidden"
                >
                    <motion.div
                        whileHover={isUnlocked ? { scale: 1.1, rotate: [0, -2, 2, 0] } : {}}
                        whileTap={isUnlocked ? { scale: 0.95 } : {}}
                        className={`relative group ${isSelected ? 'scale-110' : ''}`}
                    >
                        {/* Island Base (Beach/Sand) */}
                        <div className={`absolute inset-0 -m-3 rounded-full blur-md opacity-40 bg-amber-200 transition-opacity ${isUnlocked ? 'group-hover:opacity-60' : 'opacity-20'}`} />

                        {!isUnlocked ? (
                            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-slate-200 border-4 border-slate-300 flex items-center justify-center p-4 relative overflow-hidden backdrop-blur-sm">
                                {/* Fog Effect */}
                                <div className="absolute inset-0 bg-white/40 blur-xl animate-pulse" />
                                <Lock size={32} className="text-slate-400 relative z-10" />
                            </div>
                        ) : (
                            <>
                                {isSelected && (
                                    <motion.div
                                        layoutId="active-glow"
                                        className={`absolute -inset-8 bg-white/40 blur-3xl rounded-full opacity-60`}
                                        animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.7, 0.4] }}
                                        transition={{ duration: 3, repeat: Infinity }}
                                    />
                                )}

                                {/* Island Body (Beach + Lush) */}
                                <div className={`w-24 h-24 sm:w-34 sm:h-34 rounded-full bg-amber-100 border-8 ${isSelected ? 'border-amber-300' : 'border-amber-200/50'} shadow-2xl p-4 overflow-hidden relative group-hover:border-amber-300 transition-all duration-500`}>
                                    {/* Lush Green Center */}
                                    <div className="absolute inset-2 rounded-full bg-linear-to-br from-emerald-400 to-teal-600 opacity-90 shadow-inner" />

                                    {/* Animal Image */}
                                    <img
                                        src={animalImg}
                                        alt={lesson.title}
                                        className="w-full h-full object-contain relative z-10 drop-shadow-[0_8px_8px_rgba(0,0,0,0.3)] transition-transform group-hover:scale-110"
                                    />

                                    {/* Star Indicator */}
                                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-21 bg-black/20 backdrop-blur-md px-2 py-0.5 rounded-full">
                                        {[1, 2, 3].map(s => (
                                            <Star
                                                size={10}
                                                key={s}
                                                className={`${s <= (progress?.stars || 0) ? 'text-amber-400 fill-current' : 'text-white/40'}`}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}
                    </motion.div>
                </button>

                <div className={`mt-5 px-5 py-2 rounded-2xl font-black text-xs shadow-xl border-b-4 whitespace-nowrap transition-all duration-300 tracking-wide ${!isUnlocked
                        ? 'bg-slate-100 text-slate-400 border-slate-300 grayscale'
                        : isSelected
                            ? 'bg-primary text-white border-primary-dark -translate-y-1'
                            : 'bg-white text-slate-800 border-slate-200/50 group-hover:border-primary/30'
                    }`}>
                    {lesson.title.toUpperCase()}
                </div>
            </div>
        </motion.div>
    )
}
