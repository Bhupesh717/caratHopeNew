'use client';

import { mockProducts } from '@/lib/mock-data';
import { useCartStore } from '@/store/cart';
import { useWishlistStore } from '@/store/wishlist';
import { useAuthStore } from '@/store/auth';
import { Button } from '@/components/ui/button';
import { Heart, Star, Store, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiClient } from '@/lib/api-client';
import { Product } from '@/types';
import Image from 'next/image';
import { getCurrencySymbol } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { ProductCard } from '@/components/product-card';

export default function ProductPage({ params }: { params: { id: string } }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState<string>('');
  
  // Variations State
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [selectedVariant, setSelectedVariant] = useState<any>(null);

  // Image Zoom state
  const [isHovering, setIsHovering] = useState(false);
  const [backgroundPos, setBackgroundPos] = useState('0% 0%');

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setBackgroundPos(`${x}% ${y}%`);
  };

  // Reviews state
  const [reviews, setReviews] = useState<any[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const addToCart = useCartStore((state) => state.addItem);
  const { toggleWishlist, isInWishlist } = useWishlistStore();
  const { isAuthenticated, user } = useAuthStore();

  const inWishlist = product ? isInWishlist(product.id) : false;

  useEffect(() => {
    async function fetchProductDetail() {
      try {
        setLoading(true);
        const response = await apiClient.get(`/public/products/${params.id}`);
        if (response.data && response.data.success && response.data.data) {
          const p = response.data.data;

          // Map product detail
          let allImages: string[] = [];
          if (Array.isArray(p.images) && p.images.length > 0) {
            allImages = p.images;
          } else if (p.product_images && p.product_images.length > 0) {
            const sortedImgs = [...p.product_images].sort((a: any, b: any) => (b.is_primary ? 1 : 0) - (a.is_primary ? 1 : 0));
            allImages = sortedImgs.map((i: any) => i.image_path);
          } else {
            allImages = [p.images || 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&h=800&fit=crop'];
          }
          const imagePath = allImages[0];

          // Country detection is handled by backend via IP (no frontend code needed)
          let price = p.discount_price ? Number(p.discount_price) : Number(p.price);
          let originalPrice = p.discount_price ? Number(p.price) : undefined;
          let currency = p.display_currency || 'INR';

          const mappedProd: Product = {
            id: String(p.id),
            name: p.name,
            price,
            originalPrice,
            currency,
            category: p.category?.name || 'Jewelry',
            image: imagePath,
            description: p.description || '',
            rating: 0, // Will be updated by reviews
            reviews: 0,
            images: allImages,
            has_variants: Boolean(p.has_variants),
            variants: p.variants || [],
            variation_axes: p.variation_axes || [],
          };
          setProduct(mappedProd);
          setActiveImage(allImages[0]);

          // Initialize variations if any
          if (mappedProd.has_variants && mappedProd.variation_axes && mappedProd.variation_axes.length > 0) {
            const initialOptions: Record<string, string> = {};
            mappedProd.variation_axes.forEach((axis: any) => {
              if (axis.values && axis.values.length > 0) {
                initialOptions[axis.id] = String(axis.values[0].id);
              }
            });
            setSelectedOptions(initialOptions);
          }

          fetchReviews(p.id);

          // Fetch related products in the same category
          const categoryId = p.category_id || p.category?.id;
          if (categoryId) {
            const relResponse = await apiClient.get(`/public/products?category_id=${categoryId}&per_page=5`);
            if (relResponse.data && relResponse.data.success && Array.isArray(relResponse.data.data)) {
              const mappedRel: Product[] = relResponse.data.data
                .filter((item: any) => item.id !== p.id)
                .slice(0, 4)
                .map((item: any) => {
                  return {
                    id: String(item.id),
                    name: item.name,
                    price: item.discount_price ? Number(item.discount_price) : Number(item.price),
                    originalPrice: item.discount_price ? Number(item.price) : undefined,
                    currency: item.display_currency || 'INR',
                    category: item.category?.name || 'Jewelry',
                    image: item.images || item.product_images?.[0]?.image_path || 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&h=800&fit=crop',
                    description: item.description || '',
                  };
                });
              setRelatedProducts(mappedRel);
            }
          }
        } else {
          runLocalMockFallback();
        }
      } catch (err) {
        console.error('Error loading product details:', err);
        runLocalMockFallback();
      } finally {
        setLoading(false);
      }
    }

    function runLocalMockFallback() {
      const p = mockProducts.find((item) => item.id === params.id);
      if (p) {
        setProduct({ ...p, images: [p.image] });
        setActiveImage(p.image);
        const rel = mockProducts
          .filter((item) => item.category === p.category && item.id !== p.id)
          .slice(0, 4);
        setRelatedProducts(rel);
      } else {
        setProduct(null);
        setRelatedProducts([]);
      }
    }

    fetchProductDetail();
  }, [params.id]);

  // Update selected variant when options change
  useEffect(() => {
    if (product && product.has_variants && product.variants) {
      const variant = product.variants.find((v: any) => {
        // match attributes array (which might be an array of IDs)
        // against selectedOptions values.
        if (!v.attributes || v.attributes.length === 0) return false;
        const selectedValues = Object.values(selectedOptions).map(String);
        return selectedValues.every(val => v.attributes.map(String).includes(val));
      });
      setSelectedVariant(variant || null);
    }
  }, [selectedOptions, product]);

  const currentPrice = selectedVariant 
    ? (selectedVariant.price || product?.price || 0)
    : (product?.price || 0);

  const currentOriginalPrice = selectedVariant?.compare_at_price 
    ? selectedVariant.compare_at_price 
    : (selectedVariant ? undefined : product?.originalPrice);

  const fetchReviews = async (productId: number) => {
    try {
      setLoadingReviews(true);
      const res = await apiClient.get(`/public/products/${productId}/reviews`);
      if (res.data && res.data.success) {
        setReviews(res.data.data);

        // Update product rating based on reviews
        if (res.data.data.length > 0) {
          const totalRating = res.data.data.reduce((acc: number, curr: any) => acc + curr.rating, 0);
          const avgRating = totalRating / res.data.data.length;
          setProduct((prev) => prev ? { ...prev, rating: Number(avgRating.toFixed(1)), reviews: res.data.data.length } : prev);
        }
      }
    } catch (err) {
      console.error('Failed to load reviews', err);
    } finally {
      setLoadingReviews(false);
    }
  };

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please login to submit a review');
      return;
    }

    try {
      setSubmittingReview(true);
      const res = await apiClient.post(`/public/products/${params.id}/reviews`, {
        rating: reviewRating,
        comment: reviewComment
      });
      if (res.data && res.data.success) {
        toast.success('Review submitted successfully!');
        setReviewComment('');
        setReviewRating(5);
        fetchReviews(Number(params.id));
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="border-t border-neutral-200">
        <div className="mx-auto max-w-7xl px-6 py-12 text-center">
          <h1 className="text-3xl font-light text-neutral-900">Product Not Found</h1>
          <Button asChild className="mt-4 bg-neutral-900 text-white hover:bg-neutral-800">
            <Link href="/shop" className="inline-block">
              Back to Shop
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="border-t border-neutral-200">
      {/* Product Section */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
        <div className="grid gap-12 lg:grid-cols-12 lg:items-start">
          {/* Multi-Image Gallery */}
          <div className="lg:col-span-7 flex flex-col-reverse sm:flex-row gap-4 lg:sticky lg:top-32 z-10">
            {/* Thumbnails */}
            {product.images && product.images.length > 0 && (
              <div className="flex sm:flex-col gap-3 overflow-x-auto sm:overflow-y-auto max-h-[600px] no-scrollbar py-1 sm:w-20 sm:shrink-0">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(img)}
                    className={`relative shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 transition-all ${activeImage === img ? 'border-neutral-900 shadow-sm' : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                  >
                    <Image src={img} alt={`${product.name} ${idx + 1}`} fill sizes="5rem" className="object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Main Image */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="flex-1 w-full h-[400px] sm:h-[500px] lg:h-[550px] overflow-hidden rounded-lg bg-neutral-100 relative group cursor-crosshair"
              onMouseMove={handleMouseMove}
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeImage}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="absolute inset-0"
                >
                  <Image
                    src={activeImage}
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className={`object-cover transition-opacity duration-300 ${isHovering ? 'opacity-0' : 'opacity-100'}`}
                  />

                  {/* Zoom Overlay */}
                  <div
                    className={`absolute inset-0 w-full h-full bg-no-repeat transition-opacity duration-300 pointer-events-none ${isHovering ? 'opacity-100' : 'opacity-0'}`}
                    style={{
                      backgroundImage: `url(${activeImage})`,
                      backgroundPosition: backgroundPos,
                      backgroundSize: '250%'
                    }}
                  />
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </div>

          {/* Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="lg:col-span-5 space-y-4"
          >
            <div>
              <p className="mb-2 text-sm uppercase text-neutral-600">{product.category}</p>
              <h1 className="text-4xl font-light text-neutral-900">{product.name}</h1>
            </div>

            {product.rating !== undefined && product.rating > 0 ? (
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${i < Math.round(product.rating!) ? 'fill-yellow-500 text-yellow-500' : 'text-neutral-300'}`}
                    />
                  ))}
                </div>
                <span className="text-sm text-neutral-600">
                  {product.rating} ({product.reviews} reviews)
                </span>
              </div>
            ) : (
              <div className="text-sm text-neutral-500 italic">No reviews yet</div>
            )}

            <div className="border-t border-b border-neutral-200 py-6">
              <div className="flex flex-col">
                {currentOriginalPrice && currentOriginalPrice > currentPrice && (
                  <span className="text-xl line-through text-neutral-400">
                    {getCurrencySymbol(product.currency)}
                    {currentOriginalPrice.toLocaleString()}
                  </span>
                )}
                <p className="text-4xl font-light text-neutral-900">
                  {getCurrencySymbol(product.currency)}
                  {currentPrice.toLocaleString()}
                </p>
                {selectedVariant && selectedVariant.stock_quantity !== undefined && (
                  <p className={`text-sm mt-2 font-medium ${selectedVariant.stock_quantity > 0 ? 'text-green-600' : 'text-red-500'}`}>
                    {selectedVariant.stock_quantity > 0 ? 'In Stock' : 'Out of Stock'}
                  </p>
                )}
              </div>
            </div>

            {/* Dynamic Variation Selection */}
            {product.has_variants && product.variation_axes && product.variation_axes.length > 0 && (
              <div className="space-y-6 pt-2 pb-6 border-b border-neutral-200">
                {product.variation_axes.map((axis: any) => (
                  <div key={axis.id}>
                    <span className="text-xs font-semibold uppercase tracking-wider text-neutral-900 block mb-3">{axis.name}</span>
                    <div className="flex flex-wrap gap-2">
                      {axis.values?.map((val: any) => {
                        const isSelected = selectedOptions[axis.id] === String(val.id);
                        return (
                          <button
                            key={val.id}
                            onClick={() => setSelectedOptions({ ...selectedOptions, [axis.id]: String(val.id) })}
                            className={`px-4 py-2 text-sm border flex items-center justify-center transition-colors ${
                              isSelected
                                ? 'border-emerald-dark bg-emerald-dark text-white'
                                : 'border-neutral-200 text-neutral-600 hover:border-emerald-dark hover:text-emerald-dark'
                            }`}
                          >
                            {val.value}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Quantity and Store Availability */}
            <div className="space-y-5 py-6">
              
              <div className="flex items-center gap-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-neutral-900">Quantity</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="h-10 w-10 rounded border border-neutral-200 hover:bg-neutral-100"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    className="h-10 w-16 rounded border border-neutral-200 text-center"
                  />
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="h-10 w-10 rounded border border-neutral-200 hover:bg-neutral-100"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Store Availability Badge */}
              <div className="flex items-start gap-3 bg-[#FAF6EE] p-3.5 rounded-md border border-[#c9a96e]/30">
                <Store className="h-4 w-4 text-gold-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-emerald-dark uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    Available in Store <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                  </p>
                  <p className="text-xs text-neutral-600 leading-relaxed">Visit our Jaipur Studio to view or purchase this piece directly.</p>
                </div>
              </div>
              <div className="flex gap-4 pt-2">
                <Button
                  onClick={() => {
                    addToCart(product, quantity, selectedVariant?.id, selectedOptions);
                    setQuantity(1);
                  }}
                  disabled={product.has_variants && (!selectedVariant || selectedVariant.stock_quantity === 0)}
                  className="flex-1 bg-emerald-dark text-white hover:bg-[#0B3D2E]/90 hover:text-gold-primary h-12 uppercase tracking-wider font-semibold text-xs transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {product.has_variants && selectedVariant?.stock_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                </Button>
                <Button
                  onClick={() => toggleWishlist(product)}
                  variant="outline"
                  className="border-neutral-200 h-12 w-12 p-0"
                >
                  <Heart
                    className="h-5 w-5"
                    fill={inWishlist ? '#dc2626' : 'none'}
                    color={inWishlist ? '#dc2626' : 'currentColor'}
                  />
                </Button>
              </div>
            </div>

            {/* Additional Info */}
            <div className="space-y-4 border-t border-neutral-200 pt-6">
              {/* <div>
                <h3 className="mb-2 font-medium text-neutral-900 text-sm uppercase tracking-wider">Shipping Info</h3>
                <p className="text-sm text-neutral-600">Free shipping on orders over $100</p>
              </div> */}
              <div>
                <h3 className="mb-2 font-medium text-neutral-900 text-sm uppercase tracking-wider">Returns</h3>
                <p className="text-sm text-neutral-600">30-day return policy for all items</p>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="border-t border-neutral-200 pt-6">
              <p className="text-xs uppercase tracking-widest text-neutral-400 mb-3">Secure Payment</p>
              <div className="flex flex-wrap gap-3 items-center">
                <Image src="/visa.png" alt="Visa" width={65} height={40} className="h-10 w-auto rounded-md object-contain bg-white border border-neutral-200/60 px-2.5 py-1.5 shadow-2xs" />
                <Image src="/card.png" alt="Mastercard" width={65} height={40} className="h-10 w-auto rounded-md object-contain bg-white border border-neutral-200/60 px-2.5 py-1.5 shadow-2xs" />
                <Image src="/paypal.png" alt="PayPal" width={65} height={40} className="h-10 w-auto rounded-md object-contain bg-white border border-neutral-200/60 px-2.5 py-1.5 shadow-2xs" />
                <Image src="/apple-pay.png" alt="Apple Pay" width={65} height={40} className="h-10 w-auto rounded-md object-contain bg-white border border-neutral-200/60 px-2.5 py-1.5 shadow-2xs" />
                <Image src="/stripe.png" alt="Stripe" width={65} height={40} className="h-10 w-auto rounded-md object-contain bg-white border border-neutral-200/60 px-2.5 py-1.5 shadow-2xs" />
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Tabs Section for Description and Reviews */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 border-t border-neutral-200">
        <Tabs defaultValue="details" className="w-full">
          <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent space-x-8">
            <TabsTrigger
              value="details"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-gold-primary data-[state=active]:text-emerald-dark text-slate-500 hover:text-emerald-dark transition-colors data-[state=active]:shadow-none px-0 py-4 font-medium text-base data-[state=active]:bg-transparent"
            >
              Product Details
            </TabsTrigger>
            <TabsTrigger
              value="description"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-gold-primary data-[state=active]:text-emerald-dark text-slate-500 hover:text-emerald-dark transition-colors data-[state=active]:shadow-none px-0 py-4 font-medium text-base data-[state=active]:bg-transparent"
            >
              Product Description
            </TabsTrigger>
            <TabsTrigger
              value="reviews"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-gold-primary data-[state=active]:text-emerald-dark text-slate-500 hover:text-emerald-dark transition-colors data-[state=active]:shadow-none px-0 py-4 font-medium text-base data-[state=active]:bg-transparent flex items-center gap-2"
            >
              Reviews {product.reviews !== undefined && <span className="bg-emerald-dark/10 text-emerald-dark text-xs px-2 py-0.5 rounded-full">{product.reviews}</span>}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="pt-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="max-w-md space-y-4">
              <div className="grid grid-cols-2 gap-4 py-3 border-b border-neutral-100">
                <span className="text-neutral-500 text-sm">Category</span>
                <span className="text-neutral-900 font-medium text-sm">{product.category}</span>
              </div>
              <div className="grid grid-cols-2 gap-4 py-3 border-b border-neutral-100">
                <span className="text-neutral-500 text-sm">SKU</span>
                <span className="text-neutral-900 font-medium text-sm">{product.id ? `SKU-${product.id}` : 'N/A'}</span>
              </div>
              <div className="grid grid-cols-2 gap-4 py-3 border-b border-neutral-100">
                <span className="text-neutral-500 text-sm">Availability</span>
                <span className="text-neutral-900 font-medium text-sm">
                  {/* Assuming stock > 0 if it's available to buy */}
                  In Stock
                </span>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="description" className="pt-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {product.description ? (
              <div
                className="text-neutral-600 leading-relaxed prose prose-sm sm:prose-base max-w-none prose-neutral"
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
            ) : (
              <p className="text-neutral-500 italic">No detailed description provided for this product.</p>
            )}
          </TabsContent>

          <TabsContent value="reviews" className="pt-8">
            <div className="grid md:grid-cols-[1fr_300px] gap-12">
              <div className="space-y-8">
                <h3 className="text-xl font-medium text-neutral-900">Customer Reviews</h3>

                {loadingReviews ? (
                  <div className="py-8 flex justify-center">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  </div>
                ) : reviews.length > 0 ? (
                  <div className="space-y-6">
                    {reviews.map((review) => (
                      <div key={review.id} className="border-b border-neutral-100 pb-6 last:border-0">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3.5 w-3.5 ${i < review.rating ? 'fill-yellow-500 text-yellow-500' : 'text-neutral-200'}`}
                              />
                            ))}
                          </div>
                          <span className="text-sm font-medium text-neutral-900">{review.user?.name || 'Customer'}</span>
                          <span className="text-xs text-neutral-400">• {new Date(review.created_at).toLocaleDateString()}</span>
                        </div>
                        {review.comment && <p className="text-neutral-600 text-sm mt-2">{review.comment}</p>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-neutral-500 text-sm py-8 bg-neutral-50 text-center rounded-lg border border-neutral-100">
                    No reviews yet. Be the first to review this product!
                  </div>
                )}
              </div>

              <div className="bg-neutral-50 p-6 rounded-lg border border-neutral-100 h-fit">
                <h3 className="text-lg font-medium text-neutral-900 mb-4">Write a Review</h3>

                {!isAuthenticated ? (
                  <div className="text-center space-y-4">
                    <p className="text-sm text-neutral-600">You must be logged in to leave a review.</p>
                    <Button asChild className="w-full bg-neutral-900">
                      <Link href="/login" className="block w-full">
                        Login to Review
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={submitReview} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">Rating</label>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setReviewRating(star)}
                            className="p-1 focus:outline-none"
                          >
                            <Star
                              className={`h-6 w-6 ${star <= reviewRating ? 'fill-yellow-500 text-yellow-500' : 'text-neutral-300'}`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">Review (Optional)</label>
                      <textarea
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        className="w-full px-3 py-2 border border-neutral-200 rounded-md focus:outline-none focus:ring-1 focus:ring-neutral-900 text-sm min-h-[100px] resize-y"
                        placeholder="Share your thoughts about this product..."
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={submittingReview}
                      className="w-full bg-neutral-900"
                    >
                      {submittingReview ? 'Submitting...' : 'Submit Review'}
                    </Button>
                  </form>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="border-t border-neutral-200 bg-neutral-50 py-12">
          <div className="mx-auto max-w-7xl px-6">
            <h2 className="mb-8 text-3xl font-light text-neutral-900">Related Products</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
