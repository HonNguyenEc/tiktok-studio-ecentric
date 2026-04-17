type ToastProps = {
  message: string;
  type?: "success" | "error" | "info";
};

export default function Toast({ message, type = "success" }: ToastProps) {
  const styleMap = {
    success: "border-emerald-400/20 bg-emerald-400/10 text-emerald-200",
    error: "border-red-400/20 bg-red-400/10 text-red-200",
    info: "border-sky-400/20 bg-sky-400/10 text-sky-200",
  };

  return (
    <div
      className={`rounded-2xl border px-4 py-3 text-sm font-medium shadow-xl backdrop-blur ${styleMap[type]}`}
    >
      {message}
    </div>
  );
}