import React from 'react'
import { requireAuth } from '../../modules/authentication/actions'
import ChatSidebar from '../../modules/chat/components/ChatSidebar'
import Header from '@/components/header'
import { getAllChats } from '@/modules/chat/actions'

const layout = async({children}:{children:React.ReactNode}) => {
    const session = await requireAuth()

    if (!session) return <></>

    const {data:chats = []} = await getAllChats()

    return (
        <div className="flex h-screen overflow-hidden">
            <ChatSidebar user={session.user} chats={chats} />
            <main className="flex-1 overflow-hidden">
                <Header/>
                {children}
            </main>
        </div>
    )
}

export default layout