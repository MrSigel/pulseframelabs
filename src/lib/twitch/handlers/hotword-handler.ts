import type { ChatUserstate } from "tmi.js";
import type { MessageHandler, HandlerContext } from "../types";
import { createClient } from "@/lib/supabase/client";

interface HotwordState {
  excludedWords: string[];
}

export function createHotwordHandler(state: HotwordState): MessageHandler {
  return {
    name: "hotwords",
    enabled: true,
    canHandle() {
      return true; // process every message for word counting
    },
    async handle(_channel: string, _tags: ChatUserstate, message: string, context: HandlerContext) {
      const words = message
        .toLowerCase()
        .split(/\s+/)
        .filter((w) => w.length > 1 && !state.excludedWords.includes(w));

      const uniqueWords = [...new Set(words)];
      if (uniqueWords.length === 0) return;

      const supabase = createClient();

      for (const word of uniqueWords) {
        // Try to increment existing entry
        const { data: existing } = await supabase
          .from("hotword_entries")
          .select("id, count")
          .eq("user_id", context.userId)
          .eq("word", word)
          .maybeSingle();

        if (existing) {
          await supabase
            .from("hotword_entries")
            .update({ count: existing.count + 1, last_seen: new Date().toISOString() })
            .eq("id", existing.id);
        } else {
          await supabase
            .from("hotword_entries")
            .insert({
              user_id: context.userId,
              word,
              count: 1,
              first_seen: new Date().toISOString(),
              last_seen: new Date().toISOString(),
            });
        }
      }
    },
  };
}
