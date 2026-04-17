import { useCallback, useEffect, useState } from "react";
import type { LogItem, ManagementPlatform, ToastState } from "../type/app.type";

type LogMeta = {
  platform?: ManagementPlatform;
  result?: LogItem["result"];
  errorCode?: string;
  requestId?: string;
};

export const useFeedbackHook = () => {
  const [appError, setAppError] = useState<string>("");
  const [toast, setToast] = useState<ToastState | null>(null);
  const [logs, setLogs] = useState<LogItem[]>([]);

  const addLog = useCallback((action: string, detail: string, meta?: LogMeta) => {
    setLogs((prev) => [
      ...prev,
      {
        id: Date.now() + Math.random(),
        action,
        detail,
        time: new Date().toLocaleTimeString(),
        platform: meta?.platform,
        result: meta?.result,
        errorCode: meta?.errorCode,
        requestId: meta?.requestId,
      },
    ]);
  }, []);

  const showToast = useCallback((
    message: string,
    type: ToastState["type"] = "success"
  ) => {
    setToast({ message, type });
  }, []);

  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => {
      setToast(null);
    }, 2500);

    return () => clearTimeout(timer);
  }, [toast]);

  return {
    appError,
    setAppError,
    toast,
    logs,
    addLog,
    showToast,
  };
};
