"use client";

import { useEffect, useState, useRef } from "react";

export function CursorEffect() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const cursorRef = useRef<HTMLDivElement>(null);
  const followerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
      setIsVisible(true);
      
      clearTimeout(timeout);
      timeout = setTimeout(() => setIsVisible(false), 3000);
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);

    const handleMouseEnter = () => setIsVisible(true);
    const handleMouseLeave = () => setIsVisible(false);

    // Check if hovering over interactive elements
    const handleElementHover = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isInteractive = 
        target.tagName === 'BUTTON' ||
        target.tagName === 'A' ||
        target.tagName === 'INPUT' ||
        target.tagName === 'SELECT' ||
        target.tagName === 'TEXTAREA' ||
        target.closest('button') ||
        target.closest('a') ||
        target.closest('[role="button"]') ||
        target.closest('.card-hover-effect') ||
        target.closest('.group\\/btn');
      
      setIsHovering(!!isInteractive);
      
      if (isInteractive) {
        document.body.style.cursor = 'none';
      } else {
        document.body.style.cursor = 'none';
      }
    };

    // Animation loop for smooth follower
    const animate = () => {
      const cursor = cursorRef.current;
      const follower = followerRef.current;
      
      if (cursor && follower) {
        const mouseX = mouseRef.current.x;
        const mouseY = mouseRef.current.y;
        
        // Instant cursor dot position
        cursor.style.left = `${mouseX}px`;
        cursor.style.top = `${mouseY}px`;
        
        // Smooth follower position with lerp
        const currentX = parseFloat(follower.style.left || '0');
        const currentY = parseFloat(follower.style.top || '0');
        const lerpX = currentX + (mouseX - currentX) * 0.1;
        const lerpY = currentY + (mouseY - currentY) * 0.1;
        
        follower.style.left = `${lerpX}px`;
        follower.style.top = `${lerpY}px`;
      }
      
      rafRef.current = requestAnimationFrame(animate);
    };

    // Start animation
    rafRef.current = requestAnimationFrame(animate);

    // Event listeners
    document.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mouseenter", handleMouseEnter);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseover", handleElementHover);

    return () => {
      cancelAnimationFrame(rafRef.current);
      clearTimeout(timeout);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mouseenter", handleMouseEnter);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseover", handleElementHover);
      document.body.style.cursor = 'auto';
    };
  }, []);

  // Hide default cursor
  useEffect(() => {
    document.body.style.cursor = 'none';
    return () => {
      document.body.style.cursor = 'auto';
    };
  }, []);

  return (
    <>
      {/* Main cursor dot */}
      <div
        ref={cursorRef}
        className={`fixed pointer-events-none z-[99998] transition-all duration-100 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          width: isHovering ? '0px' : '8px',
          height: isHovering ? '0px' : '8px',
          transform: 'translate(-50%, -50%)',
          background: isClicking ? '#818cf8' : '#fff',
          borderRadius: '50%',
          boxShadow: isHovering ? 'none' : '0 0 15px rgba(99, 102, 241, 0.8), 0 0 30px rgba(99, 102, 241, 0.4)',
          transition: 'width 0.2s, height 0.2s, background 0.2s, box-shadow 0.2s',
        }}
      />

      {/* Follower ring */}
      <div
        ref={followerRef}
        className={`fixed pointer-events-none z-[99997] ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          width: isHovering ? '50px' : '30px',
          height: isHovering ? '50px' : '30px',
          transform: 'translate(-50%, -50%)',
          border: isHovering ? '2px solid rgba(99, 102, 241, 0.6)' : '1.5px solid rgba(255, 255, 255, 0.3)',
          borderRadius: '50%',
          transition: 'width 0.3s, height 0.3s, border 0.3s, opacity 0.3s',
          background: isHovering ? 'rgba(99, 102, 241, 0.05)' : 'transparent',
          boxShadow: isHovering ? '0 0 20px rgba(99, 102, 241, 0.2)' : 'none',
        }}
      />

      {/* Click ripple effect */}
      {isClicking && (
        <div
          className="fixed pointer-events-none z-[99996] rounded-full animate-ripple"
          style={{
            left: `${mouseRef.current.x}px`,
            top: `${mouseRef.current.y}px`,
            width: '20px',
            height: '20px',
            transform: 'translate(-50%, -50%)',
            background: 'rgba(99, 102, 241, 0.4)',
          }}
        />
      )}

      <style>{`
        @keyframes ripple {
          0% {
            width: 20px;
            height: 20px;
            opacity: 0.6;
          }
          100% {
            width: 80px;
            height: 80px;
            opacity: 0;
          }
        }
        .animate-ripple {
          animation: ripple 0.6s ease-out forwards;
        }
      `}</style>
    </>
  );
}