import {Router} from 'express';
import {createOrder, getOrder, getOrderId, UpdateOrder, deleteOrder} from '../controllers/order.controller';


const Orouter = Router();

Orouter.post('/', createOrder);
Orouter.get('/', getOrder);
Orouter.get('/:id', getOrderId);
Orouter.put('/:id', UpdateOrder );
Orouter.delete('/:id', deleteOrder);
export default Orouter;