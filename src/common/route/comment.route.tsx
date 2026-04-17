import CommentPage from "../../pages/comment-page";
import type { CommentPageProps } from "../../modules/comment-page/interface/comment-page.interface";

export type CommentRouteProps = CommentPageProps;

export const CommentRoute = (props: CommentRouteProps) => {
  return <CommentPage {...props} />;
};
