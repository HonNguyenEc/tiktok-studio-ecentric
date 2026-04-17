import type { ReactNode } from "react";

type AppShellProps = {
  darkMode: boolean;
  children: ReactNode;
};

export default function AppShell({ darkMode, children }: AppShellProps) {
  return (
    <div
      className={
        darkMode
          ? "min-h-screen bg-[radial-gradient(circle_at_top,_#121826,_#06080d_50%)] text-white"
          : "min-h-screen bg-[radial-gradient(circle_at_top,_#ffffff,_#eef2ff_55%)] text-slate-900"
      }
    >
      {children}
    </div>
  );
}