import ProductPageComponent from "../../modules/product-page/component/component";
import type { ProductPageProps } from "../../modules/product-page/interface/product-page.interface";

export default function ProductPageIndex(props: ProductPageProps) {
  return <ProductPageComponent {...props} />;
}
