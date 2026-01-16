import { Request, Response } from "express";
import { User } from "../models/user";
import crypto from "crypto";
import bcrypt from "bcryptjs";

// Simulated storage for reset tokens
const resetTokens: Record<string, string> = {};

// FORGOT PASSWORD
export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email is required" });

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: "User not found" });

  // Generate a token
  const resetToken = crypto.randomBytes(32).toString("hex");
  resetTokens[resetToken] = user._id.toString();

  // In real app, send this token via email
  res.status(200).json({
    message: "Password reset token generated",
    resetToken,
  });
};

// RESET PASSWORD
export const resetPassword = async (req: Request, res: Response) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) return res.status(400).json({ message: "Token and new password required" });

  const userId = resetTokens[token];
  if (!userId) return res.status(400).json({ message: "Invalid or expired token" });

  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ message: "User not found" });

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(newPassword, salt);
  await user.save();

  // Remove token after use
  delete resetTokens[token];

  res.status(200).json({ message: "Password reset successfully" });
};
