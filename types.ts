export enum ViewState {
  FAREWELL = 'FAREWELL',
  GOODBYE = 'GOODBYE',
  MEMORY = 'MEMORY',
  WITNESS = 'WITNESS',
  PROFILE = 'PROFILE'
}

export interface User {
  id: string;
  name: string;
  avatar: string;
  isDeceased?: boolean;
}

export interface Friend extends User {
  isWitness: boolean; // Means I selected THEM to be MY witness
}

export interface FarewellItem {
  id: string;
  type: 'text' | 'image';
  content: string; // text content or image url
  createdAt: string;
}

export interface FarewellSpaceItem {
  id: string;
  title: string;
  description: string;
  backgroundImage: string;
  burialDate: string;
  forgetDurationDays: number;
  musicUrl?: string; // URL of the background music
  musicName?: string;
  items: FarewellItem[];
}

export interface GoodbyeMessage {
  id: string;
  content: string;
  type: 'text' | 'voice' | 'image';
  backgroundImage: string;
  recipients: string[]; // User IDs
  witnesses: string[]; // User IDs (Logic: 1-3 people)
  createdAt: string;
  status: 'draft' | 'locked' | 'delivered';
}

export interface WitnessTask {
  id: string;
  targetUserId: string; // The person who chose you as witness
  targetUserName: string;
  targetUserAvatar: string;
  invitationStatus: 'pending_acceptance' | 'accepted' | 'declined';
  status: 'alive' | 'confirmed_deceased';
}

export interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  timestamp: number;
}