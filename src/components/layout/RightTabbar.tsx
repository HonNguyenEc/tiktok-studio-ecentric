import {
  FileText,
  LogOut,
  MessageSquare,
  MoonStar,
  Package,
  Sun,
  Tv,
} from "lucide-react";
import type { ActiveTab } from "../../common/type/app.type";
import type { Dispatch, SetStateAction } from "react";

type RightTabbarProps = {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  darkMode: boolean;
  setDarkMode: Dispatch<SetStateAction<boolean>>;
  onLogout: () => void;
};

const items: { key: ActiveTab; label: string; icon: typeof Tv }[] = [
  { key: "overview", label: "Live", icon: Tv },
  { key: "products", label: "Products", icon: Package },
  { key: "comments", label: "Comments", icon: MessageSquare },
  { key: "report", label: "Reports", icon: FileText },
];

export default function RightTabbar({
  activeTab,
  setActiveTab,
  darkMode,
  setDarkMode,
  onLogout,
}: RightTabbarProps) {
  return (
    <aside
      className={`sticky top-6 hidden h-[calc(100vh-3rem)] rounded-3xl border p-3 xl:flex xl:flex-col xl:items-center xl:justify-between ${
        darkMode ? "border-white/10 bg-black/35" : "border-slate-200 bg-white/85"
      }`}
    >
      <div className="space-y-2">
        {items.map((item) => {
          const Icon = item.icon;
          const active = activeTab === item.key;
          return (
            <button
              key={item.key}
              title={item.label}
              onClick={() => setActiveTab(item.key)}
              className={`flex h-14 w-14 items-center justify-center rounded-2xl transition ${
                active
                  ? "bg-gradient-to-br from-cyan-500 to-fuchsia-500 text-white shadow-lg"
                  : darkMode
                    ? "bg-white/5 text-white/75 hover:bg-white/10"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <Icon className="h-5 w-5" />
            </button>
          );
        })}
      </div>

      <div className="space-y-2">
        <button
          title="Toggle theme"
          onClick={() => setDarkMode((prev) => !prev)}
          className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
            darkMode ? "bg-white/5 text-white/80" : "bg-slate-100 text-slate-700"
          }`}
        >
          {darkMode ? <Sun className="h-4 w-4" /> : <MoonStar className="h-4 w-4" />}
        </button>
        <button
          title="Logout"
          onClick={onLogout}
          className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
            darkMode ? "bg-red-500/15 text-red-300" : "bg-red-50 text-red-600"
          }`}
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </aside>
  );
}
