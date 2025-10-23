export interface Message {
  id: string;
  content: string;
  sender: string;
  timestamp: string;
  sentiment?: {
    score: number;
    label: "positive" | "negative" | "neutral";
  };
}
