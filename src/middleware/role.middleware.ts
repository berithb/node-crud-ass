import {Request, Response, NextFunction} from 'express'

export const restrictTo =(...roles:  string[]) =>{
    return (req:any, res:Response, next: NextFunction)=> {
        if (!roles.includes(req.user.role)){
            return res.status(400).json({message:"acess denied"});
        }
        next();
    };
};