"use client";

import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { Loader2 } from "lucide-react";
import Link from "next/link";

interface ButtonProps extends HTMLMotionProps<"button"> {
    href?: string;
    variant?: "primary" | "secondary" | "outline" | "ghost" | "amber" | "sky" | "white";
    size?: "sm" | "md" | "lg" | "xl";
    isLoading?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className = "", variant = "primary", size = "md", isLoading, leftIcon, rightIcon, children, disabled, href, ...props }, ref) => {
        const baseStyles = "inline-flex items-center justify-center gap-2 font-black transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap";

        const sizeStyles = {
            sm: "px-4 py-2 text-xs rounded-lg",
            md: "px-5 py-2.5 text-sm rounded-xl",
            lg: "px-8 py-4 text-base rounded-2xl",
            xl: "px-10 py-5 text-base rounded-2xl",
        };

        const variantStyles = {
            primary: "aura-gradient-primary text-white shadow-xl shadow-sky-200 hover:opacity-90",
            secondary: "bg-white text-sky-600 hover:bg-sky-50 shadow-2xl aura-logo-shadow",
            outline: "bg-transparent border border-white/20 text-white hover:bg-white hover:text-sky-600 backdrop-blur-md",
            ghost: "bg-transparent text-slate-400 hover:text-sky-600 hover:bg-sky-50",
            amber: "bg-amber-400 border border-amber-500 text-amber-900 hover:bg-amber-300 shadow-[0_4px_0_0_#B45309] active:shadow-none active:translate-y-1",
            sky: "bg-sky-400 border border-sky-500 text-sky-900 hover:bg-sky-300 shadow-[0_4px_0_0_#0369a1] active:shadow-none active:translate-y-1",
            white: "bg-white text-slate-900 border border-slate-200 hover:bg-slate-50 shadow-sm",
        };

        const combinedClassName = `${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`;

        const content = (
            <>
                {isLoading ? (
                    <Loader2 className="animate-spin" size={20} />
                ) : (
                    <>
                        {leftIcon && <span className="shrink-0">{leftIcon}</span>}
                        {children}
                        {rightIcon && <span className="shrink-0">{rightIcon}</span>}
                    </>
                )}
            </>
        );

        if (href) {
            return (
                <Link href={href} className={combinedClassName}>
                    {content}
                </Link>
            );
        }

        return (
            <motion.button
                ref={ref}
                whileHover={variant !== "amber" && variant !== "sky" ? { scale: 1.02 } : {}}
                className={combinedClassName}
                disabled={isLoading || disabled}
                {...props}
            >
                {content}
            </motion.button>
        );
    }
);

Button.displayName = "Button";
