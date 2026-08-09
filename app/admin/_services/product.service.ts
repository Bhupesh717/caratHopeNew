import { adminApiClient } from '@/lib/api-client';
import { AdminProduct, AdminProductVariant, VariantPrice } from '../_types';

const mapProduct = (p: any): AdminProduct => {
  let images: string[] = [];
  
  if (typeof p.images === 'string') {
    try {
      const parsed = JSON.parse(p.images);
      images = Array.isArray(parsed) ? parsed : [p.images];
    } catch {
      images = [p.images];
    }
  } else if (p.images && Array.isArray(p.images) && typeof p.images[0] === 'string') {
    images = p.images;
  } else {
    const imgs = p.product_images || [];
    // Sort images so primary is first
    const sortedImgs = [...imgs].sort((a: any, b: any) => (b.is_primary ? 1 : 0) - (a.is_primary ? 1 : 0));
    images = sortedImgs.map((img: any) => img.image_path);
  }
  
  return {
    id: String(p.id),
    images: images.length ? images : [''],
    name: p.name,
    sku: p.sku || null,
    categoryId: String(p.category_id),
    price: p.price ? Number(p.price) : null,
    discountPrice: p.discount_price ? Number(p.discount_price) : null,
    stockQty: p.stock_qty ? Number(p.stock_qty) : null,
    description: p.description || '',
    video: p.video || null,
    details: p.details || [],
    has_variants: Boolean(p.has_variants),
    status: p.status,
    isFeatured: Boolean(p.is_featured),
    createdAt: p.created_at,
    variants: p.variants ? p.variants.map((v: any) => ({
      id: String(v.id),
      product_id: String(v.product_id),
      sku: v.sku,
      weight_grams: v.weight_grams ? Number(v.weight_grams) : null,
      making_charges: v.making_charges ? Number(v.making_charges) : null,
      stock_quantity: Number(v.stock_quantity),
      is_active: Boolean(v.is_active),
      attribute_value_ids: v.attribute_value_ids || [],
      prices: v.prices || [],
      createdAt: v.created_at,
    })) : [],
  };
};

export const productService = {
  getAll: async (): Promise<AdminProduct[]> => {
    const response = await adminApiClient.get('/admin/products');
    return (response.data.data || []).map(mapProduct);
  },

  getById: async (id: string): Promise<AdminProduct | undefined> => {
    const response = await adminApiClient.get(`/admin/products/${id}`);
    if (response.data && response.data.success) {
      return mapProduct(response.data.data);
    }
    return undefined;
  },

  create: async (data: any): Promise<AdminProduct> => {
    const payload = {
      name: data.name,
      category_id: Number(data.categoryId),
      description: data.description,
      video: data.video,
      details: data.details,
      images: data.images,
      has_variants: data.has_variants,
      sku: data.has_variants ? undefined : data.sku,
      price: data.has_variants ? undefined : data.price,
      discount_price: data.has_variants ? undefined : data.discountPrice,
      stock_qty: data.has_variants ? undefined : data.stockQty,
    };
    const response = await adminApiClient.post('/admin/products', payload);
    return mapProduct(response.data.data);
  },

  update: async (id: string, data: any): Promise<AdminProduct> => {
    const payload = {
      name: data.name,
      category_id: data.categoryId ? Number(data.categoryId) : undefined,
      description: data.description,
      video: data.video,
      details: data.details,
      images: data.images,
      sku: data.sku,
      price: data.price,
      discount_price: data.discountPrice,
      stock_qty: data.stockQty,
      has_variants: data.has_variants,
      local_prices: data.localPrices,
    };
    const response = await adminApiClient.put(`/admin/products/${id}`, payload);
    return mapProduct(response.data.data);
  },

  delete: async (id: string): Promise<void> => {
    await adminApiClient.delete(`/admin/products/${id}`);
  },

  toggleStatus: async (id: string): Promise<AdminProduct> => {
    const response = await adminApiClient.patch(`/admin/products/${id}/toggle-status`);
    return mapProduct(response.data.data);
  },

  toggleFeatured: async (id: string): Promise<AdminProduct> => {
    const response = await adminApiClient.patch(`/admin/products/${id}/toggle-featured`);
    return mapProduct(response.data.data);
  },

  generateCombinations: async (productId: string, attributesMap: Record<string, string[]>): Promise<any> => {
    // attributesMap is e.g. { "1": ["3", "4"], "2": ["5"] }
    const attributes = Object.keys(attributesMap).map(attrId => ({
      attribute_id: Number(attrId),
      attribute_value_ids: attributesMap[attrId].map(Number)
    }));
    const response = await adminApiClient.post(`/admin/products/${productId}/variants/generate-combinations`, { attributes });
    return response.data;
  },

  updateVariant: async (productId: string, variantId: string, data: any): Promise<any> => {
    const response = await adminApiClient.put(`/admin/products/${productId}/variants/${variantId}`, data);
    return response.data;
  },

  bulkUpdatePrices: async (variantId: string, prices: any[]): Promise<any> => {
    const response = await adminApiClient.put(`/admin/variants/${variantId}/prices`, { prices });
    return response.data;
  }
};
