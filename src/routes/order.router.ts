import { Router } from "express";
import {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  getAllOrders,
  updateOrderStatus,
} from "../controllers/order.controller";

import { protect, authorize } from "../middleware/auth.middleware";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Order management (Customer & Admin)
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     OrderItem:
 *       type: object
 *       properties:
 *         productId:
 *           type: string
 *           example: 64f1b2c3a1b2c3d4e5f6a7b8
 *         name:
 *           type: string
 *           example: Laptop
 *         price:
 *           type: number
 *           example: 1200
 *         quantity:
 *           type: number
 *           example: 2
 *
 *     Order:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         userId:
 *           type: string
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/OrderItem'
 *         totalAmount:
 *           type: number
 *           example: 2400
 *         status:
 *           type: string
 *           enum: [pending, confirmed, shipped, delivered, cancelled]
 *         createdAt:
 *           type: string
 *           format: date-time
 */

/* =========================
   CUSTOMER ROUTES
========================= */

/**
 * @swagger
 * /orders:
 *   post:
 *     summary: Create order from cart
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Order created successfully
 *       400:
 *         description: Cart is empty
 *       401:
 *         description: Unauthorized
 */
router.post("/", protect, authorize("customer"), createOrder);

/**
 * @swagger
 * /orders:
 *   get:
 *     summary: Get logged-in user's orders
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user orders
 */
router.get("/", protect, authorize("customer"), getMyOrders);

/**
 * @swagger
 * /orders/{id}:
 *   get:
 *     summary: Get a single order (own order only)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order details
 *       403:
 *         description: Access denied
 *       404:
 *         description: Order not found
 */
router.get("/:id", protect, authorize("customer"), getOrderById);

/**
 * @swagger
 * /orders/{id}/cancel:
 *   patch:
 *     summary: Cancel pending order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order cancelled
 *       400:
 *         description: Only pending orders can be cancelled
 *       403:
 *         description: Access denied
 */
router.patch("/:id/cancel", protect, authorize("customer"), cancelOrder);

/* =========================
   ADMIN ROUTES
========================= */

/**
 * @swagger
 * /orders/admin/all:
 *   get:
 *     summary: Get all orders (Admin only)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all orders
 *       403:
 *         description: Admin access required
 */
router.get(
  "/admin/all",
  protect,
  authorize("admin"),
  getAllOrders
);

/**
 * @swagger
 * /orders/admin/{id}/status:
 *   patch:
 *     summary: Update order status (Admin only)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [confirmed, shipped, delivered, cancelled]
 *     responses:
 *       200:
 *         description: Order status updated
 *       400:
 *         description: Invalid status
 *       404:
 *         description: Order not found
 */
router.patch(
  "/admin/:id/status",
  protect,
  authorize("admin"),
  updateOrderStatus
);

export default router;
