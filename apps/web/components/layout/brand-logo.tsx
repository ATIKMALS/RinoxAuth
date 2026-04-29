"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import defaultLogo from "@/logo/logo.png";

type BrandLogoProps = {
  size?: number;
  className?: string;
  /** Extra wrapper ring / glow */
  showLiveRing?: boolean;
};

export function BrandLogo({ size = 40, className, showLiveRing = true }: BrandLogoProps) {
  const envUrl = useMemo(
    () => (typeof process !== "undefined" ? process.env.NEXT_PUBLIC_BRAND_LOGO_URL?.trim() || "" : ""),
    []
  );
  const [envFailed, setEnvFailed] = useState(false);
  const useExternal = Boolean(envUrl) && !envFailed;

  return (
    <div
      className={cn(
        "relative flex-shrink-0 overflow-hidden rounded-xl bg-slate-950 shadow-lg",
        showLiveRing && "ring-2 ring-indigo-500/40 shadow-indigo-500/20",
        className
      )}
      style={{ width: size, height: size }}
    >
      {useExternal ? (
        // eslint-disable-next-line @next/next/no-img-element -- arbitrary user URL from env
        <img
          src={envUrl}
          alt=""
          width={size}
          height={size}
          className="h-full w-full object-cover"
          onError={() => setEnvFailed(true)}
        />
      ) : (
        <Image
          src={defaultLogo}
          alt="Brand"
          width={size}
          height={size}
          className="h-full w-full object-cover"
          priority
        />
      )}
      <span
        className="pointer-events-none absolute inset-0 opacity-60 mix-blend-screen"
        style={{
          background:
            "linear-gradient(115deg, transparent 40%, rgba(255,255,255,0.12) 50%, transparent 60%)",
          backgroundSize: "200% 200%",
          animation: "brand-shine 4s ease-in-out infinite",
        }}
      />
      {showLiveRing && (
        <span className="pointer-events-none absolute -inset-px rounded-[11px] border border-indigo-400/25 opacity-70" />
      )}
    </div>
  );
}
