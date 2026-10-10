import "reflect-metadata";
import { DataSource } from "typeorm";
import { Chat } from "../entities/Chat";
import process from "process";
import User from "../entities/User";

export const AppDataSource = new DataSource({
  type: "postgres",
  url: 'postgresql://neondb_owner:npg_SsWtqeC3dz5g@ep-jolly-dawn-b4sxogxb-pooler.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: {
    rejectUnauthorized: false,
  },
  synchronize: true,
  logging: false,
  entities: [User, Chat],
  migrations: [],
  subscribers: [],
});
