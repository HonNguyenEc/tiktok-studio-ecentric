import type { ActiveTab, ShopInfo, DemoAccount, ManagementPlatform } from "../common/type/app.type";
import {
  LayoutDashboard,
  Package,
  MessageSquare,
  FileText,
  MoonStar,
  Sun,
  Store,
  BadgeCheck,
  User,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

type SidebarProps = {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  shopInfo: ShopInfo;
  managementPlatform: ManagementPlatform;
  managementPlatformOptions: ManagementPlatform[];
  setManagementPlatform: React.Dispatch<React.SetStateAction<ManagementPlatform>>;
  darkMode: boolean;
  setDarkMode: React.Dispatch<React.SetStateAction<boolean>>;
  currentUser: DemoAccount;
  onLogout: () => void;
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  logoSrc: string;
};

export default function Sidebar({
  activeTab,
  setActiveTab,
  shopInfo,
  managementPlatform,
  managementPlatformOptions,
  setManagementPlatform,
  darkMode,
  setDarkMode,
  currentUser,
  onLogout,
  isSidebarCollapsed,
  setIsSidebarCollapsed,
  logoSrc,
}: SidebarProps) {
  const items: { key: ActiveTab; label: string; icon: typeof LayoutDashboard }[] = [
    { key: "overview", label: "Overview", icon: LayoutDashboard },
    { key: "products", label: "Products", icon: Package },
    { key: "comments", label: "Comments", icon: MessageSquare },
    { key: "report", label: "Report", icon: FileText },
  ];

  return (
    <aside
      className={`relative self-start w-full rounded-3xl border p-3 shadow-2xl backdrop-blur transition-all duration-300 ${
        isSidebarCollapsed ? "md:w-24" : "md:w-72"
      } ${darkMode ? "border-white/10 bg-white/5" : "border-slate-200 bg-white/80"}`}
    >
      <div className={`mb-6 px-2 pt-2 ${isSidebarCollapsed ? "flex flex-col items-center gap-3" : "flex items-center justify-between"}`}>
        <div className={`flex items-center ${isSidebarCollapsed ? "justify-center" : "gap-3"}`}>
          <img src={logoSrc} alt="Ecentric AI Studio logo" className="h-12 w-12 rounded-2xl bg-white object-contain p-1 shadow-sm" />
          {!isSidebarCollapsed ? (
            <div>
              <div className={`text-2xl font-bold tracking-tight ${darkMode ? "text-white" : "text-[#2C3DA6]"}`}>
                Ecentric AI Studio
              </div>
              <div className={`text-xs ${darkMode ? "text-white/50" : "text-slate-500"}`}> Mock API</div>
            </div>
          ) : null}
        </div>

        {!isSidebarCollapsed ? (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setDarkMode((prev) => !prev)}
              className={`rounded-2xl border p-2 ${
                darkMode ? "border-white/10 bg-white/5 text-white/80" : "border-slate-200 bg-slate-50 text-[#2C3DA6]"
              }`}
            >
              {darkMode ? <Sun className="h-5 w-5" /> : <MoonStar className="h-5 w-5" />}
            </button>
            <button
              onClick={() => setIsSidebarCollapsed(true)}
              className={`rounded-2xl border p-2 ${
                darkMode ? "border-white/10 bg-white/5 text-white/80" : "border-slate-200 bg-slate-50 text-[#2C3DA6]"
              }`}
              title="Collapse sidebar"
            >
              <PanelLeftClose className="h-5 w-5" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={() => setDarkMode((prev) => !prev)}
              className={`rounded-2xl border p-2 ${
                darkMode ? "border-white/10 bg-white/5 text-white/80" : "border-slate-200 bg-slate-50 text-[#2C3DA6]"
              }`}
              title="Toggle theme"
            >
              {darkMode ? <Sun className="h-5 w-5" /> : <MoonStar className="h-5 w-5" />}
            </button>
            <button
              onClick={() => setIsSidebarCollapsed(false)}
              className={`rounded-2xl border p-2 ${
                darkMode ? "border-white/10 bg-white/5 text-white/80" : "border-slate-200 bg-slate-50 text-[#2C3DA6]"
              }`}
              title="Expand sidebar"
            >
              <PanelLeftOpen className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>

      {!isSidebarCollapsed ? (
        <>
          <div className={`mb-4 rounded-3xl border p-4 ${darkMode ? "border-[#2C3DA6]/30 bg-gradient-to-br from-[#2C3DA6]/20 to-[#EF7CAF]/10" : "border-[#2C3DA6]/15 bg-gradient-to-br from-[#2C3DA6]/8 to-[#EF7CAF]/10"}`}>
            <div className="mb-3 flex items-start justify-between gap-3">
              <div className={`flex items-center gap-2 pt-1 text-sm font-semibold ${darkMode ? "text-indigo-200" : "text-[#2C3DA6]"}`}>
                <BadgeCheck className="h-4 w-4" /> Environment
              </div>
              <span className={`inline-flex min-h-[44px] items-center rounded-full px-4 py-2 text-center text-xs font-semibold leading-tight ${darkMode ? "border border-emerald-400/20 bg-emerald-400/10 text-emerald-300" : "border border-emerald-500/15 bg-emerald-500/10 text-emerald-700"}`}>
                Ready for Review
              </span>
            </div>

            <div className={`rounded-2xl border p-3 ${darkMode ? "border-white/10 bg-black/20" : "border-slate-200 bg-white/80"}`}>
              <div className="mb-3">
                <label className={`mb-1 block text-[11px] uppercase tracking-[0.2em] ${darkMode ? "text-white/45" : "text-slate-500"}`}>
                  Management Platform
                </label>
                <select
                  value={managementPlatform}
                  onChange={(e) => setManagementPlatform(e.target.value as ManagementPlatform)}
                  className={`w-full rounded-xl border px-3 py-2 text-sm font-medium outline-none ${darkMode ? "border-white/15 bg-slate-900/50 text-white" : "border-slate-200 bg-slate-50 text-slate-700"}`}
                >
                  {managementPlatformOptions.map((platformOption) => (
                    <option key={platformOption} value={platformOption}>
                      {platformOption}
                    </option>
                  ))}
                </select>
              </div>

              <div className={`mb-2 flex items-center gap-2 text-sm font-semibold ${darkMode ? "text-white" : "text-slate-900"}`}>
                <Store className={`h-4 w-4 ${darkMode ? "text-[#EF7CAF]" : "text-[#2C3DA6]"}`} /> {shopInfo.name}
              </div>
              <div className={`space-y-1 text-xs ${darkMode ? "text-white/55" : "text-slate-500"}`}>
                <div>Shop ID: <span className={darkMode ? "text-white/80" : "text-slate-700"}>{shopInfo.id}</span></div>
                <div>Region: <span className={darkMode ? "text-white/80" : "text-slate-700"}>{shopInfo.region}</span></div>
                <div>Mode: <span className={darkMode ? "text-white/80" : "text-slate-700"}>{shopInfo.mode}</span></div>
              </div>
            </div>
          </div>

          <div className={`mb-4 rounded-3xl border p-4 ${darkMode ? "border-white/10 bg-slate-900/35" : "border-slate-200 bg-slate-50"}`}>
            <div className={`mb-2 flex items-center gap-2 text-sm font-semibold ${darkMode ? "text-white" : "text-slate-900"}`}>
              <User className="h-4 w-4 text-[#EF7CAF]" /> Logged in Account
            </div>
            <div className={`text-sm font-semibold ${darkMode ? "text-white" : "text-slate-900"}`}>{currentUser?.name}</div>
            <div className={`mt-1 text-xs ${darkMode ? "text-white/55" : "text-slate-500"}`}>{currentUser?.email}</div>
            <div className="mt-3 flex items-center justify-between gap-3">
              <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${darkMode ? "bg-[#EF7CAF]/15 text-pink-200" : "bg-[#EF7CAF]/12 text-[#b43c7d]"}`}>
                {currentUser?.role}
              </span>
              <button
                onClick={onLogout}
                className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition ${darkMode ? "bg-white/5 text-white hover:bg-white/10" : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"}`}
              >
                <LogOut className="h-4 w-4" /> Logout
              </button>
            </div>
          </div>
        </>
      ) : null}

      <div className="space-y-2">
        {items.map((item) => {
          const Icon = item.icon;
          const active = activeTab === item.key;
          return (
            <button
              key={item.key}
              onClick={() => setActiveTab(item.key)}
              className={`flex w-full items-center rounded-2xl transition ${
                isSidebarCollapsed ? "justify-center px-0 py-4" : "gap-3 px-4 py-4 text-left"
              } ${
                active
                  ? "bg-[#2C3DA6] text-white shadow-lg"
                  : darkMode
                    ? "bg-slate-700/70 text-white/90 hover:bg-slate-600/80"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
              title={item.label}
            >
              <Icon className="h-5 w-5" />
              {!isSidebarCollapsed ? <span className="text-lg font-medium">{item.label}</span> : null}
            </button>
          );
        })}
      </div>
    </aside>
  );
}