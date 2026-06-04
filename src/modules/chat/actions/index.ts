"use server"

import {prisma} from "@/lib/db"; 
import { currentUser } from "../../authentication/actions";
import { MessageRole, MessageType } from "./enums";
import { revalidatePath } from "next/cache";

interface createChatWithMessageProps {
    content: string
    model: string
}

export async function createChatWithMessage({content, model}:createChatWithMessageProps) {
    try {
        const user = await currentUser()

        if (!user) {
            return {success: false, message: "Unauthorized"}
        }

        const title = content.slice(0, 50) + (content.length>50 ? "..." : "")

        const chat = await prisma.chat.create({
            data: {
                title, 
                model, 
                userId: user.id,
                messages: {
                    create: {
                        messageRole: MessageRole.USER,
                        messageType: MessageType.NORMAL,
                        content,
                        model
                    }
                }
            },
            include: {
                messages: true
            }
        })

        revalidatePath("/", "page")

        return {
            success: true,
            data: chat,
            messsage: "Chat created successfully"
        }

    } catch (error) {
        console.log("Error creating chat: ", error);
        return {
            success: true,
            messsage: "Failed to create chat"
        }
    }
}

export async function getAllChats() {
    try {
        const user = await currentUser()

        if (!user) return {
            success: false, 
            message: "Unauthorized"
        }
        
        const chats = await prisma.chat.findMany({
            where: {userId: user?.id},
            include: {messages: true},
            orderBy: {updatedAt: "desc"}
        })

        return {
            success: true,
            data: chats,
            messsage: "Fetched all chats successfully"
        }
        
    } catch (error) {
        console.log("Error fetching chat: ", error);
        return {
            success: true,
            messsage: "Failed to fetch all chats"
        }
    }
}

export async function getChatById(chatId: string) {
    try {
        const user = await currentUser()

        if (!user) return {
            success: false, 
            message: "Unauthorized"
        }
        
        const chat = await prisma.chat.findUnique({
            where: {id: chatId, userId: user?.id},
            include: {messages: true},
        })

        return {
            success: true,
            data: chat,
            messsage: "Fetched messages of chatId successfully"
        }
        
    } catch (error) {
        console.log("Error fetching messages of chatId: ", error);
        return {
            success: true,
            messsage: "Failed to fetch messages of chatId"
        }
    }
}

export async function deleteChat(chatId: string) {
    try {
        const user = await currentUser()

        if (!user) return {
            success: false, 
            message: "Unauthorized"
        }
        
        const chat = await prisma.chat.delete({
            where: {id: chatId, userId: user?.id}
        })

        if (!chat) return {
            success: false,
            message: "Chat not found"
        }

        return {
            success: true,
            messsage: "Chat deleted successfully"
        }
        
    } catch (error) {
        console.log("Error deleting chat: ", error);
        return {
            success: true,
            messsage: "Failed to delete chat"
        }
    }
}

export async function deleteLastAssistantMessage(chatId: string) {
    try {
        const user = await currentUser()

        if (!user) return {
            success: false, 
            message: "Unauthorized"
        }

        // Find the last message in this chat
        const lastMessage = await prisma.message.findFirst({
            where: { chatId },
            orderBy: { createdAt: "desc" }
        })

        if (lastMessage && lastMessage.messageRole === MessageRole.ASSISTANT) {
            await prisma.message.delete({
                where: { id: lastMessage.id }
            })
            return {
                success: true,
                message: "Last assistant message deleted successfully"
            }
        }

        return {
            success: false,
            message: "No assistant message found to delete"
        }
    } catch (error) {
        console.error("Error deleting last assistant message: ", error);
        return {
            success: false,
            message: "Failed to delete last assistant message"
        }
    }
}