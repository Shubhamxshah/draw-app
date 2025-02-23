import { Router } from "express";
import { middleware } from "../middleware";
import { prisma } from "@repo/db";
import { roomSchema } from "@repo/common/types";

const createRoom = Router();

createRoom.post("/room", middleware, (req, res) => {
  const {name} = req.body;

  const parsed = roomSchema.safeParse(req.body);
  if (!parsed.success){
    res.status(400).json({error: parsed.error.format() })
    return;
  }

  
})
