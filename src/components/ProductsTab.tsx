import { Plus, Trash2 } from "lucide-react";
import Card from "./Card";
import ProductThumb from "./ProductThumb";
import type { Product } from "../common/type/app.type";

type ProductsTabProps = {
  isAddingProduct: boolean;
  isApplyingSet: boolean;
  darkMode: boolean;
  products: Product[];
  selectedProducts: number[];
  toggleProduct: (id: number) => void;
  applySet: () => void;
  visibleProductId: number | null;
  showProduct: (id: number) => void;
  removeProduct: (id?: number) => void;
  addProduct: () => void;
  appliedProductIds: number[];
  allSelected: boolean;
  handleSelectAllProducts: () => void;
};

export default function ProductsTab({
  darkMode,
  products,
  selectedProducts,
  toggleProduct,
  applySet,
  visibleProductId,
  showProduct,
  removeProduct,
  addProduct,
  appliedProductIds,
  allSelected,
  handleSelectAllProducts,
}: ProductsTabProps) {
  return (
    <Card darkMode={darkMode}>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className={`text-3xl font-bold ${darkMode ? "text-white" : "text-slate-900"}`}>
            Product Management
          </div>
          <div className={`mt-1 text-sm ${darkMode ? "text-white/50" : "text-slate-500"}`}>
            Select products, apply the set, and choose what will be shown during livestream.
          </div>
          <div className={`mt-2 text-xs ${darkMode ? "text-white/45" : "text-slate-500"}`}>
            Applied set:{" "}
            <span className={`font-semibold ${darkMode ? "text-white" : "text-slate-900"}`}>
              {appliedProductIds.length} product(s)
            </span>
          </div>
          <div className={`mt-2 text-xs ${darkMode ? "text-white/45" : "text-slate-500"}`}>
            Status legend: <span className="font-semibold text-green-500">SELECTED</span> ·{" "}
            <span className="font-semibold text-sky-500">APPLIED</span> ·{" "}
            <span className="font-semibold text-pink-500">VISIBLE</span>
          </div>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <button
          onClick={handleSelectAllProducts}
          className={`rounded-2xl px-4 py-3 text-sm font-semibold shadow-lg transition ${
            darkMode ? "bg-white/10 text-white hover:bg-white/15" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          {allSelected ? "Clear All" : "Select All"}
        </button>
        <div className={`text-sm ${darkMode ? "text-white/55" : "text-slate-500"}`}>
          {selectedProducts.length} / {products.length} selected
        </div>
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <button
          onClick={addProduct}
          className="rounded-2xl bg-[#2C3DA6] px-4 py-4 text-lg font-semibold text-white shadow-lg"
        >
          <span className="inline-flex items-center gap-2">
            <Plus className="h-5 w-5" /> Add Products
          </span>
        </button>
        <button
          onClick={applySet}
          className="rounded-2xl bg-green-600 px-4 py-4 text-lg font-semibold text-white shadow-lg"
        >
          Apply Set
        </button>
        <button
          onClick={() => selectedProducts[0] && showProduct(selectedProducts[0])}
          className="rounded-2xl bg-[#EF7CAF] px-4 py-4 text-lg font-semibold text-white shadow-lg"
        >
          Show Product
        </button>
        <button
          onClick={() => removeProduct()}
          disabled={!visibleProductId && selectedProducts.length === 0}
          className={`rounded-2xl px-4 py-4 text-lg font-semibold text-white shadow-lg transition ${
            !visibleProductId && selectedProducts.length === 0 ? "cursor-not-allowed bg-red-300/70" : "bg-red-600"
          }`}
        >
          <span className="inline-flex items-center gap-2">
            <Trash2 className="h-5 w-5" /> Remove Product
          </span>
        </button>
      </div>

      <div
        className={`overflow-hidden rounded-3xl border ${
          darkMode ? "border-white/10 bg-black/20" : "border-slate-200 bg-white"
        }`}
      >
        <table className={`min-w-full text-left ${darkMode ? "text-white" : "text-slate-900"}`}>
          <thead
            className={`border-b text-lg ${
              darkMode ? "border-white/10 text-white/90" : "border-slate-200 text-slate-700"
            }`}
          >
            <tr>
              <th className="px-6 py-5">Select</th>
              <th className="px-6 py-5">Image</th>
              <th className="px-6 py-5">Name</th>
              <th className="px-6 py-5">Price</th>
              <th className="px-6 py-5">Stock</th>
              <th className="px-6 py-5">Status</th>
              <th className="px-6 py-5">Action</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => {
              const selected = selectedProducts.includes(p.id);
              const applied = appliedProductIds.includes(p.id);
              const visible = visibleProductId === p.id;

              return (
                <tr
                  key={p.id}
                  className={
                    darkMode ? "border-b border-white/10 last:border-none" : "border-b border-slate-200 last:border-none"
                  }
                >
                  <td className="px-6 py-5">
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => toggleProduct(p.id)}
                      className="h-5 w-5 rounded"
                    />
                  </td>
                  <td className="px-6 py-5">
                    <ProductThumb darkMode={darkMode} />
                  </td>
                  <td className="px-6 py-5 text-xl font-medium">{p.name}</td>
                  <td className="px-6 py-5 text-xl">${p.price.toFixed(2)}</td>
                  <td className="px-6 py-5 text-xl">{p.stock}</td>
                  <td className="px-6 py-5">
                    <div className="flex flex-wrap gap-2">
                      {visible ? (
                        <span className="rounded-full bg-[#EF7CAF] px-3 py-1 text-xs font-semibold text-white">
                          VISIBLE
                        </span>
                      ) : null}
                      {applied ? (
                        <span className="rounded-full bg-sky-600 px-3 py-1 text-xs font-semibold text-white">
                          APPLIED
                        </span>
                      ) : null}
                      {selected ? (
                        <span className="rounded-full bg-green-600 px-3 py-1 text-xs font-semibold text-white">
                          SELECTED
                        </span>
                      ) : null}
                      {!visible && !applied && !selected ? (
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold text-white ${
                            darkMode ? "bg-slate-600" : "bg-slate-400"
                          }`}
                        >
                          IDLE
                        </span>
                      ) : null}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <button
                      onClick={() => showProduct(p.id)}
                      className={`rounded-xl border px-4 py-2 text-sm font-medium ${
                        darkMode
                          ? "border-white/10 bg-white/5 text-white hover:bg-white/10"
                          : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      Show
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}