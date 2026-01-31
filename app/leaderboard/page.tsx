"use client"

import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Trophy, Star, ChevronRight, Crown, Sparkles, Rocket, PartyPopper } from 'lucide-react'

interface UserScore {
    id: string
    name: string
    score: number
    avatar: string
    level: number
    color: string
}

const MOCK_USERS: UserScore[] = [
    { id: '1', name: 'Олександр К.', score: 2540, avatar: '🦁', level: 42, color: 'bg-orange-400' },
    { id: '2', name: 'Марія С.', score: 2890, avatar: '🦄', level: 45, color: 'bg-pink-400' },
    { id: '3', name: 'Дмитро В.', score: 2100, avatar: '🦖', level: 38, color: 'bg-emerald-400' },
    { id: '4', name: 'Олена П.', score: 3200, avatar: '🦋', level: 50, color: 'bg-sky-400' },
    { id: '5', name: 'Андрій Ш.', score: 1950, avatar: '🐼', level: 35, color: 'bg-violet-400' },
    { id: '6', name: 'Юлія М.', score: 2750, avatar: '🦊', level: 41, color: 'bg-amber-400' },
    { id: '7', name: 'Сергій Т.', score: 1500, avatar: '🐸', level: 28, color: 'bg-lime-400' },
    { id: '8', name: 'Анна Г.', score: 2300, avatar: '🐨', level: 39, color: 'bg-rose-400' },
]

const springTransition = { type: "spring" as const, stiffness: 300, damping: 15 };

