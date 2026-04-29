"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { Card } from "@/components/ui/card";
import { 
  Shield, 
  ArrowLeft, 
  LockKeyhole, 
  Mail, 
  Key,
  Eye, 
  EyeOff, 
  AlertCircle,
  Check,
  Loader2,
  Sparkles,
  Star
} from "lucide-react";
import Script from "next/script";
import { useState, useEffect, useRef, useCallback } from "react";

// Particle Background Component
function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: Particle[] = [];
    const particleCount = 50;

    class Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      opacity: number;

      constructor() {
        this.x = Math.random() * canvas!.width;
        this.y = Math.random() * canvas!.height;
        this.size = Math.random() * 2 + 0.5;
        this.speedX = (Math.random() - 0.5) * 0.5;
        this.speedY = (Math.random() - 0.5) * 0.5;
        this.opacity = Math.random() * 0.5 + 0.1;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x > canvas!.width) this.x = 0;
        if (this.x < 0) this.x = canvas!.width;
        if (this.y > canvas!.height) this.y = 0;
        if (this.y < 0) this.y = canvas!.height;
      }

      draw() {
        if (!ctx) return;
        ctx.fillStyle = `rgba(99, 102, 241, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    function animate() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle) => {
        particle.update();
        particle.draw();
      });

      // Draw connections
      particles.forEach((a, i) => {
        particles.slice(i + 1).forEach((b) => {
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 150) {
            ctx.strokeStyle = `rgba(99, 102, 241, ${0.1 * (1 - distance / 150)})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        });
      });

      requestAnimationFrame(animate);
    }

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-0"
      style={{ pointerEvents: "none" }}
    />
  );
}

// Animated Background Gradient
function AnimatedGradient() {
  return (
    <div className="absolute inset-0 z-0">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.15),transparent_50%),radial-gradient(circle_at_80%_20%,rgba(29,78,216,0.1),transparent_40%),radial-gradient(circle_at_20%_80%,rgba(99,102,241,0.08),transparent_40%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.05),transparent_70%)]" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-br from-indigo-500/5 to-transparent rounded-full blur-2xl" />
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />
    </div>
  );
}

// Custom SVG Icons
const GoogleIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const GitHubIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
  </svg>
);

const DiscordIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189z"/>
  </svg>
);

const providers = [
  { 
    id: "google", 
    label: "Google",
    icon: GoogleIcon,
    gradientFrom: "from-red-500/10",
    gradientTo: "to-yellow-500/10",
    borderHover: "hover:border-white/30"
  },
  { 
    id: "github", 
    label: "GitHub",
    icon: GitHubIcon,
    gradientFrom: "from-gray-500/10",
    gradientTo: "to-gray-300/10",
    borderHover: "hover:border-white/30"
  },
  { 
    id: "discord", 
    label: "Discord",
    icon: DiscordIcon,
    gradientFrom: "from-indigo-500/10",
    gradientTo: "to-purple-500/10",
    borderHover: "hover:border-indigo-400/30"
  }
] as const;

// Custom Input Component
function InputField({
  label,
  type,
  value,
  onChange,
  placeholder,
  icon: Icon,
  error,
  showPasswordToggle,
  onTogglePassword,
  disabled
}: {
  label: string;
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  icon: any;
  error?: string;
  showPasswordToggle?: boolean;
  onTogglePassword?: () => void;
  disabled?: boolean;
}) {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold tracking-wider text-zinc-400 uppercase">
        {label}
      </label>
      <div className="relative group">
        <Icon className={`absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors duration-300 ${
          isFocused ? "text-indigo-400" : "text-zinc-500"
        }`} />
        <input
          ref={inputRef}
          type={type}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full rounded-xl border bg-zinc-800/50 pl-10 pr-4 py-3 text-sm text-white placeholder-zinc-500 backdrop-blur-sm transition-all duration-300 outline-none ${
            error 
              ? "border-red-500/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/20" 
              : isFocused 
                ? "border-indigo-500/50 ring-2 ring-indigo-500/20" 
                : "border-zinc-700/50 hover:border-zinc-600/70"
          } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
          style={showPasswordToggle ? { paddingRight: "2.5rem" } : {}}
        />
        {showPasswordToggle && (
          <button
            type="button"
            onClick={onTogglePassword}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
            tabIndex={-1}
          >
            {type === "password" ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        )}
        {value && !error && (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
            <Check className="h-4 w-4 text-green-400" />
          </div>
        )}
        {error && (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
            <AlertCircle className="h-4 w-4 text-red-400" />
          </div>
        )}
      </div>
      {error && (
        <p className="text-xs text-red-400 flex items-center gap-1 mt-1">
          <AlertCircle className="h-3 w-3" />
          {error}
        </p>
      )}
    </div>
  );
}

