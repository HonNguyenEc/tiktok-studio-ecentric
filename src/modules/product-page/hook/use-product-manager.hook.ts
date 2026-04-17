import { useMemo, useState } from "react";
import {
  addMockProduct,
  applyProductSet,
  selectAllProducts,
} from "../../../service/product.service";
import type { Product } from "../../../common/type/app.type";

type UseProductManagerHookArgs = {
  seedProducts: Product[];
  addLog: (action: string, detail: string) => void;
  showToast: (message: string, type?: "success" | "error" | "info") => void;
  setAppError: (message: string) => void;
};

export const useProductManagerHook = ({
  seedProducts,
  addLog,
  showToast,
  setAppError,
}: UseProductManagerHookArgs) => {
  const [products, setProducts] = useState<Product[]>(seedProducts.slice(0, 5));
  const [hiddenProducts, setHiddenProducts] = useState<Product[]>(seedProducts.slice(5));
  const [selectedProducts, setSelectedProducts] = useState<number[]>([1, 2]);
  const [allSelected, setAllSelected] = useState<boolean>(false);
  const [appliedProductIds, setAppliedProductIds] = useState<number[]>([1, 2]);
  const [visibleProductId, setVisibleProductId] = useState<number | null>(null);

  const [isAddingProduct, setIsAddingProduct] = useState<boolean>(false);
  const [isApplyingSet, setIsApplyingSet] = useState<boolean>(false);

  const selectedProductObjects = useMemo(
    () => products.filter((p) => selectedProducts.includes(p.id)),
    [products, selectedProducts]
  );

  const clearVisibleProduct = () => setVisibleProductId(null);

  const toggleProduct = (id: number) => {
    setSelectedProducts((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      setAllSelected(next.length === products.length && products.length > 0);
      return next;
    });
  };

  const handleSelectAllProducts = async () => {
    if (allSelected) {
      setSelectedProducts([]);
      setAllSelected(false);
      addLog("Selection cleared", "All products were unselected.");
      return;
    }

    const allIds = await selectAllProducts(products);
    setSelectedProducts(allIds);
    setAllSelected(true);
    addLog("All products selected", `${allIds.length} product(s) selected.`);
  };

  const addProduct = async () => {
    setAppError("");
    setIsAddingProduct(true);

    try {
      const next = await addMockProduct(hiddenProducts);

      if (!next) {
        addLog("Add product skipped", "No more hidden mock products to add.");
        setAppError("No more hidden mock products to add.");
        return;
      }

      setProducts((prev) => {
        const updated = [...prev, next];
        setAllSelected(selectedProducts.length === updated.length && updated.length > 0);
        return updated;
      });

      setHiddenProducts((prev) => prev.slice(1));
      addLog("Product added", `${next.name} added to product list.`);
      showToast(`${next.name} added.`, "success");
    } catch {
      setAppError("Failed to add product.");
    } finally {
      setIsAddingProduct(false);
    }
  };

  const applySet = async () => {
    setAppError("");
    setIsApplyingSet(true);

    try {
      const applied = await applyProductSet(selectedProducts);
      setAppliedProductIds(applied);
      addLog("Product set applied", `${applied.length} product(s) added to current set.`);
      showToast("Product set applied.", "success");
    } catch {
      setAppError("Failed to apply product set.");
    } finally {
      setIsApplyingSet(false);
    }
  };

  const showProduct = (id: number) => {
    setVisibleProductId(id);
    const product = products.find((p) => p.id === id);
    addLog("Product shown", `${product?.name || `#${id}`} is now visible in livestream.`);
  };

  const removeProduct = (id?: number) => {
    const targetId = id || visibleProductId || selectedProducts[0];
    if (!targetId) return;

    setVisibleProductId((prev) => (prev === targetId ? null : prev));
    setSelectedProducts((prev) => {
      const next = prev.filter((x) => x !== targetId);
      setAllSelected(next.length === products.length && products.length > 0);
      return next;
    });
    setAppliedProductIds((prev) => prev.filter((x) => x !== targetId));

    const product = products.find((p) => p.id === targetId);
    addLog("Product removed", `${product?.name || `#${targetId}`} removed from current selection.`);
  };

  return {
    products,
    selectedProducts,
    allSelected,
    appliedProductIds,
    visibleProductId,
    selectedProductObjects,
    isAddingProduct,
    isApplyingSet,
    clearVisibleProduct,
    toggleProduct,
    handleSelectAllProducts,
    addProduct,
    applySet,
    showProduct,
    removeProduct,
  };
};
