import React, {useState, useEffect} from 'react'
import { useAIModels } from '../../hooks/useAIModels';
import { Spinner } from '@/components/ui/spinner';
import { ModelSelector } from './ModelSelector';
import { useCreateChat } from '../../hooks/useChats';
import { toast } from 'sonner';
import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  PromptInputMessage,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
} from "@/components/ai-elements/prompt-input";

interface ChatMessageFormProps {
  initialMessage?: string | null;
  onMessageChange: () => void; 
}

const ChatMessageForm = ({initialMessage, onMessageChange}:ChatMessageFormProps) => {
    const { data: models = [], isPending } = useAIModels();

    const [selectedModel, setSelectedModel] = useState("");
    const [message, setMessage] = useState("")

    useEffect(() => {
        if (models.length > 0 && !selectedModel) {
            setSelectedModel(models[0].id);
        }
    }, [models, selectedModel]);

    useEffect(() => {
        if (initialMessage) {
            setMessage(initialMessage);
            onMessageChange?.();
        }
    }, [initialMessage, onMessageChange]);

    const {mutateAsync, isPending: isChatPending} = useCreateChat()

    const handleSubmit = async (promptMsg: PromptInputMessage) => {
        const text = promptMsg.text?.trim() || message.trim()
        if (!text) return
        if (!selectedModel) {
            toast.error("Please select a model")
            return
        }

        try {
            await mutateAsync({content: text, model: selectedModel})
        } catch (error) {
            console.error("Error sending message: ", error);
            toast.error("Failed to send message")
        } finally {
            setMessage("")
        }
    }

    return (
        <PromptInput onSubmit={handleSubmit} className="mt-4">
            <PromptInputBody>
                <PromptInputTextarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your message here..."
                    disabled={isChatPending}
                />
            </PromptInputBody>

            <PromptInputFooter>
                <PromptInputTools className="flex items-center gap-2">
                    {isPending ? (
                        <Spinner />
                    ) : (
                        <ModelSelector
                            models={models}
                            selectedModelId={selectedModel}
                            onModelSelect={setSelectedModel}
                        />
                    )}
                </PromptInputTools>

                <PromptInputSubmit status={isChatPending ? "submitted" : "ready"} />
            </PromptInputFooter>
        </PromptInput>
    );
}

export default ChatMessageForm