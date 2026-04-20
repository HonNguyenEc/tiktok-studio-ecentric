import { LogIn, MoonStar, Sun } from "lucide-react";
import type { DemoAccount, LoginForm } from "../common/type/app.type";

type LoginScreenProps = {
  isLoggingIn: boolean;
  darkMode: boolean;
  setDarkMode: React.Dispatch<React.SetStateAction<boolean>>;
  loginForm: LoginForm;
  setLoginForm: React.Dispatch<React.SetStateAction<LoginForm>>;
  onLogin: () => void;
  loginError: string;
  demoAccounts: DemoAccount[];
  logoSrc: string;
};

export default function LoginScreen({
  isLoggingIn,
  darkMode,
  setDarkMode,
  loginForm,
  setLoginForm,
  onLogin,
  loginError,
  demoAccounts,
  logoSrc,
}: LoginScreenProps) {
  void demoAccounts;

  return (
    <div
      className={
        darkMode
          ? "min-h-screen bg-gradient-to-br from-[#030712] via-[#111827] to-[#1f1147] text-white"
          : "min-h-screen bg-gradient-to-br from-[#f8fafc] via-[#eef2ff] to-[#f5f3ff] text-slate-900"
      }
    >
      <div className="relative flex min-h-screen items-center justify-center p-6">
        <div className={`absolute inset-0 ${darkMode ? "bg-[radial-gradient(circle_at_20%_20%,rgba(168,85,247,0.25),transparent_35%),radial-gradient(circle_at_80%_30%,rgba(34,211,238,0.2),transparent_40%)]" : "bg-[radial-gradient(circle_at_20%_20%,rgba(99,102,241,0.12),transparent_35%),radial-gradient(circle_at_80%_30%,rgba(14,165,233,0.12),transparent_40%)]"}`} />

        <div className="relative grid w-full max-w-6xl overflow-hidden rounded-[32px] border shadow-2xl lg:grid-cols-[1.1fr_0.9fr]">
          <section className={`p-8 md:p-10 ${darkMode ? "border-white/10 bg-gradient-to-br from-[#171133] to-[#0a1023]" : "border-slate-200 bg-gradient-to-br from-white to-indigo-50/70"}`}>
            <div className="mb-8 flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <img src={logoSrc} alt="Ecentric AI Studio logo" className="h-16 w-16 rounded-3xl bg-white p-1.5 shadow-sm" />
                <div>
                  <div className={`text-2xl font-bold ${darkMode ? "text-white" : "text-slate-900"}`}>Ecentric AI Studio</div>
                  <div className={`text-sm ${darkMode ? "text-white/65" : "text-slate-600"}`}>AI-powered livestream operation center</div>
                </div>
              </div>

              <button
                onClick={() => setDarkMode((prev) => !prev)}
                className={`rounded-2xl border p-2 ${darkMode ? "border-white/10 bg-white/5 text-white/80" : "border-slate-200 bg-white text-slate-700"}`}
              >
                {darkMode ? <Sun className="h-5 w-5" /> : <MoonStar className="h-5 w-5" />}
              </button>
            </div>

            <div className={`mb-4 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${darkMode ? "border border-cyan-300/25 bg-cyan-400/10 text-cyan-100" : "border border-cyan-200 bg-cyan-50 text-cyan-700"}`}>
              <LogIn className="h-3.5 w-3.5" /> Welcome
            </div>

            <h1 className={`max-w-xl text-4xl font-bold leading-tight ${darkMode ? "text-white" : "text-slate-900"}`}>
              Stream smarter.
              <br />
              Manage everything in one AI studio.
            </h1>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {[
                "Unified live operations",
                "TikTok + Shopee workflow",
                "Real-time monitoring",
              ].map((item) => (
                <div key={item} className={`rounded-2xl border px-3 py-3 text-sm ${darkMode ? "border-white/10 bg-white/5 text-white/80" : "border-slate-200 bg-white/80 text-slate-700"}`}>
                  {item}
                </div>
              ))}
            </div>

            <div className={`mt-8 rounded-2xl border p-4 ${darkMode ? "border-fuchsia-300/20 bg-fuchsia-400/10 text-white/85" : "border-fuchsia-200 bg-fuchsia-50 text-fuchsia-800"}`}>
              Dashboard manage AI live studio with third platform
            </div>
          </section>

          <section className={`p-8 md:p-10 ${darkMode ? "border-l border-white/10 bg-black/35" : "border-l border-slate-200 bg-white/85"}`}>
            <div className="mx-auto w-full max-w-md">
              <h2 className={`text-2xl font-bold ${darkMode ? "text-white" : "text-slate-900"}`}>Sign in your account</h2>
              <p className={`mt-1 text-sm ${darkMode ? "text-white/60" : "text-slate-500"}`}>Use your company account to access studio features.</p>

              <div className="mt-6 grid gap-4">
                <div>
                  <label className={`mb-2 block text-sm font-semibold ${darkMode ? "text-white" : "text-slate-800"}`}>Email</label>
                  <input
                    value={loginForm.email}
                    onChange={(e) => setLoginForm((prev) => ({ ...prev, email: e.target.value }))}
                    placeholder="brandname@ecentric.vn"
                    className={`w-full rounded-2xl border px-4 py-3 text-sm outline-none ${darkMode ? "border-white/15 bg-slate-900/50 text-white placeholder:text-white/35" : "border-slate-200 bg-slate-50 text-slate-800 placeholder:text-slate-400"}`}
                  />
                </div>
                <div>
                  <label className={`mb-2 block text-sm font-semibold ${darkMode ? "text-white" : "text-slate-800"}`}>Password</label>
                  <input
                    type="password"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm((prev) => ({ ...prev, password: e.target.value }))}
                    placeholder="Password"
                    className={`w-full rounded-2xl border px-4 py-3 text-sm outline-none ${darkMode ? "border-white/15 bg-slate-900/50 text-white placeholder:text-white/35" : "border-slate-200 bg-slate-50 text-slate-800 placeholder:text-slate-400"}`}
                  />
                </div>

                {/* <div>
                  <div className={`mb-2 text-xs font-semibold uppercase tracking-[0.16em] ${darkMode ? "text-white/45" : "text-slate-500"}`}>Quick fill</div>
                  <div className="flex flex-wrap gap-2">
                    {demoAccounts.slice(0, 3).map((account) => (
                      <button
                        key={account.id}
                        type="button"
                        onClick={() => setLoginForm({ email: account.email, password: account.password })}
                        className={`rounded-xl border px-3 py-1.5 text-xs font-semibold ${darkMode ? "border-white/10 bg-white/5 text-white/80 hover:bg-white/10" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-100"}`}
                      >
                        {account.role}
                      </button>
                    ))}
                  </div>
                </div> */}

                {loginError ? (
                  <div className={`rounded-2xl border px-4 py-3 text-sm ${darkMode ? "border-red-400/20 bg-red-400/10 text-red-200" : "border-red-200 bg-red-50 text-red-600"}`}>
                    {loginError}
                  </div>
                ) : null}

                <button
                  onClick={onLogin}
                  disabled={isLoggingIn}
                  className={`rounded-2xl px-5 py-3.5 text-base font-semibold text-white shadow-lg transition ${
                    isLoggingIn
                      ? "cursor-not-allowed bg-indigo-500/60"
                      : "bg-gradient-to-r from-cyan-500 to-indigo-600 hover:opacity-95"
                  }`}
                >
                  {isLoggingIn ? "Logging in..." : "Login to Portal"}
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}