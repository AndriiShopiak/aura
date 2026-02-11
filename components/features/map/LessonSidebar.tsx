"use client"

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Star, Play, Trophy, BookOpen, Clock } from 'lucide-react'
import Link from 'next/link'
import { Lesson } from '@/types'
import { LessonProgress } from '@/lib/progress'

interface LessonSidebarProps {
    lesson: Lesson | null
    progress?: LessonProgress
    isUnlocked: boolean
    onClose: () => void
}

export const LessonSidebar: React.FC<LessonSidebarProps> = ({
    lesson,
    progress,
    isUnlocked,
    onClose
}) => {
    if (!lesson) return null

    return (
        <AnimatePresence>
            <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed right-0 top-0 h-full w-full sm:w-96 bg-white/95 backdrop-blur-xl shadow-2xl z-50 border-l border-slate-200 flex flex-col"
            >
                {/* Header */}
                <div className="p-6 flex justify-between items-center border-b border-slate-100">
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">Деталі Квесту</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400 hover:text-slate-600"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    {/* Content */}
                    <div className="space-y-8">
                        {/* Title & Description */}
                        <div>
                            <h3 className="text-3xl font-black text-slate-900 leading-tight mb-2">
                                {lesson.title}
                            </h3>
                            <p className="text-slate-500 font-medium leading-relaxed">
                                {lesson.description || "Підготуйся до нової пригоди! У цьому уроці ми вивчимо цікаві слова та фрази."}
                            </p>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100 flex flex-col items-center justify-center text-center">
                                <Star className={`mb-2 ${progress?.stars ? 'text-amber-400 fill-current' : 'text-slate-300'}`} size={24} />
                                <span className="text-xl font-black text-slate-900">{progress?.stars || 0}/3</span>
                                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Зірки</span>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100 flex flex-col items-center justify-center text-center">
                                <Trophy className="mb-2 text-primary" size={24} />
                                <span className="text-xl font-black text-slate-900">{progress?.score || 0}</span>
                                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Рекорд</span>
                            </div>
                        </div>

                        {/* Lesson Info */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 text-slate-600 font-semibold">
                                <BookOpen size={20} className="text-primary" />
                                <span>12 нових слів</span>
                            </div>
                            <div className="flex items-center gap-3 text-slate-600 font-semibold">
                                <Clock size={20} className="text-primary" />
                                <span>~5 хвилин</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Button */}
                <div className="p-6 border-t border-slate-100 bg-white/50">
                    {isUnlocked ? (
                        <Link
                            href={`/train/${lesson.id}`}
                            className="w-full h-16 bg-primary hover:bg-primary/90 text-white rounded-2xl shadow-lg flex items-center justify-center gap-3 font-black text-xl transition-all hover:scale-[1.02] active:scale-[0.98] border-b-4 border-primary-dark"
                        >
                            <Play fill="currentColor" size={24} />
                            ГРАТИ ЗАРАЗ
                        </Link>
                    ) : (
                        <div className="w-full h-16 bg-slate-200 text-slate-500 rounded-2xl flex items-center justify-center gap-3 font-black text-xl cursor-not-allowed grayscale">
                            <X size={24} />
                            ЗАБЛОКОВАНО
                        </div>
                    )}
                </div>
            </motion.div>
        </AnimatePresence>
    )
}
