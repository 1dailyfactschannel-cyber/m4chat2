import type { MessageEntity } from "../types/entities.js";

/**
 * Parse Telegram-style Markdown text into plain text + entities array.
 * Supports: *bold*, _italic_, `code`, ||spoiler||, ~strikethrough~,
 * ```pre```, @mention, #hashtag, /bot_command
 *
 * Offsets and lengths are in UTF-16 code units (JavaScript string indices).
 */
export function parseMarkdown(input: string): {
  text: string;
  entities: MessageEntity[];
} {
  const entities: MessageEntity[] = [];
  let text = "";
  let i = 0;

  // Stack for nested formatting: { type, startOffset }
  const stack: { type: MessageEntity["type"]; startOffset: number }[] = [];

  while (i < input.length) {
    const ch = input[i];

    // Triple backtick (pre / code block)
    if (ch === "`" && input.slice(i, i + 3) === "```") {
      // Check if we're closing a pre on stack
      const preIdx = stack.findIndex((s) => s.type === "pre");
      if (preIdx !== -1) {
        const pre = stack[preIdx];
        entities.push({
          offset: pre.startOffset,
          length: text.length - pre.startOffset,
          type: "pre",
        });
        stack.splice(preIdx, 1);
        i += 3;
        continue;
      }
      // Opening pre
      stack.push({ type: "pre", startOffset: text.length });
      i += 3;
      // Skip optional newline right after opening ```
      if (input[i] === "\n") i++;
      continue;
    }

    // Single backtick (inline code)
    if (ch === "`") {
      const codeIdx = stack.findIndex((s) => s.type === "code");
      if (codeIdx !== -1) {
        const code = stack[codeIdx];
        entities.push({
          offset: code.startOffset,
          length: text.length - code.startOffset,
          type: "code",
        });
        stack.splice(codeIdx, 1);
        i++;
        continue;
      }
      stack.push({ type: "code", startOffset: text.length });
      i++;
      continue;
    }

    // Spoiler ||...||
    if (ch === "|" && input.slice(i, i + 2) === "||") {
      const spoilerIdx = stack.findIndex((s) => s.type === "spoiler");
      if (spoilerIdx !== -1) {
        const spoiler = stack[spoilerIdx];
        entities.push({
          offset: spoiler.startOffset,
          length: text.length - spoiler.startOffset,
          type: "spoiler",
        });
        stack.splice(spoilerIdx, 1);
        i += 2;
        continue;
      }
      stack.push({ type: "spoiler", startOffset: text.length });
      i += 2;
      continue;
    }

    // Strikethrough ~...~
    if (ch === "~") {
      const strikeIdx = stack.findIndex((s) => s.type === "strikethrough");
      if (strikeIdx !== -1) {
        const strike = stack[strikeIdx];
        entities.push({
          offset: strike.startOffset,
          length: text.length - strike.startOffset,
          type: "strikethrough",
        });
        stack.splice(strikeIdx, 1);
        i++;
        continue;
      }
      stack.push({ type: "strikethrough", startOffset: text.length });
      i++;
      continue;
    }

    // Bold *...*
    if (ch === "*") {
      const boldIdx = stack.findIndex((s) => s.type === "bold");
      if (boldIdx !== -1) {
        const bold = stack[boldIdx];
        entities.push({
          offset: bold.startOffset,
          length: text.length - bold.startOffset,
          type: "bold",
        });
        stack.splice(boldIdx, 1);
        i++;
        continue;
      }
      stack.push({ type: "bold", startOffset: text.length });
      i++;
      continue;
    }

    // Italic _..._
    if (ch === "_") {
      const italicIdx = stack.findIndex((s) => s.type === "italic");
      if (italicIdx !== -1) {
        const italic = stack[italicIdx];
        entities.push({
          offset: italic.startOffset,
          length: text.length - italic.startOffset,
          type: "italic",
        });
        stack.splice(italicIdx, 1);
        i++;
        continue;
      }
      stack.push({ type: "italic", startOffset: text.length });
      i++;
      continue;
    }

    // Plain character: append to text
    text += ch;
    i++;
  }

  // Auto-close any remaining open entities at end of string
  for (const open of stack) {
    entities.push({
      offset: open.startOffset,
      length: text.length - open.startOffset,
      type: open.type,
    });
  }

  // --- Second pass: detect mentions, hashtags, bot commands ---
  // These are detected in the *parsed* plain text (after removing markdown markers)
  const wordRegex = /(?:^|\s)([@#\/])(\w+)(?=$|\s)/g;
  let m: RegExpExecArray | null;
  while ((m = wordRegex.exec(text)) !== null) {
    const prefix = m[1];
    const name = m[2];
    const start = m.index + m[0].indexOf(prefix); // position of prefix character

    let type: MessageEntity["type"];
    if (prefix === "@") type = "mention";
    else if (prefix === "#") type = "hashtag";
    else if (prefix === "/") type = "bot_command";
    else continue;

    entities.push({
      offset: start,
      length: 1 + name.length,
      type,
    });
  }

  // Merge overlapping entities? For now just sort by offset
  entities.sort((a, b) => a.offset - b.offset);

  return { text, entities };
}
