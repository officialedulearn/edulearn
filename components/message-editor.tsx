'use client';

import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { deleteTrailingMessages } from '@/app/(chat)/actions';

import type { Message } from './message';



export type MessageEditorProps = {
  message: Message;
  setMode: Dispatch<SetStateAction<'view' | 'edit'>>;
  setMessages: (messages: Message[] | ((messages: Message[]) => Message[])) => void;
  reload: () => Promise<void>;
};

export function MessageEditor({ message, setMode, setMessages, reload }: MessageEditorProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [draftContent, setDraftContent] = useState(message.content);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    adjustHeight();
  }, []);

  const adjustHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight + 2}px`;
    }
  };

  const handleInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDraftContent(event.target.value);
    adjustHeight();
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    await deleteTrailingMessages({ id: message.id });
    
    setMessages((messages) => {
      return messages.map((m) => (m.id === message.id ? { ...m, content: draftContent } : m));
    });
    
    setMode('view');
    await reload();
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      <Textarea
        data-testid="message-editor"
        ref={textareaRef}
        className="bg-transparent outline-none overflow-hidden resize-none text-base rounded-xl w-full"
        value={draftContent}
        onChange={handleInput}
      />

      <div className="flex flex-row gap-2 justify-end">
        <Button variant="outline" className="h-fit py-2 px-3" onClick={() => setMode('view')}>
          Cancel
        </Button>
        <Button
          data-testid="message-editor-send-button"
          variant="default"
          className="h-fit py-2 px-3"
          disabled={isSubmitting}
          onClick={handleSubmit}
        >
          {isSubmitting ? 'Sending...' : 'Send'}
        </Button>
      </div>
    </div>
  );
}