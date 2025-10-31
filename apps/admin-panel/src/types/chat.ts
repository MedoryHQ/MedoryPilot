import { MessageSender, MessageStatus } from "./enums";
import { User } from "./user";

export interface ChatResponse {
  data: Chat;
}

export interface ChatsResponse {
  data: Chat[];
  count: number;
}

export interface Chat {
  id: string;

  user: User;
  userId: string;

  unreadCount: number;
  lastMessage?: string | null;
  lastAt?: Date | null;

  messages: Message[];

  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;

  chat: Chat;
  chatId: string;

  sender: MessageSender;

  body?: string | null;
  file?: File | null;

  status: MessageStatus;

  createdAt: Date;
  updatedAt: Date;
}
