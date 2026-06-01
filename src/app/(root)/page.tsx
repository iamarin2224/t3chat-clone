import { currentUser } from "../../../modules/authentication/actions";
import ChatMessageView from "../../../modules/chat/components/chat-view/ChatMessageView";

export default async function Home() {
  const user = await currentUser()

  if (!user) return <></>

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <ChatMessageView user={user} />
    </div>
  );
}