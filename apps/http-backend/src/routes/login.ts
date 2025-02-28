import { Router } from "express";
import { prisma } from "@repo/db";
import jwt from "jsonwebtoken";
import { signupSchema, signinSchema } from "@repo/common/types";
import { jwt_secret } from "@repo/backend-common"
import bcrypt from "bcrypt";

const loginRouter = Router();

loginRouter.post("/signup", async (req, res) => {
  const { username, password, name} = req.body;

  const parsed = signupSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({errors: parsed.error.format() });
    return;
  }
   
  try {
    const hashedpw = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        username,
        password: hashedpw,
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

    if (!user) {
      res.status(400).json("username doesnt exist");
      return;
    }

    const isPasswordValid = await bcrypt.compare(parsed.data.password, user.password);

    if (isPasswordValid){
      const token = jwt.sign({ userId: user?.id }, jwt_secret);
      res.status(200).json(`${token}`);
    } else {
      res.status(400).json({message: "the password is invalid"});
    }
  } catch (error) {
    res.status(400).json(`error signing in the user`);
  }
});
