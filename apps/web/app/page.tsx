import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { 
  Shield, 
  KeyRound, 
  ChartColumnIncreasing, 
  Users, 
  ArrowRight, 
  Sparkles, 
  LockKeyhole, 
  Cpu, 
  Globe,
  Zap,
  BarChart3,
  Activity,
  CheckCircle2,
  Star,
  TrendingUp,
  Clock,
  Server,
  Code2,
  Layers,
  Smartphone,
  Cloud,
  GitBranch,
  Check,
  ChevronRight,
  Play,
  Award,
  ShieldCheck,
  Fingerprint,
  ScanFace
} from "lucide-react";
import { ParticleBackground } from "@/components/marketing/particle-background";
import { ScrollAnimationWrapper } from "@/components/marketing/scroll-animation-wrapper";
import { CentralVisual } from "@/components/marketing/central-visual";
import { ScrollProgress } from "@/components/marketing/scroll-progress";
import { SectionIndicator } from "@/components/marketing/section-indicator";

// ============================================
// ANIMATED COUNTER COMPONENT
// ============================================
function AnimatedCounter({ value, label, icon: Icon, suffix = "" }: { 
  value: string; 
  label: string; 
  icon: any;
  suffix?: string;
}) {
  return (
    <ScrollAnimationWrapper animation="scale">
      <div className="glass-panel card-hover-effect rounded-2xl p-6 text-center group cursor-default relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="relative">
          <div className="flex justify-center mb-3">
            <div className="rounded-full bg-indigo-500/10 p-3 group-hover:bg-indigo-500/20 transition-all duration-500 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-indigo-500/20">
              <Icon className="h-6 w-6 text-indigo-400 group-hover:text-indigo-300 transition-colors duration-500" />
            </div>
          </div>
          <div className="text-4xl font-black bg-gradient-to-r from-white to-zinc-300 bg-clip-text text-transparent mb-2 group-hover:scale-105 transition-transform duration-500">
            {value}{suffix}
          </div>
          <div className="text-sm text-zinc-400 group-hover:text-zinc-300 transition-colors duration-500">
            {label}
          </div>
        </div>
      </div>
    </ScrollAnimationWrapper>
  );
}

