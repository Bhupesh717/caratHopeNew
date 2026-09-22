'use client';

import { useState, useEffect } from 'react';
import { ProductCard } from '@/components/product-card';
import { mockProducts } from '@/lib/mock-data';
import { apiClient } from '@/lib/api-client';
import { Product, Category } from '@/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { PageHeader } from '@/components/page-header';
import { Sparkles } from 'lucide-react';

export default function ShopPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('featured');

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [totalProducts, setTotalProducts] = useState(0);

  // Read URL params on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const catParam = params.get('category');
      if (catParam) {
        setSelectedCategory(catParam);
      }
      const searchParam = params.get('search');
      if (searchParam) {
        setSearchQuery(searchParam);
      }
      setIsReady(true);
    }
  }, []);

  // Fetch categories once on mount
  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await apiClient.get('/public/categories');
        if (response.data && response.data.success && response.data.data.length > 0) {
          const mappedCats = response.data.data.map((c: any) => ({
            id: String(c.id),
            name: c.name,
            slug: c.slug,
            image: c.image || '',
          }));
          setCategories(mappedCats);
        } else {
          // fallback to mock category names
          setCategories([
            { id: 'necklaces', name: 'Necklaces', slug: 'necklaces', image: '' },
            { id: 'rings', name: 'Rings', slug: 'rings', image: '' },
            { id: 'bracelets', name: 'Bracelets', slug: 'bracelets', image: '' },
            { id: 'earrings', name: 'Earrings', slug: 'earrings', image: '' },
          ]);
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    }
    fetchCategories();
  }, []);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchQuery, sortBy]);

  // Fetch products when query filters or page change
  useEffect(() => {
    if (!isReady) return;

    async function fetchProducts() {
      try {
        if (currentPage === 1) setLoading(true);
        else setLoadingMore(true);

        const params: Record<string, any> = {
          per_page: 12,
          page: currentPage,
        };
        if (selectedCategory !== 'all') {
          params.category_id = selectedCategory;
        }
        if (searchQuery) {
          params.search = searchQuery;
        }
        if (sortBy === 'price-low') {
          params.sort_by = 'price_asc';
        } else if (sortBy === 'price-high') {
          params.sort_by = 'price_desc';
        } else if (sortBy === 'newest') {
          params.sort_by = 'newest';
        }

        const response = await apiClient.get('/public/products', { params });
        if (response.data && response.data.success && Array.isArray(response.data.data)) {
          const mappedProds: Product[] = response.data.data.map((p: any) => ({
            id: String(p.id),
            name: p.name,
            price: p.discount_price ? Number(p.discount_price) : Number(p.price),
            originalPrice: p.discount_price ? Number(p.price) : undefined,
            currency: p.display_currency || 'INR',
            category: p.category?.name || 'Jewelry',
            image: p.images || p.product_images?.[0]?.image_path || 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?w=800&h=800&fit=crop',
            description: p.description || '',
            rating: p.avg_rating ? Number(Number(p.avg_rating).toFixed(1)) : 5,
            reviews: p.reviews_count || 0,
            has_variants: Boolean(p.has_variants),
          }));

          if (currentPage === 1) {
            setProducts(mappedProds);
          } else {
            setProducts(prev => [...prev, ...mappedProds]);
          }

          const meta = response.data.meta || {};
          setHasMore(meta.current_page < meta.last_page);
          setTotalProducts(meta.total || mappedProds.length);
        } else {
          runLocalMockFilter();
        }
      } catch (err) {
        console.error('Error fetching public products list:', err);
        runLocalMockFilter();
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    }

    function runLocalMockFilter() {
      let filtered = mockProducts;
      if (selectedCategory !== 'all') {
        filtered = filtered.filter((p) => p.category === selectedCategory);
      }
      if (searchQuery) {
        filtered = filtered.filter(
          (p) =>
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.description.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      if (sortBy === 'price-low') {
        filtered = [...filtered].sort((a, b) => a.price - b.price);
      } else if (sortBy === 'price-high') {
        filtered = [...filtered].sort((a, b) => b.price - a.price);
      }
      if (currentPage === 1) {
        setProducts(filtered);
      } else {
        setProducts(prev => [...prev, ...filtered]);
      }
      setHasMore(false);
      setTotalProducts(filtered.length);
    }

    fetchProducts();
  }, [selectedCategory, searchQuery, sortBy, isReady, currentPage]);

  return (
    <div className="border-t border-neutral-200">
      <PageHeader
        eyebrow="Shop"
        icon={Sparkles}
        title="Our"
        accentTitle="Collection"
        subtitle="Explore our finest jewelry pieces, ethically sourced and masterfully crafted."
        imageSrc="/page_heaer.png"
      />

      {/* Filters and Products */}
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-12 grid gap-6 sm:grid-cols-4">
          {/* Search */}
          <Input
            placeholder="Search jewelry..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border-neutral-200 placeholder:text-neutral-400"
          />

          {/* Category Filter */}
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="border-neutral-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Sort */}
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="border-neutral-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="featured">Featured</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="newest">Newest</SelectItem>
            </SelectContent>
          </Select>

          {/* Results Count */}
          <div className="flex items-center text-sm text-neutral-600">
            Showing {products.length} of {totalProducts || products.length} results
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-24">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : products.length > 0 ? (
          <>
            <motion.div
              layout
              className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
            >
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </motion.div>

            {/* Load More Button */}
            {hasMore && (
              <div className="mt-12 flex justify-center">
                <Button
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  disabled={loadingMore}
                  className="bg-neutral-900 text-white hover:bg-neutral-800 px-10 py-6 rounded-xl transition-all"
                >
                  {loadingMore ? (
                    <span className="flex items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Loading...
                    </span>
                  ) : (
                    'Load More Products'
                  )}
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center gap-4 py-16">
            <p className="text-neutral-600">No products found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}
