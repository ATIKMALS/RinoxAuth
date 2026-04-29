"use client";

import { HTMLAttributes, forwardRef, useState } from "react";
import { cn } from "@/lib/utils";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "glass" | "bordered" | "elevated";
  hover?: "lift" | "glow" | "scale" | "none";
  isInteractive?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ 
    className, 
    variant = "default", 
    hover = "lift",
    isInteractive = false,
    padding = "md",
    children,
    onMouseMove,
    ...props 
  }, ref) => {
    
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [isHovered, setIsHovered] = useState(false);

    const baseStyles = "relative transition-all duration-300";
    
    const variants = {
      default: "rounded-2xl border border-indigo-500/15 bg-gradient-to-b from-[rgba(30,41,90,0.35)] to-[rgba(12,14,30,0.78)] shadow-[0_0_0_1px_rgba(99,102,241,0.06),0_15px_45px_rgba(2,6,23,0.5)] backdrop-blur-md",
      glass: "rounded-2xl border border-white/10 bg-white/5 shadow-[0_8px_32px_rgba(0,0,0,0.12)] backdrop-blur-xl",
      bordered: "rounded-2xl border-2 border-indigo-500/20 bg-slate-950/80 backdrop-blur-sm",
      elevated: "rounded-2xl border border-indigo-500/10 bg-slate-900/90 shadow-[0_20px_60px_rgba(2,6,23,0.7),0_0_0_1px_rgba(99,102,241,0.1)] backdrop-blur-md",
    };
    
    const hovers = {
      lift: "hover:-translate-y-1 hover:shadow-[0_25px_60px_rgba(2,6,23,0.8)]",
      glow: "hover:border-indigo-400/40 hover:shadow-[0_0_30px_rgba(99,102,241,0.2),0_15px_45px_rgba(2,6,23,0.5)]",
      scale: "hover:scale-[1.02]",
      none: "",
    };
    
    const paddings = {
      none: "p-0",
      sm: "p-3",
      md: "p-5",
      lg: "p-6 sm:p-8",
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
      if (isInteractive) {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        setMousePosition({ x, y });
      }
      onMouseMove?.(e);
    };

    return (
      <div
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          hovers[hover],
          paddings[padding],
          isInteractive && "cursor-pointer",
          "group",
          className
        )}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          setMousePosition({ x: 0, y: 0 });
        }}
        style={isInteractive ? {
          '--mouse-x': `${mousePosition.x}px`,
          '--mouse-y': `${mousePosition.y}px`,
        } as React.CSSProperties : undefined}
        {...props}
      >
        {/* Top highlight line */}
        <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-indigo-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* Corner glow on hover */}
        <div className="absolute -top-1 -right-1 w-20 h-20 bg-indigo-500/5 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        <div className="absolute -bottom-1 -left-1 w-20 h-20 bg-violet-500/5 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        
        {/* Mouse follower glow (only for interactive cards) */}
        {isInteractive && isHovered && (
          <div 
            className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-violet-500/5 rounded-2xl pointer-events-none transition-opacity duration-300"
            style={{
              background: `radial-gradient(400px circle at var(--mouse-x) var(--mouse-y), rgba(99,102,241,0.08), transparent 40%)`,
            }}
          />
        )}
        
        {/* Content */}
        <div className="relative z-10">
          {children}
        </div>
      </div>
    );
  }
);

Card.displayName = "Card";