import type { MessageHandler } from "../types";

interface CustomResponseEntry {
  response: string;
  cooldown: number;
}

export function createCustomResponseHandler(
  commands: Map<string, CustomResponseEntry>,
): MessageHandler {
  const lastUsed = new Map<string, number>();

  return {
    name: "custom-responses",
    enabled: true,
    canHandle(_channel, _tags, message) {
      const cmd = message.split(" ")[0].toLowerCase();
      return commands.has(cmd);
    },
    async handle(_channel, tags, message, context) {
      const cmd = message.split(" ")[0].toLowerCase();
      const entry = commands.get(cmd);
      if (!entry) return;

      // Cooldown check
      const now = Date.now();
      const last = lastUsed.get(cmd) || 0;
      if (now - last < entry.cooldown * 1000) return;
      lastUsed.set(cmd, now);

      // Send response with {user} placeholder
      const username = tags["display-name"] || tags.username || "viewer";
      const text = entry.response.replace(/\{user\}/gi, username);
      context.say(text);
    },
  };
}
