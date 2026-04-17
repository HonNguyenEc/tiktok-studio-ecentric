import AuthPageComponent from "../../modules/auth-page/component/component";
import type { AuthPageProps } from "../../modules/auth-page/interface/auth-page.interface";

export default function AuthPageIndex(props: AuthPageProps) {
  return <AuthPageComponent {...props} />;
}
