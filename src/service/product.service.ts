import type { Product } from "../common/type/app.type";

export const selectAllProducts = async (products: Product[]): Promise<number[]> => {
  return products.map((p) => p.id);
};

export const addMockProduct = async (
  hiddenProducts: Product[]
): Promise<Product | null> => {
  if (hiddenProducts.length === 0) return null;
  return hiddenProducts[0];
};

export const applyProductSet = async (selectedProducts: number[]): Promise<number[]> => {
  return selectedProducts;
};
