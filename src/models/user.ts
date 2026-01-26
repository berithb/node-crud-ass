import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role?: string;
  profileImage?: string; 
  matchPassword(enteredPassword: string): Promise<boolean>; 
  createPasswordResetToken: () => string;
  passwordResetExpires: Date,
}

const userSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
 profileImage: {
    type: String,
    default: "", // empty until user uploads image
  },
  password: { type: String, required: true },
  role: { type: String, default: "user" },
});

// Hash password before saving
userSchema.pre<IUser>("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});


// Compare entered password with hashed password
userSchema.methods.matchPassword = async function (enteredPassword: string) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.createPasswordResetToken = function () {
  // Generate a random token
  const resetToken = crypto.randomBytes(32).toString("hex");

  // Hash the token and store it in the database
  this.passwordResetToken = crypto.createHash("sha256").update(resetToken).digest("hex");
  this.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  return resetToken; // This is the plain token to send via email
};


export const User = mongoose.model<IUser>("User", userSchema);
