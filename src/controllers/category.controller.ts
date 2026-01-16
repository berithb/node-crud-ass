import { Request, Response } from 'express';
import Category from '../models/Category';

export const createcategories = async (req:Request, res:Response)=> {
    try{
        const {name, description} = req.body;
        if(!name){
            res.status(400).json({message: "Name not found"})
        }
        const category= await Category.create({
            name,
            description
        });
        res.status(201).json(category);

    }
    catch (error){
        res.status (500).json({message: "failed to create category", error});
    }
};

export const getcategories = async (req:Request, res:Response) =>{
    try{
        const categories = await Category.find();
        res.json(categories);
    } catch (error){
        res.status(400).json({message:"failed to fetch categories"});

    }
};

export const getCategoryById = async (req:Request, res:Response) =>{
    try {
        const {id} = req.params;
        const category = await Category.findById(id);
        if(!category){
            return res.status(404).json({message:"category not found"});
        }
        res.status(200).json (category);
    } catch (error){
        res.status(500).json({message:"failed to fetch category", error});
    }
};

export const updateCategory = async (req:Request, res:Response) => {
    try{
        const {id } =req.params;
        const {name, description, } =req.body;

        const category = await Category.findById(id);
        if(!category){
            return res.status(404).json({message:"category not found"});
        }
        if (name) category.name = name;
        if (description) category.description = description;
        await category.save();
        res.status(200).json(category);
    } catch (error){
        res.status(500).json({message:"failed to upadate category", error});
    }
};

export const deleteCategory = async (req:Request, res:Response) =>{
    try{
        const {id} = req.params;
        const category = await Category.findByIdAndDelete(id);
        if (!category){
            return res.status(404).json({message:"category not found"});
        }
        res.status(200).json({message:"category succefflly delete"});
    } catch (error){
        res.status(500).json({message:"failed to delete",error});
    }
};

export default {createcategories, getcategories,  getCategoryById,  updateCategory, deleteCategory};
