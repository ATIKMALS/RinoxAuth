"use client";

import { useState } from "react";
import Script from "next/script";
import { OAuthAuthCard } from "@/components/auth/oauth-auth-card";

export default function LoginPage() {
  const [captchaToken, setCaptchaToken] = useState<string>("");

  return (
    <>
      {/* Cloudflare Turnstile Script */}
      <Script 
        src="https://challenges.cloudflare.com/turnstile/v0/api.js" 
        strategy="lazyOnload" 
      />
      
      {/* OAuth Card with Turnstile */}
      <OAuthAuthCard
        mode="login"
        title="Welcome Back"
        subtitle="Sign in to continue to your dashboard."
        captchaToken={captchaToken}
        setCaptchaToken={setCaptchaToken}
      />
    </>
  );
}