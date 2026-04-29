"use client";

import { useEffect, useRef, useCallback, useState } from "react";

// ============================================
// TYPES & INTERFACES
// ============================================
interface Particle {
  id: number;
  x: number;
  y: number;
  z: number;
  size: number;
  baseSize: number;
  speedX: number;
  speedY: number;
  speedZ: number;
  opacity: number;
  baseOpacity: number;
  hue: number;
  saturation: number;
  lightness: number;
  pulsePhase: number;
  pulseSpeed: number;
  trail: { x: number; y: number; opacity: number }[];
  maxTrailLength: number;
  type: 'core' | 'spark' | 'orbital' | 'dust';
  angle: number;
  radius: number;
  centerX: number;
  centerY: number;
  waveAmplitude: number;
  waveFrequency: number;
  waveOffset: number;
  sparkTimer: number;
  sparkLifetime: number;
  isSparking: boolean;
}

interface MousePosition {
  x: number;
  y: number;
  isActive: boolean;
  velocityX: number;
  velocityY: number;
  prevX: number;
  prevY: number;
}

interface Ripple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  opacity: number;
  hue: number;
}

// ============================================
// CONFIGURATION
// ============================================
const CONFIG = {
  // Particle counts
  coreCount: 25,
  sparkCount: 15,
  orbitalCount: 20,
  dustCount: 30,
  
  // Connection settings
  connectionDistance: 180,
  connectionDistanceOrbital: 250,
  mouseRadius: 220,
  mouseForce: 3.5,
  
  // Size ranges by type - ENSURE ALL MIN VALUES ARE > 0
  coreSizeRange: [1.5, 4] as [number, number],
  sparkSizeRange: [2, 5] as [number, number],
  orbitalSizeRange: [1, 2.5] as [number, number],
  dustSizeRange: [0.5, 1.2] as [number, number], // Increased min from 0.3 to 0.5
  
  // Speed ranges
  coreSpeedRange: [0.05, 0.3] as [number, number],
  sparkSpeedRange: [0.3, 1.5] as [number, number],
  orbitalSpeedRange: [0.02, 0.08] as [number, number],
  dustSpeedRange: [0.1, 0.4] as [number, number],
  
  // Visual settings
  hueRange: [230, 290] as [number, number],
  accentHue: [190, 220] as [number, number],
  pulseSpeedRange: [0.01, 0.04],
  trailLength: 12,
  trailLengthShort: 4,
  
  // Spark settings
  sparkLifetimeRange: [30, 90],
  sparkInterval: 120,
  
  // Orbital centers
  orbitalCenters: [
    { x: 0.25, y: 0.3 },
    { x: 0.75, y: 0.7 },
    { x: 0.5, y: 0.5 },
  ],
  
  // Ripple settings
  maxRipples: 5,
  rippleMaxRadius: 150,
  rippleDuration: 60,
  
  // Performance
  fps: 60,
  frameInterval: 1000 / 60,
};

