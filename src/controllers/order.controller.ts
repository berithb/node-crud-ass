import { Request, Response} from 'express';
import Order from '../models/order';

export const createOrder = async ( req: Request, res:Response) =>{
    try{
        const order = await Order.create(req.body);
        res.status(201).json(order);
    } catch (error){
        res.status(500).json({message:'failed to create order ', error});
    };
};

    export const getOrders = async ( req: Request, res: Response) =>{
     try{
        const orders = await Order.find();
        res.status(200).json(orders);

     } catch(error){
        res.status(500).json({message:"failed to fetch orders", error});
     }
    };


    export const getOrderById = async (req:Request, res:Response) => {
        try{

       
        const orders = await Order.findById(req.params.id);

        if(!orders){
          return  res.status(404).json({message:"Order not found"});

        }
       return res.status(200).json(orders);

    }catch (error){
       return res.status(500).json({message:"failed to fecth order", error});
    }
 };

 export const updateOrder = async (req:Request, res:Response) =>{
    try{
        const orders = await Order.findByIdAndUpdate( req.params.id, req.body,  {new: true});
        if (!orders){
          return  res.status(404).json({message: "order not found"});
        }
       return res.status(200).json(orders);

    } catch (error){
      return  res.status(500).json({message: "failed to update order", error });
    }
 };

 export const deleteOrder = async (req:Request, res:Response) =>{
    try{
        const orders = await Order.findByIdAndDelete(req.params.id);
        if (!orders){
           return res.status(404).json({message:"order not found"});
        }
        return res.status (200).json(orders);
    } catch(error){
       return res.status(500).json({message:"failed to delete order", error});
    }
 };
 export default {createOrder, getOrders, getOrderById, updateOrder, deleteOrder };