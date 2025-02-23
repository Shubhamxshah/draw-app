import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

export function middleware(req: Request, res: Response, next: NextFunction) {
  const token = req.headers["authorization"] ?? "";
  const jwt_secret = process.env.jwt;

  try {
    const decoded = jwt.verify(token, jwt_secret!) as JwtPayload;

    if (decoded && typeof decoded === "object" && "username" in decoded) {
      req.username = decoded.username;
      next();
    } else {
      res.status(403).json({
        message: "unauthorized",
      });
    }
  } catch (error) {
    res.status(403).json({
      message: "unauthorized",
    });
  }
}
