import mongoose, {Schema, Document} from 'mongoose';

export interface CartItem{
    productId: mongoose.Types.ObjectId;
    quantity: number;
}


export interface Icart extends Document {
    userId: string;
      items: CartItem[];

}
const CartItemSchema: Schema = new Schema(
    {
        userId: {type: String, required: true },
        items: [
            {
                productId: {type: Schema.Types.ObjectId, ref: 'product', required: true},
                quantity: { type: Number,required: true, }
            }
        ]

    }, {timestamps: true}
);
export default  mongoose.model<Icart>('Cart', CartItemSchema);

