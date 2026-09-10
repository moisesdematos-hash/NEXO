import { Json } from './database.types';

export type AITextMessageRole = 'system' | 'user' | 'assistant';

export interface AITextMessage {
  id: string;
  role: AITextMessageRole;
  content: string;
  timestamp: string;
}

export type AIIntentActionType =
  | 'CREATE_TASK'
  | 'UPDATE_TASK'
  | 'CREATE_EVENT'
  | 'CREATE_LIST_ITEM'
  | 'CREATE_GOAL';

export interface AIActionPayload {
  actionType: AIIntentActionType;
  parameters: Record<string, Json>;
  summary: string;
}

export interface AIRequestPayload {
  conversationId?: string;
  prompt: string;
}

export interface AIResponsePayload {
  conversationId: string;
  message: string;
  proposedActions?: AIActionPayload[];
}
