"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NotFound() {
    const router = useRouter();

    return (
        <main className="min-h-screen flex items-center justify-center p-6 bg-background overflow-hidden relative">
            {/* Decorative background elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-error/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />

            <div className="max-w-2xl w-full text-center relative z-10">
                <div className="mb-8 relative inline-block">
                    <h1 className="text-[12rem] font-black leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-error to-error-dark opacity-20">
                        404
                    </h1>
                    <div className="absolute inset-0 flex items-center justify-center translate-y-8">
                        <div className="aura-card p-8 bg-white/80 backdrop-blur-md border-error/20 inline-flex flex-col items-center">
                            <span className="text-6xl mb-4">👀</span>
                            <h2 className="text-3xl font-bold text-foreground mb-2">Are we lost?</h2>
                            <p className="text-slate-500 max-w-sm">
                                Oops! The page you are looking for doesn't exist or has been moved to another universe.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mt-24 space-y-4">
                    <button
                        onClick={() => router.back()}
                        className="inline-flex items-center justify-center px-8 py-4 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/30 hover:shadow-primary/40 hover:-translate-y-1 transition-all duration-300"
                    >
                        ← Go Back
                    </button>
                </div>
            </div>
        </main>
    );
}
