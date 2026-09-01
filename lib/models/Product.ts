import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  brandId: mongoose.Types.ObjectId;
  costPrice: number;
  sellingPrice: number;
  packSize: number; // e.g. 12 bottles per pack
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    brandId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Brand',
      required: true,
    },
    costPrice: { type: Number, required: true },
    sellingPrice: { type: Number, required: true },
    packSize: { type: Number, required: true, default: 1 },
    image: { type: String },
  },
  { timestamps: true }
);

const Product: Model<IProduct> = mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);

export default Product;
