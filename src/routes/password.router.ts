import { Router } from "express";
import {
  forgotPassword,
  resetPassword,
} from "../controllers/password.controller";

const Prouter = Router();

/**
 * @swagger
 * tags:
 *   name: Password
 *   description: Password recovery and reset
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     ForgotPasswordRequest:
 *       type: object
 *       required:
 *         - email
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: user@example.com
 *
 *     ResetPasswordRequest:
 *       type: object
 *       required:
 *         - token
 *         - password
 *       properties:
 *         token:
 *           type: string
 *           example: dkjf934jf9f934jf9f934jf
 *         password:
 *           type: string
 *           format: password
 *           example: NewStrongPassword123!
 */

/**
 * @swagger
 * /api/password/forgot:
 *   post:
 *     summary: Request password reset
 *     description: Generates a password reset token and sends it to the user's email
 *     tags: [Password]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ForgotPasswordRequest'
 *     responses:
 *       200:
 *         description: Password reset email sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Reset email sent
 *       404:
 *         description: User with this email does not exist
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/password/reset:
 *   post:
 *     summary: Reset password
 *     description: Resets the user's password using the provided reset token
 *     tags: [Password]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ResetPasswordRequest'
 *     responses:
 *       200:
 *         description: Password reset successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Password updated successfully
 *       400:
 *         description: Invalid or expired token
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */


/**
 * @route   POST /api/password/forgot
 * @desc    Generate password reset token
 * @access  Public
 */
Prouter.post("/forgot", forgotPassword);

/**
 * @route   POST /api/password/reset
 * @desc    Reset password using token
 * @access  Public
 */
Prouter.post("/reset", resetPassword);

export default Prouter;
