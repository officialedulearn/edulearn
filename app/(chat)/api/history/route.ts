import { getUser } from '@/actions/login';
import { auth } from '@/app/(auth)/auth';
import { getChatsByUserId } from '@/lib/db/queries';

export async function GET() {
  const session = await auth();
  const user = await getUser()

  if (!user) {
    return Response.json('Unauthorized!', { status: 401 });
  }

  // biome-ignore lint: Forbidden non-null assertion.
  console.log("Logged in user" +  user.sub!);
  const chats = await getChatsByUserId({ id: user.sub! });
  return Response.json(chats);
}
