import { notFound } from 'next/navigation';
import { products, getProductById } from '@/data/products';
import ProductDetailClient from '@/components/ProductDetailClient';

export async function generateStaticParams() {
  return products.map((product) => ({
    id: product.id.toString(),
  }));
}

export default function ProductPage({ params }: { params: { id: string } }) {
  const product = getProductById(parseInt(params.id));

  if (!product) {
    notFound();
  }

  return <ProductDetailClient product={product} />;
}
