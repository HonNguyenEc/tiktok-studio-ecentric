import CommentPageComponent from "../../modules/comment-page/component/component";
import type { CommentPageProps } from "../../modules/comment-page/interface/comment-page.interface";

export default function CommentPageIndex(props: CommentPageProps) {
  return <CommentPageComponent {...props} />;
}
