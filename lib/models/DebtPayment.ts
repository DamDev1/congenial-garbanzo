import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IDebtPayment extends Document {
  branchId: mongoose.Types.ObjectId;
  cashierId: mongoose.Types.ObjectId;
  customerId: mongoose.Types.ObjectId;
  amountPaid: number;
  cashAmount: number;
  transferAmount: number;
  paymentMethod: 'cash' | 'transfer' | 'split';
  createdAt: Date;
  updatedAt: Date;
}

const DebtPaymentSchema: Schema = new Schema(
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
      required: true,
    },
    amountPaid: { type: Number, required: true },
    cashAmount: { type: Number, default: 0 },
    transferAmount: { type: Number, default: 0 },
    paymentMethod: {
      type: String,
      enum: ['cash', 'transfer', 'split'],
      required: true,
    },
  },
  { timestamps: true }
);

const DebtPayment: Model<IDebtPayment> = mongoose.models.DebtPayment || mongoose.model<IDebtPayment>('DebtPayment', DebtPaymentSchema);

export default DebtPayment;
