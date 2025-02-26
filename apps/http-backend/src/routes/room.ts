import { Router } from "express";
import { middleware } from "../middleware";
import { prisma } from "@repo/db";
import { roomSchema } from "@repo/common/types";

const createRoom = Router();

createRoom.post("/room", middleware, async (req, res) => {
  const parsed = roomSchema.safeParse(req.body);
  if (!parsed.success){
    res.status(400).json({error: parsed.error.format() })
    return;
  }

  if (!req.userId || typeof req.userId !== "string"){
    res.status(401).json({message: "not authorized. Please login with valid credentials"})
    return;
  }

  try {
    const room = await prisma.room.create({
      data: {
        slug: parsed.data.name, 
        adminId: req.userId, 
      }
    })

    res
      .status(200)
      .json({
      roomId: room.id
    })
  } catch (error) {
      res
        .status(401)
        .json({
          message: "room already exists with this name"
        })
  }  
})

createRoom.get("/chats/:roomId", async (req, res) => {
  try {
    const roomId = req.params.roomId; 
    const messages = await prisma.chat.findMany({
      where: {
        roomId: roomId
      }, 
      orderBy: {
        createdAt: "desc"
      }, 
      take: 1000
    })

    res.status(200).json({messages})
  } catch (error) {
    console.log(error)
    res.json({
      messages: []
    })
  }
})

createRoom.get("/room/:slug", async (req, res) => {
  const slug = req.params.slug; 
  const room = await prisma.room.findFirst({
    where: {
      slug
    }
  }); 

  res.json({
    room
  })
})


