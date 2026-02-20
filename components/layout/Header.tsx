"use client";

import React from "react";
import Link from "next/link";
import { Mic, Trophy, Map as MapIcon, Settings } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Image from "next/image";
import { UserProgress } from "@/types";

interface HeaderProps {
    progress?: UserProgress | null;
}

export const Header: React.FC<HeaderProps> = ({ progress }) => {
    return (
        <header className="flex justify-between items-center mb-16 flex-wrap gap-5">
            <Link href="/" className="flex items-center gap-4 group">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-sky-600 aura-logo-shadow transition-transform">
                    <Image
                        src="/aura-logo.svg"
                        alt="Aura Logo"
                        width={24}
                        height={24}
                        className="w-6 h-6 object-contain"
                    />
                </div>
                <div className="flex flex-col text-white">
                    <h1 className="text-2xl font-black tracking-tight leading-none">Aura</h1>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-sky-100 mt-1 opacity-80">Speech App</span>
                </div>
            </Link>

            <div className="flex items-center flex-wrap gap-3">
                <Button
                    href="#"
                    variant="amber"
                    leftIcon={<Trophy size={18} />}
                >
                    <span>{progress?.totalStars || 0} Stars</span>
                </Button>

                <Button
                    href="#"
                    variant="sky"
                    leftIcon={<MapIcon size={18} />}
                >
                    <span>Map</span>
                </Button>
            </div>
        </header>
    );
};