// ============================================
// UTILITY FUNCTIONS
// ============================================
function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function randomRange(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

// ============================================
// SAFE GRADIENT CREATION
// ============================================
function createSafeRadialGradient(
  ctx: CanvasRenderingContext2D,
  x0: number,
  y0: number,
  r0: number,
  x1: number,
  y1: number,
  r1: number
): CanvasGradient | null {
  // Ensure all radius values are non-negative
  const safeR0 = Math.max(0.0001, r0);
  const safeR1 = Math.max(0.0001, r1);
  
  // Ensure r0 < r1 for proper gradient
  if (safeR0 >= safeR1) {
    // If r0 is larger, create gradient with r0 slightly smaller
    return ctx.createRadialGradient(x0, y0, safeR1 * 0.5, x1, y1, safeR1);
  }
  
  try {
    return ctx.createRadialGradient(x0, y0, safeR0, x1, y1, safeR1);
  } catch (error) {
    console.warn('Failed to create radial gradient:', error);
    return null;
  }
}

// ============================================
// PARTICLE FACTORY
// ============================================
function createParticle(
  id: number,
  type: Particle['type'],
  canvasWidth: number,
  canvasHeight: number
): Particle {
  const angle = Math.random() * Math.PI * 2;
  const z = Math.random();

  const baseParticle = {
    id,
    x: Math.random() * canvasWidth,
    y: Math.random() * canvasHeight,
    z,
    size: 0,
    baseSize: 1, // Default minimum size
    speedX: 0,
    speedY: 0,
    speedZ: 0,
    opacity: 0,
    baseOpacity: clamp(randomRange(0.1, 0.4), 0.05, 1),
    hue: clamp(randomRange(CONFIG.hueRange[0], CONFIG.hueRange[1]), 0, 360),
    saturation: clamp(randomRange(50, 80), 0, 100),
    lightness: clamp(randomRange(50, 70), 0, 100),
    pulsePhase: Math.random() * Math.PI * 2,
    pulseSpeed: randomRange(CONFIG.pulseSpeedRange[0], CONFIG.pulseSpeedRange[1]),
    trail: [],
    maxTrailLength: CONFIG.trailLength,
    type,
    angle: 0,
    radius: 0,
    centerX: 0,
    centerY: 0,
    waveAmplitude: 0,
    waveFrequency: 0,
    waveOffset: 0,
    sparkTimer: 0,
    sparkLifetime: 0,
    isSparking: false,
  };

  switch (type) {
    case 'core': {
      const size = randomRange(CONFIG.coreSizeRange[0], CONFIG.coreSizeRange[1]);
      return {
        ...baseParticle,
        baseSize: Math.max(0.5, size),
        size: Math.max(0.5, size),
        speedX: Math.cos(angle) * randomRange(CONFIG.coreSpeedRange[0], CONFIG.coreSpeedRange[1]),
        speedY: Math.sin(angle) * randomRange(CONFIG.coreSpeedRange[0], CONFIG.coreSpeedRange[1]),
        speedZ: randomRange(0.001, 0.003),
        maxTrailLength: CONFIG.trailLength,
      };
    }

    case 'spark': {
      const size = randomRange(CONFIG.sparkSizeRange[0], CONFIG.sparkSizeRange[1]);
      return {
        ...baseParticle,
        hue: clamp(randomRange(CONFIG.accentHue[0], CONFIG.accentHue[1]), 0, 360),
        baseSize: Math.max(0.5, size),
        size: Math.max(0.5, size),
        speedX: Math.cos(angle) * randomRange(CONFIG.sparkSpeedRange[0], CONFIG.sparkSpeedRange[1]),
        speedY: Math.sin(angle) * randomRange(CONFIG.sparkSpeedRange[0], CONFIG.sparkSpeedRange[1]),
        speedZ: randomRange(0.005, 0.01),
        baseOpacity: clamp(randomRange(0.3, 0.7), 0.1, 1),
        sparkTimer: Math.random() * CONFIG.sparkInterval,
        sparkLifetime: randomRange(CONFIG.sparkLifetimeRange[0], CONFIG.sparkLifetimeRange[1]),
        maxTrailLength: CONFIG.trailLengthShort,
      };
    }

    case 'orbital': {
      const centerIdx = Math.floor(Math.random() * CONFIG.orbitalCenters.length);
      const center = CONFIG.orbitalCenters[centerIdx];
      const size = randomRange(CONFIG.orbitalSizeRange[0], CONFIG.orbitalSizeRange[1]);
      return {
        ...baseParticle,
        baseSize: Math.max(0.3, size),
        size: Math.max(0.3, size),
        speedX: randomRange(CONFIG.orbitalSpeedRange[0], CONFIG.orbitalSpeedRange[1]) * (Math.random() > 0.5 ? 1 : -1),
        speedY: 0,
        speedZ: randomRange(0.0005, 0.002),
        baseOpacity: clamp(randomRange(0.2, 0.5), 0.05, 1),
        z: Math.random() * 0.5,
        angle: Math.random() * Math.PI * 2,
        radius: Math.max(50, randomRange(80, 250) + Math.random() * 100),
        centerX: center.x * canvasWidth,
        centerY: center.y * canvasHeight,
        waveAmplitude: randomRange(10, 30),
        waveFrequency: randomRange(0.01, 0.03),
        waveOffset: Math.random() * Math.PI * 2,
        maxTrailLength: CONFIG.trailLength,
      };
    }

    case 'dust': {
      const size = randomRange(CONFIG.dustSizeRange[0], CONFIG.dustSizeRange[1]);
      return {
        ...baseParticle,
        hue: clamp(randomRange(CONFIG.hueRange[0] - 20, CONFIG.hueRange[1] + 20), 0, 360),
        baseSize: Math.max(0.2, size),
        size: Math.max(0.2, size),
        speedX: Math.cos(angle) * randomRange(CONFIG.dustSpeedRange[0], CONFIG.dustSpeedRange[1]),
        speedY: Math.sin(angle) * randomRange(CONFIG.dustSpeedRange[0], CONFIG.dustSpeedRange[1]),
        speedZ: 0,
        baseOpacity: clamp(randomRange(0.05, 0.2), 0.01, 1),
        z: Math.random() * 0.3,
        waveAmplitude: randomRange(20, 50),
        waveFrequency: randomRange(0.005, 0.015),
        waveOffset: Math.random() * Math.PI * 2,
        maxTrailLength: 0,
      };
    }
  }
}

// ============================================
// MAIN COMPONENT
// ============================================
export function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const ripplesRef = useRef<Ripple[]>([]);
  const mouseRef = useRef<MousePosition>({ 
    x: 0, y: 0, isActive: false, 
    velocityX: 0, velocityY: 0, 
    prevX: 0, prevY: 0 
  });
  const animationFrameRef = useRef<number>(0);
  const lastFrameTimeRef = useRef<number>(0);
  const frameCountRef = useRef<number>(0);
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const [fps, setFps] = useState(60);

  // ============================================
  // CHECK REDUCED MOTION PREFERENCE
  // ============================================
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setIsReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // ============================================
  // INITIALIZE ALL PARTICLES
  // ============================================
  const initializeParticles = useCallback((width: number, height: number) => {
    if (isReducedMotion) {
      return [
        ...Array(5).fill(0).map((_, i) => createParticle(i, 'core', width, height)),
        ...Array(3).fill(0).map((_, i) => createParticle(i + 5, 'orbital', width, height)),
      ];
    }

    let id = 0;
    const particles: Particle[] = [];
    
    for (let i = 0; i < CONFIG.coreCount; i++) {
      particles.push(createParticle(id++, 'core', width, height));
    }
    
    for (let i = 0; i < CONFIG.sparkCount; i++) {
      particles.push(createParticle(id++, 'spark', width, height));
    }
    
    for (let i = 0; i < CONFIG.orbitalCount; i++) {
      particles.push(createParticle(id++, 'orbital', width, height));
    }
    
    for (let i = 0; i < CONFIG.dustCount; i++) {
      particles.push(createParticle(id++, 'dust', width, height));
    }
    
    return particles;
  }, [isReducedMotion]);

  // ============================================
  // UPDATE PARTICLE
  // ============================================
  const updateParticle = useCallback((particle: Particle, mouse: MousePosition, canvasWidth: number, canvasHeight: number, time: number) => {
    // Store trail
    if (particle.maxTrailLength > 0) {
      particle.trail.push({ x: particle.x, y: particle.y, opacity: particle.opacity });
      if (particle.trail.length > particle.maxTrailLength) {
        particle.trail.shift();
      }
    }

    // Mouse interaction
    if (mouse.isActive) {
      const dx = mouse.x - particle.x;
      const dy = mouse.y - particle.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < CONFIG.mouseRadius) {
        const force = Math.pow((CONFIG.mouseRadius - distance) / CONFIG.mouseRadius, 2);
        const angle = Math.atan2(dy, dx);
        
        const repelX = -Math.cos(angle) * force * CONFIG.mouseForce;
        const repelY = -Math.sin(angle) * force * CONFIG.mouseForce;
        
        particle.x += repelX + mouse.velocityX * force * 0.5;
        particle.y += repelY + mouse.velocityY * force * 0.5;
        
        // Visual enhancement near mouse - clamp values
        particle.opacity = Math.min(particle.baseOpacity * 3, 0.9);
        particle.size = Math.max(0.1, lerp(particle.baseSize, particle.baseSize * 2.5, force));
        particle.lightness = clamp(lerp(particle.lightness, 85, force * 0.5), 0, 100);
        
        // Trigger sparks near mouse
        if (particle.type === 'core' && Math.random() < 0.05) {
          particle.isSparking = true;
          particle.sparkTimer = 0;
          particle.sparkLifetime = randomRange(10, 40);
        }
      } else {
        particle.opacity = lerp(particle.opacity, particle.baseOpacity, 0.05);
        particle.size = Math.max(0.1, lerp(particle.size, particle.baseSize, 0.05));
        particle.lightness = lerp(particle.lightness, randomRange(50, 70), 0.02);
      }
    } else {
      particle.opacity = lerp(particle.opacity, particle.baseOpacity, 0.02);
      particle.size = Math.max(0.1, lerp(particle.size, particle.baseSize, 0.02));
    }

    // Update based on particle type
    switch (particle.type) {
      case 'core':
        particle.x += particle.speedX + Math.sin(time * 0.001 + particle.id) * 0.3;
        particle.y += particle.speedY + Math.cos(time * 0.0013 + particle.id) * 0.3;
        
        particle.pulsePhase += particle.pulseSpeed;
        if (!mouse.isActive) {
          particle.opacity = particle.baseOpacity + Math.sin(particle.pulsePhase) * 0.1;
          particle.size = Math.max(0.1, particle.baseSize + Math.sin(particle.pulsePhase * 1.5) * 0.5);
        }
        
        if (particle.isSparking) {
          particle.sparkTimer++;
          if (particle.sparkTimer > particle.sparkLifetime) {
            particle.isSparking = false;
          }
          particle.size = Math.max(0.1, particle.baseSize * (1 + Math.sin(particle.sparkTimer * 0.5) * 1.5));
          particle.opacity = Math.min(particle.baseOpacity * 2 + Math.sin(particle.sparkTimer * 0.3) * 0.5, 0.9);
        }
        break;

      case 'spark':
        particle.x += particle.speedX * (1 + Math.sin(time * 0.01 + particle.id) * 0.5);
        particle.y += particle.speedY * (1 + Math.cos(time * 0.012 + particle.id) * 0.5);
        
        particle.sparkTimer++;
        const cycle = Math.sin(particle.sparkTimer * 0.02) * 0.5 + 0.5;
        particle.opacity = particle.baseOpacity * cycle;
        particle.size = Math.max(0.1, particle.baseSize * (0.5 + cycle));
        
        if (Math.random() < 0.02) {
          const newAngle = Math.random() * Math.PI * 2;
          const speed = randomRange(CONFIG.sparkSpeedRange[0], CONFIG.sparkSpeedRange[1]);
          particle.speedX = Math.cos(newAngle) * speed;
          particle.speedY = Math.sin(newAngle) * speed;
        }
        break;

      case 'orbital':
        particle.angle += particle.speedX;
        const wobbleY = Math.sin(time * 0.0005 + particle.waveOffset) * particle.waveAmplitude;
        const wobbleX = Math.cos(time * 0.0007 + particle.waveOffset) * particle.waveAmplitude * 0.5;
        
        particle.x = particle.centerX + Math.cos(particle.angle) * particle.radius + wobbleX;
        particle.y = particle.centerY + Math.sin(particle.angle) * particle.radius * 0.7 + wobbleY;
        
        particle.radius += Math.sin(time * 0.0003 + particle.id) * 0.1;
        particle.radius = Math.max(50, particle.radius); // Ensure minimum radius
        
        particle.pulsePhase += particle.pulseSpeed;
        particle.opacity = particle.baseOpacity + Math.sin(particle.pulsePhase) * 0.15;
        break;

      case 'dust':
        particle.x += particle.speedX + Math.sin(time * particle.waveFrequency + particle.waveOffset) * 0.5;
        particle.y += particle.speedY + Math.cos(time * particle.waveFrequency + particle.waveOffset) * 0.5;
        particle.opacity = particle.baseOpacity + Math.sin(time * 0.002 + particle.id) * 0.05;
        break;
    }

    // Wrap around edges with smooth transition
    const margin = 50;
    if (particle.x < -margin) particle.x = canvasWidth + margin;
    if (particle.x > canvasWidth + margin) particle.x = -margin;
    if (particle.y < -margin) particle.y = canvasHeight + margin;
    if (particle.y > canvasHeight + margin) particle.y = -margin;

    // Update Z depth for parallax
    particle.z += particle.speedZ;
    if (particle.z > 1) particle.z = 0;
    if (particle.z < 0) particle.z = 1;
    
    // Final safety clamp for size
    particle.size = Math.max(0.05, particle.size);
  }, []);

  // ============================================
  // ADD RIPPLE EFFECT
  // ============================================
  const addRipple = useCallback((x: number, y: number) => {
    if (ripplesRef.current.length >= CONFIG.maxRipples) {
      ripplesRef.current.shift();
    }
    
    ripplesRef.current.push({
      x,
      y,
      radius: 0,
      maxRadius: CONFIG.rippleMaxRadius,
      opacity: 0.6,
      hue: randomRange(CONFIG.hueRange[0], CONFIG.hueRange[1]),
    });
  }, []);

  // ============================================
  // ANIMATION LOOP
  // ============================================
  const animate = useCallback((timestamp: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    if (!lastFrameTimeRef.current) lastFrameTimeRef.current = timestamp;
    const deltaTime = timestamp - lastFrameTimeRef.current;
    lastFrameTimeRef.current = timestamp;

    frameCountRef.current++;
    if (frameCountRef.current % 30 === 0 && deltaTime > 0) {
      setFps(Math.round(1000 / deltaTime));
    }

    const dpr = window.devicePixelRatio || 1;
    const canvasWidth = canvas.width / dpr;
    const canvasHeight = canvas.height / dpr;

    // Clear with trail effect
    ctx.fillStyle = 'rgba(2, 6, 23, 0.15)';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    const particles = particlesRef.current;
    const mouse = mouseRef.current;
    const time = timestamp;

    // Update particles
    particles.forEach(particle => {
      updateParticle(particle, mouse, canvasWidth, canvasHeight, time);
    });

    // Update ripples
    ripplesRef.current = ripplesRef.current.filter(ripple => {
      ripple.radius += 2;
      ripple.opacity -= 0.008;
      return ripple.opacity > 0;
    });

    // Draw ripples
    ripplesRef.current.forEach(ripple => {
      if (ripple.radius > 0) {
        ctx.beginPath();
        ctx.arc(ripple.x, ripple.y, Math.max(1, ripple.radius), 0, Math.PI * 2);
        ctx.strokeStyle = `hsla(${ripple.hue}, 70%, 60%, ${Math.max(0, ripple.opacity)})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    });

    // Draw connections
    if (!isReducedMotion) {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const p1 = particles[i];
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          const maxDist = (p1.type === 'orbital' || p2.type === 'orbital') 
            ? CONFIG.connectionDistanceOrbital 
            : CONFIG.connectionDistance;

          if (distance < maxDist && distance > 0) {
            const opacity = (1 - distance / maxDist) * 0.08;
            
            const gradient = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
            gradient.addColorStop(0, `hsla(${p1.hue}, ${p1.saturation}%, ${p1.lightness}%, ${opacity})`);
            gradient.addColorStop(1, `hsla(${p2.hue}, ${p2.saturation}%, ${p2.lightness}%, ${opacity})`);
            
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = gradient;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
    }

    // Draw particles
    particles.forEach(particle => {
      ctx.save();

      // Calculate draw size based on Z depth - ensure minimum
      const depthScale = clamp(0.5 + particle.z * 0.5, 0.3, 1);
      const drawSize = Math.max(0.1, particle.size * depthScale);

      // Skip drawing if too small
      if (drawSize < 0.05) {
        ctx.restore();
        return;
      }

      // Outer glow - USE SAFE GRADIENT
      if (particle.type !== 'dust') {
        const glowRadius = Math.max(0.5, drawSize * (particle.type === 'spark' ? 5 : particle.isSparking ? 6 : 3));
        
        const glowGradient = createSafeRadialGradient(
          ctx,
          particle.x, particle.y, Math.max(0.001, drawSize * 0.1),
          particle.x, particle.y, glowRadius
        );
        
        if (glowGradient) {
          const glowAlpha = Math.max(0, particle.opacity * (particle.isSparking ? 0.8 : 0.4));
          glowGradient.addColorStop(0, `hsla(${particle.hue}, 80%, ${clamp(particle.lightness + 10, 0, 100)}%, ${glowAlpha})`);
          glowGradient.addColorStop(0.4, `hsla(${particle.hue}, 60%, ${clamp(particle.lightness, 0, 100)}%, ${glowAlpha * 0.5})`);
          glowGradient.addColorStop(1, `hsla(${particle.hue}, 50%, ${clamp(particle.lightness, 0, 100)}%, 0)`);
          
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, glowRadius, 0, Math.PI * 2);
          ctx.fillStyle = glowGradient;
          ctx.fill();
        }
      }

      // Inner glow ring - only if size is sufficient
      if ((particle.type === 'core' || particle.type === 'spark') && drawSize > 0.3) {
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, drawSize * 1.8, 0, Math.PI * 2);
        ctx.strokeStyle = `hsla(${particle.hue}, 70%, ${clamp(particle.lightness + 15, 0, 100)}%, ${Math.max(0, particle.opacity * 0.3)})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Core particle - USE SAFE GRADIENT
      const coreGradient = createSafeRadialGradient(
        ctx,
        particle.x, particle.y, 0,
        particle.x, particle.y, Math.max(0.1, drawSize)
      );
      
      if (coreGradient) {
        if (particle.type === 'spark') {
          coreGradient.addColorStop(0, `hsla(${particle.hue}, 90%, 95%, ${Math.max(0, particle.opacity)})`);
          coreGradient.addColorStop(0.3, `hsla(${particle.hue}, 80%, 75%, ${Math.max(0, particle.opacity * 0.9)})`);
          coreGradient.addColorStop(0.7, `hsla(${particle.hue}, 60%, 50%, ${Math.max(0, particle.opacity * 0.4)})`);
          coreGradient.addColorStop(1, `hsla(${particle.hue}, 50%, 40%, 0)`);
        } else if (particle.isSparking) {
          coreGradient.addColorStop(0, `hsla(${particle.hue}, 100%, 100%, ${Math.max(0, particle.opacity)})`);
          coreGradient.addColorStop(0.2, `hsla(${particle.hue}, 90%, 85%, ${Math.max(0, particle.opacity * 0.9)})`);
          coreGradient.addColorStop(0.6, `hsla(${particle.hue}, 70%, 60%, ${Math.max(0, particle.opacity * 0.5)})`);
          coreGradient.addColorStop(1, `hsla(${particle.hue}, 60%, 40%, 0)`);
        } else {
          coreGradient.addColorStop(0, `hsla(${particle.hue}, 80%, ${clamp(particle.lightness + 20, 0, 100)}%, ${Math.max(0, particle.opacity)})`);
          coreGradient.addColorStop(0.5, `hsla(${particle.hue}, 70%, ${clamp(particle.lightness + 5, 0, 100)}%, ${Math.max(0, particle.opacity * 0.7)})`);
          coreGradient.addColorStop(1, `hsla(${particle.hue}, 50%, ${clamp(particle.lightness - 10, 0, 100)}%, 0)`);
        }
        
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, Math.max(0.1, drawSize), 0, Math.PI * 2);
        ctx.fillStyle = coreGradient;
        ctx.fill();
      }

      // Bright center dot
      if ((particle.type === 'spark' || particle.isSparking) && drawSize > 0.2) {
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, drawSize * 0.3, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${particle.hue}, 100%, 95%, ${Math.max(0, particle.opacity)})`;
        ctx.fill();
      }

      // Trail effect
      if (particle.trail.length > 1 && !isReducedMotion && drawSize > 0.1) {
        ctx.beginPath();
        ctx.moveTo(particle.trail[0].x, particle.trail[0].y);
        
        for (let i = 1; i < particle.trail.length; i++) {
          const t = particle.trail[i];
          ctx.lineTo(t.x, t.y);
        }
        
        const trailOpacity = Math.max(0, particle.opacity * 0.2);
        ctx.strokeStyle = `hsla(${particle.hue}, 70%, ${clamp(particle.lightness, 0, 100)}%, ${trailOpacity})`;
        ctx.lineWidth = Math.max(0.1, drawSize * 0.4);
        ctx.lineCap = 'round';
        ctx.stroke();
      }

      ctx.restore();
    });

    // Draw mouse glow
    if (mouse.isActive && !isReducedMotion) {
      ctx.save();
      const mouseGlowRadius = Math.max(1, CONFIG.mouseRadius * 0.5);
      const mouseGlow = createSafeRadialGradient(
        ctx,
        mouse.x, mouse.y, 0,
        mouse.x, mouse.y, mouseGlowRadius
      );
      
      if (mouseGlow) {
        mouseGlow.addColorStop(0, 'rgba(129, 140, 248, 0.08)');
        mouseGlow.addColorStop(1, 'rgba(129, 140, 248, 0)');
        
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, mouseGlowRadius, 0, Math.PI * 2);
        ctx.fillStyle = mouseGlow;
        ctx.fill();
      }
      ctx.restore();
    }

    animationFrameRef.current = requestAnimationFrame(animate);
  }, [isReducedMotion, updateParticle]);

  // ============================================
  // CANVAS SETUP & EVENT HANDLERS
  // ============================================
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const updateCanvasSize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    updateCanvasSize();
    
    const canvasWidth = canvas.width / (window.devicePixelRatio || 1);
    const canvasHeight = canvas.height / (window.devicePixelRatio || 1);
    particlesRef.current = initializeParticles(canvasWidth, canvasHeight);

    let resizeTimeout: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        updateCanvasSize();
        const w = canvas.width / (window.devicePixelRatio || 1);
        const h = canvas.height / (window.devicePixelRatio || 1);
        particlesRef.current = initializeParticles(w, h);
      }, 200);
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const prevX = mouseRef.current.x;
      const prevY = mouseRef.current.y;
      
      mouseRef.current = {
        x,
        y,
        isActive: true,
        velocityX: x - prevX,
        velocityY: y - prevY,
        prevX,
        prevY,
      };
      
      if (Math.abs(mouseRef.current.velocityX) + Math.abs(mouseRef.current.velocityY) > 10 && Math.random() < 0.1) {
        addRipple(x, y);
      }
    };

    const handleMouseLeave = () => {
      mouseRef.current = {
        x: 0, y: 0, isActive: false,
        velocityX: 0, velocityY: 0,
        prevX: 0, prevY: 0,
      };
    };

    const handleClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      for (let i = 0; i < 3; i++) {
        setTimeout(() => addRipple(x + randomRange(-20, 20), y + randomRange(-20, 20)), i * 50);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const touch = e.touches[0];
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;
      
      mouseRef.current = {
        x, y, isActive: true,
        velocityX: 0, velocityY: 0,
        prevX: x, prevY: y,
      };
    };

    const handleTouchEnd = () => {
      mouseRef.current = {
        x: 0, y: 0, isActive: false,
        velocityX: 0, velocityY: 0,
        prevX: 0, prevY: 0,
      };
    };

    window.addEventListener('resize', handleResize);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);
    canvas.addEventListener('click', handleClick);
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd);

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      clearTimeout(resizeTimeout);
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      canvas.removeEventListener('click', handleClick);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [animate, initializeParticles, addRipple]);

  // ============================================
  // RENDER
  // ============================================
  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-full h-full"
        style={{ 
          zIndex: 0,
          opacity: isReducedMotion ? 0.4 : 1,
        }}
        aria-hidden="true"
      />
      
      <div 
        className="fixed inset-0 pointer-events-none"
        style={{ 
          zIndex: 0,
          background: `
            radial-gradient(ellipse at 25% 25%, rgba(99, 102, 241, 0.04) 0%, transparent 60%),
            radial-gradient(ellipse at 75% 75%, rgba(139, 92, 246, 0.04) 0%, transparent 60%),
            radial-gradient(ellipse at 50% 50%, rgba(59, 130, 246, 0.02) 0%, transparent 70%)
          `,
        }}
        aria-hidden="true"
      />
    </>
  );
}

export default ParticleBackground;