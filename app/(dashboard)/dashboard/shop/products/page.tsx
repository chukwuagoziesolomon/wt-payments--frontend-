"use client";

import React, { useEffect, useState } from "react";
import { useToast } from "@/components/ui/ToastProvider";
import { authFetch } from "@/lib/auth-fetch";
import { Plus, Edit2, Trash2, Image, ChevronLeft, ChevronRight } from "lucide-react";

const API = "/backend";

function getToken() {
  return typeof window !== "undefined" ? (localStorage.getItem("authToken") || localStorage.getItem("token") || "") : "";
}

function authHeaders(extra?: Record<string, string>) {
  return { Authorization: `Bearer ${getToken()}`, ...extra };
}

type Product = {
  uniqueId: string;
  name: string;
  price: number;
  currency: string;
  description: string;
  category: string;
  stock: number;
  images: Array<{ url: string; publicId: string }>;
  isActive: boolean;
};

type PaginationMeta = {
  currentPage: number;
  total: number;
};

function normalizeProduct(product: any): Product {
  return {
    uniqueId: product.uniqueId ?? product.id ?? "",
    name: product.name ?? "",
    price: Number(product.price ?? 0),
    currency: product.currency ?? "NGN",
    description: product.description ?? "",
    category: product.category ?? "",
    stock: Number(product.stock ?? 0),
    images: Array.isArray(product.images) ? product.images : [],
    isActive: Boolean(product.isActive ?? product.is_active ?? false),
  };
}