// ============================================
// FEATURE CARD COMPONENT
// ============================================
function FeatureCard({ 
  icon: Icon, 
  title, 
  description, 
  benefits,
  delay = 0 
}: { 
  icon: any; 
  title: string; 
  description: string; 
  benefits: string[];
  delay?: number;
}) {
  return (
    <ScrollAnimationWrapper animation="up" delay={delay}>
      <div className="glass-panel card-hover-effect rounded-2xl p-6 group relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-violet-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        <div className="relative flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="rounded-xl bg-indigo-500/10 p-3 group-hover:bg-indigo-500/20 transition-all duration-500 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-indigo-500/20 group-hover:rotate-3">
              <Icon className="h-6 w-6 text-indigo-400 group-hover:text-indigo-300 transition-all duration-500" />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-indigo-300 transition-colors duration-500">
              {title}
            </h3>
            <p className="text-sm text-zinc-400 mb-3 leading-relaxed group-hover:text-zinc-300 transition-colors duration-500">
              {description}
            </p>
            <ul className="space-y-1.5">
              {benefits.map((benefit, idx) => (
                <li key={idx} className="flex items-center gap-2 text-xs text-zinc-500 group-hover:text-zinc-400 transition-all duration-500" style={{ transitionDelay: `${idx * 50}ms` }}>
                  <CheckCircle2 className="h-3.5 w-3.5 text-indigo-400 flex-shrink-0 group-hover:scale-110 transition-transform duration-300" />
                  {benefit}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </ScrollAnimationWrapper>
  );
}

// ============================================
// PRICING CARD COMPONENT
// ============================================
function PricingCard({ 
  name, 
  price, 
  period, 
  features, 
  popular = false,
  delay = 0
}: { 
  name: string; 
  price: string; 
  period: string; 
  features: string[]; 
  popular?: boolean;
  delay?: number;
}) {
  return (
    <ScrollAnimationWrapper animation={popular ? "scale" : "up"} delay={delay}>
      <div className={`glass-panel card-hover-effect rounded-2xl p-6 relative overflow-hidden ${
        popular ? 'border-indigo-400/40 shadow-lg shadow-indigo-500/20' : ''
      }`}>
        {popular && (
          <>
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
              <span className="badge badge-primary text-xs px-4 py-1 font-semibold shadow-lg shadow-indigo-500/20 animate-pulse">
                <Star className="h-3 w-3" /> Most Popular
              </span>
            </div>
            <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/10 via-transparent to-transparent" />
          </>
        )}
        <div className="relative text-center">
          <h3 className="text-lg font-semibold text-white mb-2">{name}</h3>
          <div className="mb-4">
            <span className="text-4xl font-black text-white">{price}</span>
            <span className="text-sm text-zinc-400 ml-1">/{period}</span>
          </div>
          <ul className="space-y-2 mb-6">
            {features.map((feature, idx) => (
              <li key={idx} className="flex items-center gap-2 text-sm text-zinc-400 group-hover:text-zinc-300 transition-colors duration-300">
                <Check className="h-4 w-4 text-indigo-400 flex-shrink-0" />
                {feature}
              </li>
            ))}
          </ul>
          <Link
            href="/signup"
            className={`block w-full rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-500 text-center transform hover:scale-105 ${
              popular 
                ? 'bg-gradient-to-r from-indigo-600 to-violet-500 text-white hover:from-indigo-500 hover:to-violet-400 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40'
                : 'border border-zinc-700 bg-zinc-800/50 text-zinc-300 hover:bg-zinc-700/50 hover:border-zinc-600'
            }`}
          >
            Get Started
          </Link>
        </div>
      </div>
    </ScrollAnimationWrapper>
  );
}

// ============================================
// TESTIMONIAL COMPONENT
// ============================================
function TestimonialCard({ 
  quote, 
  author, 
  role, 
  company,
  delay = 0 
}: { 
  quote: string; 
  author: string; 
  role: string; 
  company: string;
  delay?: number;
}) {
  return (
    <ScrollAnimationWrapper animation="up" delay={delay}>
      <div className="glass-panel rounded-2xl p-6 card-hover-effect relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-indigo-500/5 to-transparent rounded-bl-full" />
        <div className="relative">
          <div className="flex gap-1 mb-3">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-4 w-4 text-yellow-400 fill-current group-hover:scale-110 transition-transform duration-300" style={{ transitionDelay: `${i * 50}ms` }} />
            ))}
          </div>
          <p className="text-sm text-zinc-300 mb-4 italic leading-relaxed group-hover:text-white transition-colors duration-500">
            <span className="text-zinc-500">&ldquo;</span>
            {quote}
            <span className="text-zinc-500">&rdquo;</span>
          </p>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white font-bold text-sm group-hover:scale-110 transition-transform duration-500 group-hover:shadow-lg group-hover:shadow-indigo-500/30">
              {author[0]}
            </div>
            <div>
              <div className="text-sm font-semibold text-white">{author}</div>
              <div className="text-xs text-zinc-500">{role} at {company}</div>
            </div>
          </div>
        </div>
      </div>
    </ScrollAnimationWrapper>
  );
}

// ============================================
// HOW IT WORKS STEP COMPONENT
// ============================================
function HowItWorksStep({ 
  step, 
  title, 
  description, 
  icon: Icon,
  isLast = false,
  delay = 0 
}: { 
  step: string; 
  title: string; 
  description: string; 
  icon: any;
  isLast?: boolean;
  delay?: number;
}) {
  return (
    <ScrollAnimationWrapper animation="up" delay={delay}>
      <div className="text-center relative">
        <div className="glass-panel rounded-2xl p-6 card-hover-effect relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          <div className="relative">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <div className="rounded-full bg-indigo-500/10 p-4 group-hover:bg-indigo-500/20 transition-all duration-500 group-hover:scale-110 group-hover:shadow-xl group-hover:shadow-indigo-500/20">
                  <Icon className="h-8 w-8 text-indigo-400 group-hover:text-indigo-300 transition-all duration-500" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-br from-indigo-600 to-violet-500 flex items-center justify-center text-xs font-bold text-white shadow-lg shadow-indigo-500/30 group-hover:scale-110 transition-transform duration-500">
                  {step}
                </div>
              </div>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-indigo-300 transition-colors duration-500">{title}</h3>
            <p className="text-sm text-zinc-400 group-hover:text-zinc-300 transition-colors duration-500">{description}</p>
          </div>
        </div>
        {!isLast && (
          <div className="hidden md:block absolute -right-4 top-1/2 -translate-y-1/2 text-zinc-600 z-10">
            <ChevronRight className="h-8 w-8 animate-pulse" />
          </div>
        )}
      </div>
    </ScrollAnimationWrapper>
  );
}

