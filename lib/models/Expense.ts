import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IExpense extends Document {
  branchId: mongoose.Types.ObjectId;
  recordedBy: mongoose.Types.ObjectId;
  amount: number;
  description: string;
  method: 'cash' | 'transfer';
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ExpenseSchema: Schema = new Schema(
  {
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      required: true,
    },
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    method: {
      type: String,
      enum: ['cash', 'transfer'],
      required: true,
      default: 'cash',
    },
    date: {
      type: Date,
      default: Date.now,
      required: true,
    },
  },
  { timestamps: true }
);

const Expense: Model<IExpense> = mongoose.models.Expense || mongoose.model<IExpense>('Expense', ExpenseSchema);

export default Expense;
