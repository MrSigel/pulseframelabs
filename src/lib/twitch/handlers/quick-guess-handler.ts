import type { ChatUserstate } from "tmi.js";
import type { MessageHandler, HandlerContext } from "../types";
import { createClient } from "@/lib/supabase/client";

interface QuickGuessState {
  commands: string[];
  activeSessionId: string | null;
  isOpen: boolean;
  messages: {
    success: string;
    alreadyInUse: string;
    guessChanged: string;
    wrongNumbers: string;
    notActive: string;
  };
}

function formatMsg(template: string, vars: Record<string, string>): string {
  let result = template;
  for (const [key, val] of Object.entries(vars)) {
    result = result.replace(new RegExp(`\\{${key}\\}|@\\{${key}\\}`, "g"), val);
  }
  return result;
}

export function createQuickGuessHandler(state: QuickGuessState): MessageHandler {
  return {
    name: "quick-guesses",
    enabled: true,
    canHandle(_channel: string, _tags: ChatUserstate, message: string) {
      const cmd = message.split(" ")[0].toLowerCase();
      return state.commands.some((c) => c.toLowerCase() === cmd);
    },
    async handle(_channel: string, tags: ChatUserstate, message: string, context: HandlerContext) {
      const username = tags["display-name"] || tags.username || "anonymous";
      const parts = message.split(" ");
      const guess = parts[1]?.trim();

      if (!state.isOpen || !state.activeSessionId) {
        context.say(formatMsg(state.messages.notActive, { username }));
        return;
      }

      if (!guess || isNaN(Number(guess))) {
        context.say(formatMsg(state.messages.wrongNumbers, { username, command: parts[0] }));
        return;
      }

      const supabase = createClient();

      // Check if user already guessed
      const { data: existing } = await supabase
        .from("quick_guess_entries")
        .select("id")
        .eq("session_id", state.activeSessionId)
        .eq("username", username)
        .maybeSingle();

      if (existing) {
        // Check if same guess number is taken by someone else
        const { data: taken } = await supabase
          .from("quick_guess_entries")
          .select("id")
          .eq("session_id", state.activeSessionId)
          .eq("guess", guess)
          .neq("username", username)
          .maybeSingle();

        if (taken) {
          context.say(formatMsg(state.messages.alreadyInUse, { username, guess }));
          return;
        }

        // Update existing guess
        await supabase
          .from("quick_guess_entries")
          .update({ guess, changed_at: new Date().toISOString() })
          .eq("id", existing.id);

        context.say(formatMsg(state.messages.guessChanged, { username, guess }));
      } else {
        // Check if guess number is taken
        const { data: taken } = await supabase
          .from("quick_guess_entries")
          .select("id")
          .eq("session_id", state.activeSessionId)
          .eq("guess", guess)
          .maybeSingle();

        if (taken) {
          context.say(formatMsg(state.messages.alreadyInUse, { username, guess }));
          return;
        }

        await supabase.from("quick_guess_entries").insert({
          user_id: context.userId,
          session_id: state.activeSessionId,
          username,
          guess,
          guessed_at: new Date().toISOString(),
        });

        context.say(formatMsg(state.messages.success, { username, guess }));
      }
    },
  };
}
