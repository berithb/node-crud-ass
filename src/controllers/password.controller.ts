import { Request, Response } from "express";
import { User } from "../models/user";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { sendPasswordResetEmail, sendPasswordChangedEmail } from "../utils/emailService";

// Simulated storage for reset tokens with expiration
const resetTokens: Record<string, { userId: string; expiresAt: number }> = {};

// FORGOT PASSWORD
export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email is required" });

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: "User not found" });

  // Generate a token (valid for 30 minutes)
  const resetToken = crypto.randomBytes(32).toString("hex");
  resetTokens[resetToken] = {
    userId: user._id.toString(),
    expiresAt: Date.now() + 30 * 60 * 1000, // 30 minutes
  };

  // Generate reset link - adjust URL based on your frontend
  const resetLink = `${process.env.FRONTEND_URL || "http://localhost:3000"}/reset-password?token=${resetToken}`;

  // Send password reset email (async - don't wait for it)
  sendPasswordResetEmail(user.name, email, resetLink);

  res.status(200).json({
    message: "Password reset email sent successfully",
    resetToken, // Include in response for testing/development
  });
};

// RESET PASSWORD
export const resetPassword = async (req: Request, res: Response) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) return res.status(400).json({ message: "Token and new password required" });

  const tokenData = resetTokens[token];
  if (!tokenData) return res.status(400).json({ message: "Invalid or expired token" });

  // Check if token has expired
  if (tokenData.expiresAt < Date.now()) {
    delete resetTokens[token];
    return res.status(400).json({ message: "Token has expired" });
  }

  const user = await User.findById(tokenData.userId);
  if (!user) return res.status(404).json({ message: "User not found" });

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(newPassword, salt);
  await user.save();

  // Send password changed confirmation email (async - don't wait for it)
  sendPasswordChangedEmail(user.name, user.email);

  // Remove token after use
  delete resetTokens[token];

  res.status(200).json({ message: "Password reset successfully" });
};
