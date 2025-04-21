import { notFound } from "next/navigation";
import { Chat } from "@/components/chat";
import { getChatById, getMessagesByChatId } from "@/lib/db/queries";
import { convertToUIMessages } from "@/lib/utils";
import { getUser } from "@/actions/login";

export default async function Page({params}: {params: Promise<{ id: string }>}) {
  const { id } = await params;
  const chat = await getChatById({ id });
  console.log("Chat result:", chat);

  if (!chat) {
    console.log("Chat not found, redirecting to 404");
    notFound();
  }

  const user = await getUser();

  if (chat.visibility === "private") {
    if (!user || !user.sub) {
      notFound();
    }

    if (user?.sub !== chat.userAddress) {
      notFound();
    }
  }

  const messagesFromDb = await getMessagesByChatId({ id });

  return (
    <Chat
      key={id}
      id={id}
      initialMessages={convertToUIMessages(messagesFromDb)}
      isReadonly={user?.sub !== chat.userAddress}
    />
  );
}