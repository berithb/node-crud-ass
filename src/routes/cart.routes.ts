import { Router } from "express";
import {
  getCart,
  addItemToCart,
  updateCartItem,
  removeItemFromCart,
} from "../controllers/cart.controller";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Cart
 *   description: Cart management APIs
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     CartItem:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: 64f1c9a2b2f5a12b12345678
 *         productId:
 *           type: string
 *           example: 64f1b2c9c5a2b7a9d2e4a111
 *         quantity:
 *           type: integer
 *           example: 2
 *
 *     Cart:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         userId:
 *           type: string
 *           example: 64f1a9e2b3c4d5e6f7890123
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/CartItem'
 *
 *     AddItemRequest:
 *       type: object
 *       required:
 *         - productId
 *         - quantity
 *       properties:
 *         productId:
 *           type: string
 *           example: 64f1b2c9c5a2b7a9d2e4a111
 *         quantity:
 *           type: integer
 *           example: 1
 *
 *     UpdateCartItemRequest:
 *       type: object
 *       required:
 *         - quantity
 *       properties:
 *         quantity:
 *           type: integer
 *           example: 3
 */

/**
 * @swagger
 * /api/cart/{userId}:
 *   get:
 *     summary: Get user cart
 *     tags: [Cart]
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         description: User ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Cart retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cart'
 *       404:
 *         description: Cart not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/cart/{userId}/items:
 *   post:
 *     summary: Add item to cart
 *     tags: [Cart]
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         description: User ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AddItemRequest'
 *     responses:
 *       201:
 *         description: Item added to cart
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/cart/{userId}/items/{itemId}:
 *   put:
 *     summary: Update cart item quantity
 *     tags: [Cart]
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         description: User ID
 *         schema:
 *           type: string
 *       - name: itemId
 *         in: path
 *         required: true
 *         description: Cart item ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateCartItemRequest'
 *     responses:
 *       200:
 *         description: Cart item updated
 *       404:
 *         description: Item not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/cart/{userId}/items/{itemId}:
 *   delete:
 *     summary: Remove item from cart
 *     tags: [Cart]
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         description: User ID
 *         schema:
 *           type: string
 *       - name: itemId
 *         in: path
 *         required: true
 *         description: Cart item ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Item removed from cart
 *       404:
 *         description: Item not found
 *       500:
 *         description: Server error
 */


router.get("/cart/:userId", getCart);
router.post("/cart/:userId/items", addItemToCart);
router.put("/cart/:userId/items/:itemId", updateCartItem);
router.delete("/cart/:userId/items/:itemId", removeItemFromCart);

export default router;
