// types/chat.ts
export interface Message {
  id: string;
  content: string;
  sender: string;
  timestamp: string;
  sentimentLabel?: string; 
  sentimentScore?: number; 
}