"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useDemo } from "@/components/providers/DemoContext";
import { useCurrency } from "@/components/providers/CurrencyContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import {
  Package,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Copy,
  ExternalLink,
  ArrowUpRight,
  Download,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

export default function ProductsPage() {
  const { isDemoMode } = useDemo();
  const { formatPrice } = useCurrency();

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // New product form
  const [newTitle, setNewTitle] = useState("");
  const [newSku, setNewSku] = useState("");
  const [newCategory, setNewCategory] = useState("Personal Electronics");
  const [newSellingPrice, setNewSellingPrice] = useState("39.99");
  const [newCostPrice, setNewCostPrice] = useState("12.50");
  const [newInventory, setNewInventory] = useState("150");

  useEffect(() => {
    async function loadProducts() {
      setLoading(true);
      try {
        const res = await fetch(`/api/app/data?type=products&demo=${isDemoMode}`);
        const data = await res.json();
        setProducts(data.products || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, [isDemoMode]);

  const filtered = products.filter((p) => {
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "ALL" || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/app/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create_product",
          data: {
            title: newTitle,
            sku: newSku,
            category: newCategory,
            sellingPrice: newSellingPrice,
            costPrice: newCostPrice,
            inventory: newInventory,
          },
        }),
      });
      const result = await res.json();
      if (result.product) {
        setProducts([result.product, ...products]);
      } else {
        // Fallback optimistic update
        const fallback = {
          id: `prod_${Date.now()}`,
          title: newTitle,
          sku: newSku || `SKU-${Math.floor(Math.random() * 90000 + 10000)}`,
          category: newCategory,
          sellingPrice: parseFloat(newSellingPrice) || 0,
          costPrice: parseFloat(newCostPrice) || 0,
          inventory: parseInt(newInventory) || 0,
          status: "ACTIVE",
          aiScore: 88.0,
          images: JSON.stringify(["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600"]),
          variants: [],
          supplierProducts: [],
        };
        setProducts([fallback, ...products]);
      }
    } catch (err) {
      console.error("Create product error:", err);
    }
    setCreateModalOpen(false);
    setNewTitle("");
    setNewSku("");
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      await fetch(`/api/app/data?type=product&id=${productId}`, { method: "DELETE" });
      setProducts(products.filter((p) => p.id !== productId));
    } catch (err) {
      console.error("Delete product error:", err);
    }
  };

  const handleExportCSV = () => {
    const headers = "ID,Title,SKU,Category,SellingPrice,CostPrice,Inventory,Status\n";
    const rows = products.map(p => `"${p.id}","${p.title.replace(/"/g, '""')}","${p.sku}","${p.category}",${p.sellingPrice},${p.costPrice},${p.inventory},"${p.status}"`).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dropai_catalog_${Date.now()}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header & Main Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Product Catalog
            </h1>
            <span className="text-xs text-slate-500 font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800">
              {products.length} Products
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage inventory, variants, margins, and automated store sync.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
          <button
            onClick={() => setCreateModalOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Product
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <div className="relative w-full sm:max-w-xs">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Filter by title or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-transparent focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 text-slate-900 dark:text-white focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">Status:</span>
          {["ALL", "ACTIVE", "DRAFT", "ARCHIVED"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === st
                  ? "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Products Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase text-[10px] font-semibold border-b border-slate-200/60 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Retail Price</th>
                  <th className="px-4 py-3">Supplier Cost</th>
                  <th className="px-4 py-3">Net Margin</th>
                  <th className="px-4 py-3">Inventory</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map((prod) => {
                  let img = "https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=100";
                  try {
                    const parsed = JSON.parse(prod.images);
                    if (parsed[0]) img = parsed[0];
                  } catch {}

                  const profit = prod.sellingPrice - prod.costPrice;
                  const margin = Math.round((profit / prod.sellingPrice) * 100);

                  return (
                    <tr key={prod.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={img}
                            alt={prod.title}
                            className="w-10 h-10 rounded-lg object-cover bg-slate-100 dark:bg-slate-800 shrink-0"
                          />
                          <div>
                            <Link
                              href={`/app/products/${prod.id}`}
                              className="font-bold text-slate-900 dark:text-white hover:text-blue-600 transition-colors line-clamp-1"
                            >
                              {prod.title}
                            </Link>
                            <span className="text-[10px] text-slate-400 font-mono">
                              SKU: {prod.sku}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400 font-medium">
                        {prod.category}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={prod.status === "ACTIVE" ? "success" : "warning"}
                          size="sm"
                        >
                          {prod.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 font-mono font-semibold text-slate-900 dark:text-white">
                        {formatPrice(prod.sellingPrice)}
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-500">
                        {formatPrice(prod.costPrice)}
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-semibold text-emerald-600">
                          +{margin}% ({formatPrice(profit)})
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono">
                        <span className={prod.inventory < 50 ? "text-amber-600 font-bold" : "text-slate-700 dark:text-slate-300"}>
                          {prod.inventory} units
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/app/products/${prod.id}`}
                            className="p-1 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                            title="Edit Product"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Link>
                          <button
                            onClick={() => handleDeleteProduct(prod.id)}
                            className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                            title="Delete Product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Create Product Modal */}
      {createModalOpen && (
        <Modal
          isOpen={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          title="Add New Catalog Product"
          description="Create a manual listing or connect an external supplier SKU."
        >
          <form onSubmit={handleCreateProduct} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Product Title
              </label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Ergonomic Foot Rest Cushion"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  SKU
                </label>
                <input
                  type="text"
                  value={newSku}
                  onChange={(e) => setNewSku(e.target.value)}
                  placeholder="DROPAI-FR-007"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Category
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="Personal Electronics">Personal Electronics</option>
                  <option value="Home & Office">Home & Office</option>
                  <option value="Pet Supplies">Pet Supplies</option>
                  <option value="Fitness & Outdoor">Fitness & Outdoor</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Selling Price ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={newSellingPrice}
                  onChange={(e) => setNewSellingPrice(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Supplier Cost ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={newCostPrice}
                  onChange={(e) => setNewCostPrice(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Inventory
                </label>
                <input
                  type="number"
                  required
                  value={newInventory}
                  onChange={(e) => setNewInventory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                />
              </div>
            </div>

            <div className="pt-3 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setCreateModalOpen(false)}
                className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs"
              >
                Save to Catalog
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
