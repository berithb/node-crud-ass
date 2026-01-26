import { Router } from 'express';
import { createProduct , getProducts, updateProduct, deleteProduct, uploadProductImage, deleteProductImage} from '../controllers/product.contoller';
import { protect, authorize } from "../middleware/auth.middleware";
import { upload } from "../config/multer.config";
const productrouter = Router ();

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Product management APIs
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: 64f2a1c9b8e9a1f234567890
 *         name:
 *           type: string
 *           example: iPhone 15 Pro
 *         description:
 *           type: string
 *           example: Latest Apple smartphone
 *         price:
 *           type: number
 *           example: 1299.99
 *         categoryId:
 *           type: string
 *           example: 64f1a9e2b3c4d5e6f7890123
 *         quantity:
 *           type: integer
 *           example: 10
 *         inStock:
 *           type: boolean
 *           example: true
 *
 *     CreateProductRequest:
 *       type: object
 *       required:
 *         - name
 *         - price
 *       properties:
 *         name:
 *           type: string
 *           example: Samsung Galaxy S24
 *         description:
 *           type: string
 *           example: Android flagship phone
 *         price:
 *           type: number
 *           example: 999.99
 *         categoryId:
 *           type: string
 *           example: 64f1a9e2b3c4d5e6f7890123
 *         quantity:
 *           type: integer
 *           example: 20
 *
 *     UpdateProductRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         price:
 *           type: number
 *         categoryId:
 *           type: string
 *         quantity:
 *           type: integer
 */

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Create a product
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateProductRequest'
 *     responses:
 *       201:
 *         description: Product created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
productrouter.post('/', createProduct);
/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Get all products
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Products retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 *       500:
 *         description: Server error
 */
productrouter.get('/', getProducts);
/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Update a product
 *     tags: [Products]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Product ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateProductRequest'
 *     responses:
 *       200:
 *         description: Product updated successfully
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 */
productrouter.put('/:id', updateProduct);
/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Delete a product
 *     tags: [Products]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Product ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 */

productrouter.delete('/:id', deleteProduct);

/**
 * @swagger
 * /products/{id}/image:
 *   post:
 *     summary: Upload or update a product image
 *     tags:
 *       - Products
 *     description: Uploads a single image for a product. Only accessible by Admin or Vendor.
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the product
 *       - in: formData
 *         name: image
 *         type: file
 *         required: true
 *         description: Image file to upload (max 1MB, images only)
 *     responses:
 *       200:
 *         description: Image uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Product image uploaded successfully"
 *                 imageUrl:
 *                   type: string
 *                   example: "https://yourcdn.com/products/12345.jpg"
 *       400:
 *         description: Bad request, e.g., file type not supported or file too large
 *       401:
 *         description: Unauthorized, user not logged in
 *       403:
 *         description: Forbidden, user is not Admin or Vendor
 *       404:
 *         description: Product not found
 */

productrouter.post("/:id/image", protect, authorize("admin", "vendor"), upload.single("image"), uploadProductImage);

/**
 * @swagger
 * /products/{id}/image:
 *   delete:
 *     summary: Delete a product image
 *     tags:
 *       - Products
 *     description: Deletes the image of a product. Only accessible by Admin or Vendor.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the product whose image will be deleted
 *     responses:
 *       200:
 *         description: Product image deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Product image deleted successfully"
 *       401:
 *         description: Unauthorized, user not logged in
 *       403:
 *         description: Forbidden, user is not Admin or Vendor
 *       404:
 *         description: Product not found
 */
productrouter.delete("/:id/image", protect, authorize("admin", "vendor"), deleteProductImage);

export default productrouter;  
