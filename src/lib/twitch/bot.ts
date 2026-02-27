"use client";

import tmi from "tmi.js";
import type { ChatUserstate } from "tmi.js";
import type { MessageHandler, HandlerContext } from "./types";

type BotStatus = "disconnected" | "connecting" | "connected";
type StatusListener = (status: BotStatus) => void;
type LogListener = (entry: { time: Date; type: string; message: string }) => void;

class TwitchBot {
  private client: tmi.Client | null = null;
  private handlers: MessageHandler[] = [];
  private statusListeners: StatusListener[] = [];
  private logListeners: LogListener[] = [];
  private _status: BotStatus = "disconnected";
  private _channel: string | null = null;
  private _userId: string | null = null;

  get status() {
    return this._status;
  }
  get isConnected() {
    return this._status === "connected";
  }
  get channel() {
    return this._channel;
  }

  private setStatus(s: BotStatus) {
    this._status = s;
    this.statusListeners.forEach((fn) => fn(s));
  }

  onStatusChange(fn: StatusListener) {
    this.statusListeners.push(fn);
    return () => {
      this.statusListeners = this.statusListeners.filter((l) => l !== fn);
    };
  }

  onLog(fn: LogListener) {
    this.logListeners.push(fn);
    return () => {
      this.logListeners = this.logListeners.filter((l) => l !== fn);
    };
  }

  private log(type: string, message: string) {
    const entry = { time: new Date(), type, message };
    this.logListeners.forEach((fn) => fn(entry));
  }

  async connect(token: string, channel: string, userId: string): Promise<void> {
    if (this.client) {
      await this.disconnect();
    }

    this._channel = channel;
    this._userId = userId;
    this.setStatus("connecting");

    this.client = new tmi.Client({
      options: { debug: false },
      connection: { reconnect: true, secure: true },
      identity: { username: channel, password: `oauth:${token}` },
      channels: [channel],
    });

    this.client.on("message", (_ch: string, tags: ChatUserstate, message: string, self: boolean) => {
      if (self) return;
      this.handleMessage(_ch, tags, message);
    });

    this.client.on("connected", () => {
      this.setStatus("connected");
      this.log("system", `Connected to #${channel}`);
    });

    this.client.on("disconnected", () => {
      this.setStatus("disconnected");
      this.log("system", "Disconnected from Twitch");
    });

    try {
      await this.client.connect();
    } catch (err) {
      this.setStatus("disconnected");
      this.log("error", `Connection failed: ${err instanceof Error ? err.message : String(err)}`);
      throw err;
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      try {
        await this.client.disconnect();
      } catch {
        // ignore disconnect errors
      }
      this.client = null;
    }
    this._channel = null;
    this.setStatus("disconnected");
  }

  say(message: string) {
    if (this.client && this._channel) {
      this.client.say(this._channel, message).catch(() => {});
    }
  }

  addHandler(handler: MessageHandler) {
    this.handlers.push(handler);
  }

  removeHandler(name: string) {
    this.handlers = this.handlers.filter((h) => h.name !== name);
  }

  clearHandlers() {
    this.handlers = [];
  }

  getHandlers() {
    return [...this.handlers];
  }

  private async handleMessage(channel: string, tags: ChatUserstate, message: string) {
    const context: HandlerContext = {
      userId: this._userId || "",
      channel: channel.replace("#", ""),
      say: (msg: string) => this.say(msg),
    };

    for (const handler of this.handlers) {
      if (!handler.enabled) continue;
      try {
        if (handler.canHandle(channel, tags, message, context)) {
          await handler.handle(channel, tags, message, context);
          this.log(handler.name, `${tags["display-name"] || tags.username}: ${message}`);
        }
      } catch (err) {
        this.log("error", `Handler "${handler.name}" error: ${err instanceof Error ? err.message : String(err)}`);
      }
    }
  }
}

// Singleton instance
export const twitchBot = new TwitchBot();
