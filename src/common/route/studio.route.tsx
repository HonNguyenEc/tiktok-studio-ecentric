import StudioPage from "../../pages/studio-page";
import type { StudioPageProps } from "../../modules/studio-page/interface/studio-page.interface";

export type StudioRouteProps = StudioPageProps;

export const StudioRoute = (props: StudioRouteProps) => {
  return <StudioPage {...props} />;
};
