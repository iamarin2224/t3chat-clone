"use client"

import { useRouter, useSearchParams } from 'next/navigation'
import { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import { useAIModels } from '../../hooks/useAIModels'
import { useGetChatById } from '../../hooks/useChats'
import { Spinner } from '@/components/ui/spinner'
import { Message as PrismaMessage } from '@/generated/prisma/client'
import { useChat }  from "@ai-sdk/react"
import { DefaultChatTransport, type UIMessage } from 'ai'
import { useQueryClient } from '@tanstack/react-query'

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
import { RotateCcwIcon, StopCircleIcon, Copy, Check, Sparkles } from 'lucide-react'
import { Conversation, ConversationContent, ConversationScrollButton } from '@/components/ai-elements/conversation'
import { Message, MessageContent, MessageResponse } from '@/components/ai-elements/message'
import { Reasoning, ReasoningContent, ReasoningTrigger } from '@/components/ai-elements/reasoning'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { deleteLastAssistantMessage } from '../../actions'
import { OpenRouterModel } from '@/app/api/ai/get-models/route'

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
  model?: string | null;
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
      model: msg.model,
    };
  } catch {
    return {
      id: msg.id,
      role,
      parts: [basePart],
      createdAt: msg.createdAt,
      model: msg.model,
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
function CopyButton({ text }: { text: string }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy text: ", err);
            toast.error("Failed to copy to clipboard");
        }
    };

    return (
        <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-sidebar-accent-foreground/10"
            onClick={handleCopy}
            title="Copy response"
        >
            {copied ? (
                <Check className="h-3.5 w-3.5 text-green-500" />
            ) : (
                <Copy className="h-3.5 w-3.5" />
            )}
        </Button>
    );
}

interface AssistantActionBarProps {
  message: any;
  isLast: boolean;
  onRetry: (modelId: string) => void;
  models: OpenRouterModel[];
  currentSelectedModel: string;
}

