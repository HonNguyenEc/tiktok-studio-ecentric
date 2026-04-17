import { useState } from "react";
import type { DemoAccount, LoginForm } from "../../../common/type/app.type";
import { loginWithDemoAccount } from "../../../service/auth.service";

type UseAuthHookArgs = {
  demoAccounts: DemoAccount[];
  showToast: (message: string, type?: "success" | "error" | "info") => void;
  setAppError: (message: string) => void;
};

const AUTH_STORAGE_KEY = "ecentric_auth_session";

type PersistedAuthSession = {
  email: string;
};

export const useAuthHook = ({ demoAccounts, showToast, setAppError }: UseAuthHookArgs) => {
  const getPersistedAuth = (): PersistedAuthSession | null => {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;

    try {
      const parsed = JSON.parse(raw) as Partial<PersistedAuthSession>;
      if (!parsed.email) return null;
      return { email: parsed.email };
    } catch {
      return null;
    }
  };

  const getPersistedAccount = (): DemoAccount | null => {
    const persisted = getPersistedAuth();
    if (!persisted) return null;
    return demoAccounts.find((account) => account.email === persisted.email) || null;
  };

  const persistedAccount = getPersistedAccount();

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(Boolean(persistedAccount));
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const [loginForm, setLoginForm] = useState<LoginForm>({
    email: "",
    password: "",
  });
  const [loginError, setLoginError] = useState<string>("");
  const [currentUser, setCurrentUser] = useState<DemoAccount>(persistedAccount || demoAccounts[0]);

  const handleLogin = async () => {
    setAppError("");
    setLoginError("");
    setIsLoggingIn(true);

    try {
      const matched = await loginWithDemoAccount(
        demoAccounts,
        loginForm.email,
        loginForm.password
      );

      if (!matched) {
        setLoginError("Invalid email or password.");
        return;
      }

      setCurrentUser(matched);
      setIsAuthenticated(true);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ email: matched.email }));
      showToast("Login successful.", "success");
    } catch {
      setAppError("Login failed. Please try again.");
      showToast("Login failed.", "error");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  return {
    isAuthenticated,
    isLoggingIn,
    loginForm,
    setLoginForm,
    loginError,
    currentUser,
    handleLogin,
    handleLogout,
  };
};
