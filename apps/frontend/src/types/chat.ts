import { MessageSender, MessageStatus } from "./enums";
import { File } from "./global";
import { User } from "./user";

export interface ChatResponse {
  data: Chat;
}

export interface Chat {
  id: string;
  user: User;
  userId: string;
  unreadCount: number;
  lastMessage?: string | null;
  lastAt?: string | null;
  messages: Message[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Message {
  id: string;
  chat: Chat;
  chatId: string;
  sender: MessageSender;
  body?: string | null;
  file?: File | null;
  status: MessageStatus;
  createdAt?: string;
  updatedAt?: string;
}
