import type { ManagementPlatform, SessionState } from "../common/type/app.type";
import { getMarketplaceDemoAdapter } from "./marketplace/adapter/marketplace-demo.adapter";

export const createMockSession = async (
  scheduleStart: string,
  scheduleEnd: string,
  previousState: SessionState
): Promise<{
  nextState: SessionState;
  actionLabel: string;
  detail: string;
}> => {
  const now = new Date();
  const start = scheduleStart ? new Date(scheduleStart) : null;
  const hasFutureSchedule = start && start > now;

  const nextState: SessionState = hasFutureSchedule ? "scheduled" : "created";

  return {
    nextState,
    actionLabel: previousState === "ended" ? "New session created" : "Session created",
    detail: `Mock session created successfully.${scheduleStart ? ` Scheduled start: ${scheduleStart}.` : ""}${scheduleEnd ? ` Scheduled end: ${scheduleEnd}.` : ""}`,
  };
};

export const generateMockStreamUrl = async (): Promise<string> => {
  return `rtmp://live.local/session/${Math.random().toString(36).slice(2, 10)}`;
};

export const generateMockStreamUrlByPlatform = async (platform: ManagementPlatform): Promise<string> => {
  return getMarketplaceDemoAdapter(platform).generateStreamUrl();
};

export const startMockStream = async (
  scheduleStart: string
): Promise<{ blocked: boolean; detail: string; nextState?: SessionState }> => {
  const now = new Date();
  const start = scheduleStart ? new Date(scheduleStart) : null;

  if (start && start > now) {
    return {
      blocked: true,
      detail: `Stream is scheduled for ${scheduleStart}. Session stays in SCHEDULED state until that time.`,
    };
  }

  return {
    blocked: false,
    detail: "Session moved to LIVE state.",
    nextState: "live",
  };
};

export const endMockStream = async (): Promise<{
  nextState: SessionState;
  detail: string;
}> => {
  return {
    nextState: "ended",
    detail: "Session moved to ENDED state.",
  };
};
