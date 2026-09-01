import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  name: string;
  username: string;
  phone: string;
  password?: string;
  role: 'owner' | 'manager' | 'cashier';
  branchId?: mongoose.Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    password: { type: String, select: false },
    isActive: { type: Boolean, default: true },
    role: {
      type: String,
      enum: ['owner', 'manager', 'cashier'],
      required: true,
    },
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
    },
  },
  { timestamps: true }
);

// Prevent redefining the model if hot reloading
const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
