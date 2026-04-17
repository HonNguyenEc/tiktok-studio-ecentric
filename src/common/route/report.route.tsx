import ReportPage from "../../pages/report-page";
import type { ReportPageProps } from "../../modules/report-page/interface/report-page.interface";

export type ReportRouteProps = ReportPageProps;

export const ReportRoute = (props: ReportRouteProps) => {
  return <ReportPage {...props} />;
};
