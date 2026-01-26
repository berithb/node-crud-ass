import { Request, Response } from "express";
import Order from "../models/order";
import Cart from "../models/cart";
import { User } from "../models/user";
import { sendOrderConfirmationEmail, sendOrderStatusUpdateEmail } from "../utils/emailService";

/**
 * CUSTOMER: Create order from cart
 */
export const createOrder = async (req: any, res: Response) => {
  try {
    const userId = req.user._id;

    const cart = await Cart.findOne({ userId }).populate("items.productId");

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    let totalAmount = 0;

    const items = cart.items.map((item: any) => {
      totalAmount += item.productId.price * item.quantity;
      return {
        productId: item.productId._id,
        name: item.productId.name,
        price: item.productId.price,
        quantity: item.quantity,
      };
    });

    const order = await Order.create({
      userId,
      items,
      totalAmount,
    });

    // Clear cart after order
    cart.items = [];
    await cart.save();

    // Send order confirmation email (async - don't wait for it)
    const user = await User.findById(userId);
    if (user) {
      sendOrderConfirmationEmail(
        user.name,
        user.email,
        order._id.toString(),
        totalAmount,
        items
      );
    }

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: "Failed to create order", error });
  }
};

/**
 * CUSTOMER: Get own orders
 */
export const getMyOrders = async (req: any, res: Response) => {
  const orders = await Order.find({ userId: req.user._id });
  res.json(orders);
};

/**
 * CUSTOMER: Get single order (own only)
 */
export const getOrderById = async (req: any, res: Response) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  if (order.userId.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: "Access denied" });
  }

  res.json(order);
};

/**
 * CUSTOMER: Cancel pending order
 */
export const cancelOrder = async (req: any, res: Response) => {
  const order = await Order.findById(req.params.id);

  if (!order) return res.status(404).json({ message: "Order not found" });

  if (order.userId.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: "Access denied" });
  }

  if (order.status !== "pending") {
    return res
      .status(400)
      .json({ message: "Only pending orders can be cancelled" });
  }

  order.status = "cancelled";
  await order.save();

  res.json(order);
};

/**
 * ADMIN: Get all orders
 */
export const getAllOrders = async (_req: Request, res: Response) => {
  const orders = await Order.find().populate("userId", "email role");
  res.json(orders);
};

/**
 * ADMIN: Update order status
 */
export const updateOrderStatus = async (req: Request, res: Response) => {
  const { status } = req.body;

  const allowed = ["confirmed", "shipped", "delivered", "cancelled"];
  if (!allowed.includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  const order = await Order.findById(req.params.id).populate("userId");
  if (!order) return res.status(404).json({ message: "Order not found" });

  if (order.status === "delivered") {
    return res
      .status(400)
      .json({ message: "Delivered orders cannot be modified" });
  }

  order.status = status;
  await order.save();

  // Send order status update email (async - don't wait for it)
  const user = order.userId as any;
  if (user && user.email) {
    sendOrderStatusUpdateEmail(user.name, user.email, order._id.toString(), status);
  }

  res.json(order);
};

export default { createOrder, getMyOrders, getOrderById, cancelOrder, getAllOrders, updateOrderStatus };