import { cookies } from "next/headers";
import { notFound } from "next/navigation";

import { auth } from "@/app/(auth)/auth";
import { Chat } from "@/components/chat";
import { getChatById, getMessagesByChatId } from "@/lib/db/queries";
import { convertToUIMessages } from "@/lib/utils";
import { DEFAULT_CHAT_MODEL } from "@/lib/ai/models";
import { getUser } from "@/actions/login";

export default async function Page(props: { params: { id: string } }) {
  const { id } = props.params;

  console.log("ID from params:", id);

  const chat = await getChatById({ id });

  console.log("Chat result:", chat);

  if (!chat) {
    console.log("Chat not found, redirecting to 404");
    notFound();
  }
  const session = await auth();
  const user = await getUser();

  if (chat.visibility === "private") {
    if (!user || !user.sub) {
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
