import { cookies } from "next/headers";
import { notFound } from "next/navigation";

import { auth } from "@/app/(auth)/auth";
import { Chat } from "@/components/chat";
import { getChatById, getMessagesByChatId } from "@/lib/db/queries";
import { convertToUIMessages } from "@/lib/utils";
import { DEFAULT_CHAT_MODEL } from "@/lib/ai/models";
import { getUser } from "@/actions/login";

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { id } = params;
  const chat = await getChatById({ id });

  if (!chat) {
    notFound();
  }

  const session = await auth();
  const user = await getUser();

  if (chat.visibility === "private") {
    if (!session || !session.user) {
      return notFound();
    }

    if (user?.sub !== chat.userAddress) {
      return notFound();
    }
  }

  const messagesFromDb = await getMessagesByChatId({
    id,
  });

  const cookieStore = await cookies();
  const chatModelFromCookie = cookieStore.get("chat-model");

  if (!chatModelFromCookie) {
    return (
      <>
        <Chat
          key={id}
          id={id}
          initialMessages={convertToUIMessages(messagesFromDb)}
          selectedChatModel={DEFAULT_CHAT_MODEL}
          isReadonly={user?.sub !== chat.userAddress}
        />
      </>
    );
  }

  return (
    <>
      <Chat
        key={id}
        id={id}
        initialMessages={convertToUIMessages(messagesFromDb)}
        selectedChatModel={DEFAULT_CHAT_MODEL}
        isReadonly={user?.sub !== chat.userAddress}
      />
    </>
  );
}
