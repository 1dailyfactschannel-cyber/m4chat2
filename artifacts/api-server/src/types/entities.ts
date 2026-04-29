export type MessageEntityType =
  | "bold"
  | "italic"
  | "code"
  | "pre"
  | "spoiler"
  | "strikethrough"
  | "text_link"
  | "mention"
  | "hashtag"
  | "bot_command";

export interface MessageEntity {
  offset: number;
  length: number;
  type: MessageEntityType;
  url?: string;
  language?: string;
}
