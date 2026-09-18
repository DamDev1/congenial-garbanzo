import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPosExchange extends Document {
  branchId: mongoose.Types.ObjectId;
  recordedBy: mongoose.Types.ObjectId;
  agentName?: string;
  cashGiven: number;
  transferReceived: number;
  fee: number;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PosExchangeSchema: Schema = new Schema(
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
    agentName: {
      type: String,
      trim: true,
    },
    cashGiven: {
      type: Number,
      required: true,
      min: 0,
    },
    transferReceived: {
      type: Number,
      required: true,
      min: 0,
    },
    fee: {
      type: Number,
      default: 0,
    },
    date: {
      type: Date,
      default: Date.now,
      required: true,
    },
  },
  { timestamps: true }
);

const PosExchange: Model<IPosExchange> = mongoose.models.PosExchange || mongoose.model<IPosExchange>('PosExchange', PosExchangeSchema);

export default PosExchange;
