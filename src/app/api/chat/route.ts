import { convertToModelMessages, streamText, TextPart, tool } from "ai";
import { CHAT_SYSTEM_PROMPT } from "@/lib/prompt";
import {prisma} from "@/lib/db";
import { MessageRole, MessageType } from "@/generated/prisma/enums";
import { createOpenRouter, openrouter } from "@openrouter/ai-sdk-provider";
import { MessagePart, ParsedUIMessage } from "@/modules/chat/components/messages/MessageViewForm";
import { Message as PrismaMessage } from '@/generated/prisma/client'
import { NextRequest } from "next/server";

const provider = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

// Convert message parts to JSON string for DB storage
function partsToJSON(message: { parts?: MessagePart[]; content?: string }): string {
  if (Array.isArray(message.parts)) {
    return JSON.stringify(message.parts);
  }
  
  return JSON.stringify([{ type: "text", text: message.content || "" }]);
}

// Converts a Prisma database message into a frontend UI message
function dbMessageToUI(msg: PrismaMessage): ParsedUIMessage | null {
  try {
    const parts = JSON.parse(msg.content);
    
    // Ensure parts is an array before filtering
    const partsArray = Array.isArray(parts) ? parts : [];
    const textParts = partsArray.filter((p): p is TextPart => p.type === "text");

    if (textParts.length === 0) return null;

    return {
      id: msg.id,
      role: msg.messageRole.toLowerCase() as "user" | "assistant",
      parts: textParts,
      createdAt: msg.createdAt,
    };
  } catch {
    return {
      id: msg.id,
      role: msg.messageRole.toLowerCase() as "user" | "assistant",
      parts: [{ type: "text", text: msg.content }],
      createdAt: msg.createdAt,
    };
  }
}

export async function POST(req:NextRequest) {
    try {
        const {chatId, messages: newMessages, model, skipUserMessage} = await req.json();

        //get previous chats
        const dbMessages = chatId ? 
            await prisma.message.findMany({
                where:{chatId},
                orderBy:{createdAt: "asc"}
            }) : []
        
        //combine current and previous
        const previousUI = dbMessages.map(dbMessageToUI).filter(Boolean)
        const newUI = Array.isArray(newMessages) ? newMessages : [newMessages]
        const allMessages = [...previousUI, ...newUI]

        //convert to model messages
        let modelMessages = await convertToModelMessages(allMessages)
        
        //obtain the result
        const result = streamText({
            model:provider.chat(model),
            system:CHAT_SYSTEM_PROMPT,
            messages:modelMessages
        })

        return result.toUIMessageStreamResponse({
            sendReasoning:true,
            originalMessages:allMessages,
            //Save the messages to db
            onFinish:async({responseMessage})=>{
                try {
                    const msgToSave = []

                    if (!skipUserMessage){
                        const lastUserMsg = newUI[newUI.length-1]

                        //Save user msg
                        if (lastUserMsg?.role === "user") {
                            msgToSave.push({
                                chatId,
                                content: partsToJSON(lastUserMsg),
                                messageRole: MessageRole.USER,
                                model,
                                messageType: MessageType.NORMAL,
                            });
                        }
                    }

                    //Save assistant msg
                    if (responseMessage?.parts && responseMessage.parts.length > 0) {
                        msgToSave.push({
                        chatId,
                        content: partsToJSON(responseMessage),
                        messageRole: MessageRole.ASSISTANT,
                        model,
                        messageType: MessageType.NORMAL,
                        });
                    }

                    if (msgToSave.length > 0) {
                        await prisma.message.createMany({data: msgToSave});
                    }
                } catch (error) {
                    console.error("Error saving messages:", error);
                }
            }
        })

    } catch (error) {
        console.error("API Route Error:", error);

        const errorMessage = error instanceof Error ? error.message : "Internal server error";

        return new Response(
            JSON.stringify({
                error: errorMessage,
                details: error?.toString(),
            }),
            {
                status: 500,
                headers: { "Content-Type": "application/json" },
            }
        );
    }
}