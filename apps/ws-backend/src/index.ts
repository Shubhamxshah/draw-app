import { WebSocket, WebSocketServer } from "ws";
import { jwt_secret } from "@repo/backend-common";
import { prisma } from "@repo/db";
import jwt from "jsonwebtoken"; 

const wss = new WebSocketServer({ port:8080 });

interface User {
  ws: WebSocket, 
  rooms: string[], 
  userId: string 
}

const users:User[] = [];

function checkUser(token: string): string | null {
  try {
    const decoded = jwt.verify(token, jwt_secret);

    if (!decoded || typeof decoded == "string" || !decoded.userId ){
      return null;
    }

    return decoded.userId;
  } catch (error) {
    return null;
  }
}

wss.on('connection', function connection(ws, request){
  
  const url = request.url;
  if (!url) {
    return;
  } 

  const urlObj = new URL(url);
  const token = urlObj.searchParams.get('token') || "";
  const userId = checkUser(token);

  if (userId === null) {
    ws.close();
    return null;
  }
  
  users.push({
    ws, 
    rooms: [], 
    userId
  })

  ws.on('message', async function message(data){
    let parsedData; 

    if (typeof data !== "string") {
      parsedData = JSON.stringify(data.toString());
    } else {
      parsedData = JSON.parse(data);
    }

    if (parsedData.type === "join_room") {
      const user = users.find(x => x.ws === ws); 
      user?.rooms.push(parsedData.roomId);
    }

    if (parsedData.type === "leave_room") {
      const user = users.find(x => x.ws === ws);
      if (!user) {
        return;
      }
      user.rooms = user?.rooms.filter(x => x === parsedData.room);
    }

    if (parsedData.type === "chat") {
      const roomId = parsedData.roomId; 
      const message = parsedData.message; 

      await prisma.chat.create({
        data: {
          roomId, 
          message, 
          userId
        }
      });

      users.forEach(user => {
        if (user.rooms.includes(roomId)) {
          user.ws.send(JSON.stringify({
            type: "chat", 
            message, 
            roomId
          }))
        }
      })
    }
  })
})
