export type Gender = "Female" | "Male" | "Non-binary";

export type RelationshipGoal = 
  | "Marriage / Life Partner"
  | "Serious Relationship"
  | "Casual Dating"
  | "New Friends / Networking"
  | "Open to Anything";

export interface Prompt {
  id: string; // e.g. "dream_date"
  question: string; // e.g. "My idea of a perfect first date is..."
  answer: string;
}

export interface Profile {
  id: string;
  name: string;
  age: number;
  gender: Gender;
  location: string;
  distance: number; // calculated simulated distance in miles
  biography: string;
  prompts: Prompt[];
  photoUrl: string; // Primary image URL
  albumPhotos: string[]; // secondary photos
  verified: boolean;
  verificationStatus: "unverified" | "pending" | "verified";
  hobbies: string[];
  completesProfile: number; // completion gauge percentage
  relationshipGoal: RelationshipGoal;
  superLiked?: boolean;
  sentRose?: boolean;
  sentRoseToMe?: boolean;
}

export interface Message {
  id: string;
  matchId: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
  isIcebreaker?: boolean;
  warningText?: string; // AI Warning message if flagged
  mediaUrl?: string; // photo/image message
  voiceDuration?: string; // represents a voice note
}

export interface Match {
  id: string;
  partner: Profile;
  likesEachOther: boolean;
  unreadCount: number;
  lastActive: string;
  dateShared?: {
    location: string;
    time: string;
    contacts: string[];
  };
  messages: Message[];
}

export interface SafetyQuiz {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}
