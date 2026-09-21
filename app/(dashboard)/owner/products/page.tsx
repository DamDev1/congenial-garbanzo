import { getProducts } from '@/lib/actions/product';
import ProductsClient from './ProductsClient';

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <ProductsClient products={products} />
  );
}
