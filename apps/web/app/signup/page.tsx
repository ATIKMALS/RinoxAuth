import { OAuthAuthCard } from "@/components/auth/oauth-auth-card";

export default function SignupPage() {
  return (
    <OAuthAuthCard
      mode="signup"
      title="Create Account"
      subtitle="Start your secure SaaS journey in seconds."
    />
  );
}
