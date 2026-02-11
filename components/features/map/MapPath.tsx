"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { Anchor } from 'lucide-react'

interface MapPathProps {
    points: { x: number, y: number }[]
}

export const MapPath: React.FC<MapPathProps> = ({ points }) => {
    if (points.length < 2) return null

    const pathData = points.reduce((acc, point, i) => {
        if (i === 0) return `M ${point.x} ${point.y}`

        const prev = points[i - 1]
        const midX = (prev.x + point.x) / 2
        const midY = (prev.y + point.y) / 2 + (i % 2 === 0 ? 5 : -5)

        return `${acc} Q ${midX} ${midY}, ${point.x} ${point.y}`
    }, "")

    return (
        <div className="absolute inset-0 w-full h-[120vh] pointer-events-none z-0">
            <svg
                className="w-full h-full"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
            >
                {/* Nautical Chart Path (Lower shadow) */}
                <path
                    d={pathData}
                    fill="transparent"
                    stroke="rgba(0,0,0,0.1)"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    className="translate-y-0.5"
                />

                {/* Dashed Trail */}
                <motion.path
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 0.8 }}
                    transition={{ duration: 3, ease: "easeInOut", delay: 0.5 }}
                    d={pathData}
                    fill="transparent"
                    stroke="rgba(255,255,255,0.6)"
                    strokeWidth="0.8"
                    strokeDasharray="1.5 2.5"
                    strokeLinecap="round"
                />
            </svg>

            {/* Anchor Markers at each island (optional decorative) */}
            {points.map((p, i) => (
                <div
                    key={i}
                    style={{ left: `${p.x}%`, top: `${p.y}%` }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 opacity-20"
                >
                    <Anchor size={12} className="text-white" />
                </div>
            ))}
        </div>
    )
}
