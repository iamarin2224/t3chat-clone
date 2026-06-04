export const MessageRole = {
  USER: 'USER',
  ASSISTANT: 'ASSISTANT'
} as const

export type MessageRole = (typeof MessageRole)[keyof typeof MessageRole]


export const MessageType = {
  NORMAL: 'NORMAL',
  ERROR: 'ERROR',
  TOOL_CALL: 'TOOL_CALL'
} as const

export type MessageType = (typeof MessageType)[keyof typeof MessageType]