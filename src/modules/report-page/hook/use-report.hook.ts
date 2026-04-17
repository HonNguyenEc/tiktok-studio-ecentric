import { useMemo } from "react";
import { buildMockReportItems } from "../util/report.util";

export const useReportHook = () => {
  const reportItems = useMemo(() => buildMockReportItems(), []);

  return {
    reportItems,
  };
};
