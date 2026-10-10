import { Entity, PrimaryGeneratedColumn, CreateDateColumn, ManyToMany, JoinTable, Column } from "typeorm";
import User from "./User";

@Entity("chats")
export class Chat {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({ type: "boolean", default: false })
    isGroup!: boolean;

    @Column({ type: "varchar", nullable: true })
    name?: string;

    @ManyToMany(() => User, user => user.chats)
    @JoinTable({
        name: "chat_members",
        joinColumn: {
            name: "chatId",
            referencedColumnName: "id"
        },
        inverseJoinColumn: {
            name: "userId",
            referencedColumnName: "id"
        }
    })
    members!: User[];

    @CreateDateColumn()
    createdAt!: Date;
}