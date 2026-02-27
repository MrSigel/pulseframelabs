import type { ChatUserstate } from "tmi.js";

export interface HandlerContext {
  userId: string;
  channel: string;
  say: (message: string) => void;
}

export interface MessageHandler {
  name: string;
  enabled: boolean;
  canHandle(
    channel: string,
    tags: ChatUserstate,
    message: string,
    context: HandlerContext,
  ): boolean;
  handle(
    channel: string,
    tags: ChatUserstate,
    message: string,
    context: HandlerContext,
  ): Promise<void>;
}
