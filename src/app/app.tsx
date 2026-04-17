import { useState } from "react";
import AppShell from "../components/AppShell";
import Toast from "../components/Toast";
import RightTabbar from "../components/layout/RightTabbar";
import ShopInfoPanel from "../components/layout/ShopInfoPanel";
import TopStatusBar from "../components/layout/TopStatusBar";
import { AuthRoute } from "../common/route/auth.route";
import { IndexRoute } from "../common/route/index.route";
import { useFeedbackHook } from "../common/hook/use-feedback.hook";
import { useAuthHook } from "../modules/auth-page/hook/use-auth.hook";
import { useSessionLifecycleHook } from "../modules/studio-page/hook/use-session-lifecycle.hook";
import { useProductManagerHook } from "../modules/product-page/hook/use-product-manager.hook";
import { useCommentManagerHook } from "../modules/comment-page/hook/use-comment-manager.hook";
import {
  demoAccounts,
  ecentricAiStudioLogo,
  initialCommentsByPlatform,
  seedProducts,
} from "../common/constant/mock-data.constant";
import { shopInfoByPlatform } from "../common/constant/shop-info.constant";
import { managementPlatformOptions } from "../common/constant/management-platform.constant";
import type { ActiveTab, ManagementPlatform } from "../common/type/app.type";
import {
  buildCommentRouteProps,
  buildProductRouteProps,
  buildReportRouteProps,
  buildStudioRouteProps,
} from "./util/build-route-props.util";

export default function App() {
  const [darkMode, setDarkMode] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<ActiveTab>("overview");
  const [managementPlatform, setManagementPlatform] = useState<ManagementPlatform>("Tiktok");
  const shopInfo = shopInfoByPlatform[managementPlatform];

  const { appError, setAppError, toast, logs, addLog, showToast } = useFeedbackHook();

  const auth = useAuthHook({
    demoAccounts,
    showToast,
    setAppError,
  });

  const product = useProductManagerHook({
    seedProducts,
    addLog,
    showToast,
    setAppError,
  });

  const session = useSessionLifecycleHook({
    managementPlatform,
    addLog,
    showToast,
    setAppError,
  });

  const comment = useCommentManagerHook({
    initialComments: initialCommentsByPlatform[managementPlatform],
    managementPlatform,
    currentUserEmail: auth.currentUser.email,
    addLog,
    showToast,
    setAppError,
  });

  const handleLogout = () => {
    auth.handleLogout();
    setActiveTab("overview");
  };

  const studioProps = buildStudioRouteProps({
    darkMode,
    session,
    product,
    comment,
    logs,
    shopInfo,
    currentUser: auth.currentUser,
    managementPlatform,
  });

  const productProps = buildProductRouteProps({
    darkMode,
    product,
  });

  const commentProps = buildCommentRouteProps({
    darkMode,
    comment,
    currentUser: auth.currentUser,
    managementPlatform,
  });

  const reportProps = buildReportRouteProps(darkMode);

  if (!auth.isAuthenticated) {
    return (
      <AuthRoute
        isLoggingIn={auth.isLoggingIn}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        loginForm={auth.loginForm}
        setLoginForm={auth.setLoginForm}
        onLogin={auth.handleLogin}
        loginError={auth.loginError}
        demoAccounts={demoAccounts}
        logoSrc={ecentricAiStudioLogo}
      />
    );
  }

  return (
    <AppShell darkMode={darkMode}>
      <div className="p-4 md:p-6">
        {toast ? (
          <div className="fixed right-4 top-4 z-50 w-[320px]">
            <Toast message={toast.message} type={toast.type} />
          </div>
        ) : null}

        <div className="mx-auto grid max-w-[1800px] gap-5 xl:grid-cols-[minmax(0,1fr)_330px_92px]">
          <main className="space-y-5">
            <TopStatusBar
              darkMode={darkMode}
              sessionState={session.sessionState}
              viewers={session.realtimeMetrics.viewers}
              connectionStatus={session.streamHealth.connectionStatus}
              managementPlatform={managementPlatform}
              appError={appError}
            />

            <IndexRoute
              activeTab={activeTab}
              studioProps={studioProps}
              productProps={productProps}
              commentProps={commentProps}
              reportProps={reportProps}
            />
          </main>

          <ShopInfoPanel
            darkMode={darkMode}
            managementPlatform={managementPlatform}
            managementPlatformOptions={managementPlatformOptions}
            setManagementPlatform={setManagementPlatform}
            shopInfo={shopInfo}
            currentUser={auth.currentUser}
            marketplaceShopProfile={session.marketplaceShopProfile}
            isLoadingMarketplaceShopProfile={session.isLoadingMarketplaceShopProfile}
          />

          <RightTabbar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            darkMode={darkMode}
            setDarkMode={setDarkMode}
            onLogout={handleLogout}
          />
        </div>
      </div>
    </AppShell>
  );
}
