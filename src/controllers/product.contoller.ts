import {Request, Response} from 'express';
import productModel from '../models/product';
import mongoose from 'mongoose';
import { uploadToCloudinary } from "./upload.controller";
import path from 'path';
import fs from 'fs';

export const createProduct = async (req:Request, res:Response) =>{
    try{
       
        const{ name, price, description, categoryId, Instock, quantity} = req.body;

        if(!name || !price || !categoryId) {
            return res.status(404).json({message: " name, price, categoryId is required "});
        }

        const product = await productModel.create({
            name,
            price,
            description,
            categoryId,
            Instock,
            quantity,
        });
        res.status(201).json(product);
    } catch(error){
        console.error(error);
        res.status(500).json({message: "failed to connect", error});
    }


};
export  const getProducts = async (req:Request, res:Response)=> {
    try{
        const products = await productModel.find();
        res.json(products);
    } catch(error){
        res.status(500).json({message: "failed to fetch product", error});
    }

}

export const updateProduct = async (req:Request, res:Response) =>{
    try{ 
        const id =req.params.id as string;
        const {name, price, categoryId} = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)){
            return res.status(400).json({message: "invalid productId"});
        }
        if (categoryId && !mongoose.Types.ObjectId.isValid(categoryId)){
            return res.status(400).json({message:"invalid categoryId"})
        }

        const products = await productModel.findByIdAndUpdate(
            id,
            { name, price, categoryId},
            {new:true, runValidators:true}
        ).populate('categoryId');
        if (!productModel){
            return res.status(404).json({message:"product not found"});
        }
        res.json(productModel);
    } catch(error){
        res.status(500).json({message:"failed to connect", error});
    }
};

export const deleteProduct = async (req:Request, res:Response) =>{
    try{
        const id = req.params.id as string;
        if(~!mongoose.Types.ObjectId.isValid(id)){
            return res.status(400).json({message:"invalid productId"});
        }
        const deleteProduct = await productModel.findByIdAndDelete(id);
        if (!deleteProduct){
            return res.status(404).json({message:"product not found"});
        }
        res.json({message:"product deleted"});
    }  catch (error) {
    res.status(500).json({ message: 'Failed to delete product', error });
  }

};
// Ensure your Import is capitalized: import Product from '../models/product.model';

export const uploadProductImage = async (req: any, res: any) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // 1. Use the Capitalized Model to query
    const foundProduct = await productModel.findById(req.params.id);

    // 2. Check the "foundProduct" variable
    if (!foundProduct) {
      // Clean up uploaded file
      if (req.file.path) fs.unlinkSync(req.file.path);
      return res.status(404).json({ message: "Product not found" });
    }

    // 3. Store file path (local storage or Cloudinary)
    const imageUrl = `/uploads/${req.file.filename}`;

    // Push the file path to the "foundProduct" instance
    foundProduct.images.push(imageUrl);
    
    // 4. Save the instance
    await foundProduct.save();

    res.status(200).json({ 
      message: "Product image uploaded successfully",
      product: foundProduct 
    });
  } catch (error: any) {
    // Clean up uploaded file on error
    if (req.file && req.file.path) fs.unlinkSync(req.file.path);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Delete product image
 * Removes a specific image from product's images array
 */
export const deleteProductImage = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const { imageUrl } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ message: "Image URL is required" });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const product = await productModel.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Remove the image URL from the array
    product.images = product.images.filter((img) => img !== imageUrl);

    // Delete the file from local storage if it exists
    if (imageUrl.startsWith("/uploads/")) {
      const filePath = path.join(process.cwd(), imageUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await product.save();

    res.status(200).json({ 
      message: "Product image deleted successfully",
      product 
    });
  } catch (error: any) {
    res.status(500).json({ message: "Failed to delete product image", error });
  }
};