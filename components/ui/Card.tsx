"use client";

import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";

interface CardProps extends HTMLMotionProps<"div"> {
    hover?: boolean;
    gradient?: boolean;
    glass?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
    ({ className = "", hover = true, gradient = false, glass = false, children, ...props }, ref) => {
        const baseStyles = "aura-card p-8 rounded-4xl border-white/50 relative overflow-hidden";
        const hoverStyles = hover ? "aura-card-hover" : "";
        const gradientStyles = gradient ? "aura-card-gradient" : "";
        const glassStyles = glass ? "aura-glass" : "";

        const combinedClassName = `${baseStyles} ${hoverStyles} ${gradientStyles} ${glassStyles} ${className}`;

        return (
            <motion.div
                ref={ref}
                className={combinedClassName}
                {...props}
            >
                {children}
            </motion.div>
        );
    }
);

Card.displayName = "Card";
