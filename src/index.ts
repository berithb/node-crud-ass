import express from 'express';
import connectDB from './config/database';
// import categoryRoutes from './routes/category.routes'
import router from './routes/category.routes';
import productrouter from './routes/products.routes';
// import userRouter from "./routes/user";
// import {authRouter} from "./routes/auth";
import userRouter from './routes/user.routers';
import authRouter from './routes/auth.routers';
import Prouter from './routes/password.router';

import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger";







const app  = express();
app.use(express.json());
connectDB();

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));


app.use('/api', router);
app.use('/api/products', productrouter);
app.use("/api/users", userRouter);
app.use("/api/auth", authRouter);
// app.use("/api/password", Prouter);
app.use('/api/password', Prouter); // ✅ FIXED
app.listen(3000, () =>{
  console.log('server is running on port 3000');

});