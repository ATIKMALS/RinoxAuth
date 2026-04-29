"use client";

import { useEffect, useRef, useState } from "react";
import { Shield } from "lucide-react";

export function CentralVisual() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollY, setScrollY] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Intersection Observer for initial appearance
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(container);
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(container);

    // Scroll handler for parallax and transformations
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setScrollY(scrollPosition);
    };

    // Mouse parallax handler
    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      setMousePos({
        x: (e.clientX - centerX) / 20,
        y: (e.clientY - centerY) / 20,
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleMouseMove);
      observer.unobserve(container);
    };
  }, []);

  // Calculate transformations based on scroll
  const scrollProgress = Math.min(scrollY / 500, 1);
  const scale = 1 + scrollProgress * 0.2;
  const opacity = 1 - scrollProgress * 0.6;
  const translateY = scrollY * 0.1;
  const rotation = scrollY * 0.05;

  return (
    <div
      ref={containerRef}
      className="central-visual mouse-parallax"
      style={{
        opacity: isVisible ? opacity : 0,
        transform: isVisible 
          ? `translateY(${translateY}px) scale(${scale}) rotate(${rotation}deg)`
          : "translateY(60px) scale(0.5)",
        transition: isVisible 
          ? "transform 0.1s linear, opacity 0.3s ease"
          : "transform 1.2s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 1s ease",
      }}
    >
      <div
        className="central-visual-inner"
        style={{
          transform: `perspective(1000px) rotateY(${mousePos.x}deg) rotateX(${-mousePos.y}deg)`,
        }}
      >
        {/* Orbiting Rings */}
        <div className="orbit-ring orbit-ring-1">
          <div className="orbit-dot orbit-dot-1" />
          <div className="orbit-dot orbit-dot-2" />
        </div>
        <div className="orbit-ring orbit-ring-2">
          <div className="orbit-dot orbit-dot-3" />
          <div className="orbit-dot orbit-dot-4" />
        </div>
        <div className="orbit-ring orbit-ring-3">
          <div className="orbit-dot orbit-dot-1" style={{ animationDelay: '0.3s' }} />
          <div className="orbit-dot orbit-dot-2" style={{ animationDelay: '0.7s' }} />
          <div className="orbit-dot orbit-dot-3" style={{ animationDelay: '1.1s' }} />
          <div className="orbit-dot orbit-dot-4" style={{ animationDelay: '1.5s' }} />
        </div>

        {/* Central Core */}
        <div className="central-core">
          <div className="relative">
            {/* Glow effect behind the icon */}
            <div className="absolute inset-0 bg-indigo-500/30 rounded-full blur-2xl animate-pulse" />
            <Shield className="core-icon relative z-10" />
            
            {/* Pulsing ring around the core */}
            <div className="absolute inset-0 rounded-full border-2 border-indigo-400/50 animate-ping" 
              style={{ animationDuration: '3s' }} 
            />
            <div className="absolute inset-0 rounded-full border border-indigo-300/30 animate-pulse" 
              style={{ animationDuration: '2s' }} 
            />
          </div>
        </div>

        {/* Floating particles around the visual */}
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              width: `${Math.random() * 6 + 2}px`,
              height: `${Math.random() * 6 + 2}px`,
              left: `${Math.random() * 200 - 50}%`,
              top: `${Math.random() * 200 - 50}%`,
              animation: `float-particle ${Math.random() * 3 + 2}s ease-in-out ${Math.random() * 2}s infinite`,
              opacity: 0.3 + Math.random() * 0.4,
            }}
          />
        ))}
      </div>
    </div>
  );
}