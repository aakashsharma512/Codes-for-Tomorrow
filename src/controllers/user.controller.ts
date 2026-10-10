import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import User from "../entities/User";

const userRepo = AppDataSource.getRepository(User);

export const createUser = async (req: Request, res: Response) => {
  try {
    const { name, password } = req.body;
    if (!name || !password) {
      return res.status(400).json({ message: "Name and password are required." });
    }

    const newUser = userRepo.create({ name, password });
    await userRepo.save(newUser);

    return res.status(201).json(newUser);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getUsers = async (_req: Request, res: Response) => {
  try {
    const users = await userRepo.find();
    return res.json(users);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
