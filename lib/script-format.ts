// The v2 script structure (brief, section 11) and the plain-text format the
// app uses to move scripts in and out of an AI chat. Client-safe.
//
//   TITLE: Why isn't your worst case bad enough?
//   [Hook]
//   SAY: Why isn't your worst case bad enough?
//   BOARD: Open palm on "enough".
//   SCREEN: Hook text on face, yellow bold, one word per line.
//
// `say`, `board` and `screen` are the old black / red / green layers.

import { countWords, durationForWords } from "./taxonomy";

export type Beat = {
  beat: string;
  say: string;
  board: string;
  screen: string;
  drawing: boolean;
  locked: boolean;
  fact_ids: string[];
};

export function emptyBeat(name = ""): Beat {
  return { beat: name, say: "", board: "", screen: "", drawing: false, locked: false, fact_ids: [] };
}

const FIELD = /^\s*(say|board|screen)\s*[:\-–—]\s*(.*)$/i;
const BEAT_HEAD = /^\s*(?:\[([^\]]{1,40})\]|#{2,4}\s+(.{1,60}))\s*$/;
const TITLE = /^\s*title\s*:\s*(.+)$/i;
// Direction cues that belong in the board layer vs the screen layer (A10).
const BOARD_CUE = /\[(?:WB|WB-PRE)\s*:[^\]]*\]/gi;
const SCREEN_CUE = /\[(?:WALL|ABOVE|CARD|SRC|GFX|TITLE|EMPH|SFX)\s*:[^\]]*\]|\[PUNCH\]/gi;

export function parseScript(text: string): { title: string; beats: Beat[] } {
  const lines = text.replace(/\r/g, "").split("\n");
  let title = "";
  const beats: Beat[] = [];
  const structured = lines.some((l) => FIELD.test(l));

  if (structured) {
    let cur: Beat | null = null;
    let field: "say" | "board" | "screen" | null = null;
    for (const raw of lines) {
      const line = raw.replace(/^>\s?/, "");
      const t = line.match(TITLE);
      if (t && !title) { title = t[1].trim(); continue; }
      const h = line.match(BEAT_HEAD);
      if (h) { cur = emptyBeat((h[1] ?? h[2]).trim()); beats.push(cur); field = null; continue; }
      const f = line.match(FIELD);
      if (f) {
        if (!cur) { cur = emptyBeat(""); beats.push(cur); }
        field = f[1].toLowerCase() as "say" | "board" | "screen";
        if (field === "say" && cur.say) { cur = emptyBeat(""); beats.push(cur); }
        cur[field] = f[2].trim();
        continue;
      }
      if (cur && field && line.trim()) cur[field] = `${cur[field]} ${line.trim()}`.trim();
    }
  } else {
    // Plain text, e.g. a script pasted from a chat: one beat per non-empty
    // line. "Board:" lines attach to the line above; bracketed cues move to
    // the board or screen layer.
    for (const raw of lines) {
      const line = raw.replace(/^>\s?/, "").trim();
      if (!line) continue;
      const t = line.match(TITLE) ?? line.match(/^#\s*(.+)$/) ?? line.match(/^###\s*["“]?(.+?)["”]?\s*$/);
      if (t && !title && beats.length === 0) { title = t[1].trim(); continue; }
      const b = line.match(/^board\s*:\s*(.+)$/i);
      if (b) { if (beats.length) beats[beats.length - 1].board = b[1].trim(); continue; }
      const board = (line.match(BOARD_CUE) ?? []).join(" ");
      const screen = (line.match(SCREEN_CUE) ?? []).join(" ");
      const say = line.replace(BOARD_CUE, "").replace(SCREEN_CUE, "").replace(/\s{2,}/g, " ").trim();
      if (!say && beats.length) {
        const last = beats[beats.length - 1];
        last.board = [last.board, board].filter(Boolean).join(" ");
        last.screen = [last.screen, screen].filter(Boolean).join(" ");
        continue;
      }
      beats.push({ ...emptyBeat(""), say, board, screen });
    }
  }
  const named = beats.filter((b) => b.say || b.board || b.screen).map((b, i) => ({ ...b, beat: b.beat || (i === 0 ? "Hook" : `Beat ${i + 1}`) }));
  return { title: title || named[0]?.say.slice(0, 80) || "", beats: named };
}

export function serializeScript(beats: Beat[], title = "") {
  const out: string[] = [];
  if (title) out.push(`TITLE: ${title}`);
  beats.forEach((b, i) => {
    out.push(`[${b.beat || (i === 0 ? "Hook" : `Beat ${i + 1}`)}]${b.locked ? " (LOCKED)" : ""}`);
    out.push(`SAY: ${b.say}`);
    if (b.board) out.push(`BOARD: ${b.board}`);
    if (b.screen) out.push(`SCREEN: ${b.screen}`);
  });
  return out.join("\n");
}

export function spokenText(beats: Beat[]) {
  return beats.map((b) => b.say).filter(Boolean).join("\n");
}

export function spokenWords(beats: Beat[]) {
  return beats.reduce((n, b) => n + countWords(b.say), 0);
}

// After a whole-script tool (Correct only, Tighten, Improve) returns a new
// script, put every locked line back exactly as it was. Locked beats are
// matched by position first, then appended if the AI dropped them.
export function enforceLocks(before: Beat[], after: Beat[]): Beat[] {
  const locked = before.map((b, i) => ({ b, i })).filter((x) => x.b.locked);
  if (locked.length === 0) return after;
  const result = [...after];
  for (const { b, i } of locked) {
    if (i < result.length) result[i] = { ...b };
    else result.push({ ...b });
  }
  return result;
}

// Classification for "Paste from Claude" when no AI is connected (section 5.2).
export function classifyScript(text: string, beats: Beat[]) {
  const words = spokenWords(beats);
  const lower = text.toLowerCase();
  const hasYear = /\b(1[5-9]\d\d|20[0-4]\d)\b/.test(text);
  const firstPerson = /\b(i'm|i've|i am|i built|my clients|my business|i'm building|we're building)\b/.test(lower);
  const building = /\b(building|built|week \d+|day \d+|episode|progress)\b/.test(lower);
  const type = hasYear ? "history" : firstPerson ? (building ? "build" : "authority") : "whiteboard";
  const funnel = /\b(dm me|link in bio|book a call)\b/.test(lower) ? "bofu" : /\bcomment\b/.test(lower) ? "mofu" : "tofu";
  return { format: "reel" as const, duration: durationForWords(words), type, funnel, words };
}
