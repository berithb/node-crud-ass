import { Request, Response} from 'express';
import order from '../models/order';

export const createOrder = async ( req: Request, res:Response) =>{
    try{
        const Order = await order.create(req.body);
        res.status(201).json(order);
    } catch (error){
        res.status(500).json({message:'failed to create order ', error});
    };
};

    export const getOrder = async (_req: Request, res: Response) =>{
     try{
        const Orders = await order.find();
        res.status(200).json(order);

     } catch(error){
        res.status(500).json({message:"failed to fetch orders", error});
     }
    };


    export const getOrderId = async (req:Request, res:Response) => {
        try{

       
        const Order = await order.findById(req.params.id);

        if(!Order){
            res.status(400).json({message:"Order not found"});

        }
        res.status(200).json(order);

    }catch (error){
        res.status(500).json({message:"failed to fecth order", error});
    }
 };

 export const UpdateOrder = async (req:Request, res:Response) =>{
    try{
        const Order = await order.findByIdAndUpdate( req.params.id, req.body,  {new: true});
        if (Order){
            res.status(404).json({message: "order not found"});
        }
        res.status(200).json(Order);

    } catch (error){
        res.status(500).json({message: "failed to update order", error });
    }
 };

 export const deleteOrder = async (req:Request, res:Response) =>{
    try{
        const Order = await order.findByIdAndDelete(req.params.id);
        if (!Order){
            res.status(400).json({message:"order not found"});
        }
        res.status (200).json(Order);
    } catch(error){
        res.status(500).json({message:"failed to delete order", error});
    }
 };
 export default {createOrder, getOrder, getOrderId, UpdateOrder, deleteOrder };