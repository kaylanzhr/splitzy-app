import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";

export function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizes = {
    sm: "text-xl",
    md: "text-2xl",
    lg: "text-4xl md:text-5xl",
  };
  return (
    <Link to="/" className="inline-flex items-center gap-2 group">
      <span className="relative inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-warm shadow-soft group-hover:rotate-6 transition-transform">
        <Sparkles className="h-5 w-5 text-primary-foreground" strokeWidth={2.5} />
      </span>
      <span className={`font-display font-extrabold tracking-tight ${sizes[size]}`}>
        Splitzy
      </span>
    </Link>
  );
}
