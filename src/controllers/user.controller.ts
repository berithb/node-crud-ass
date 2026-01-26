import { Request, Response } from "express";
import { User, IUser } from "../models/user";
import bcrypt from "bcryptjs";
import { uploadToCloudinary } from "./upload.controller";
import path from "path";
import fs from "fs";

// GET all users
export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find().select("-password"); // exclude passwords
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Failed to get users", error });
  }
};

// GET user by ID
export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select("-password"); // exclude password

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Failed to get user", error });
  }
};

// CREATE new user
export const createUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email already exists" });
    }

    const newUser = new User({ name, email, password, role });
    await newUser.save();

    // Exclude password from response
    const { password: _, ...userWithoutPassword } = newUser.toObject();

    res.status(201).json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ message: "Failed to create user", error });
  }
};

// UPDATE user by ID
export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, email, password, role } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;
    if (password) {
      // hash new password before saving
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save();

    const { password: _, ...userWithoutPassword } = user.toObject();
    res.status(200).json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ message: "Failed to update user", error });
  }
};

// DELETE user by ID
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { password: _, ...userWithoutPassword } = user.toObject();
    res.status(200).json({ message: "User deleted successfully", user: userWithoutPassword });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete user", error });
  }
};
// change password
export const changePassword = async (req: any, res: Response) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword)
      return res.status(400).json({ message: "Old and new passwords required" });

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await user.matchPassword(oldPassword);
    if (!isMatch) return res.status(401).json({ message: "Old password is incorrect" });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to change password", error });
  }
};

export const uploadProfileImage = async (req: any, res: any) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      // Clean up uploaded file
      if (req.file.path) fs.unlinkSync(req.file.path);
      return res.status(404).json({ message: "User not found" });
    }

    // Delete old profile image if exists
    if (user.profileImage && user.profileImage.startsWith("/uploads/")) {
      const oldFilePath = path.join(process.cwd(), user.profileImage);
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }
    }

    // Store file path (local storage or Cloudinary)
    const profileImagePath = `/uploads/${req.file.filename}`;

    user.profileImage = profileImagePath;
    await user.save();

    const { password: _, ...userWithoutPassword } = user.toObject();
    res.status(200).json({ 
      message: "Profile image uploaded successfully", 
      user: userWithoutPassword 
    });
  } catch (error) {
    // Clean up uploaded file on error
    if (req.file.path) fs.unlinkSync(req.file.path);
    res.status(500).json({ message: "Failed to upload profile image", error });
  }
};