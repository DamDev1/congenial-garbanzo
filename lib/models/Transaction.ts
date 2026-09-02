import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITransactionItem {
  productId: mongoose.Types.ObjectId;
  name: string;
  quantity: number;
  price: number;
}

export interface ITransaction extends Document {
  branchId: mongoose.Types.ObjectId;
  cashierId: mongoose.Types.ObjectId;
  customerId?: mongoose.Types.ObjectId;
  items: ITransactionItem[];
  totalAmount: number;
  paymentMethod: 'cash' | 'credit';
  status: 'completed' | 'voided';
  createdAt: Date;
  updatedAt: Date;
}

const TransactionItemSchema = new Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
});

const TransactionSchema: Schema = new Schema(
  {
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      required: true,
    },
    cashierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
    },
    items: {
      type: [TransactionItemSchema],
      required: true,
      validate: [
        (v: any[]) => v.length > 0,
        'A transaction must have at least one item',
      ],
    },
    totalAmount: { type: Number, required: true },
    paymentMethod: {
      type: String,
      enum: ['cash', 'credit'],
      required: true,
    },
    status: {
      type: String,
      enum: ['completed', 'voided'],
      default: 'completed',
    },
  },
  { timestamps: true }
);

const Transaction: Model<ITransaction> = mongoose.models.Transaction || mongoose.model<ITransaction>('Transaction', TransactionSchema);

export default Transaction;
