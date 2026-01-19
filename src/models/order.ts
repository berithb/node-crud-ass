import mongoose, { Schema, Document} from 'mongoose';

export interface Iorder extends Document{
    userId: string;
    products :{
        productId: string,
        quantity: number
    }[];
    totalAmount: number;
    status: 'pending' | 'paid' | 'shipped' | 'canceded';
    createdAt: Date;
}

const orderSchema :Schema = new Schema({
    userId:{
        type: String,
        required: true,
    },
    products:[
    {
        productId:{
            type: String,
            required: true
        },
        quantity:{
            type:Number,
            required:true,
            min:1
        },
    },
    ],
        totalAmount:{
            type: Number,
            required:true
        },
        status:{
            type: String,
            enum: ['pending' , 'paid', 'shipped', 'cancelled'],
            default :'pending',

        },
    
}, {timestamps: true}
);
export default mongoose.model<Iorder>('order', orderSchema);