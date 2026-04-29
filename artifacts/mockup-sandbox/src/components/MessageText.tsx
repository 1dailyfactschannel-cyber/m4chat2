import React, { useState } from "react";
import type { MessageEntity } from "../types/entities";

interface MessageTextProps {
  content: string | null;
  entities?: MessageEntity[] | null;
  darkMode?: boolean;
  className?: string;
}

export const MessageText: React.FC<MessageTextProps> = ({
  content,
  entities,
  darkMode = false,
  className = "",
}) => {
  const [revealedSpoilers, setRevealedSpoilers] = useState<Set<number>>(new Set());

  if (!content) return null;
  if (!entities || entities.length === 0) {
    return <span className={className}>{content}</span>;
  }

  // Build array of segments with their entity types
  const segments: {
    text: string;
    types: MessageEntity["type"][];
    url?: string;
    language?: string;
  }[] = [];

  let currentOffset = 0;

  // Sort entities by offset
  const sortedEntities = [...entities].sort((a, b) => a.offset - b.offset);

  // Build a map of offsets to active entity types
  const activeAt = new Map<number, { start: boolean; type: MessageEntity["type"]; url?: string; language?: string }[]>();
  const endAt = new Map<number, { type: MessageEntity["type"]; url?: string; language?: string }[]>();

  for (const entity of sortedEntities) {
    const start = entity.offset;
    const finish = entity.offset + entity.length;
    if (!activeAt.has(start)) activeAt.set(start, []);
    activeAt.get(start)!.push({ start: true, type: entity.type, url: entity.url, language: entity.language });
    if (!endAt.has(finish)) endAt.set(finish, []);
    endAt.get(finish)!.push({ type: entity.type, url: entity.url, language: entity.language });
  }

  const points = Array.from(new Set([...activeAt.keys(), ...endAt.keys()])).sort((a, b) => a - b);

  let prev = 0;
  const activeStack: { type: MessageEntity["type"]; url?: string; language?: string }[] = [];

  for (const point of points) {
    if (point > prev) {
      const text = content.slice(prev, point);
      segments.push({
        text,
        types: activeStack.map((a) => a.type),
        url: activeStack.find((a) => a.url)?.url,
        language: activeStack.find((a) => a.language)?.language,
      });
    }

    // Process ends first (LIFO for nested)
    const ends = endAt.get(point) || [];
    for (const end of ends) {
      const idx = activeStack.findIndex((a) => a.type === end.type && a.url === end.url && a.language === end.language);
      if (idx !== -1) activeStack.splice(idx, 1);
    }

    const starts = activeAt.get(point) || [];
    for (const start of starts) {
      activeStack.push({ type: start.type, url: start.url, language: start.language });
    }

    prev = point;
  }

  if (prev < content.length) {
    segments.push({
      text: content.slice(prev),
      types: activeStack.map((a) => a.type),
      url: activeStack.find((a) => a.url)?.url,
      language: activeStack.find((a) => a.language)?.language,
    });
  }

  return (
    <span className={className}>
      {segments.map((seg, i) => {
        const key = `${i}-${seg.text.slice(0, 10)}`;
        let element: React.ReactNode = seg.text;

        const isSpoiler = seg.types.includes("spoiler");
        const isRevealed = revealedSpoilers.has(i);

        if (seg.types.includes("bold")) {
          element = <strong key={key}>{element}</strong>;
        }
        if (seg.types.includes("italic")) {
          element = <em key={key}>{element}</em>;
        }
        if (seg.types.includes("strikethrough")) {
          element = <del key={key}>{element}</del>;
        }
        if (seg.types.includes("code")) {
          element = (
            <code
              key={key}
              className={`px-1 py-0.5 rounded text-sm font-mono ${darkMode ? "bg-gray-700 text-gray-200" : "bg-gray-200 text-gray-800"}`}
            >
              {element}
            </code>
          );
        }
        if (seg.types.includes("pre")) {
          element = (
            <pre
              key={key}
              className={`block p-2 rounded my-1 overflow-x-auto text-sm font-mono ${darkMode ? "bg-gray-800 text-gray-200" : "bg-gray-100 text-gray-800"}`}
            >
              <code>{element}</code>
            </pre>
          );
        }
        if (seg.types.includes("text_link") && seg.url) {
          element = (
            <a
              key={key}
              href={seg.url}
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-[#2481CC] hover:text-[#1a6db3]"
              onClick={(e) => e.stopPropagation()}
            >
              {element}
            </a>
          );
        }
        if (seg.types.includes("mention")) {
          element = (
            <span key={key} className="text-[#2481CC] cursor-pointer hover:underline">
              {element}
            </span>
          );
        }
        if (seg.types.includes("hashtag")) {
          element = (
            <span key={key} className="text-[#2481CC] cursor-pointer hover:underline">
              {element}
            </span>
          );
        }
        if (seg.types.includes("bot_command")) {
          element = (
            <span key={key} className="text-[#2481CC] cursor-pointer hover:underline">
              {element}
            </span>
          );
        }
        if (isSpoiler) {
          const handleReveal = (e: React.MouseEvent) => {
            e.stopPropagation();
            setRevealedSpoilers((prev) => new Set(prev).add(i));
          };
          if (!isRevealed) {
            element = (
              <span
                key={key}
                onClick={handleReveal}
                className={`cursor-pointer rounded px-1 select-none ${darkMode ? "bg-gray-600 text-transparent" : "bg-gray-300 text-transparent"}`}
                title="Нажмите, чтобы показать"
              >
                {seg.text}
              </span>
            );
          }
        }

        return <React.Fragment key={key}>{element}</React.Fragment>;
      })}
    </span>
  );
};
