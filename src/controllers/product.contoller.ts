import {Request, Response} from 'express';
import product from "../models/product";
import productModel from '../models/product';
import mongoose from 'mongoose';

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
        const products = await product.find();
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

        const products = await product.findByIdAndUpdate(
            id,
            { name, price, categoryId},
            {new:true, runValidators:true}
        ).populate('categoryId');
        if (!product){
            return res.status(404).json({message:"product not found"});
        }
        res.json(product);
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
        const deleteProduct = await product.findByIdAndDelete(id);
        if (!deleteProduct){
            return res.status(404).json({message:"product not found"});
        }
        res.json({message:"product deleted"});
    }  catch (error) {
    res.status(500).json({ message: 'Failed to delete product', error });
  }

};