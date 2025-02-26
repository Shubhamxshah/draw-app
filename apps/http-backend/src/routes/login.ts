import { Router } from "express";
import { prisma } from "@repo/db";
import jwt from "jsonwebtoken";
import { signupSchema, signinSchema } from "@repo/common/types";
import { jwt_secret } from "@repo/backend-common"

const loginRouter = Router();

loginRouter.post("/signup", async (req, res) => {
  const { username, password, name} = req.body;

  const parsed = signupSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({errors: parsed.error.format() });
    return;
  }
   
  try {
    const user = await prisma.user.create({
      data: {
        username,
        password,
        name,
      },
    });
    res.status(200).json(`user created: ${user}`);
  } catch (error) {
    res.status(400).json("error creating user or it already exists");
  }
});

loginRouter.post("/signin", async (req, res) => {
  const parsed = signinSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({errors: parsed.error.format() });
    return;
  }

  try {
    const user = await prisma.user.findUnique({
      where: {
        username: parsed.data.username,
      },
    });

    if (!user || user.password !== parsed.data.password) {
      res.status(400).json("user doesnt exist or password is incorrect");
      return;
    }

    const token = jwt.sign({ userId: user?.id }, jwt_secret);
    res.status(200).json(`${token}`);
  } catch (error) {
    res.status(400).json(`error signing in the user`);
  }
});
