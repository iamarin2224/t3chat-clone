import React from 'react'
import { requireAuth } from '../../modules/authentication/actions'
import ChatLayout from '@/components/chat-layout'
import { getAllChats } from '@/modules/chat/actions'

export const dynamic = "force-dynamic";

const layout = async({children}:{children:React.ReactNode}) => {
    const session = await requireAuth()

    if (!session) return <></>

    const {data:chats = []} = await getAllChats()

    return (
        <ChatLayout user={session.user} initialChats={chats}>
            {children}
        </ChatLayout>
    )
}

export default layout