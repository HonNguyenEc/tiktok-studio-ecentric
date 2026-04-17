import AuthPage from "../../pages/auth-page";
import type { AuthPageProps } from "../../modules/auth-page/interface/auth-page.interface";

export type AuthRouteProps = AuthPageProps;

export const AuthRoute = (props: AuthRouteProps) => {
  return <AuthPage {...props} />;
};
