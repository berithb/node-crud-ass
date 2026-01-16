import {Request, Response} from 'express';
import Cart from '../models/cart';
import mongoose from 'mongoose';
import cart from '../models/cart';

export const getCart = async (req:Request, res:Response)=>{
    try{
        const userId = req.params.userId as string;
        const cart = await Cart.findOne({userId}).populate('items.productId');
        if (!cart){
            return res.status(404).json({message:"cart not found"});
        }
        res.json(cart);
    } catch (error){
        res.status(500).json({message:"failed to fetch cart"});
    }

}; 

export const addItemToCart = async (req:Request, res:Response) => {
    try{
        const userId = req.params.userId as string;
        const { productId, quantity } = req.body;

        if(!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({message:"invalid productId"});
        }
        if (!quantity ||  quantity <= 0){
            return res.status(400).json({message:"quantity must be greater than 0"});

        }
        let cart = await Cart.findOne({userId});

        if(!cart){
            cart = await Cart.create ({
                userId,
                items:[{productId, quantity}],
            });
        } else {
            const itemIndex = cart.items.findIndex(
                (item) => item.productId.toString() === productId
            );
            if(itemIndex > -1){
                cart.items[itemIndex].quantity += quantity;
            } else{
                cart?.items.push({productId, quantity});
            }
            await cart.save();
        }
        res.status(201).json(cart);
    } catch(error){
        res.status(500).json({message:"failed to add item", error});
    }
};

export const updateCartItem = async (req:Request, res:Response) =>{
    try{
        const {userId, itemId } = req.params; 
        const { quantity } = req.body;

        if (!quantity || quantity <=0){
            return res.status(400).json({message: "quantity must be greater than 0"});
        }
        const cart = await Cart.findOne({userId});
        if (!cart){
            return res.status(400).json({message:"cart not found"});
        }
        const itemIndex = cart.items.findIndex(
            (item:any) => item._id .toString() === itemId

        );
        if (itemIndex === -1){
            return res.status(400).json({message:"items not found"});
        } 
        cart.items[itemIndex].quantity = quantity;
        await cart.save();

        res.status(200).json(cart);
        
    } catch (error){
        return res.status(500).json({message:"item failed to update", error});
    }
};

export const  removeItemFromCart = async (req:Request, res:Response) =>{
    try{
        const { userId, itemId} = req.params;
        const cart = await Cart.findOne({userId});

        if(!cart){
            return res.status(404).json({message:"cart not found"});
        }
        const itemIndex = cart.items.findIndex(
            (item:any) => item._id.toString() === itemId
        );
       if (itemIndex === -1){
        return res.status(404).json({message:"item not found"});
       }
       cart.items.splice(itemIndex, 1);
       await cart.save();

       res.status(200).json({message:"item removed", cart});

    } catch (error){
        res.status(500).json({message:"failed to remove cart", error});
    }
};
export default {getCart, addItemToCart, updateCartItem,   removeItemFromCart };