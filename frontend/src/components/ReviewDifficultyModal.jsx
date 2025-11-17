import React from "react";

const difficulties = [
  { key: "hard", label: "Hard", desc: "I struggled to remember this." },
  { key: "medium", label: "Medium", desc: "I remembered some parts." },
  { key: "easy", label: "Easy", desc: "I remembered it well." },
];

const ReviewDifficultyModal = ({ note, onClose, onSelectDifficulty }) => {
  if (!note) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
        <h2 className="text-xl font-semibold mb-2">
          Review &quot;{note.title}&quot;
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          How well did you remember this note today?
        </p>

        <div className="space-y-3 mb-4">
          {difficulties.map((d) => (
            <button
              key={d.key}
              onClick={() => onSelectDifficulty(d.key)}
              className="w-full text-left border rounded-lg px-4 py-2 hover:bg-gray-50 transition"
            >
              <div className="font-medium">{d.label}</div>
              <div className="text-xs text-gray-500">{d.desc}</div>
            </button>
          ))}
        </div>

        <button
          onClick={onClose}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default ReviewDifficultyModal;
