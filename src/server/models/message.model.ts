export interface Message {
  id: string;
  userId: string;
  content: string;
  timestamp?: string;
  isRead?: boolean;
  sender: string;
  sessionId: string;
}

export interface ChatMessage extends Message {
  recipient: string;
  origin: string;
  ipAddress: string;
  status: 'Sending' | 'Sent' | 'Failed';
  hasChat: boolean;
}