// Main Component
export function OAuthAuthCard({
  mode,
  title,
  subtitle,
  captchaToken,
  setCaptchaToken
}: {
  mode: "login" | "signup";
  title: string;
  subtitle: string;
  captchaToken?: string;
  setCaptchaToken?: (token: string) => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("Free Plan");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [termsError, setTermsError] = useState("");
  const [generalError, setGeneralError] = useState("");
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  // Mouse move effect for card
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setMousePosition({ x, y });
    }
  }, []);

  // Form validation
  const validateForm = useCallback(() => {
    let isValid = true;
    
    // Email validation
    if (!email) {
      setEmailError("Email is required");
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError("Please enter a valid email address");
      isValid = false;
    } else {
      setEmailError("");
    }

    // Password validation
    if (!password) {
      setPasswordError("Password is required");
      isValid = false;
    } else if (mode === "signup" && password.length < 8) {
      setPasswordError("Password must be at least 8 characters");
      isValid = false;
    } else {
      setPasswordError("");
    }

    // Username validation for signup
    if (mode === "signup" && !username) {
      setUsernameError("Username is required");
      isValid = false;
    } else {
      setUsernameError("");
    }

    // Terms validation for signup
    if (mode === "signup" && !agreeTerms) {
      setTermsError("You must agree to the terms");
      isValid = false;
    } else {
      setTermsError("");
    }

    return isValid;
  }, [email, password, username, agreeTerms, mode]);

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      // Get current app_id from cookie
      const response = await fetch('/api/auth/get-app-id');
      const data = await response.json();
      const appId = data.appId;
      
      if (!appId) {
        setGeneralError("No application selected. Please select an application first.");
        setIsLoading(false);
        return;
      }
      
      // Use NextAuth signIn
      const result = await signIn("credentials", {
        username: email, // Using email as username for login
        password: password,
        app_id: appId,
        redirect: false,
      });
      
      if (result?.error) {
        setGeneralError("Invalid credentials. Please try again.");
      } else if (result?.ok) {
        // Redirect to dashboard on success
        window.location.href = "/dashboard";
      }
    } catch (error) {
      setGeneralError("Login failed. Please try again.");
    }
    
    setIsLoading(false);
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-zinc-950 px-4 sm:px-6 py-12">
      {/* Background Effects */}
      <ParticleBackground />
      <AnimatedGradient />
      
      {/* Floating Orbs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-500" />

      {/* Back to Home Button */}
      <Link
        href="/"
        className="absolute left-4 sm:left-6 top-4 sm:top-6 z-20 inline-flex items-center gap-2 rounded-lg border border-zinc-700/50 bg-zinc-900/80 px-3 sm:px-4 py-2 sm:py-2.5 text-sm text-zinc-300 transition-all duration-300 hover:border-zinc-600 hover:bg-zinc-800/80 hover:text-white hover:shadow-lg hover:shadow-indigo-500/10 backdrop-blur-sm group"
      >
        <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
        <span className="hidden sm:inline">Back to Home</span>
      </Link>

      {/* Main Card */}
      <div ref={cardRef} onMouseMove={handleMouseMove}>
        <Card 
          className="relative z-10 w-full max-w-md rounded-2xl border border-white/10 bg-zinc-900/90 p-6 sm:p-8 backdrop-blur-xl shadow-2xl transition-all duration-500 hover:shadow-indigo-500/20"
          style={{
            transform: `perspective(1000px) rotateX(${(mousePosition.y - 200) * 0.01}deg) rotateY(${(mousePosition.x - 200) * -0.01}deg)`,
          }}
        >
          {/* Glow Effect */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500/10 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 -z-10" />
          
          {/* Card Border Glow */}
          <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-br from-indigo-500/20 via-transparent to-blue-500/20 opacity-50 -z-10" />

          {/* Logo/Brand with Animation */}
          <div className="mb-6 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-indigo-500/20 blur-xl animate-pulse" />
              <div className="relative rounded-full bg-indigo-600/20 p-3 ring-1 ring-indigo-500/30 backdrop-blur-sm">
                <Shield className="h-6 w-6 text-indigo-400" />
                <Sparkles className="absolute -top-1 -right-1 h-3 w-3 text-yellow-400 animate-pulse" />
              </div>
            </div>
          </div>

          {/* Header with Animated Text */}
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 bg-gradient-to-r from-white via-white to-zinc-300 bg-clip-text text-transparent">
              {title}
            </h1>
            <p className="text-sm text-zinc-400 animate-fade-in">
              {subtitle}
            </p>
          </div>

          {/* Form Fields */}
          <div className="space-y-5">
            {/* Username Field for Signup */}
            {mode === "signup" && (
              <div className="animate-slide-in" style={{ animationDelay: "0.1s" }}>
                <InputField
                  label="Username"
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setUsernameError("");
                  }}
                  placeholder="Choose a username"
                  icon={Shield}
                  error={usernameError}
                />
              </div>
            )}

            {/* Email Field */}
            <div className="animate-slide-in" style={{ animationDelay: "0.2s" }}>
              <InputField
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setEmailError("");
                  setGeneralError("");
                }}
                placeholder="you@example.com"
                icon={Mail}
                error={emailError}
              />
            </div>

            {/* Password Field */}
            <div className="animate-slide-in" style={{ animationDelay: "0.3s" }}>
              <InputField
                label="Password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setPasswordError("");
                  setGeneralError("");
                }}
                placeholder={mode === "signup" ? "Enter your password (min 8 chars)" : "Enter your password"}
                icon={Key}
                error={passwordError}
                showPasswordToggle={true}
                onTogglePassword={() => setShowPassword(!showPassword)}
              />
            </div>

            {/* Plan Selection for Signup */}
            {mode === "signup" && (
              <div className="animate-slide-in" style={{ animationDelay: "0.4s" }}>
                <label className="block text-xs font-semibold tracking-wider text-zinc-400 uppercase mb-1.5">
                  Select Plan
                </label>
                <div className="relative">
                  <Star className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                  <select
                    value={selectedPlan}
                    onChange={(e) => setSelectedPlan(e.target.value)}
                    className="w-full rounded-xl border border-zinc-700/50 bg-zinc-800/50 pl-10 pr-4 py-3 text-sm text-white backdrop-blur-sm transition-all duration-300 outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 hover:border-zinc-600/70 cursor-pointer appearance-none"
                  >
                    <option value="Free Plan">Free Plan</option>
                    <option value="Pro Plan">Pro Plan</option>
                    <option value="Enterprise Plan">Enterprise Plan</option>
                  </select>
                </div>
              </div>
            )}

            {/* Remember me / Terms */}
            <div className="flex items-center justify-between animate-slide-in" style={{ animationDelay: "0.5s" }}>
              {mode === "login" ? (
                <>
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="sr-only"
                      />
                      <div className={`w-4 h-4 rounded border transition-all duration-300 ${
                        rememberMe 
                          ? "bg-indigo-500 border-indigo-500" 
                          : "border-zinc-600 bg-zinc-800 group-hover:border-zinc-500"
                      }`}>
                        {rememberMe && (
                          <Check className="h-3 w-3 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                        )}
                      </div>
                    </div>
                    <span className="text-sm text-zinc-400 group-hover:text-zinc-300 transition-colors">
                      Remember me
                    </span>
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors duration-300 relative group"
                  >
                    Forgot password?
                    <span className="absolute bottom-0 left-0 w-0 h-px bg-indigo-400 transition-all duration-300 group-hover:w-full" />
                  </Link>
                </>
              ) : (
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={(e) => {
                        setAgreeTerms(e.target.checked);
                        setTermsError("");
                      }}
                      className="sr-only"
                    />
                    <div className={`w-4 h-4 rounded border transition-all duration-300 ${
                      agreeTerms 
                        ? "bg-indigo-500 border-indigo-500" 
                        : "border-zinc-600 bg-zinc-800 group-hover:border-zinc-500"
                    }`}>
                      {agreeTerms && (
                        <Check className="h-3 w-3 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                      )}
                    </div>
                  </div>
                  <span className="text-sm text-zinc-400 group-hover:text-zinc-300 transition-colors">
                    I agree to the Terms & Conditions
                  </span>
                </label>
              )}
            </div>

            {/* Terms Error */}
            {termsError && (
              <p className="text-xs text-red-400 flex items-center gap-1 -mt-3">
                <AlertCircle className="h-3 w-3" />
                {termsError}
              </p>
            )}

            {/* General Error */}
            {generalError && (
              <p className="text-xs text-red-400 flex items-center gap-1 -mt-3">
                <AlertCircle className="h-3 w-3" />
                {generalError}
              </p>
            )}

            {captchaToken !== undefined && setCaptchaToken && (
              <div className="flex justify-center my-4">
                <div 
                  className="cf-turnstile" 
                  data-sitekey={process.env.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY}
                  data-callback={setCaptchaToken}
                />
              </div>
            )}

            {/* Submit Button */}
            <div className="animate-slide-in" style={{ animationDelay: "0.6s" }}>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isLoading}
                className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 px-4 py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:from-indigo-500 hover:to-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-indigo-600 disabled:hover:to-indigo-500 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 mt-2 relative overflow-hidden group"
              >
                <span className={`flex items-center justify-center gap-2 transition-all duration-300 ${
                  isLoading ? "opacity-0" : "opacity-100"
                }`}>
                  {mode === "login" ? "Sign In" : "Create Account"}
                  <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
                {isLoading && (
                  <span className="absolute inset-0 flex items-center justify-center">
                    <Loader2 className="h-5 w-5 animate-spin" />
                  </span>
                )}
              </button>
            </div>

            {/* Divider */}
            <div className="relative my-6 animate-slide-in" style={{ animationDelay: "0.7s" }}>
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-700/50" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-zinc-900/95 px-4 text-zinc-400 backdrop-blur-sm font-medium tracking-wider">
                  OR CONTINUE WITH
                </span>
              </div>
            </div>

            {/* OAuth Providers with Enhanced Design */}
            <div className="space-y-3 animate-slide-in" style={{ animationDelay: "0.8s" }}>
              {providers.map((provider, index) => {
                const IconComponent = provider.icon;
                return (
                  <button
                    key={provider.id}
                    type="button"
                    onClick={() => signIn(provider.id, { callbackUrl: "/dashboard" })}
                    className={`w-full rounded-xl border border-zinc-700/50 bg-zinc-800/50 px-4 py-3.5 text-sm text-zinc-100 transition-all duration-300 ${provider.borderHover} backdrop-blur-sm flex items-center gap-4 group relative overflow-hidden`}
                    style={{ animationDelay: `${0.9 + index * 0.1}s` }}
                  >
                    {/* Hover Gradient Background */}
                    <div className={`absolute inset-0 bg-gradient-to-r ${provider.gradientFrom} ${provider.gradientTo} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                    
                    {/* Icon Container */}
                    <span className="relative flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-700/50 transition-all duration-300 group-hover:scale-110 group-hover:bg-zinc-700/80 group-hover:shadow-lg group-hover:shadow-indigo-500/20">
                      <IconComponent />
                    </span>
                    
                    {/* Provider Name */}
                    <span className="relative font-medium transition-all duration-300 group-hover:translate-x-1">
                      Continue with {provider.label}
                    </span>
                    
                    {/* Arrow Icon on Hover */}
                    <svg 
                      className="relative ml-auto h-4 w-4 opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-1" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Security Notice */}
          <div className="mt-6 rounded-xl border border-zinc-800/50 bg-zinc-800/30 p-4 backdrop-blur-sm animate-fade-in" style={{ animationDelay: "1s" }}>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <div className="rounded-full bg-indigo-500/10 p-1.5">
                  <LockKeyhole className="h-3.5 w-3.5 text-indigo-400" />
                </div>
              </div>
              <div className="flex-1">
                <p className="text-xs text-zinc-400 font-medium">Protected by CloudAuth Security</p>
                <p className="text-xs text-zinc-500 mt-0.5">Your data is encrypted and secure with industry-standard protocols.</p>
              </div>
            </div>
          </div>

          {/* Footer Link */}
          <p className="mt-6 text-center text-sm text-zinc-400 animate-fade-in" style={{ animationDelay: "1.1s" }}>
            {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
            <Link
              href={mode === "login" ? "/signup" : "/login"}
              className="font-medium text-indigo-400 hover:text-indigo-300 transition-colors duration-300 relative group"
            >
              {mode === "login" ? "Create one" : "Sign in"}
              <span className="absolute bottom-0 left-0 w-0 h-px bg-indigo-400 transition-all duration-300 group-hover:w-full" />
            </Link>
          </p>
        </Card>
      </div>

      {/* Cloudflare Turnstile Script */}
      {captchaToken !== undefined && setCaptchaToken && (
        <Script 
          src="https://challenges.cloudflare.com/turnstile/v0/api.js" 
          strategy="lazyOnload" 
        />
      )}

      {/* Custom Animations Styles */}
      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        .animate-slide-in {
          animation: slideIn 0.5s ease-out both;
        }
        
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out both;
        }
      `}</style>
    </main>
  );
}

export default OAuthAuthCard;
