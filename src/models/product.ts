import mongoose, {Schema, Document} from 'mongoose';

export interface Iproduct extends Document{
    name: string;
    price: number;
    description: string;
    categoryId: Schema.Types.ObjectId;
    Instock: boolean;
    quantity: number;
    images: string[],

}

const ProductSchema: Schema = new Schema ({
    name: { type: String, required:true},
    price: { type: Number, required:true},
    description: String,
    categoryId: { type: Schema.Types.ObjectId, ref: 'category', required:true},
    Instock: {type:Boolean, required:true},
    images: { type: [String], default: [] },
    quantity: { type: Number, default:0}

}, {timestamps: true}

);
const productModel =mongoose.model<Iproduct>('Product', ProductSchema);
export default  productModel;