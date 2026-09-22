import { adminApiClient } from '@/lib/api-client';
import { AdminProduct, ProductFormState } from '../_types';

export function objectToFormData(obj: any, formData = new FormData(), parentKey = '') {
  if (obj === null || obj === undefined) return formData;

  if (obj instanceof File || obj instanceof Blob) {
    formData.append(parentKey, obj);
  } else if (Array.isArray(obj)) {
    obj.forEach((element, index) => {
      objectToFormData(element, formData, `${parentKey}[${index}]`);
    });
  } else if (typeof obj === 'object') {
    Object.keys(obj).forEach((key) => {
      const propName = parentKey ? `${parentKey}[${key}]` : key;
      objectToFormData(obj[key], formData, propName);
    });
  } else {
    const value = typeof obj === 'boolean' ? (obj ? 1 : 0) : obj;
    formData.append(parentKey, String(value));
  }

  return formData;
}

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

export const formatProductPayload = (data: ProductFormState): any => {
  const payload: any = {
    name: data.name,
    category_id: Number(data.category_id),
    description: data.description || '',
    status: data.status || 'active',
    is_featured: Boolean(data.is_featured),
    sku: data.sku || undefined,
    when_was_it_made: data.when_was_it_made || undefined,
    images: data.images || [],
    video: data.video || undefined,

    has_variants: Boolean(data.has_variants),
    prices_vary: data.has_variants ? Boolean(data.prices_vary) : false,
    quantities_vary: data.has_variants ? Boolean(data.quantities_vary) : false,
    skus_vary: data.has_variants ? Boolean(data.skus_vary) : false,
    processing_time_varies: data.has_variants ? Boolean(data.processing_time_varies) : false,
    max_variation_axes: data.max_variation_axes || 2,

    is_global_pricing_enabled: data.is_global_pricing_enabled ?? true,
    allow_offers: Boolean(data.allow_offers),
    max_offer_discount_percent: data.max_offer_discount_percent !== undefined ? Number(data.max_offer_discount_percent) : undefined,

    tags: data.tags || [],
    materials: (data.materials || []).map(Number).filter((n: any) => !isNaN(n) && n > 0),
    gold_solidity: (data.gold_solidity || []).map(Number).filter((n: any) => !isNaN(n) && n > 0),
    gold_purity: (data.gold_purity || []).map(Number).filter((n: any) => !isNaN(n) && n > 0),
    listing_attributes: data.listing_attributes || {},
  };

  if (data.processing_profile_id) {
    payload.processing_profile_id = Number(data.processing_profile_id);
  }
  if (data.shipping_profile_id) {
    payload.shipping_profile_id = Number(data.shipping_profile_id);
  }

  if (data.has_variants && data.variants && data.variants.length > 0) {
    payload.variants = data.variants.map((v: any) => ({
      attributes: (v.attributes || []).map(Number),
      sku: v.sku || undefined,
      weight_grams: v.weight_grams !== undefined && v.weight_grams !== null ? Number(v.weight_grams) : undefined,
      making_charges: v.making_charges !== undefined && v.making_charges !== null ? Number(v.making_charges) : undefined,
      stock_quantity: Number(v.stock_quantity || 0),
      is_active: v.is_active ?? true,
      variant_images: v.variant_images || undefined,
      prices: (v.prices || []).map((p: any) => ({
        region_id: Number(p.region_id),
        price: Number(p.price),
        compare_at_price: p.compare_at_price ? Number(p.compare_at_price) : undefined,
      })),
    }));

    const totalStock = payload.variants.reduce((sum: number, v: any) => sum + (v.stock_quantity || 0), 0);
    payload.total_stock = totalStock;
  } else {
    if (data.prices && data.prices.length > 0) {
      payload.prices = data.prices.map((p: any) => ({
        region_id: Number(p.region_id),
        price: Number(p.price),
        compare_at_price: p.compare_at_price ? Number(p.compare_at_price) : undefined,
      }));
    }
    if (data.stock_qty !== undefined) {
      payload.stock_qty = Number(data.stock_qty);
      payload.total_stock = Number(data.stock_qty);
    }
  }

  return payload;
};

export const productService = {
  getAll: async (): Promise<AdminProduct[]> => {
    const response = await adminApiClient.get('/admin/products');
    return (response.data.data || []).map(mapProduct);
  },

  getById: async (id: string): Promise<any> => {
    const response = await adminApiClient.get(`/admin/products/${id}`);
    if (response.data && (response.data.success || response.data.status)) {
      const p = response.data.data || response.data;
      return {
        ...p,
        ...mapProduct(p),
        categoryId: String(p.category_id || p.categoryId || ''),
        materials_ids: p.materials_ids || (Array.isArray(p.materials) && typeof p.materials[0] === 'number' ? p.materials : []),
        gold_solidity_ids: p.gold_solidity_ids || (Array.isArray(p.gold_solidity) && typeof p.gold_solidity[0] === 'number' ? p.gold_solidity : []),
        gold_purity_ids: p.gold_purity_ids || (Array.isArray(p.gold_purity) && typeof p.gold_purity[0] === 'number' ? p.gold_purity : []),
        materials: p.materials_ids || p.materials || [],
        gold_solidity: p.gold_solidity_ids || p.gold_solidity || [],
        gold_purity: p.gold_purity_ids || p.gold_purity || [],
        listing_attributes: p.listing_attributes || {},
        tags: p.tags || [],
        variants: p.variants || [],
        images: Array.isArray(p.images) ? p.images : (p.product_images || []).map((img: any) => img.image_path || img.url),
      };
    }
    return undefined;
  },

  create: async (data: ProductFormState): Promise<AdminProduct> => {
    const payload = formatProductPayload(data);
    const formData = objectToFormData(payload);
    const response = await adminApiClient.post('/admin/products', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return mapProduct(response.data.data);
  },

  update: async (id: string, data: Partial<ProductFormState>): Promise<AdminProduct> => {
    const payload = formatProductPayload(data as ProductFormState);
    payload._method = 'PUT'; // Laravel form-data PUT spoofing
    const formData = objectToFormData(payload);
    const response = await adminApiClient.post(`/admin/products/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return mapProduct(response.data.data);
  },

  preview: async (data: ProductFormState): Promise<any> => {
    const payload = formatProductPayload(data);
    const response = await adminApiClient.post('/admin/products/preview', payload);
    return response.data;
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
  
  // Custom Options (Buyer-filled fields)
  getCustomOptions: async (productId: string) => {
    const response = await adminApiClient.get(`/admin/products/${productId}/custom-options`);
    return response.data;
  },
  createCustomOption: async (productId: string, data: any) => {
    const response = await adminApiClient.post(`/admin/products/${productId}/custom-options`, data);
    return response.data;
  },
  updateCustomOption: async (optionId: string, data: any) => {
    const response = await adminApiClient.put(`/admin/custom-options/${optionId}`, data);
    return response.data;
  },
  deleteCustomOption: async (optionId: string) => {
    await adminApiClient.delete(`/admin/custom-options/${optionId}`);
  }
};
