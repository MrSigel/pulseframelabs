"use client";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, Trash2, Megaphone, X, History, Settings, Plus, ChevronLeft, ChevronRight, Inbox } from "lucide-react";
import { useState } from "react";

interface GuessEntry {
  id: number;
  username: string;
  guess: string;
  guessedAt: string;
  changedAt: string;
}

interface HistoryEntry {
  id: number;
  date: string;
  participants: number;
  winner: string;
  guess: string;
}

export default function QuickGuessesPage() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [twitchUsername, setTwitchUsername] = useState("");
  const [guesses, setGuesses] = useState<GuessEntry[]>([]);
  const [history] = useState<HistoryEntry[]>([]);
  const [guessesOpen, setGuessesOpen] = useState(true);

  // Settings state
  const [successMsg, setSuccessMsg] = useState("");
  const [alreadyInUseMsg, setAlreadyInUseMsg] = useState("");
  const [guessChangedMsg, setGuessChangedMsg] = useState("");
  const [wrongNumbersMsg, setWrongNumbersMsg] = useState("");
  const [notActiveMsg, setNotActiveMsg] = useState("");
  const [winnerMsg, setWinnerMsg] = useState("");
  const [commands, setCommands] = useState(["!command"]);

  const addCommand = () => {
    setCommands((prev) => [...prev, "!command"]);
  };

  const updateCommand = (index: number, value: string) => {
    setCommands((prev) => prev.map((c, i) => (i === index ? value : c)));
  };

  const removeCommand = (index: number) => {
    setCommands((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClearGuesses = () => {
    setGuesses([]);
  };

  const handleCloseGuesses = () => {
    setGuessesOpen(false);
  };

  return (
    <div>
      <PageHeader
        title="Quick Guesses (Beta)"
        actions={
          <>
            <Button variant="outline" className="gap-2" onClick={() => setHistoryOpen(true)}>
              <History className="h-4 w-4" />
              Quick Guess History
            </Button>
            <Button variant="outline" className="gap-2" onClick={() => setSettingsOpen(true)}>
              <Settings className="h-4 w-4" />
              Settings
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base text-white">Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-semibold text-white mb-2 block">Twitch Username</Label>
              <Input
                placeholder="Enter your twitch username"
                value={twitchUsername}
                onChange={(e) => setTwitchUsername(e.target.value)}
              />
              <p className="text-xs text-slate-500 mt-2">
                Enter your twitch username to enable live hotwords on twitch, leave blank to disable.
              </p>
            </div>
            <Button className="gap-2">
              <Save className="h-4 w-4" />
              Save
            </Button>
          </CardContent>
        </Card>

        {/* Options */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base text-white">Options</CardTitle>
            {!guessesOpen && (
              <span className="text-[10px] font-semibold text-red-400 uppercase tracking-wider">Guesses Closed</span>
            )}
            {guessesOpen && (
              <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider">Guesses Open</span>
            )}
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-slate-500">
              You must mod CElementsBot for this to work as intended. /mod CElementsBot
            </p>
            <p className="text-xs text-slate-500">
              If you clear the guesses, it will be saved in the Quick Guess History.
            </p>
            <Button variant="destructive" className="w-full gap-2" onClick={handleClearGuesses}>
              <Trash2 className="h-4 w-4" />
              Clear Guesses
            </Button>
            <Button variant="success" className="w-full gap-2">
              <Megaphone className="h-4 w-4" />
              Announce Guess Winner to Chat
            </Button>
            <Button variant="outline" className="w-full gap-2" onClick={handleCloseGuesses}>
              <X className="h-4 w-4" />
              {guessesOpen ? "Close Guesses" : "Open Guesses"}
            </Button>
          </CardContent>
        </Card>

        {/* Guesses Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base text-white">Guesses</CardTitle>
            <span className="text-xs text-slate-500">{guesses.length} total</span>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-2 text-xs text-slate-500 font-semibold uppercase border-b border-border pb-2 mb-2">
              <span>Username</span>
              <span>Guess</span>
              <span>Guessed at</span>
              <span>Changed at</span>
            </div>
            {guesses.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-sm">
                No guesses yet
              </div>
            ) : (
              <div className="space-y-1">
                {guesses.map((g) => (
                  <div key={g.id} className="grid grid-cols-4 gap-2 text-xs py-1.5 border-b border-white/[0.03]">
                    <span className="text-white font-medium">{g.username}</span>
                    <span className="text-slate-300">{g.guess}</span>
                    <span className="text-slate-500">{g.guessedAt}</span>
                    <span className="text-slate-500">{g.changedAt}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ====== Settings Modal ====== */}
      {settingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            style={{ animation: "fadeIn 0.2s ease-out" }}
            onClick={() => setSettingsOpen(false)}
          />
          <div
            className="relative z-10 w-full max-w-3xl rounded-xl border border-white/[0.08] shadow-2xl max-h-[90vh] flex flex-col"
            style={{
              background: "linear-gradient(135deg, #0f1521 0%, #1a2235 50%, #0f1521 100%)",
              animation: "modalSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
              boxShadow: "0 0 60px rgba(59, 130, 246, 0.08), 0 25px 50px rgba(0,0,0,0.5)",
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
              <h2 className="text-white font-bold text-lg">Quick Guess Settings</h2>
              <button
                onClick={() => setSettingsOpen(false)}
                className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/[0.06] transition-all"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-5 overflow-y-auto flex-1">
              {/* Row 1 */}
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <Label className="text-sm font-semibold text-white mb-2 block">Success Message</Label>
                  <textarea
                    className="w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all resize-y min-h-[80px]"
                    placeholder="Success Message"
                    value={successMsg}
                    onChange={(e) => setSuccessMsg(e.target.value)}
                    rows={3}
                  />
                  <p className="text-[11px] text-slate-500 mt-1.5 flex items-center gap-1">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                    You can use the following variables: <span className="text-pink-400">@{"{username}"}</span>, <span className="text-pink-400">{"{guess}"}</span>
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-semibold text-white mb-2 block">Guess already in use Message</Label>
                  <textarea
                    className="w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all resize-y min-h-[80px]"
                    placeholder="Guess already in use Message"
                    value={alreadyInUseMsg}
                    onChange={(e) => setAlreadyInUseMsg(e.target.value)}
                    rows={3}
                  />
                  <p className="text-[11px] text-slate-500 mt-1.5 flex items-center gap-1">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                    You can use the following variables: <span className="text-pink-400">@{"{username}"}</span>, <span className="text-pink-400">{"{guess}"}</span>
                  </p>
                </div>
              </div>

              {/* Row 2 */}
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <Label className="text-sm font-semibold text-white mb-2 block">Guess Changed Message</Label>
                  <textarea
                    className="w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all resize-y min-h-[80px]"
                    placeholder="Guess Changed Message"
                    value={guessChangedMsg}
                    onChange={(e) => setGuessChangedMsg(e.target.value)}
                    rows={3}
                  />
                  <p className="text-[11px] text-slate-500 mt-1.5 flex items-center gap-1">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                    You can use the following variables: <span className="text-pink-400">@{"{username}"}</span>, <span className="text-pink-400">{"{guess}"}</span>
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-semibold text-white mb-2 block">Wrong Numbers Message</Label>
                  <textarea
                    className="w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all resize-y min-h-[80px]"
                    placeholder="Wrong Numbers Message"
                    value={wrongNumbersMsg}
                    onChange={(e) => setWrongNumbersMsg(e.target.value)}
                    rows={3}
                  />
                  <p className="text-[11px] text-slate-500 mt-1.5 flex items-center gap-1">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                    You can use the following variables: <span className="text-pink-400">@{"{username}"}</span>, <span className="text-pink-400">{"{command}"}</span>
                  </p>
                </div>
              </div>

              {/* Row 3 */}
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <Label className="text-sm font-semibold text-white mb-2 block">Not Active Message</Label>
                  <textarea
                    className="w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all resize-y min-h-[80px]"
                    placeholder="Not Active Message"
                    value={notActiveMsg}
                    onChange={(e) => setNotActiveMsg(e.target.value)}
                    rows={3}
                  />
                  <p className="text-[11px] text-slate-500 mt-1.5 flex items-center gap-1">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                    You can use the following variables: <span className="text-pink-400">@{"{username}"}</span>
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-semibold text-white mb-2 block">Winner Message</Label>
                  <textarea
                    className="w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all resize-y min-h-[80px]"
                    placeholder="Winner Message"
                    value={winnerMsg}
                    onChange={(e) => setWinnerMsg(e.target.value)}
                    rows={3}
                  />
                  <p className="text-[11px] text-slate-500 mt-1.5 flex items-center gap-1">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                    You can use the following variables: <span className="text-pink-400">{"{place}"}</span>, <span className="text-pink-400">@{"{username}"}</span>, <span className="text-pink-400">{"{guess}"}</span>, <span className="text-pink-400">{"{difference}"}</span>
                  </p>
                </div>
              </div>

              {/* Commands */}
              <div>
                <Label className="text-sm font-semibold text-white mb-2 block">Commands</Label>
                <div className="space-y-2">
                  {commands.map((cmd, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Input
                        value={cmd}
                        onChange={(e) => updateCommand(i, e.target.value)}
                        className="flex-1"
                        placeholder="!command"
                      />
                      {commands.length > 1 && (
                        <button
                          onClick={() => removeCommand(i)}
                          className="h-9 w-9 rounded-lg flex items-center justify-center text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all shrink-0"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <Button variant="accent" size="sm" className="mt-2 gap-1" onClick={addCommand}>
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-white/[0.06] flex justify-end gap-3">
              <Button variant="outline" onClick={() => setSettingsOpen(false)}>Close</Button>
              <Button onClick={() => setSettingsOpen(false)}>Save changes</Button>
            </div>
          </div>
        </div>
      )}

      {/* ====== History Modal ====== */}
      {historyOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            style={{ animation: "fadeIn 0.2s ease-out" }}
            onClick={() => setHistoryOpen(false)}
          />
          <div
            className="relative z-10 w-full max-w-2xl rounded-xl border border-white/[0.08] shadow-2xl"
            style={{
              background: "linear-gradient(135deg, #0f1521 0%, #1a2235 50%, #0f1521 100%)",
              animation: "modalSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
              boxShadow: "0 0 60px rgba(59, 130, 246, 0.08), 0 25px 50px rgba(0,0,0,0.5)",
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
              <h2 className="text-white font-bold text-lg">Quick Guess History</h2>
              <button
                onClick={() => setHistoryOpen(false)}
                className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/[0.06] transition-all"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5">
              {/* Table Header */}
              <div
                className="grid gap-4 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500"
                style={{
                  gridTemplateColumns: "1fr 0.8fr 1fr 0.8fr",
                  borderBottom: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <span>Date</span>
                <span>Participants</span>
                <span>Winner</span>
                <span>Guess</span>
              </div>

              {history.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                  <Inbox className="h-10 w-10 mb-3 text-slate-600" />
                  <p className="text-sm">No history available</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {history.map((h) => (
                    <div
                      key={h.id}
                      className="grid gap-4 px-4 py-2.5 text-sm"
                      style={{
                        gridTemplateColumns: "1fr 0.8fr 1fr 0.8fr",
                        borderBottom: "1px solid rgba(255,255,255,0.03)",
                      }}
                    >
                      <span className="text-slate-400">{h.date}</span>
                      <span className="text-white">{h.participants}</span>
                      <span className="text-emerald-400 font-medium">{h.winner}</span>
                      <span className="text-white">{h.guess}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/[0.06]">
                <span className="text-xs text-slate-600">Showing no records</span>
                <div className="flex items-center gap-1">
                  <Button variant="outline" size="icon-sm" disabled>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon-sm" disabled>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-white/[0.06] flex justify-end">
              <Button variant="outline" onClick={() => setHistoryOpen(false)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
