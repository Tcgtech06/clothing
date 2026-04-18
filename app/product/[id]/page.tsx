import { notFound } from 'next/navigation';
import { products, getProductById } from '@/data/products';
import ProductDetailClient from '@/components/ProductDetailClient';

export async function generateStaticParams() {
  return products.map((product) => ({
    id: product.id.toString(),
  }));
}

type Props = {
  params: Promise<{ id: string }>;
};

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  const product = getProductById(parseInt(id));

  if (!product) {
    notFound();
  }

  return <ProductDetailClient product={product} />;
}
