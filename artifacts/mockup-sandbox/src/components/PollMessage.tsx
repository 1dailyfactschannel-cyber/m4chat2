import React, { useState, useEffect } from "react";
import { api } from "../lib/api";

interface PollMessageProps {
  messageId: number;
  darkMode?: boolean;
  outgoing?: boolean;
}

export const PollMessage: React.FC<PollMessageProps> = ({
  messageId,
  darkMode = false,
  outgoing = false,
}) => {
  const [poll, setPoll] = useState<any>(null);
  const [selectedOptions, setSelectedOptions] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadPoll = async () => {
      try {
        const data = await api.getPoll(messageId);
        setPoll(data);
      } catch (err) {
        console.error("Failed to load poll:", err);
      }
    };
    loadPoll();
  }, [messageId]);

  const handleVote = async (optionIndex: number) => {
    if (!poll || loading) return;
    setLoading(true);
    try {
      const result = await api.votePoll(poll.id, optionIndex);
      setPoll((prev: any) => ({ ...prev, votes: result.votes }));
      setSelectedOptions((prev) => [...prev, optionIndex]);
    } catch (err) {
      console.error("Vote failed:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!poll) return null;

  const totalVotes: number = (Object.values(poll.votes || {}) as number[]).reduce((sum, count) => sum + count, 0);

  return (
    <div className={`rounded-xl p-3 min-w-[240px] ${outgoing ? "bg-white/10" : darkMode ? "bg-gray-700" : "bg-gray-100"}`}>
      <div className={`font-semibold text-sm mb-2 ${outgoing ? "text-white" : darkMode ? "text-gray-200" : "text-gray-800"}`}>
        📊 {poll.question}
      </div>
      <div className="flex flex-col gap-1.5">
        {poll.options?.map((option: string, index: number) => {
          const votes = poll.votes?.[index] || 0;
          const percentage = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;
          const hasVoted = selectedOptions.includes(index);

          return (
            <button
              key={index}
              onClick={() => handleVote(index)}
              disabled={loading || (hasVoted && !poll.allowsMultiple)}
              className={`relative text-left px-3 py-2 rounded-lg text-sm transition-all overflow-hidden ${
                hasVoted
                  ? outgoing
                    ? "bg-white/30 text-white"
                    : "bg-[#2481CC]/20 text-[#2481CC]"
                  : outgoing
                    ? "bg-white/10 text-white/90 hover:bg-white/20"
                    : darkMode
                      ? "bg-gray-600 text-gray-200 hover:bg-gray-500"
                      : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              {/* Progress bar */}
              <div
                className={`absolute left-0 top-0 h-full rounded-lg opacity-20 ${
                  outgoing ? "bg-white" : "bg-[#2481CC]"
                }`}
                style={{ width: `${percentage}%` }}
              />
              <div className="relative flex items-center justify-between">
                <span>{option}</span>
                {totalVotes > 0 && (
                  <span className="text-xs opacity-70 ml-2">{percentage}% ({votes})</span>
                )}
              </div>
            </button>
          );
        })}
      </div>
      <div className={`text-xs mt-2 opacity-50 ${outgoing ? "text-white" : darkMode ? "text-gray-400" : "text-gray-500"}`}>
        {totalVotes} голосов · {poll.isAnonymous ? "Анонимно" : "Публично"}
      </div>
    </div>
  );
};
