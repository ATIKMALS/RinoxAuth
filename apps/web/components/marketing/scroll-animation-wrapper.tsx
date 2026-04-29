"use client";

import { useEffect, useRef, useState, ReactNode } from "react";

interface ScrollAnimationWrapperProps {
  children: ReactNode;
  animation?: "up" | "down" | "left" | "right" | "scale" | "rotate";
  delay?: number;
  threshold?: number;
  className?: string;
}

export function ScrollAnimationWrapper({
  children,
  animation = "up",
  delay = 0,
  threshold = 0.1,
  className = "",
}: ScrollAnimationWrapperProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const getTransformValue = () => {
      switch (animation) {
        case "up":
          return "translateY(40px)";
        case "down":
          return "translateY(-40px)";
        case "left":
          return "translateX(-40px)";
        case "right":
          return "translateX(40px)";
        case "scale":
          return "scale(0.85)";
        case "rotate":
          return "rotate(-5deg) scale(0.9)";
        default:
          return "translateY(40px)";
      }
    };

    // Set initial styles
    element.style.opacity = "0";
    element.style.transform = getTransformValue();
    element.style.transition = `opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1) ${delay}ms, transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) ${delay}ms`;
    element.style.willChange = "transform, opacity";

    // Use Intersection Observer
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          element.style.opacity = "1";
          element.style.transform = "translate(0, 0) scale(1) rotate(0deg)";
          observer.unobserve(element);
        }
      },
      {
        threshold,
        rootMargin: "0px 0px -50px 0px",
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [animation, delay, threshold]);

  // Parse className to get existing animation classes
  const animationClass = `animate-in ${isVisible ? "visible" : ""}`;

  return (
    <div ref={ref} className={`${animationClass} ${className}`}>
      {children}
    </div>
  );
}