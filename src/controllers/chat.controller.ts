import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { FieldValue, Firestore } from "../config/firebase";
import { Chat } from "../entities/Chat";
import User from "../entities/User";

const chatRepo = AppDataSource.getRepository(Chat);
const userRepo = AppDataSource.getRepository(User);

export const createOrGetChat = async (req: Request, res: Response) => {
  try {
    const { userAId, userBId } = req.body;
    if (!userAId || !userBId) {
      return res.status(400).json({ message: "Both userAId and userBId are required." });
    }

    const chats = await chatRepo
      .createQueryBuilder("chat")
      .innerJoinAndSelect("chat.members", "member")
      .where("chat.isGroup = false")
      .getMany();

    const existingChat = chats.find((chat) => {
      const ids = chat.members.map((m) => m.id);
      return ids.length === 2 && ids.includes(userAId) && ids.includes(userBId);
    });

    if (existingChat) {
      return res.json({ chatId: existingChat.id, members: existingChat.members });
    }

    const userA = await userRepo.findOneBy({ id: userAId });
    const userB = await userRepo.findOneBy({ id: userBId });

    if (!userA || !userB) {
      return res.status(404).json({ message: "User(s) not found." });
    }

    const newChat = chatRepo.create({ isGroup: false, members: [userA, userB] });
    await chatRepo.save(newChat);

    return res.status(201).json({ chatId: newChat.id, members: [userA, userB] });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const sendMessage = async (req: Request, res: Response) => {
  try {
    const chatId = req.params.chatId as string;
    const { senderId, text } = req.body;

    if (!senderId || !text) {
      return res.status(400).json({ message: "senderId and text are required." });
    }

    const doc = await Firestore.collection("chats")
      .doc(chatId)
      .collection("messages")
      .add({
        senderId,
        text,
        timestamp: FieldValue.serverTimestamp(),
        readBy: [senderId],
      });

    return res.status(201).json({ messageId: doc.id, chatId, senderId, text });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getMessages = async (req: Request, res: Response) => {
  try {
    const chatId = req.params.chatId as string;
    const limit = Number(req.query.limit) || 50;

    const snapshot = await Firestore.collection("chats")
      .doc(chatId)
      .collection("messages")
      .orderBy("timestamp", "asc")
      .limit(limit)
      .get();

    const messages = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return res.json({ chatId, messages });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const markMessageRead = async (req: Request, res: Response) => {
  try {
    const chatId = req.params.chatId as string;
    const messageId = req.params.messageId as string;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "userId is required." });
    }

    const msgRef = Firestore.collection("chats").doc(chatId).collection("messages").doc(messageId);
    await msgRef.update({
      readBy: FieldValue.arrayUnion(userId),
    });

    return res.json({ message: "Marked as read", chatId, messageId, userId });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const updateLastSeenMessage = async (req: Request, res: Response) => {
  try {
    const chatId = req.params.chatId as string;
    const { userId, messageId } = req.body;

    if (!userId || !messageId) {
      return res.status(400).json({ message: "userId and messageId are required." });
    }

    await Firestore.collection("chats")
      .doc(chatId)
      .collection("lastSeen")
      .doc(userId)
      .set({ userId, messageId, updatedAt: FieldValue.serverTimestamp() }, { merge: true });

    return res.json({ message: "Last seen updated", chatId, userId, messageId });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const listUserChats = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId as string;

    const user = await userRepo.findOne({
      where: { id: userId },
      relations: { chats: { members: true } },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    return res.json({ chats: user.chats });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const createGroupChat = async (req: Request, res: Response) => {
  try {
    const { name, memberIds } = req.body;
    if (!name || !Array.isArray(memberIds)) {
      return res.status(400).json({ message: "name and memberIds array required." });
    }

    const members: User[] = [];
    for (const id of memberIds) {
      const u = await userRepo.findOneBy({ id });
      if (u) members.push(u);
    }

    const groupChat = chatRepo.create({ name, isGroup: true, members });
    await chatRepo.save(groupChat);

    return res.status(201).json(groupChat);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
