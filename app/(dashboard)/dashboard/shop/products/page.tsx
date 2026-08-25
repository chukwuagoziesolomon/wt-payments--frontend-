"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useToast } from "@/components/ui/ToastProvider";
import { authFetch } from "@/lib/auth-fetch";
import { Plus, Edit2, Trash2, ChevronLeft, ChevronRight, Upload, X } from "lucide-react";
import { TreasuryCard } from "@/components/products/TreasuryCard";

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
  product_type?: string;
  trackStock?: boolean;
  variants?: Record<string, any>;
};

type PaginationMeta = {
  currentPage: number;
  total: number;
  perPage: number;
  lastPage: number;
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
    product_type: product.product_type ?? product.productType ?? "physical",
    trackStock: Boolean(product.trackStock ?? product.track_stock ?? true),
    variants: product.variants ?? {},
  };
}

export default function ProductsPage() {
  const { notify } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({ currentPage: 1, total: 0, perPage: 20, lastPage: 1 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [pendingImages, setPendingImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    description: "",
    category: "",
    stock: "",
    product_type: "physical",
    track_stock: true,
    variants: "",
  });

  const loadProducts = useCallback(async () => {
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
          perPage: metaData.per_page ?? metaData.perPage ?? 12,
          lastPage: metaData.last_page ?? metaData.lastPage ?? 1,
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
  }, [page, notify]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price) {
      notify("Please fill in required fields");
      return;
    }

    const method = editingId ? "PUT" : "POST";
    const url = editingId ? `${API}/user/shop/products/${editingId}` : `${API}/user/shop/products`;

    try {
      const body: Record<string, any> = {
        name: formData.name,
        price: parseFloat(formData.price),
        description: formData.description,
        category: formData.category,
        stock: parseInt(formData.stock) || 0,
        product_type: formData.product_type,
        track_stock: formData.track_stock,
      };

      if (formData.variants.trim()) {
        try {
          body.variants = JSON.parse(formData.variants);
        } catch {
          notify("Invalid JSON for variants");
          return;
        }
      }

      const res = await authFetch(url, {
        method,
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify(body),
      });

      const json = await res.json().catch(() => ({}));

      if (res.ok) {
        const productId = editingId || json.result?.uniqueId || json.result?.id;
        if (pendingImages.length > 0 && productId) {
          await uploadImagesForProduct(productId, pendingImages);
          setPendingImages([]);
          setImagePreviewUrls([]);
        }
        notify(editingId ? "Product updated!" : "Product created!");
        setShowForm(false);
        setEditingId(null);
        setFormData({ name: "", price: "", description: "", category: "", stock: "", product_type: "physical", track_stock: true, variants: "" });
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

  const handleImageUpload = async (productId: string, file: File) => {
    setUploadingImage(true);
    try {
      const form = new FormData();
      form.append("images", file);
      const res = await authFetch(`${API}/user/shop/products/${productId}/images`, {
        method: "POST",
        headers: authHeaders(),
        body: form,
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json.result) {
        notify("Image uploaded!");
        loadProducts();
      } else {
        notify(json.data || json.message || "Failed to upload image");
      }
    } catch (err: any) {
      if (err.name !== "AuthExpiredError") notify("Error uploading image");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleDeleteImage = async (productId: string, publicId: string) => {
    if (!confirm("Delete this image?")) return;
    try {
      const res = await authFetch(`${API}/user/shop/products/${productId}/images/${encodeURIComponent(publicId)}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      if (res.ok) {
        notify("Image deleted");
        loadProducts();
      } else {
        notify("Failed to delete image");
      }
    } catch (err: any) {
      if (err.name !== "AuthExpiredError") notify("Error deleting image");
    }
  };

  const handleEdit = (product: Product) => {
    setFormData({
      name: product.name,
      price: product.price.toString(),
      description: product.description || "",
      category: product.category || "",
      stock: product.stock.toString(),
      product_type: product.product_type || "physical",
      track_stock: product.trackStock ?? true,
      variants: product.variants ? JSON.stringify(product.variants, null, 2) : "",
    });
    setEditingId(product.uniqueId);
    setPendingImages([]);
    setImagePreviewUrls([]);
    setShowForm(true);
  };

  const uploadImagesForProduct = async (productId: string, files: File[]) => {
    for (const file of files) {
      const form = new FormData();
      form.append("images", file);
      const res = await authFetch(`${API}/user/shop/products/${productId}/images`, {
        method: "POST",
        headers: authHeaders(),
        body: form,
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.result) {
        notify(json.data || json.message || "Failed to upload an image");
      }
    }
    loadProducts();
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
              if (showForm) {
                setEditingId(null);
                setPendingImages([]);
                setImagePreviewUrls([]);
                setFormData({ name: "", price: "", description: "", category: "", stock: "", product_type: "physical", track_stock: true, variants: "" });
              }
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
                <div>
                  <label className="block text-sm text-muted-foreground mb-2">Product Type</label>
                  <select
                    value={formData.product_type}
                    onChange={(e) => setFormData({ ...formData, product_type: e.target.value })}
                    className="w-full bg-[#11111a] border border-[#23242A] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#9d8df1]"
                  >
                    <option value="physical">Physical</option>
                    <option value="digital">Digital</option>
                  </select>
                </div>
                <div className="flex items-center gap-3 pt-6">
                  <input
                    id="track_stock"
                    type="checkbox"
                    checked={formData.track_stock}
                    onChange={(e) => setFormData({ ...formData, track_stock: e.target.checked })}
                    className="h-4 w-4 rounded border-[#23242A] bg-[#11111a] text-[#9d8df1] focus:ring-[#9d8df1]"
                  />
                  <label htmlFor="track_stock" className="text-sm text-muted-foreground">Track stock</label>
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
              <div>
                <label className="block text-sm text-muted-foreground mb-2">Variants (JSON, optional)</label>
                <textarea
                  value={formData.variants}
                  onChange={(e) => setFormData({ ...formData, variants: e.target.value })}
                  className="w-full bg-[#11111a] border border-[#23242A] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#9d8df1] resize-none font-mono text-xs"
                  rows={3}
                  placeholder='{ "sizes": ["S", "M", "L"], "colors": ["Red", "Blue"] }'
                />
              </div>
              <div>
                <label className="block text-sm text-muted-foreground mb-2">Product Images</label>
                <div className="flex flex-wrap gap-3 mb-3">
                  {imagePreviewUrls.map((url, idx) => (
                    <div key={idx} className="relative h-24 w-24 rounded-xl overflow-hidden border border-[#23242A]">
                      <img src={url} alt="Preview" className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => {
                          setPendingImages((prev) => prev.filter((_, i) => i !== idx));
                          setImagePreviewUrls((prev) => prev.filter((_, i) => i !== idx));
                        }}
                        className="absolute top-1 right-1 h-5 w-5 rounded-full bg-red-500 text-white flex items-center justify-center"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  <label className="h-24 w-24 rounded-xl border border-dashed border-white/20 flex flex-col items-center justify-center cursor-pointer hover:border-[#9d8df1] transition-colors">
                    <Upload className="h-5 w-5 text-white/40" />
                    <span className="text-[11px] text-white/40 mt-1">Upload</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = () => {
                            const result = reader.result as string;
                            setPendingImages((prev) => [...prev, file]);
                            setImagePreviewUrls((prev) => [...prev, result]);
                          };
                          reader.readAsDataURL(file);
                        }
                        e.target.value = "";
                      }}
                    />
                  </label>
                </div>
                <p className="text-xs text-muted-foreground">You can upload images here while creating/editing, or use the uploader on each product card after saving.</p>
              </div>
              <div className="flex gap-3 justify-end pt-4 border-t border-[#23242A]">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                    setPendingImages([]);
                    setImagePreviewUrls([]);
                    setFormData({ name: "", price: "", description: "", category: "", stock: "", product_type: "physical", track_stock: true, variants: "" });
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
                  className="group relative"
                >
                  <TreasuryCard
                    productName={product.name}
                    category={product.category || "Uncategorized"}
                    price={`${product.currency} ${product.price.toLocaleString()}`}
                    stock={product.stock}
                    isActive={product.isActive}
                    imageCount={product.images.length}
                  />
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    <button
                      onClick={() => handleEdit(product)}
                      className="h-7 w-7 rounded-lg border border-[#23242A] text-muted-foreground hover:text-white hover:border-[#9d8df1] flex items-center justify-center transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(product.uniqueId)}
                      className="h-7 w-7 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 flex items-center justify-center transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
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
                    disabled={page >= meta.lastPage}
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
