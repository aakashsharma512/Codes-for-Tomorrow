import "reflect-metadata";
import express from "express";
import { configDotenv } from "dotenv";
import { AppDataSource } from "./config/data-source";
import { createUser, getUsers } from "./controllers/user.controller";
import {
  createOrGetChat,
  sendMessage,
  getMessages,
  markMessageRead,
  updateLastSeenMessage,
  listUserChats,
  createGroupChat,
} from "./controllers/chat.controller";

configDotenv();

const app = express();
app.use(express.json());

app.post("/users/create", createUser);
app.post("/users", createUser);
app.get("/users", getUsers);

app.post("/chat/create", createOrGetChat);
app.post("/chat/:chatId/message/send", sendMessage);
app.post("/chat/:chatId/message", sendMessage);
app.get("/chat/:chatId/messages", getMessages);
app.post("/chat/:chatId/message/:messageId/read", markMessageRead);
app.post("/chat/:chatId/lastseen", updateLastSeenMessage);
app.get("/user/:userId/chats", listUserChats);
app.post("/chat/group/create", createGroupChat);

const PORT = process.env.PORT || 3000;

AppDataSource.initialize()
  .then(() => {
    console.log("Database connected!");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.error("Database connection error:", err));