export default function ProductsPage() {
  const { notify } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({ currentPage: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    description: "",
    category: "",
    stock: "",
  });

  useEffect(() => {
    loadProducts();
  }, [page]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await authFetch(`${API}/user/shop/products?page=${page}&limit=12`, {
        headers: authHeaders(),
      });
      const json = await res.json().catch(() => ({}));

      const payload = json.result ?? json.data ?? {};
      const items = Array.isArray(payload.data) ? payload.data : Array.isArray(payload) ? payload : [];
      const metaData = payload.meta ?? payload;

      if (res.ok) {
        setProducts(items.map(normalizeProduct));
        setMeta({
          currentPage: metaData.current_page ?? metaData.currentPage ?? page,
          total: metaData.total ?? items.length ?? 0,
        });
      } else {
        notify(json.data || json.message || "Failed to load products");
      }
    } catch (err: any) {
      if (err.name !== "AuthExpiredError") {
        notify("Error loading products");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price) {
      notify("Please fill in required fields");
      return;
    }

    const method = editingId ? "PUT" : "POST";
    const url = editingId ? `${API}/user/shop/products/${editingId}` : `${API}/user/shop/products`;

    try {
      const res = await authFetch(url, {
        method,
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({
          name: formData.name,
          price: parseFloat(formData.price),
          description: formData.description,
          category: formData.category,
          stock: parseInt(formData.stock) || 0,
        }),
      });

      const json = await res.json().catch(() => ({}));

      if (res.ok) {
        notify(editingId ? "Product updated!" : "Product created!");
        setShowForm(false);
        setEditingId(null);
        setFormData({ name: "", price: "", description: "", category: "", stock: "" });
        loadProducts();
      } else {
        notify(json.data || json.message || "Failed to save product");
      }
    } catch (err: any) {
      if (err.name !== "AuthExpiredError") {
        notify("Error saving product");
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product?")) return;

    try {
      const res = await authFetch(`${API}/user/shop/products/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });

      if (res.ok) {
        notify("Product deleted");
        loadProducts();
      } else {
        notify("Failed to delete product");
      }
    } catch (err: any) {
      if (err.name !== "AuthExpiredError") {
        notify("Error deleting product");
      }
    }
  };

  const handleEdit = (product: Product) => {
    setFormData({
      name: product.name,
      price: product.price.toString(),
      description: product.description || "",
      category: product.category || "",
      stock: product.stock.toString(),
    });
    setEditingId(product.uniqueId);
    setShowForm(true);
  };

  return (
    <div className="min-h-screen p-4 sm:p-8 bg-background">
      <div className="w-full max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Products</h1>
            <p className="text-muted-foreground text-sm mt-1">{meta.total} total products</p>
          </div>
          <button
            onClick={() => {
              setShowForm(!showForm);
              if (showForm) setEditingId(null);
              setFormData({ name: "", price: "", description: "", category: "", stock: "" });
            }}
            className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold bg-gradient-to-r from-[#9d8df1] to-[#5b4dd4] text-white hover:shadow-lg transition-all"
          >
            <Plus className="w-5 h-5" />
            {showForm ? "Cancel" : "New Product"}
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-[#19191d] rounded-2xl p-8 border border-[#23242A] mb-8">
            <h2 className="text-lg font-semibold text-white mb-6">{editingId ? "Edit Product" : "Create Product"}</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm text-muted-foreground mb-2">Product Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-[#11111a] border border-[#23242A] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#9d8df1]"
                    placeholder="e.g., Premium Ankara Fabric"
                  />
                </div>
                <div>
                  <label className="block text-sm text-muted-foreground mb-2">Price *</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full bg-[#11111a] border border-[#23242A] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#9d8df1]"
                    placeholder="15000"
                  />
                </div>
                <div>
                  <label className="block text-sm text-muted-foreground mb-2">Category</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-[#11111a] border border-[#23242A] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#9d8df1]"
                    placeholder="e.g., Fabrics"
                  />
                </div>
                <div>
                  <label className="block text-sm text-muted-foreground mb-2">Stock</label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full bg-[#11111a] border border-[#23242A] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#9d8df1]"
                    placeholder="50"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-muted-foreground mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-[#11111a] border border-[#23242A] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#9d8df1] resize-none"
                  rows={4}
                  placeholder="Product description..."
                />
              </div>
              <div className="flex gap-3 justify-end pt-4 border-t border-[#23242A]">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                    setFormData({ name: "", price: "", description: "", category: "", stock: "" });
                  }}
                  className="px-6 py-2.5 rounded-lg font-semibold border border-[#23242A] text-muted-foreground hover:text-white hover:border-[#9d8df1] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-lg font-semibold bg-gradient-to-r from-[#9d8df1] to-[#5b4dd4] text-white hover:shadow-lg transition-all"
                >
                  {editingId ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Products Grid */}
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading products...</div>
        ) : products.length === 0 ? (
          <div className="bg-[#19191d] rounded-2xl p-12 border border-[#23242A] text-center">
            <div className="mb-4 text-5xl">📦</div>
            <h2 className="text-lg font-semibold text-white mb-2">No products yet</h2>
            <p className="text-muted-foreground">Create your first product to get started</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {products.map((product) => (
                <div
                  key={product.uniqueId}
                  className="bg-[#19191d] rounded-xl border border-[#23242A] overflow-hidden hover:border-[#9d8df1] transition-colors group"
                >
                  {/* Product Image */}
                  <div className="relative h-40 bg-[#11111a] overflow-hidden">
                    {product.images.length > 0 ? (
                      <img
                        src={product.images[0].url}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        <Image className="w-8 h-8" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold bg-gradient-to-r from-[#9d8df1] to-[#5b4dd4] text-white">
                        {product.images.length} image{product.images.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>

                  {/* Product Details */}
                  <div className="p-4">
                    <h3 className="font-semibold text-white mb-1 line-clamp-2">{product.name}</h3>
                    <p className="text-xs text-muted-foreground mb-3">{product.category || "Uncategorized"}</p>

                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-sm text-muted-foreground">Price</p>
                        <p className="text-lg font-bold text-[#9d8df1]">
                          {product.currency} {product.price.toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Stock</p>
                        <p
                          className={`text-lg font-bold ${
                            product.stock > 0 ? "text-green-400" : "text-red-400"
                          }`}
                        >
                          {product.stock}
                        </p>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="mb-4">
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                          product.isActive
                            ? "bg-green-500/20 text-green-400"
                            : "bg-red-500/20 text-red-400"
                        }`}
                      >
                        {product.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-3 border-t border-[#23242A]">
                      <button
                        onClick={() => handleEdit(product)}
                        className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border border-[#23242A] text-muted-foreground hover:text-white hover:border-[#9d8df1] transition-colors text-sm"
                      >
                        <Edit2 className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(product.uniqueId)}
                        className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors text-sm"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {meta.total > 12 && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Page {meta.currentPage} · {meta.total} total
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="p-2 rounded-lg border border-[#23242A] text-muted-foreground hover:border-[#9d8df1] hover:text-white transition-colors disabled:opacity-50"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page >= Math.ceil(meta.total / 12)}
                    className="p-2 rounded-lg border border-[#23242A] text-muted-foreground hover:border-[#9d8df1] hover:text-white transition-colors disabled:opacity-50"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
