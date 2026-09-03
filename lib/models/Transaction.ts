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
  cashAmount: number;
  transferAmount: number;
  creditAmount: number;
  paymentMethod: 'cash' | 'transfer' | 'credit' | 'split';
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
    cashAmount: { type: Number, default: 0 },
    transferAmount: { type: Number, default: 0 },
    creditAmount: { type: Number, default: 0 },
    paymentMethod: {
      type: String,
      enum: ['cash', 'transfer', 'credit', 'split'],
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

