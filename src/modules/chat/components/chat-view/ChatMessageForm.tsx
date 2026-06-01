import React, {useState, useEffect} from 'react'
import { useAIModels } from '../../hooks/useAIModels';
import { Textarea } from '@/components/ui/textarea';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';
import { ModelSelector } from './ModelSelector';

interface ChatMessageFormProps {
  initialMessage?: string | null;
  onMessageChange: () => void; 
}

const ChatMessageForm = ({initialMessage, onMessageChange}:ChatMessageFormProps) => {
    const { data: models = [], isPending } = useAIModels();

    const [selectedModel, setSelectedModel] = useState(models[0]?.id)
    const [message, setMessage] = useState("")

    useEffect(() => {
        if (initialMessage) {
            setMessage(initialMessage);
            onMessageChange?.();
        }
    }, [initialMessage, onMessageChange]);

    const handleSubmit = async(e: any) => {}

    return (
        <div className="w-full max-w-3xl mx-auto px-4 pb-6">
        <form onSubmit={handleSubmit}>
            <div className="relative rounded-2xl border border-[#272730] shadow-sm transition-all bg-[#1b1b22]">
            <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your mesage here..."
                className="min-h-15 max-h-50 resize-none border-0 bg-transparent px-4 py-3 text-base focus-visible:ring-0 focus-visible:ring-offset-0 "
                onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                }
                }}
            />

            <div className="flex items-center justify-between gap-2 px-3 py-2 border-t">
                {/* Model Selector */}
                <div className="flex items-center gap-1">
                {isPending ? (
                    <>
                    <Spinner />
                    </>
                ) : (
                    <>
                    <ModelSelector
                        models={models}
                        selectedModelId={selectedModel}
                        onModelSelect={setSelectedModel}
                        className="ml-1"
                    />
                    </>
                )}
                </div>

                {/* <Button
                    type="submit"
                    disabled={!message.trim() || isChatPending}
                    size="sm"
                    variant={message.trim() ? "default" : "ghost"}
                    className="h-8 w-8 p-0 rounded-full "
                >
                {isChatPending ? (
                    <>
                    <Spinner/>
                    </>
                ) : (
                    <>
                    <Send className="h-4 w-4" />
                    <span className="sr-only">Send message</span>
                    </>
                )}
                </Button> */}
                <Button
                    type="submit"
                    disabled={!message.trim()}
                    size="sm"
                    variant={message.trim() ? "default" : "ghost"}
                    className="h-8 w-8 p-0 rounded-full "
                >
                    <>
                    <Send className="h-4 w-4" />
                    <span className="sr-only">Send message</span>
                    </>
                </Button>
            </div>
            </div>
        </form>
        </div>
    );
}

export default ChatMessageForm