'use client';
import { memo } from 'react';
import type { Vote } from '@/lib/db/schema';
import equal from 'fast-deep-equal';
import { useScrollToBottom } from './use-scroll-to-bottom';
import { PreviewMessage, ThinkingMessage } from './message';
import type { Message } from './message';

type ChatRequestOptions = unknown;

type MessagesProps = {
  chatId: string;
  status: string;
  votes: Array<Vote> | undefined;
  messages: Array<Message>;
  setMessages: (
    messages: Message[] | ((messages: Message[]) => Message[]),
  ) => void;
  reload: (
    chatRequestOptions?: ChatRequestOptions,
  ) => Promise<void>;
  isReadonly: boolean;
};

const PureMessages = ({
  chatId,
  status,
  votes,
  messages,
  setMessages,
  reload,
  isReadonly,
}: MessagesProps) => {
  const [messagesContainerRef, messagesEndRef] =
    useScrollToBottom<HTMLDivElement>();

  return (
    <div
      ref={messagesContainerRef}
      className="flex flex-col min-w-0 gap-6 flex-1 overflow-y-scroll pt-4"
    >
      {messages.map((message, index) => (
        <PreviewMessage
          key={message.id}
          chatId={chatId}
          message={message}
          isLoading={status === 'streaming' && messages.length - 1 === index}
          vote={
            votes
              ? votes.find((vote) => vote.messageId === message.id)
              : undefined
          }
          setMessages={setMessages}
          reload={async (chatRequestOptions) => {
            await reload(chatRequestOptions);
          }}
          isReadonly={isReadonly}
        />
      ))}

      {status === 'submitted' &&
        messages.length > 0 &&
        messages[messages.length - 1].role === 'user' && <ThinkingMessage />}

      <div ref={messagesEndRef} className="shrink-0 min-w-[24px] min-h-[24px]" />
    </div>
  );
};

export const Messages = memo(PureMessages, (prevProps, nextProps) => {

  if (prevProps.status !== nextProps.status) return false;
  if (prevProps.status && nextProps.status) return false;
  if (prevProps.messages.length !== nextProps.messages.length) return false;
  if (!equal(prevProps.messages, nextProps.messages)) return false;
  if (!equal(prevProps.votes, nextProps.votes)) return false;

  return true;
});
