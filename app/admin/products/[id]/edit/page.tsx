'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ProductWizard } from '../../_components/product-wizard';
import { productService } from '../../../_services/product.service';
import { AdminProduct } from '../../../_types';

export default function ProductEditPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<AdminProduct | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      productService.getById(id as string).then((data) => {
        setProduct(data || null);
        setLoading(false);
      });
    }
  }, [id]);

  if (loading) {
    return <div className="flex justify-center items-center h-64 text-slate-500">Loading product...</div>;
  }

  if (!product) {
    return <div className="flex justify-center items-center h-64 text-red-500">Product not found.</div>;
  }

  return <ProductWizard mode="edit" initialProduct={product} />;
}
