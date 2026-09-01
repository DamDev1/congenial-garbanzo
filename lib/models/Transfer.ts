import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITransferItem {
  productId: mongoose.Types.ObjectId;
  quantity: number;
}

export interface ITransfer extends Document {
  sourceBranchId: mongoose.Types.ObjectId;
  destinationBranchId: mongoose.Types.ObjectId;
  initiatedBy: mongoose.Types.ObjectId;
  receivedBy?: mongoose.Types.ObjectId;
  items: ITransferItem[];
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

const TransferItemSchema = new Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  quantity: { type: Number, required: true },
});

const TransferSchema: Schema = new Schema(
  {
    sourceBranchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      required: true,
    },
    destinationBranchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      required: true,
    },
    initiatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    receivedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    items: {
      type: [TransferItemSchema],
      required: true,
      validate: [
        (v: any[]) => v.length > 0,
        'A transfer must have at least one item',
      ],
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'cancelled'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

const Transfer: Model<ITransfer> = mongoose.models.Transfer || mongoose.model<ITransfer>('Transfer', TransferSchema);

export default Transfer;
