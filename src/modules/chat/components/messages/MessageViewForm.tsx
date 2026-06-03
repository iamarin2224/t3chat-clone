"use client"

import { useRouter, useSearchParams } from 'next/navigation'
import { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import { useAIModels } from '../../hooks/useAIModels'
import { useGetChatById } from '../../hooks/useChats'
import { Spinner } from '@/components/ui/spinner'
import { Message as PrismaMessage } from '@/generated/prisma/client'
import { useChat }  from "@ai-sdk/react"
import { DefaultChatTransport, type UIMessage } from 'ai'

import {
  PromptInput,
  PromptInputBody,
  PromptInputButton,
  PromptInputFooter,
  PromptInputMessage,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
} from "@/components/ai-elements/prompt-input";
import { ModelSelector } from '../chat-view/ModelSelector'
import { RotateCcwIcon, StopCircleIcon } from 'lucide-react'
import { Conversation, ConversationContent, ConversationScrollButton } from '@/components/ai-elements/conversation'
import { Message, MessageContent, MessageResponse } from '@/components/ai-elements/message'
import { Reasoning, ReasoningContent, ReasoningTrigger } from '@/components/ai-elements/reasoning'
import { toast } from 'sonner'

export interface TextPart {
  type: "text";
  text: string;
}

export type MessagePart = TextPart | { type: string; [key: string]: any };

export interface ParsedUIMessage {
  id: string;
  role: "user" | "assistant" | "system";
  parts: MessagePart[];
  createdAt: Date;
}

function parseMessageToUI(msg: PrismaMessage): ParsedUIMessage {
  const basePart: TextPart = { type: "text", text: msg.content };

  const role = msg.messageRole.toLowerCase() as "user" | "assistant" | "system";

  try {
    const parts = JSON.parse(msg.content);

    return {
      id: msg.id,
      role,
      parts: Array.isArray(parts) ? parts : [basePart],
      createdAt: msg.createdAt,
    };
  } catch {
    return {
      id: msg.id,
      role,
      parts: [basePart],
      createdAt: msg.createdAt,
    };
  }
}

interface MessagePartProps {
  part: MessagePart;
  partIndex: number;
  role: "user" | "assistant" | "system";
}

function MessagePart({part, partIndex, role}:MessagePartProps) {
    if (part.type === "text"){
        return (
            <Message from={role}>
                <MessageContent>
                <MessageResponse>{part.text}</MessageResponse>
                </MessageContent>
            </Message>
        );
    }

    if (part.type === "reasoning"){
        return (
            <Reasoning
                className="max-w-2xl px-4 py-4 border border-muted rounded-md bg-muted/50"
            >
                <ReasoningTrigger />
                <ReasoningContent className="mt-2 italic font-light text-muted-foreground">
                {part.text ?? ""}
                </ReasoningContent>
            </Reasoning>
        );
    }

    if (part.type === "step-start" && partIndex > 0){
        return (
            <div className="my-4 text-gray-500">
                <hr className="border-gray-300"/>
            </div>
        )
    }

    return null
}

const MessageViewForm = ({ chatId }: { chatId: string }) => {
    const router = useRouter()

    const searchParams = useSearchParams()
    const shouldAutoTrigger = searchParams.get("autoTrigger") === "true"
    const hasAutoTrigger = useRef(false)

    const [selectedModel, setSelectedModel] = useState("");
    const [input, setInput] = useState("");

    const { data: models = [], isPending: isModelPending } = useAIModels();
    const { data, isPending } = useGetChatById(chatId)

    const initialMessage = useMemo(() => {
        if (!data?.data?.messages) return []
        
        return data?.data?.messages.
        filter((msg) => msg.content?.trim() && msg.id).
        map(parseMessageToUI)
    }, [data])
    
    const transport = useMemo(() => new DefaultChatTransport({
        api:"/api/chat"
    }), [])

    const {messages, status, sendMessage, regenerate, stop, error} = useChat({
        id:chatId,
        messages:initialMessage as any,
        transport,
        onError:(err) => {
            console.log("Error in chat: ", err);
            toast.error(err.message)
        }
    })

    const isBusy = status === "streaming" || status === "submitted"

    useEffect(() => {
        if (hasAutoTrigger.current) return;
        if (!shouldAutoTrigger) return;
        if (!selectedModel) return;
        if (initialMessage.length === 0) return;
        const lastMessage = initialMessage[initialMessage.length - 1];
        if (lastMessage.role !== "user") return;

        hasAutoTrigger.current = true;
        
        regenerate({
            body: {
                chatId,
                model:selectedModel,
                skipUserMessage:true
            }
        }).catch((err) => {
            console.log("Auto trigger failed: ", err);
            toast.error(err.message)
        })

        const params = new URLSearchParams(searchParams.toString())
        params.delete("autoTrigger")
        const query = params.toString()
        router.replace(`/chat/${chatId}${query ? `?${query}` : "" }`, { scroll: false });
    }, [
        shouldAutoTrigger,
        selectedModel,
        chatId,
        initialMessage,
        regenerate,
        router,
    ]);

    useEffect(() => {
        if (data?.data?.model && !selectedModel){
            setSelectedModel(data?.data?.model)
        }
    }, [data, selectedModel])

    const handleSubmit = async (message:PromptInputMessage) => {
        const text = message.text?.trim() || input.trim()
        if (!text) return
        if (!selectedModel) {
            toast.error("Please select a model")
            return
        }
        if (isBusy) return

        try {
            await sendMessage(
                {text},
                {
                    body: {
                        chatId,
                        model:selectedModel,
                        skipUserMessage:false
                    }
                }
            )
        } catch (error) {
            
        } finally {
            setInput("")
        }
    }
    const handleRetry = () => {
        if (!selectedModel || isBusy) return;
        
        regenerate({
            body: {
                chatId,
                model: selectedModel,
                skipUserMessage: true // Don't duplicate the user message block
            }
        }).catch((err) => {
            console.error("Retry failed: ", err);
            toast.error(err.message);
        });
    };

    const isStreaming = status === "streaming"

    const initialIds = new Set(initialMessage.map(m => m.id));
    const uniqueLiveMessages = messages.filter(m => !initialIds.has(m.id));
    const messageToRender = [...initialMessage, ...uniqueLiveMessages];

    if (isPending) {
        return (
        <div className="flex items-center justify-center h-full">
            <Spinner />
        </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6 relative size-full h-[calc(100vh-4rem)]">
            <div className="flex flex-col h-full">
                {/* Messages */}
                <Conversation className={"h-full"}>
                <ConversationContent>
                    {messageToRender.length === 0 ? (
                    <>
                        <div className="flex items-center justify-center h-full text-gray-500">
                        Start a coversation...
                        </div>
                    </>
                    ) : (
                    messageToRender.map((message) => (
                        <Fragment key={message.id}>
                        {message.parts.map((part, i) => (
                            <MessagePart
                                key={`${message.id}-${i}`}
                                part={part}
                                partIndex={i}
                                role={message.role}
                            />
                        ))}
                        </Fragment>
                    ))
                    )}
                    {isStreaming && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Spinner />
                        <span className="text-sm">AI is thinking...</span>
                    </div>
                    )}
                </ConversationContent>
                <ConversationScrollButton />
                </Conversation>


                {/* Input */}
                <PromptInput onSubmit={handleSubmit} className={"mt-4"}>
                    <PromptInputBody>
                        <PromptInputTextarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={!isBusy ? "Type your message..." : "AI is typing"}
                            disabled={isBusy}
                        />
                    </PromptInputBody>

                    <PromptInputFooter>
                        <PromptInputTools className={"flex items-center gap-2"}>

                            {isModelPending ? (
                                <Spinner />
                            ) : (
                                <ModelSelector
                                models={models}
                                selectedModelId={selectedModel}
                                onModelSelect={setSelectedModel}
                                />
                            )}

                            {isStreaming? (
                                <PromptInputButton onClick={stop}>
                                <StopCircleIcon size={16} />
                                <span>Stop</span>
                                </PromptInputButton>
                            ) : (
                                messageToRender.length > 0 && (
                                <PromptInputButton onClick={handleRetry}>
                                    <RotateCcwIcon size={16} />
                                    <span>Retry</span>
                                </PromptInputButton>
                                )
                            )}

                        </PromptInputTools>

                        <PromptInputSubmit status="ready" />
                    </PromptInputFooter>
                </PromptInput>


            </div>
        </div>
    )
}

export default MessageViewForm