function AssistantActionBar({ message, isLast, onRetry, models, currentSelectedModel }: AssistantActionBarProps) {
  const activeModelId = message.model || currentSelectedModel;
  const modelObj = models?.find((m) => m.id === activeModelId);
  const modelName = modelObj ? modelObj.name : (activeModelId || "Random");

  const messageText = message.parts
    .filter((part: any) => part.type === "text")
    .map((part: any) => part.text)
    .join("\n");

  return (
    <Message from="assistant" className="border-0 bg-transparent py-0 mt-1 shadow-none select-none">
      <MessageContent className="border-0 bg-transparent py-0 pr-0">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <CopyButton text={messageText} />
          <span className="text-muted-foreground/30">|</span>
          <span className="text-[10px] bg-muted px-2 py-0.5 rounded font-mono truncate max-w-[200px]" title={activeModelId || "Random"}>
            {modelName.replace(/\s*\(free\)$/i, '')}
          </span>
          
          {isLast && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground hover:bg-sidebar-accent-foreground/10 flex items-center gap-1.5 ml-auto"
                >
                  <RotateCcwIcon className="h-3 w-3" />
                  <span>Retry</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 max-h-80 overflow-y-auto">
                <DropdownMenuItem
                  className="cursor-pointer font-medium"
                  onClick={() => onRetry(message.model || "openrouter/free")}
                >
                  <RotateCcwIcon className="h-3.5 w-3.5 mr-2" />
                  Retry Same
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-[10px] text-muted-foreground font-semibold">
                  Select Model to Retry
                </DropdownMenuLabel>
                {models?.map((model) => (
                  <DropdownMenuItem
                    key={model.id}
                    className="cursor-pointer"
                    onClick={() => onRetry(model.id)}
                  >
                    <Sparkles className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                    <span className="truncate">{model.name.replace(/\s*\(free\)$/i, '')}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </MessageContent>
    </Message>
  );
}


const MessageViewForm = ({ chatId }: { chatId: string }) => {
    const { data, isPending } = useGetChatById(chatId)

    if (isPending) {
        return (
            <div className="flex items-center justify-center h-full">
                <Spinner />
            </div>
        );
    }

    if (!data?.success || !data?.data) {
        return (
            <div className="flex items-center justify-center h-full text-red-500">
                Chat not found.
            </div>
        );
    }

    return (
        <MessageViewInnerForm
            chatId={chatId}
            initialMessages={data.data.messages}
            defaultModel={data.data.model}
        />
    )
}

const MessageViewInnerForm = ({
    chatId,
    initialMessages,
    defaultModel
}: {
    chatId: string;
    initialMessages: PrismaMessage[];
    defaultModel?: string | null;
}) => {
    const router = useRouter()
    const searchParams = useSearchParams()
    const shouldAutoTrigger = searchParams.get("autoTrigger") === "true"
    const hasAutoTrigger = useRef(false)

    const [selectedModel, setSelectedModel] = useState(defaultModel || "");
    const [input, setInput] = useState("");

    const { data: models = [], isPending: isModelPending } = useAIModels();

    const initialMessage = useMemo(() => {
        return initialMessages
            .filter((msg) => msg.content?.trim() && msg.id)
            .map(parseMessageToUI)
    }, [initialMessages])
    
    const transport = useMemo(() => new DefaultChatTransport({
        api:"/api/chat"
    }), [])

    const queryClient = useQueryClient();

    const {messages, status, sendMessage, regenerate, stop, error} = useChat({
        id:chatId,
        messages:initialMessage as any,
        transport,
        onFinish: () => {
            queryClient.invalidateQueries({ queryKey: ["chats", chatId] });
        },
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
        searchParams,
    ]);

    useEffect(() => {
        if (defaultModel && !selectedModel){
            setSelectedModel(defaultModel)
        } else if (!selectedModel && models.length > 0) {
            setSelectedModel(models[0].id)
        }
    }, [defaultModel, selectedModel, models])

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
            console.error("Error sending message: ", error);
            toast.error("Failed to send message");
        } finally {
            setInput("")
        }
    }

    const handleRetryWithModel = async (modelId: string) => {
        if (isBusy) return;
        
        try {
            await deleteLastAssistantMessage(chatId);
            await queryClient.invalidateQueries({ queryKey: ["chats", chatId] });
            await regenerate({
                body: {
                    chatId,
                    model: modelId,
                    skipUserMessage: true // Don't duplicate the user message block
                }
            });
        } catch (err: any) {
            console.error("Retry failed: ", err);
            toast.error(err.message || "Failed to retry message");
        }
    };

    const isStreaming = status === "streaming"

    const initialIds = new Set(initialMessage.map(m => m.id));
    const uniqueLiveMessages = messages.filter(m => !initialIds.has(m.id));
    const messageToRender = [...initialMessage, ...uniqueLiveMessages];

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
                    messageToRender.map((message, index) => {
                        const isAssistant = message.role === "assistant";
                        const isLast = index === messageToRender.length - 1;
                        return (
                            <Fragment key={message.id}>
                                {message.parts.map((part, i) => (
                                    <MessagePart
                                        key={`${message.id}-${i}`}
                                        part={part}
                                        partIndex={i}
                                        role={message.role}
                                    />
                                ))}
                                {isAssistant && !(isLast && isStreaming) && (
                                    <AssistantActionBar
                                        message={message}
                                        isLast={isLast}
                                        onRetry={handleRetryWithModel}
                                        models={models}
                                        currentSelectedModel={selectedModel}
                                    />
                                )}
                            </Fragment>
                        );
                    })
                    )}
                    {status === "submitted" && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Spinner />
                        <span className="text-sm">Working on it...</span>
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

                            {isStreaming && (
                                <PromptInputButton onClick={stop}>
                                <StopCircleIcon size={16} />
                                <span>Stop</span>
                                </PromptInputButton>
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