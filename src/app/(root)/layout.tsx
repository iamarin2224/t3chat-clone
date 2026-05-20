import React from 'react'
import { requireAuth } from '../../../modules/authentication/actions'
import ChatSidebar from '../../../modules/chat/components/ChatSidebar'
import Header from '@/components/header'

const layout = async({children}:{children:React.ReactNode}) => {
    const session = await requireAuth()

    if (!session) return <></>

    return (
        <div className="flex h-screen overflow-hidden">
            <ChatSidebar user={session.user} />
            <main className="flex-1 overflow-hidden">
                <Header/>
                {children}
            </main>
        </div>
    )
}

export default layout