"use client";

import React from "react";
import { motion } from "framer-motion";

export const Hero: React.FC = () => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
        >
            <div className="max-w-xl text-center lg:text-left">
                <h2 className="text-4xl md:text-6xl font-black leading-[1.1] mb-6 tracking-tight">
                    Master English <br />
                    <span className="text-yellow-300 drop-shadow-lg">Pronunciation</span>
                </h2>
                <p className="text-sky-50 text-xl font-medium mb-8 opacity-90 hidden lg:block">
                    Learn and play with your favorite animal friends!
                </p>
            </div>

            <div className="flex justify-center items-center relative">
                <motion.div
                    animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="relative z-10"
                >
                    <img
                        src="/animals/lion.png"
                        alt="Friendly Lion Cub"
                        className="w-full max-w-[400px] h-auto drop-shadow-3xl"
                    />
                </motion.div>

                {/* Magical sparkles/blobs behind the animal */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-yellow-300/30 rounded-full blur-[80px] z-0" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-400/20 rounded-full blur-[100px] animate-pulse z-0" />
            </div>
        </motion.div>
    );
};
