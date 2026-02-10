"use client";

import React from "react";
import { motion } from "framer-motion";
import { KeyRound, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

interface AdminLoginProps {
    adminKey: string;
    setAdminKey: (val: string) => void;
    onSubmit: (e: React.FormEvent) => void;
    isLoading: boolean;
    error: string;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({
    adminKey,
    setAdminKey,
    onSubmit,
    isLoading,
    error,
}) => {
    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 selection:bg-sky-100 selection:text-sky-900">
            <Card
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md bg-white p-12 text-center relative overflow-hidden"
                hover={false}
            >
                <div className="absolute top-0 left-0 w-full h-2 aura-gradient-primary" />
                <div className="w-20 h-20 aura-gradient-primary rounded-4xl flex items-center justify-center mx-auto mb-10 text-white aura-logo-shadow">
                    <KeyRound size={36} />
                </div>
                <h1 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">Tutor Console</h1>
                <p className="text-slate-500 font-medium mb-10">Enter your developer access key to manage lessons.</p>

                <form onSubmit={onSubmit} className="space-y-6">
                    <div className="relative group">
                        <input
                            type="password"
                            placeholder="Access Key"
                            value={adminKey}
                            onChange={(e) => setAdminKey(e.target.value)}
                            className="w-full h-16 bg-slate-50 border border-slate-200 rounded-2xl px-6 focus:outline-none focus:ring-4 focus:ring-sky-500/5 focus:border-sky-500 transition-all text-center font-mono font-bold tracking-widest text-slate-900"
                        />
                        {error && <p className="text-rose-500 text-[10px] mt-3 font-black uppercase tracking-widest">{error}</p>}
                    </div>
                    <Button
                        type="submit"
                        isLoading={isLoading}
                        className="w-full h-16"
                    >
                        Authenticate Access
                    </Button>
                </form>

                <Link href="/" className="inline-flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-widest mt-12 hover:text-sky-600 transition-colors group">
                    <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
                </Link>
            </Card>
        </div>
    );
};
