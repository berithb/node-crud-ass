import express from 'express';
import connectDB from './config/database';
import router from './routes/category.routes';
import productrouter from './routes/products.routes';

import userRouter from './routes/user.routers';
import authRouter from './routes/auth.routers';
import Prouter from './routes/password.router';

import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger";

import dotenv from 'dotenv';




dotenv.config();

const app  = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI= process.env.MONGO_URI;
const JWT_SECRET = process.env.JWT_SECRET;

app.use(express.json());
connectDB();

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));


app.use('/api', router);
app.use('/api/products', productrouter);
app.use("/api/users", userRouter);
app.use("/api/auth", authRouter);
// app.use("/api/password", Prouter);
app.use('/api/password', Prouter); // ✅ FIXED
app.listen(PORT, () =>{
  console.log('server is running on port ${PORT}');

});