'use client';

import { useState } from 'react';

interface MultimodalInputProps {
  chatId: string;
  input: string;
  setInput: (value: string) => void;
  handleSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}

export function MultimodalInput({ chatId, input, setInput, handleSubmit }: MultimodalInputProps) {
  return (
    <div className="flex w-full border rounded-lg overflow-hidden">
      <input
        type="text"
        className="flex-1 p-2 outline-none"
        placeholder="Type a message..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <button type="submit" className="p-2 bg-blue-500 text-white" onClick={(e) => handleSubmit(e as any)}>
        Send
      </button>
    </div>
  );
}
