import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from "typeorm";
import { Chat } from "./Chat";


@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 255 })
  name!: string;

  @ManyToMany(() => Chat, (chat) => chat.members)
  chats!: Chat[];

  @Column({ type: "varchar", length: 255 })
  password!: string;
}

export default User;
