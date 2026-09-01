import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBranch extends Document {
  name: string;
  location: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const BranchSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    location: { type: String, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Branch: Model<IBranch> = mongoose.models.Branch || mongoose.model<IBranch>('Branch', BranchSchema);

export default Branch;
