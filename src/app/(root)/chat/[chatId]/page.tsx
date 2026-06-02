import MessageViewForm from '@/modules/chat/components/messages/MessageViewForm'
import React from 'react'

const chatIdPage = async ({ params }: {
    params: Promise<{ chatId: string }>
}) => {

    const {chatId} = await params

    return (
        <MessageViewForm chatId={chatId} />
    )
}

export default chatIdPage