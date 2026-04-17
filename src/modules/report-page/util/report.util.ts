import type { ReportItem } from "../interface/report-page.interface";

export const buildMockReportItems = (): ReportItem[] => {
  const now = new Date().toISOString();

  return [
    { id: 1, title: "Livestream Summary", createdAt: now },
    { id: 2, title: "Comment Trend", createdAt: now },
    { id: 3, title: "Top Product Snapshot", createdAt: now },
  ];
};
