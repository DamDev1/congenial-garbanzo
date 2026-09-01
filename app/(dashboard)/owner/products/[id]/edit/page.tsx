import { getBrands, getProduct } from '@/lib/actions/product';
import ProductForm from '../../new/ProductForm';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const [brands, product] = await Promise.all([
    getBrands(),
    getProduct(params.id)
  ]);

  return (
    <div className="space-y-6 max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center gap-4">
        <Link href="/owner/products" className="w-10 h-10 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-800 hover:shadow-sm transition-all">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Edit Product</h2>
          <p className="text-slate-500 font-medium mt-1">Update pricing and details for {product.name}.</p>
        </div>
      </div>

      <div className="glass rounded-3xl p-8 shadow-sm border border-slate-100/50">
        <ProductForm brands={brands} initialData={product} />
      </div>
    </div>
  );
}
