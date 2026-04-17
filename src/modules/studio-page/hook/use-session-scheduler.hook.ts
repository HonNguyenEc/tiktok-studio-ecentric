import { useEffect, useMemo, type Dispatch, type SetStateAction } from "react";
import { parseScheduleValue } from "../../../common/util/date-time.util";
import type { ManagementPlatform, SessionState } from "../../../common/type/app.type";

type UseSessionSchedulerHookArgs = {
  scheduleStart: string;
  scheduleEnd: string;
  sessionState: SessionState;
  managementPlatform: ManagementPlatform;
  setSessionState: Dispatch<SetStateAction<SessionState>>;
  setSessionLifecycleState: Dispatch<SetStateAction<SessionState>>;
  addLog: (
    action: string,
    detail: string,
    meta?: {
      platform?: ManagementPlatform;
      result?: "success" | "error" | "info";
      errorCode?: string;
      requestId?: string;
    }
  ) => void;
};

export const useSessionSchedulerHook = ({
  scheduleStart,
  scheduleEnd,
  sessionState,
  managementPlatform,
  setSessionState,
  setSessionLifecycleState,
  addLog,
}: UseSessionSchedulerHookArgs) => {
  const isScheduleRangeInvalid = useMemo(() => {
    const start = parseScheduleValue(scheduleStart);
    const end = parseScheduleValue(scheduleEnd);
    if (!start || !end) return false;
    return end <= start;
  }, [scheduleStart, scheduleEnd]);

  useEffect(() => {
    const start = parseScheduleValue(scheduleStart);
    const end = parseScheduleValue(scheduleEnd);
    if (!start && !end) return;

    const timer = setInterval(() => {
      const now = new Date();

      if (sessionState === "scheduled" && start && now >= start) {
        setSessionState("live");
        setSessionLifecycleState("live");
        addLog("Stream auto-started", `Session automatically moved to LIVE at ${now.toLocaleTimeString()}.`, {
          platform: managementPlatform,
          result: "info",
        });
        return;
      }

      if (sessionState === "live" && end && now >= end) {
        setSessionState("ended");
        setSessionLifecycleState("ended");
        addLog("Stream auto-ended", `Session automatically moved to ENDED at ${now.toLocaleTimeString()}.`, {
          platform: managementPlatform,
          result: "info",
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [
    sessionState,
    scheduleStart,
    scheduleEnd,
    managementPlatform,
    setSessionState,
    setSessionLifecycleState,
    addLog,
  ]);

  return {
    isScheduleRangeInvalid,
  };
};
