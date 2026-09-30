import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IStockHistory extends Document {
  inventoryId: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;
  branchId: mongoose.Types.ObjectId;
  previousQuantity: number;
  quantityAdded: number;
  newQuantity: number;
  addedBy?: string; // user name or ID
  createdAt: Date;
  updatedAt: Date;
}

const StockHistorySchema: Schema = new Schema(
  {
    inventoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Inventory',
      required: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      required: true,
    },
    previousQuantity: { type: Number, required: true },
    quantityAdded: { type: Number, required: true },
    newQuantity: { type: Number, required: true },
    addedBy: { type: String },
  },
  { timestamps: true }
);

// Index for fast lookups by product + branch
StockHistorySchema.index({ productId: 1, branchId: 1, createdAt: -1 });

const StockHistory: Model<IStockHistory> = mongoose.models.StockHistory || mongoose.model<IStockHistory>('StockHistory', StockHistorySchema);

export default StockHistory;
