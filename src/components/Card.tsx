import type { ReactNode } from "react";

type CardProps = {
  darkMode: boolean;
  children: ReactNode;
  className?: string;
};

export default function Card({ darkMode, children, className = "" }: CardProps) {
  return (
    <section
      className={`rounded-3xl border p-6 shadow-2xl backdrop-blur ${
        darkMode ? "border-white/10 bg-white/5" : "border-slate-200 bg-white/80"
      } ${className}`}
    >
      {children}
    </section>
  );
}