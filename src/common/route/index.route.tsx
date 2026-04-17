import type { ActiveTab } from "../type/app.type";
import { CommentRoute, type CommentRouteProps } from "./comment.route";
import { ProductRoute, type ProductRouteProps } from "./product.route";
import { ReportRoute, type ReportRouteProps } from "./report.route";
import { StudioRoute, type StudioRouteProps } from "./studio.route";

type IndexRouteProps = {
  activeTab: ActiveTab;
  studioProps: StudioRouteProps;
  productProps: ProductRouteProps;
  commentProps: CommentRouteProps;
  reportProps: ReportRouteProps;
};

export const IndexRoute = ({
  activeTab,
  studioProps,
  productProps,
  commentProps,
  reportProps,
}: IndexRouteProps) => {
  if (activeTab === "overview") {
    return <StudioRoute {...studioProps} />;
  }

  if (activeTab === "products") {
    return <ProductRoute {...productProps} />;
  }

  if (activeTab === "report") {
    return <ReportRoute {...reportProps} />;
  }

  return <CommentRoute {...commentProps} />;
};
