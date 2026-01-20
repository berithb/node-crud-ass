import { Router } from "express";
import { protect } from "../middleware/auth.middleware";
import {
  getCart,
  addItemToCart,
  updateCartItem,
  removeItemFromCart,
} from "../controllers/cart.controller";

const cartRouter = Router();

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
 * /cart/{userId}:
 *   get:
 *     summary: Get user cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
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
cartRouter.get("/:userId", protect, getCart);

/**
 * @swagger
 * /cart/{userId}/items:
 *   post:
 *     summary: Add item to cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
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
cartRouter.post("/:userId/items", protect, addItemToCart);

/**
 * @swagger
 * /cart/{userId}/items/{itemId}:
 *   put:
 *     summary: Update cart item quantity
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
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
cartRouter.put("/:userId/items/:itemId", protect, updateCartItem);

/**
 * @swagger
 * /cart/{userId}/items/{itemId}:
 *   delete:
 *     summary: Remove item from cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
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
cartRouter.delete("/:userId/items/:itemId", protect, removeItemFromCart);

export default cartRouter;