export default function LeaderboardPage() {
    const sortedUsers = useMemo(() => {
        return [...MOCK_USERS].sort((a, b) => b.score - a.score)
    }, [])

    return (
        <div className="min-h-screen bg-linear-to-br from-yellow-50 via-sky-50 to-pink-50 dark:from-slate-900 dark:via-indigo-950 dark:to-slate-900 py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-3xl mx-auto">
                {/* Header Section */}
                <div className="text-center mb-16 relative">
                    <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={springTransition}
                        className="inline-block p-6 bg-yellow-300 dark:bg-yellow-500 rounded-4xl shadow-[0_8px_0_0_#D97706] mb-6 relative"
                    >
                        <Trophy className="w-16 h-16 text-white drop-shadow-md" />
                        <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="absolute -top-2 -right-2 bg-pink-500 rounded-full p-2 shadow-lg"
                        >
                            <Sparkles className="w-6 h-6 text-white" />
                        </motion.div>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl font-black text-slate-900 dark:text-white sm:text-6xl tracking-tight"
                    >
                        Зіркова Дошка
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="mt-4 text-xl text-slate-600 dark:text-slate-400 font-bold"
                    >
                        Тут живуть справжні супергерої! 🚀
                    </motion.p>
                </div>

                {/* Top 3 Podiums */}
                <div className="flex justify-center items-end gap-6 mb-16 px-4 h-64">
                    {/* 2nd Place */}
                    <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: '75%' }}
                        transition={{ ...springTransition, delay: 0.3 }}
                        className="flex-1 max-w-[140px] bg-sky-200 dark:bg-sky-900/40 rounded-t-[2.5rem] flex flex-col items-center justify-end pb-6 relative shadow-[0_12px_30px_-10px_rgba(186,230,253,0.5)] dark:shadow-none border-x-4 border-t-4 border-sky-300 dark:border-sky-800"
                    >
                        <div className="absolute -top-16 flex flex-col items-center">
                            <motion.span whileHover={{ scale: 1.2 }} className="text-4xl mb-2 drop-shadow-lg cursor-pointer">{sortedUsers[1].avatar}</motion.span>
                            <div className="bg-white dark:bg-slate-800 rounded-full p-1 border-2 border-sky-300">
                                <Star className="w-6 h-6 text-sky-400 fill-current" />
                            </div>
                        </div>
                        <span className="font-black dark:text-white truncate w-full px-2 text-center text-sm mb-1">{sortedUsers[1].name}</span>
                        <div className="bg-white/50 dark:bg-white/10 px-3 py-1 rounded-full">
                            <span className="text-xs text-sky-700 dark:text-sky-300 font-black">{sortedUsers[1].score}</span>
                        </div>
                    </motion.div>

                    {/* 1st Place */}
                    <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: '100%' }}
                        transition={{ ...springTransition, delay: 0.2 }}
                        className="flex-1 max-w-[160px] bg-yellow-200 dark:bg-yellow-900/40 rounded-t-[3rem] flex flex-col items-center justify-end pb-8 relative shadow-[0_20px_40px_-15px_rgba(253,224,71,0.6)] dark:shadow-none border-x-4 border-t-4 border-yellow-300 dark:border-yellow-800"
                    >
                        <div className="absolute -top-20 flex flex-col items-center">
                            <motion.div
                                animate={{ y: [0, -10, 0] }}
                                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                            >
                                <Crown className="w-12 h-12 text-yellow-500 drop-shadow-[0_0_15px_rgba(234,179,8,0.5)] mb-1" />
                            </motion.div>
                            <motion.span whileHover={{ scale: 1.2 }} className="text-5xl mb-2 drop-shadow-xl cursor-pointer">{sortedUsers[0].avatar}</motion.span>
                            <div className="bg-white dark:bg-slate-800 rounded-full p-1.5 border-2 border-yellow-400">
                                <Trophy className="w-7 h-7 text-yellow-500 fill-current" />
                            </div>
                        </div>
                        <span className="font-black dark:text-white truncate w-full px-2 text-center text-base mb-1">{sortedUsers[0].name}</span>
                        <div className="bg-amber-400 px-4 py-1.5 rounded-full shadow-[0_4px_0_0_#B45309]">
                            <span className="text-sm text-amber-900 font-black tracking-wider">{sortedUsers[0].score}</span>
                        </div>
                    </motion.div>

                    {/* 3rd Place */}
                    <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: '60%' }}
                        transition={{ ...springTransition, delay: 0.4 }}
                        className="flex-1 max-w-[140px] bg-pink-200 dark:bg-pink-900/40 rounded-t-[2.5rem] flex flex-col items-center justify-end pb-6 relative shadow-[0_12px_30px_-10px_rgba(251,207,232,0.5)] dark:shadow-none border-x-4 border-t-4 border-pink-300 dark:border-pink-800"
                    >
                        <div className="absolute -top-16 flex flex-col items-center">
                            <motion.span whileHover={{ scale: 1.2 }} className="text-4xl mb-2 drop-shadow-lg cursor-pointer">{sortedUsers[2].avatar}</motion.span>
                            <div className="bg-white dark:bg-slate-800 rounded-full p-1 border-2 border-pink-300">
                                <Star className="w-6 h-6 text-pink-400 fill-current" />
                            </div>
                        </div>
                        <span className="font-black dark:text-white truncate w-full px-2 text-center text-sm mb-1">{sortedUsers[2].name}</span>
                        <div className="bg-white/50 dark:bg-white/10 px-3 py-1 rounded-full">
                            <span className="text-xs text-pink-700 dark:text-pink-300 font-black">{sortedUsers[2].score}</span>
                        </div>
                    </motion.div>
                </div>

                {/* List Section */}
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-white dark:bg-slate-900 rounded-[3rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] overflow-hidden border-8 border-white dark:border-slate-800"
                >
                    <div className="divide-y-4 divide-slate-50 dark:divide-slate-800">
                        {sortedUsers.map((user, index) => {
                            const isFirst = index === 0;
                            const isSecond = index === 1;
                            const isThird = index === 2;

                            return (
                                <motion.div
                                    key={user.id}
                                    whileHover={{ backgroundColor: "rgba(255,255,255,0.8)", scale: 1.02 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                                    className={`flex items-center gap-4 p-6 transition-all cursor-pointer ${isFirst ? 'bg-yellow-50 dark:bg-yellow-900/10' : ''
                                        }`}
                                >
                                    <div className="shrink-0 w-12 text-center">
                                        {isFirst ? (
                                            <div className="relative inline-block">
                                                <Trophy className="w-10 h-10 text-yellow-400 mx-auto drop-shadow-sm" />
                                                <motion.div
                                                    animate={{ scale: [1, 1.5, 1], opacity: [0, 1, 0] }}
                                                    transition={{ duration: 1.5, repeat: Infinity }}
                                                    className="absolute inset-0 bg-yellow-400 rounded-full blur-xl -z-10"
                                                />
                                            </div>
                                        ) : (
                                            <span className={`text-2xl font-black ${isSecond ? 'text-sky-400' : isThird ? 'text-pink-400' : 'text-slate-300'
                                                }`}>
                                                {index + 1}
                                            </span>
                                        )}
                                    </div>

                                    <motion.div
                                        whileHover={{ rotate: [0, -10, 10, 0] }}
                                        className={`shrink-0 w-16 h-16 rounded-3xl ${user.color} flex items-center justify-center text-3xl shadow-lg border-4 border-white dark:border-slate-700`}
                                    >
                                        {user.avatar}
                                    </motion.div>

                                    <div className="grow min-w-0">
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-lg font-black text-slate-900 dark:text-white truncate">
                                                {user.name}
                                            </h3>
                                            {index === 0 && (
                                                <motion.div
                                                    animate={{ rotate: [-5, 5, -5] }}
                                                    transition={{ duration: 0.5, repeat: Infinity }}
                                                    className="px-3 py-1 rounded-full bg-yellow-400 text-yellow-900 text-xs font-black uppercase tracking-tighter"
                                                >
                                                    Король! 👑
                                                </motion.div>
                                            )}
                                        </div>

                                        <p className="text-sm text-slate-500 dark:text-slate-400 font-bold">
                                            Рівень {user.level} • {index + 1} місце
                                        </p>
                                    </div>

                                    <div className="shrink-0 text-right">
                                        <div className="flex items-center justify-end gap-1.5 text-orange-500 dark:text-orange-400">
                                            <PartyPopper className="w-5 h-5" />
                                            <span className="text-2xl font-black tracking-tight leading-none italic">
                                                {user.score.toLocaleString()}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-400 uppercase font-black tracking-widest mt-1">Очок!</p>
                                    </div>

                                    <div className="hidden sm:block ml-2">
                                        <ChevronRight className="w-6 h-6 text-slate-200" />
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </motion.div>

                {/* Fun Footer */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5 }}
                    className="text-center mt-12 bg-white/50 py-4 px-8 rounded-full inline-block left-1/2 -translate-x-1/2 relative border-4 border-white border-dashed text-slate-500 font-bold"
                >
                    Супер-сила оновлюється кожні 5 хвилин! ⚡️
                </motion.div>
            </div>
        </div>
    )
}
