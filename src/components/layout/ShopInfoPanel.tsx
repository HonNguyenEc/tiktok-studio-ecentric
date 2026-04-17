import { BadgeCheck, Store, User } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";
import type {
  DemoAccount,
  ManagementPlatform,
  MarketplaceShopProfile,
  ShopInfo,
} from "../../common/type/app.type";

type ShopInfoPanelProps = {
  darkMode: boolean;
  managementPlatform: ManagementPlatform;
  managementPlatformOptions: ManagementPlatform[];
  setManagementPlatform: Dispatch<SetStateAction<ManagementPlatform>>;
  shopInfo: ShopInfo;
  currentUser: DemoAccount;
  marketplaceShopProfile: MarketplaceShopProfile | null;
  isLoadingMarketplaceShopProfile: boolean;
};

export default function ShopInfoPanel({
  darkMode,
  managementPlatform,
  managementPlatformOptions,
  setManagementPlatform,
  shopInfo,
  currentUser,
  marketplaceShopProfile,
  isLoadingMarketplaceShopProfile,
}: ShopInfoPanelProps) {
  return (
    <aside className="sticky top-6 h-fit space-y-4">
      <section
        className={`rounded-3xl border p-4 ${
          darkMode ? "border-cyan-400/20 bg-slate-950/70" : "border-slate-200 bg-white"
        }`}
      >
        <div className={`mb-3 inline-flex items-center gap-2 text-xs font-semibold ${darkMode ? "text-cyan-200" : "text-cyan-700"}`}>
          <BadgeCheck className="h-3.5 w-3.5" /> Platform Control
        </div>
        <label className={`mb-1 block text-[11px] uppercase tracking-[0.18em] ${darkMode ? "text-white/45" : "text-slate-500"}`}>
          Management Platform
        </label>
        <select
          value={managementPlatform}
          onChange={(e) => setManagementPlatform(e.target.value as ManagementPlatform)}
          className={`w-full rounded-2xl border px-3 py-2.5 text-sm font-medium outline-none ${
            darkMode ? "border-white/10 bg-black/30 text-white" : "border-slate-200 bg-slate-50 text-slate-700"
          }`}
        >
          {managementPlatformOptions.map((platformOption) => (
            <option key={platformOption} value={platformOption}>
              {platformOption}
            </option>
          ))}
        </select>
      </section>

      <section
        className={`rounded-3xl border p-4 ${
          darkMode ? "border-white/10 bg-black/35" : "border-slate-200 bg-white"
        }`}
      >
        <div className={`mb-3 flex items-center gap-2 text-sm font-semibold ${darkMode ? "text-white" : "text-slate-900"}`}>
          <Store className="h-4 w-4 text-fuchsia-400" /> Shop Snapshot
        </div>
        <div className={`text-base font-semibold ${darkMode ? "text-white" : "text-slate-900"}`}>{shopInfo.name}</div>
        <div className={`mt-1 space-y-1 text-xs ${darkMode ? "text-white/60" : "text-slate-500"}`}>
          <div>ID: {shopInfo.id}</div>
          <div>Region: {shopInfo.region}</div>
          <div>Mode: {shopInfo.mode}</div>
        </div>
        <div className={`mt-3 rounded-2xl border p-3 text-xs ${darkMode ? "border-white/10 bg-slate-900/70 text-white/75" : "border-slate-200 bg-slate-50 text-slate-600"}`}>
          Profile: {isLoadingMarketplaceShopProfile ? "Loading..." : marketplaceShopProfile?.shopName || "Unavailable"}
        </div>
      </section>

      <section
        className={`rounded-3xl border p-4 ${
          darkMode ? "border-white/10 bg-black/35" : "border-slate-200 bg-white"
        }`}
      >
        <div className={`mb-2 flex items-center gap-2 text-sm font-semibold ${darkMode ? "text-white" : "text-slate-900"}`}>
          <User className="h-4 w-4 text-cyan-400" /> Current Operator
        </div>
        <div className={`text-sm font-semibold ${darkMode ? "text-white" : "text-slate-900"}`}>{currentUser.name}</div>
        <div className={`mt-1 text-xs ${darkMode ? "text-white/60" : "text-slate-500"}`}>{currentUser.email}</div>
        <span className={`mt-3 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${darkMode ? "bg-fuchsia-500/15 text-fuchsia-200" : "bg-fuchsia-50 text-fuchsia-700"}`}>
          {currentUser.role}
        </span>
      </section>
    </aside>
  );
}