// ============================================
// MAIN HOME PAGE COMPONENT
// ============================================
export default async function HomePage() {
  const session = await getServerSession(authOptions);
  if (session) {
    redirect("/dashboard");
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      {/* Scroll Progress Bar */}
      <ScrollProgress />
      
      {/* Section Navigation Indicator */}
      <SectionIndicator 
        sections={['hero', 'trusted', 'features', 'stats', 'how-it-works', 'pricing', 'testimonials', 'integrations', 'security', 'cta']} 
      />
      
      {/* Particle Background */}
      <ParticleBackground />
      
      {/* Grid Background */}
      <div className="absolute inset-0 bg-grid opacity-30 pointer-events-none" />
      
      {/* Floating Orbs with Parallax */}
      <div className="absolute top-20 left-10 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-pulse pointer-events-none parallax-slow" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000 pointer-events-none parallax-fast" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-3xl pointer-events-none parallax-slow" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 pb-16 pt-6 sm:pt-8">
        
        {/* ============================================ */}
        {/* HEADER / NAVIGATION */}
        {/* ============================================ */}
        <header className="glass-panel sticky top-4 z-50 flex items-center justify-between rounded-2xl px-4 sm:px-6 py-3 mb-12 sm:mb-20 fade-in-down">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 font-bold text-lg group">
            <div className="rounded-lg bg-indigo-600/20 p-2 text-indigo-300 group-hover:bg-indigo-600/30 transition-all duration-500 shadow-[0_0_20px_rgba(99,102,241,0.4)] group-hover:shadow-[0_0_30px_rgba(99,102,241,0.6)] group-hover:scale-105">
              <Shield className="h-5 w-5" />
            </div>
            <span className="bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
              RinoxAuth
            </span>
          </Link>
          
          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 text-sm">
            {[
              { href: "#features", label: "Features" },
              { href: "#stats", label: "Stats" },
              { href: "#pricing", label: "Pricing" },
              { href: "#testimonials", label: "Testimonials" },
              { href: "#security", label: "Security" },
            ].map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-zinc-400 hover:text-white transition-colors duration-300 relative group py-1"
              >
                {link.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-indigo-400 to-violet-400 transition-all duration-500 group-hover:w-full rounded-full" />
              </a>
            ))}
          </nav>
          
          {/* Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link 
              href="/login" 
              className="hidden sm:inline-flex rounded-lg px-3 sm:px-4 py-2 text-sm text-zinc-300 transition-all duration-300 hover:bg-slate-800 hover:text-white hover:shadow-lg hover:shadow-slate-800/20"
            >
              Sign In
            </Link>
            <Link 
              href="/signup" 
              className="btn-gradient rounded-lg px-4 sm:px-5 py-2 sm:py-2.5 text-sm font-semibold inline-flex items-center gap-2 hover:scale-105 transition-transform duration-300"
            >
              Get Started <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </header>

        {/* ============================================ */}
        {/* HERO SECTION WITH CENTRAL VISUAL */}
        {/* ============================================ */}
        <section id="hero" className="mx-auto max-w-4xl py-12 sm:py-20 text-center">
          {/* Central Visual Element with Progressive Animation */}
          <div className="mb-8 sm:mb-12">
            <CentralVisual />
          </div>
          
          {/* Badge */}
          <ScrollAnimationWrapper animation="down">
            <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-500/10 px-4 py-1.5 text-sm text-indigo-200 backdrop-blur-sm">
              <Sparkles className="h-4 w-4 animate-pulse" />
              <span className="hidden sm:inline">Premium Licensing & Authentication Platform</span>
              <span className="sm:hidden">Premium Auth Platform</span>
            </div>
          </ScrollAnimationWrapper>
          
          {/* Main Heading */}
          <ScrollAnimationWrapper animation="up" delay={100}>
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight text-white mb-6">
              Secure Your Software
              <br />
              <span className="gradient-text">
                With RinoxAuth
              </span>
            </h1>
            
            {/* Subtitle */}
            <p className="mx-auto max-w-2xl text-base sm:text-lg text-zinc-400 mb-8 leading-relaxed">
              Production-ready license and authentication platform for SaaS apps, APIs, and desktop products. 
              Manage users, keys, activity logs, analytics, and security from one modern dashboard.
            </p>
          </ScrollAnimationWrapper>
          
          {/* CTA Buttons */}
          <ScrollAnimationWrapper animation="up" delay={200}>
            <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
              <Link 
                href="/signup" 
                className="btn-gradient inline-flex items-center justify-center gap-2 rounded-xl px-6 sm:px-8 py-3.5 sm:py-4 font-semibold text-base group shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transform hover:scale-105 transition-all duration-300"
              >
                Start Free Trial 
                <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
              <Link 
                href="/login" 
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900/70 px-6 sm:px-8 py-3.5 sm:py-4 font-semibold text-base transition-all duration-300 hover:bg-zinc-800 hover:border-zinc-600 hover:scale-105 backdrop-blur-sm"
              >
                <Play className="h-5 w-5" />
                View Demo
              </Link>
            </div>
          </ScrollAnimationWrapper>
          
          {/* Social Proof */}
          <ScrollAnimationWrapper animation="up" delay={300}>
            <div className="mt-8 flex items-center justify-center gap-6 text-sm text-zinc-500">
              <div className="flex items-center gap-2 hover:text-zinc-300 transition-colors duration-300">
                <CheckCircle2 className="h-4 w-4 text-green-400" />
                No credit card required
              </div>
              <div className="flex items-center gap-2 hover:text-zinc-300 transition-colors duration-300">
                <CheckCircle2 className="h-4 w-4 text-green-400" />
                Free 14-day trial
              </div>
              <div className="hidden sm:flex items-center gap-2 hover:text-zinc-300 transition-colors duration-300">
                <CheckCircle2 className="h-4 w-4 text-green-400" />
                Cancel anytime
              </div>
            </div>
          </ScrollAnimationWrapper>
        </section>

        {/* ============================================ */}
        {/* TRUSTED BY SECTION */}
        {/* ============================================ */}
        <section id="trusted" className="mb-20">
          <ScrollAnimationWrapper animation="up">
            <p className="text-center text-sm text-zinc-500 mb-8 uppercase tracking-wider">
              Trusted by innovative teams worldwide
            </p>
          </ScrollAnimationWrapper>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 stagger-children reveal-on-scroll" data-animate>
            {['TechCorp', 'CloudScale', 'DevStudio', 'AppWorks', 'DataFlow', 'SecureNet'].map((company) => (
              <div key={company} className="glass-panel rounded-xl p-4 flex items-center justify-center hover:border-indigo-400/30 transition-all duration-500 hover:scale-105">
                <span className="text-sm font-semibold text-zinc-500 hover:text-zinc-300 transition-colors duration-300">{company}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ============================================ */}
        {/* FEATURES SECTION */}
        {/* ============================================ */}
        <section id="features" className="mb-20">
          <ScrollAnimationWrapper animation="up">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Everything You Need
              </h2>
              <p className="text-zinc-400 max-w-2xl mx-auto">
                Powerful features to manage your authentication and licensing needs with ease
              </p>
            </div>
          </ScrollAnimationWrapper>
          
          <div className="grid gap-6 md:grid-cols-2">
            <FeatureCard
              icon={KeyRound}
              title="Application Management"
              description="Create and manage application credentials securely with advanced encryption."
              benefits={["Multiple app support", "API key management", "Role-based access"]}
              delay={100}
            />
            <FeatureCard
              icon={Users}
              title="User Management"
              description="Manage users with expiry, HWID, and status controls effortlessly."
              benefits={["Bulk user operations", "HWID locking", "Plan assignment"]}
              delay={200}
            />
            <FeatureCard
              icon={ChartColumnIncreasing}
              title="Advanced Analytics"
              description="Track growth, logins, and license usage trends with beautiful charts."
              benefits={["Real-time metrics", "Custom reports", "Export data"]}
              delay={300}
            />
            <FeatureCard
              icon={ShieldCheck}
              title="Enterprise Security"
              description="OAuth-ready flows with protected admin operations and audit logs."
              benefits={["256-bit encryption", "Session management", "Audit trails"]}
              delay={400}
            />
          </div>
        </section>

        {/* ============================================ */}
        {/* STATS SECTION */}
        {/* ============================================ */}
        <section id="stats" className="mb-20">
          <ScrollAnimationWrapper animation="up">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Platform Performance
              </h2>
              <p className="text-zinc-400 max-w-2xl mx-auto">
                Delivering reliability and speed at scale
              </p>
            </div>
          </ScrollAnimationWrapper>
          
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <AnimatedCounter value="10+" label="SDK Languages" icon={Code2} />
            <AnimatedCounter value="256" label="Bit Encryption" icon={LockKeyhole} suffix="-bit" />
            <AnimatedCounter value="99.9" label="Uptime SLA" icon={Server} suffix="%" />
            <AnimatedCounter value="50K+" label="Active Users" icon={Users} />
          </div>
        </section>

        {/* ============================================ */}
        {/* HOW IT WORKS SECTION */}
        {/* ============================================ */}
        <section id="how-it-works" className="mb-20">
          <ScrollAnimationWrapper animation="up">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                How It Works
              </h2>
              <p className="text-zinc-400 max-w-2xl mx-auto">
                Get started in minutes with our simple setup process
              </p>
            </div>
          </ScrollAnimationWrapper>
          
          <div className="grid gap-8 md:grid-cols-3 relative">
            <HowItWorksStep
              step="01"
              title="Create Account"
              description="Sign up and configure your application settings in minutes with our intuitive setup wizard."
              icon={Sparkles}
              delay={0}
            />
            <HowItWorksStep
              step="02"
              title="Integrate SDK"
              description="Add our lightweight SDK to your application with just a few lines of code and comprehensive docs."
              icon={Code2}
              delay={100}
            />
            <HowItWorksStep
              step="03"
              title="Go Live"
              description="Deploy with confidence and monitor everything from your dashboard with real-time analytics."
              icon={RocketIcon}
              isLast={true}
              delay={200}
            />
          </div>
        </section>

        {/* ============================================ */}
        {/* PRICING SECTION */}
        {/* ============================================ */}
        <section id="pricing" className="mb-20">
          <ScrollAnimationWrapper animation="up">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Simple, Transparent Pricing
              </h2>
              <p className="text-zinc-400 max-w-2xl mx-auto">
                Choose the plan that fits your needs
              </p>
            </div>
          </ScrollAnimationWrapper>
          
          <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
            <PricingCard
              name="Starter"
              price="$0"
              period="month"
              features={["Up to 100 users", "Basic analytics", "Community support", "1 application"]}
              delay={100}
            />
            <PricingCard
              name="Professional"
              price="$49"
              period="month"
              features={["Up to 10,000 users", "Advanced analytics", "Priority support", "Unlimited apps", "Custom branding"]}
              popular={true}
              delay={200}
            />
            <PricingCard
              name="Enterprise"
              price="Custom"
              period="year"
              features={["Unlimited users", "Dedicated support", "SLA guarantee", "Custom integrations", "On-premise option"]}
              delay={300}
            />
          </div>
        </section>

        {/* ============================================ */}
        {/* TESTIMONIALS SECTION */}
        {/* ============================================ */}
        <section id="testimonials" className="mb-20">
          <ScrollAnimationWrapper animation="up">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Loved by Developers
              </h2>
              <p className="text-zinc-400 max-w-2xl mx-auto">
                See what our customers say about RinoxAuth
              </p>
            </div>
          </ScrollAnimationWrapper>
          
          <div className="grid gap-6 md:grid-cols-3">
            <TestimonialCard
              quote="RinoxAuth made license management incredibly simple. The API is clean and well-documented."
              author="Sarah Johnson"
              role="Lead Developer"
              company="TechCorp"
              delay={100}
            />
            <TestimonialCard
              quote="We switched from a competitor and never looked back. The analytics dashboard is a game changer."
              author="Mike Chen"
              role="CTO"
              company="CloudScale"
              delay={200}
            />
            <TestimonialCard
              quote="Setting up authentication took less than an hour. The SDK support is fantastic."
              author="Alex Rodriguez"
              role="Full Stack Developer"
              company="DevStudio"
              delay={300}
            />
          </div>
        </section>

        {/* ============================================ */}
        {/* INTEGRATIONS SECTION */}
        {/* ============================================ */}
        <section id="integrations" className="mb-20">
          <ScrollAnimationWrapper animation="up">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Integrates With Your Stack
              </h2>
              <p className="text-zinc-400 max-w-2xl mx-auto">
                Works seamlessly with your favorite tools and frameworks
              </p>
            </div>
          </ScrollAnimationWrapper>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 stagger-children reveal-on-scroll" data-animate>
            {[
              { name: "React", icon: Code2 },
              { name: "Next.js", icon: Globe },
              { name: "Python", icon: Code2 },
              { name: "Node.js", icon: Server },
              { name: "C++", icon: Cpu },
              { name: "C#", icon: Layers },
            ].map((tech, idx) => (
              <div 
                key={tech.name} 
                className="glass-panel rounded-xl p-4 text-center card-hover-effect group"
              >
                <tech.icon className="h-8 w-8 text-indigo-400 mx-auto mb-2 group-hover:scale-110 group-hover:text-indigo-300 transition-all duration-500" />
                <span className="text-sm text-zinc-400 group-hover:text-zinc-300 transition-colors duration-300">{tech.name}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ============================================ */}
        {/* SECURITY SECTION */}
        {/* ============================================ */}
        <section id="security" className="mb-20">
          <ScrollAnimationWrapper animation="scale">
            <div className="glass-panel rounded-2xl p-8 sm:p-12 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-violet-500/5" />
              <div className="relative max-w-3xl mx-auto text-center">
                <ScrollAnimationWrapper animation="up">
                  <div className="flex justify-center mb-6">
                    <div className="rounded-full bg-indigo-500/10 p-4 ring-1 ring-indigo-500/30 group hover:bg-indigo-500/20 transition-all duration-500 hover:scale-110 hover:shadow-lg hover:shadow-indigo-500/20">
                      <Shield className="h-8 w-8 text-indigo-400" />
                    </div>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                    Enterprise-Grade Security
                  </h2>
                  <p className="text-zinc-400 mb-8 leading-relaxed">
                    Built for modern SaaS teams: secure key handling, role-aware dashboard routes, 
                    audit-ready activity logs, and smooth workflows designed for daily operations.
                  </p>
                </ScrollAnimationWrapper>
                
                <div className="grid gap-4 sm:grid-cols-2 mb-8 stagger-children reveal-on-scroll" data-animate>
                  {[
                    { icon: LockKeyhole, title: "256-bit Encryption", desc: "Military-grade encryption for all data" },
                    { icon: Activity, title: "Real-time Monitoring", desc: "Track all activities in real-time" },
                    { icon: Clock, title: "Session Management", desc: "Control and revoke sessions instantly" },
                    { icon: GitBranch, title: "Version Control", desc: "Track changes with audit logs" },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3 text-left group hover:bg-white/5 rounded-lg p-3 transition-all duration-300">
                      <item.icon className="h-5 w-5 text-indigo-400 flex-shrink-0 mt-0.5 group-hover:scale-110 group-hover:text-indigo-300 transition-all duration-300" />
                      <div>
                        <div className="text-sm font-semibold text-white group-hover:text-indigo-300 transition-colors duration-300">{item.title}</div>
                        <div className="text-xs text-zinc-400">{item.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <ScrollAnimationWrapper animation="up" delay={200}>
                  <div className="flex flex-wrap justify-center gap-2">
                    {["HWID Locking", "OAuth 2.0", "JWT Tokens", "Rate Limiting", "IP Whitelisting", "2FA Support"].map((pill) => (
                      <span key={pill} className="badge badge-primary hover:scale-105 transition-transform duration-300 cursor-default">
                        {pill}
                      </span>
                    ))}
                  </div>
                </ScrollAnimationWrapper>
              </div>
            </div>
          </ScrollAnimationWrapper>
        </section>

        {/* ============================================ */}
        {/* CTA SECTION */}
        {/* ============================================ */}
        <section id="cta" className="text-center">
          <ScrollAnimationWrapper animation="scale">
            <div className="glass-panel rounded-2xl p-8 sm:p-12 max-w-3xl mx-auto relative overflow-hidden card-hover-effect">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-violet-500/10" />
              <div className="relative">
                <ScrollAnimationWrapper animation="up">
                  <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                    Ready to Get Started?
                  </h2>
                  <p className="text-zinc-400 mb-8 max-w-xl mx-auto">
                    Join thousands of developers who trust RinoxAuth for their authentication and licensing needs.
                  </p>
                </ScrollAnimationWrapper>
                <ScrollAnimationWrapper animation="up" delay={100}>
                  <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
                    <Link 
                      href="/signup" 
                      className="btn-gradient inline-flex items-center justify-center gap-2 rounded-xl px-8 py-4 font-semibold text-lg group transform hover:scale-105 transition-all duration-300"
                    >
                      Start Free Trial 
                      <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                    </Link>
                    <Link 
                      href="/login" 
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900/70 px-8 py-4 font-semibold text-lg transition-all duration-300 hover:bg-zinc-800 hover:border-zinc-600 hover:scale-105"
                    >
                      Talk to Sales
                    </Link>
                  </div>
                </ScrollAnimationWrapper>
              </div>
            </div>
          </ScrollAnimationWrapper>
        </section>

        {/* ============================================ */}
        {/* FOOTER */}
        {/* ============================================ */}
        <footer className="mt-20 pt-10 border-t border-zinc-800/50">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 mb-10 stagger-children reveal-on-scroll" data-animate>
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="rounded-lg bg-indigo-600/20 p-2 text-indigo-300 hover:bg-indigo-600/30 transition-all duration-300">
                  <Shield className="h-5 w-5" />
                </div>
                <span className="font-bold text-white">RinoxAuth</span>
              </div>
              <p className="text-sm text-zinc-500 leading-relaxed">
                Modern licensing and authentication platform for the next generation of software.
              </p>
            </div>
            
            {[
              {
                title: "Product",
                links: ["Features", "Pricing", "Security", "Changelog"]
              },
              {
                title: "Resources",
                links: ["Documentation", "API Reference", "SDK Guide", "Blog"]
              },
              {
                title: "Company",
                links: ["About", "Contact", "Privacy", "Terms"]
              }
            ].map((section) => (
              <div key={section.title}>
                <h4 className="font-semibold text-white mb-4">{section.title}</h4>
                <ul className="space-y-2">
                  {section.links.map((link) => (
                    <li key={link}>
                      <a href="#" className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors duration-300 relative group">
                        {link}
                        <span className="absolute bottom-0 left-0 w-0 h-px bg-indigo-400 transition-all duration-300 group-hover:w-full" />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          
          <div className="py-6 border-t border-zinc-800/50 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-zinc-500">
              © 2026 RinoxAuth. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors duration-300">Privacy Policy</a>
              <a href="#" className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors duration-300">Terms of Service</a>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}

// Helper component for Rocket icon (not in lucide-react by default)
function RocketIcon(props: any) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      {...props}
    >
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
      <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
    </svg>
  );
}