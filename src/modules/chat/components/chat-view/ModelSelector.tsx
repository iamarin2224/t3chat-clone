"use client";

import { useState } from "react";
import { Check, ChevronDown, Info, Search, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { OpenRouterModel } from "@/app/api/ai/get-models/route";

export interface ModelSelectorProps {
  models: OpenRouterModel[] | undefined;
  selectedModelId: string | undefined;
  onModelSelect: (id: string) => void;
  className?: string;
}

export function ModelSelector({
  models,
  selectedModelId,
  onModelSelect,
  className,
}: ModelSelectorProps) {
  const [open, setOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedForDetails, setSelectedForDetails] = useState<OpenRouterModel | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const selectedModel = models?.find((m) => m.id === selectedModelId);

  const formatContextLength = (length: number | string) => {
    const numLength = typeof length === "string" ? parseInt(length, 10) : length;
    if (isNaN(numLength)) return "0";
    if (numLength >= 1000000) return `${(numLength / 1000000).toFixed(1)}M`;
    if (numLength >= 1000) return `${(numLength / 1000).toFixed(0)}K`;
    return numLength.toString();
  };

  const isFreeModel = (model: OpenRouterModel) => {
    return (
      model.pricing.prompt === "0" &&
      model.pricing.completion === "0" &&
      model.pricing.request === "0"
    );
  };

  const openModelDetails = (model: OpenRouterModel | null, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedForDetails(model);
    setDetailsOpen(true);
  };

  // Safely fallback to an empty array if models is undefined while loading
  const filteredModels = (models || []).filter((model) => {
    const query = searchQuery.toLowerCase();
    return (
      model.name?.toLowerCase().includes(query) ||
      model.description?.toLowerCase().includes(query) ||
      model.id?.toLowerCase().includes(query) ||
      model.architecture?.modality?.toLowerCase().includes(query)
    );
  });

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "h-8 justify-between gap-2 px-2 text-xs hover:bg-accent",
              className
            )}
          >
            <div className="flex items-center gap-1.5 min-w-0">
              <Sparkles className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <span className="truncate font-medium">
                {selectedModel?.name || "Select model"}
              </span>
            </div>
            <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-3xl p-0" align="start">
          <div className="p-3 border-b">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search models..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 pl-9"
              />
            </div>
          </div>
          <ScrollArea className="h-100">
            <div className="p-2">
              <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                Available Models ({filteredModels.length})
              </div>
            </div>
            {filteredModels.length === 0 ? (
              <div className="px-2 py-8 text-center text-sm text-muted-foreground">
                No models found matching "{searchQuery}"
              </div>
            ) : (
              filteredModels.map((model) => (
                <div
                  key={model.id}
                  className={cn(
                    "relative flex cursor-pointer select-none items-start gap-2 rounded-md px-2 py-2 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground",
                    selectedModelId === model.id && "bg-accent"
                  )}
                  onClick={() => {
                    onModelSelect(model.id);
                    setOpen(false);
                    setSearchQuery("");
                  }}
                >
                  <div className="flex h-5 items-center">
                    <Check
                      className={cn(
                        "h-4 w-4",
                        selectedModelId === model.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm leading-none truncate">
                        {model.name.replace(/\s*\(free\)$/i, '')}
                      </span>
                      {isFreeModel(model) && (
                        <Badge variant="secondary" className="h-4 px-1 text-[10px]">
                          FREE
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {model.description}
                    </p>
                    <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                      <span>
                        Context: {formatContextLength(model.context_length)}
                      </span>
                      <span>•</span>
                      <span className="capitalize">
                        {model.architecture?.modality?.replace("->", " → ") || "N/A"}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 shrink-0"
                    onClick={(e) => openModelDetails(model, e)}
                  >
                    <Info className="h-3.5 w-3.5" />
                    <span className="sr-only">View details</span>
                  </Button>
                </div>
              ))
            )}
          </ScrollArea>
        </PopoverContent>
      </Popover>

      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              {selectedForDetails?.name}
            </DialogTitle>
            <DialogDescription>
              Detailed information about this AI model
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="pr-4 h-100">
            {selectedForDetails && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold mb-2">Description</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {selectedForDetails.description}
                  </p>
                </div>

                <Separator />

                <div>
                  <h3 className="text-sm font-semibold mb-3">
                    Context & Capabilities
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">
                        Context Length
                      </p>
                      <p className="text-sm font-medium">
                        {formatContextLength(selectedForDetails.context_length)} tokens
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">
                        Max Completion Tokens
                      </p>
                      <p className="text-sm font-medium">
                        {formatContextLength(
                          selectedForDetails.top_provider?.max_completion_tokens || 0
                        )}{" "}
                        tokens
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Modality</p>
                      <p className="text-sm font-medium capitalize">
                        {selectedForDetails.architecture?.modality?.replace(
                          "->",
                          " → "
                        ) || "N/A"}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Tokenizer</p>
                      <p className="text-sm font-medium">
                        {selectedForDetails.architecture?.tokenizer || "Unknown"}
                      </p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-sm font-semibold mb-3">
                    Supported Modalities
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground">
                        Input Modalities
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {selectedForDetails.architecture?.input_modalities?.map(
                          (modality) => (
                            <Badge
                              key={modality}
                              variant="outline"
                              className="text-xs"
                            >
                              {modality}
                            </Badge>
                          )
                        ) || <span className="text-xs text-muted-foreground">N/A</span>}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground">
                        Output Modalities
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {selectedForDetails.architecture?.output_modalities?.map(
                          (modality: string) => (
                            <Badge
                              key={modality}
                              variant="outline"
                              className="text-xs"
                            >
                              {modality}
                            </Badge>
                          )
                        ) || <span className="text-xs text-muted-foreground">N/A</span>}
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-sm font-semibold mb-3">Pricing</h3>
                  {isFreeModel(selectedForDetails) ? (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                      <Badge variant="secondary" className="bg-green-500/20 text-green-600">
                        FREE
                      </Badge>
                      <p className="text-sm text-muted-foreground">
                        This model is completely free to use
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      {Object.entries(selectedForDetails.pricing || {}).map(
                        ([key, value]) => {
                          if (value === "0") return null;
                          return (
                            <div key={key} className="space-y-1">
                              <p className="text-xs text-muted-foreground capitalize">
                                {key.replace("_", " ")}
                              </p>
                              <p className="text-sm font-medium">${value}</p>
                            </div>
                          );
                        }
                      )}
                    </div>
                  )}
                </div>

                <Separator />

                <div>
                  <h3 className="text-sm font-semibold mb-3">
                    Provider Information
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Content Moderation
                      </span>
                      <Badge
                        variant={
                          selectedForDetails.top_provider?.is_moderated
                            ? "default"
                            : "secondary"
                        }
                      >
                        {selectedForDetails.top_provider?.is_moderated
                          ? "Enabled"
                          : "Disabled"}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold mb-2">Model ID</h3>
                  <code className="text-xs bg-muted px-2 py-1 rounded block break-all">
                    {selectedForDetails.id}
                  </code>
                </div>
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}