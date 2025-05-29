'use client';

import { useState, useRef } from 'react';

export default function MessageInput({ onSend }) {
  const [input, setInput] = useState('');
  const textareaRef = useRef(null);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    if (input.trim()) {
      onSend(input.trim());
      setInput('');
    }
  };

  return (
    <div className="w-full bg-neutral-900 border-t border-neutral-800 px-4 py-3 relative">
      <textarea
        ref={textareaRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        rows={1}
        className="w-full h-24 max-h-40 resize-none overflow-y-auto bg-neutral-800 text-white border border-neutral-700 rounded-md px-4 py-3 pr-14 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-white"
        placeholder="Nachricht eingeben…"
      />
      <button
        onClick={handleSubmit}
        className="absolute bottom-7 right-7 text-white bg-neutral-700 hover:bg-neutral-600 rounded-md px-3 py-1.5 transition text-sm"
      >
        Senden
      </button>
    </div>
  );
}