import { nanoid } from '@/lib/utils'
import { Chat } from '@/components/chat'
import { redirect } from 'next/navigation';


export default function IndexPage() {
  const id = nanoid()

  return <Chat id={id} />
}

export function NewChatPage() {
  return redirect("/");
}
