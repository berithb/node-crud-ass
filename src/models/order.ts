import mongoose, { Schema, Document } from "mongoose";
import { User, IUser } from "./user";

export interface OrderItem {
  productId: mongoose.Types.ObjectId;
  name: string;
  price: number;
  quantity: number;
}

export interface Iorder extends Document {
  userId: mongoose.Types.ObjectId;
  items: OrderItem[];
   total: number;
  totalAmount: number;
  trackingNumber?:string;
  createdAt: Date;
  updatedAt: Date;
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
}

const orderSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [
      {
        productId: { type: Schema.Types.ObjectId, ref: "Product" },
        name: String,
        price: Number,
        quantity: { type: Number, min: 1 },
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    trackingNumber: { type: String },
    total: { type: Number, required: true },
  },
  { timestamps: true }
);

export default mongoose.model<Iorder>("Order", orderSchema);
