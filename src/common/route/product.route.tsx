import ProductPage from "../../pages/product-page";
import type { ProductPageProps } from "../../modules/product-page/interface/product-page.interface";

export type ProductRouteProps = ProductPageProps;

export const ProductRoute = (props: ProductRouteProps) => {
  return <ProductPage {...props} />;
};
