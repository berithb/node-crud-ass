import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import connectDB from './config/database';
import categoryRouter from './routes/category.router';
import productrouter from './routes/products.router';

import userRouter from './routes/user.router';
import authRouter from './routes/auth.router';
import Prouter from './routes/password.router';

import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger";


import router from './routes/order.router';
import cartRouter from './routes/cart.router';

import path from 'path';




const app  = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI= process.env.MONGO_URI;
const JWT_SECRET = process.env.JWT_SECRET;

app.use(express.json());


app.get("/", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "API is running 🚀",
  });
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));


app.use('/api/categories', categoryRouter);
app.use('/api/products', productrouter);
app.use("/api/users", userRouter);
app.use("/api/auth", authRouter);
app.use('/api/password', Prouter); 
app.use('/api/orders', router);
app.use('/api/cart', cartRouter );
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

connectDB();

app.listen(PORT, () =>{
  console.log(`server is running on port ${PORT}`);

});