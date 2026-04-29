import React from "react";
import { Bold, Italic, Strikethrough, Code, EyeOff, Type } from "lucide-react";

interface FormatToolbarProps {
  onFormat: (type: "bold" | "italic" | "strikethrough" | "code" | "spoiler" | "pre") => void;
  darkMode?: boolean;
}

export const FormatToolbar: React.FC<FormatToolbarProps> = ({ onFormat, darkMode }) => {
  const buttons = [
    { type: "bold" as const, icon: Bold, label: "Bold (Ctrl+B)" },
    { type: "italic" as const, icon: Italic, label: "Italic (Ctrl+I)" },
    { type: "strikethrough" as const, icon: Strikethrough, label: "Strikethrough (Ctrl+U)" },
    { type: "code" as const, icon: Code, label: "Code (Ctrl+Shift+M)" },
    { type: "spoiler" as const, icon: EyeOff, label: "Spoiler (Ctrl+K)" },
  ];

  return (
    <div
      className={`flex items-center gap-1 px-2 py-1 rounded-lg border ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} shadow-sm`}
    >
      {buttons.map((btn) => (
        <button
          key={btn.type}
          onClick={() => onFormat(btn.type)}
          title={btn.label}
          className={`p-1.5 rounded-md transition-colors ${darkMode ? "hover:bg-gray-700 text-gray-300" : "hover:bg-gray-100 text-gray-600"}`}
        >
          <btn.icon className="w-4 h-4" />
        </button>
      ))}
    </div>
  );
};
