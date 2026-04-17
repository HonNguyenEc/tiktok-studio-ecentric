import type { SessionState } from "../common/type/app.type";

type StatusPillProps = {
  state: SessionState;
};

export default function StatusPill({ state }: StatusPillProps) {
  const map: Record<SessionState, string> = {
    draft: "bg-slate-600 text-white",
    created: "bg-green-600 text-white",
    scheduled: "bg-sky-600 text-white",
    live: "bg-amber-500 text-white",
    ended: "bg-red-600 text-white",
  };

  return (
    <span className={`rounded-full px-3 py-1 text-sm font-semibold ${map[state]}`}>
      {state.toUpperCase()}
    </span>
  );
}