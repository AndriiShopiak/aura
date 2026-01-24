"use client";

import React from "react";
import Link from "next/link";
import { Mic, Github, Twitter, Mail, Settings, ArrowRight } from "lucide-react";

export default function Footer() {
    return (
        <footer className="w-full bg-white border-t border-slate-100 py-16">
            <div className="max-w-6xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                    {/* Logo and Brand */}
                    <div className="col-span-1 md:col-span-2">
                        <Link href="/" className="flex items-center gap-3 mb-6 group">
                            <div className="w-10 h-10 aura-gradient-primary rounded-xl flex items-center justify-center text-white aura-logo-shadow group-hover:scale-110 transition-transform">
                                <Mic size={20} />
                            </div>
                            <span className="text-2xl font-black tracking-tight text-slate-900">Aura</span>
                        </Link>
                        <p className="text-slate-500 max-w-sm leading-relaxed mb-8 font-medium">
                            Elevating English pronunciation through AI-driven training.
                            Modern, accessible, and balanced for every learner.
                        </p>
                        <div className="flex gap-4">
                            {[Twitter, Github, Mail].map((Icon, i) => (
                                <Link key={i} href="#" className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-sky-600 hover:bg-sky-50 hover:-translate-y-1 transition-all border border-transparent hover:border-sky-100">
                                    <Icon size={18} />
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Navigation */}
                    <div>
                        <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 mb-6">Learning</h4>
                        <ul className="space-y-4 text-sm font-bold">
                            <li><Link href="/" className="text-slate-600 hover:text-sky-600 transition-colors flex items-center gap-2 group">Academy Home <ArrowRight size={12} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-sky-600" /></Link></li>
                            <li><Link href="#" className="text-slate-600 hover:text-sky-600 transition-colors flex items-center gap-2 group">Lesson Library <ArrowRight size={12} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-sky-600" /></Link></li>
                            <li><Link href="#" className="text-slate-600 hover:text-sky-600 transition-colors flex items-center gap-2 group">Success Stories <ArrowRight size={12} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-sky-600" /></Link></li>
                        </ul>
                    </div>

                    {/* Management */}
                    <div>
                        <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 mb-6">Platform</h4>
                        <Link
                            href="/admin"
                            className="inline-flex items-center gap-3 px-6 py-3 bg-white border border-slate-200 rounded-xl hover:border-sky-500 hover:text-sky-600 hover:shadow-lg hover:shadow-sky-100/50 transition-all text-sm font-black group text-slate-700"
                        >
                            <Settings size={16} className="text-slate-400 group-hover:text-sky-600 group-hover:rotate-45 transition-all" />
                            Tutor Console
                        </Link>
                    </div>
                </div>

                <div className="pt-8 border-t border-slate-50 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                    <p>© 2026 Aura Speech Academy • Balanced & Modern</p>
                    <div className="flex gap-8">
                        <Link href="#" className="hover:text-slate-600 transition-colors">Privacy Policy</Link>
                        <Link href="#" className="hover:text-slate-600 transition-colors">Terms of Use</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
