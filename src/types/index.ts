export type UserRole = 'user' | 'lawyer' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar?: string;
  createdAt: string;
  isActive: boolean;
}

export interface Lawyer {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  specializations: LegalCategory[];
  barCouncilId: string;
  experience: number;
  degree: string;
  bio: string;
  isVerified: boolean;
  isAvailable: boolean;
  rating: number;
  casesHandled: number;
  createdAt: string;
}

export type LegalCategory =
  | 'civil'
  | 'criminal'
  | 'family'
  | 'property'
  | 'corporate'
  | 'consumer'
  | 'labor'
  | 'documentation'
  | 'other';

export const LEGAL_CATEGORIES: Record<LegalCategory, string> = {
  civil: 'Civil Law',
  criminal: 'Criminal Law',
  family: 'Family Law',
  property: 'Property Dispute',
  corporate: 'Corporate Law',
  consumer: 'Consumer Complaint',
  labor: 'Labour & Employment',
  documentation: 'Documentation / Legal Notice',
  other: 'Other',
};

export type CaseStatus =
  | 'new'
  | 'under_review'
  | 'lawyer_assigned'
  | 'in_consultation'
  | 'waiting_for_user'
  | 'resolved'
  | 'closed'
  | 'emergency';

export const CASE_STATUS_LABELS: Record<CaseStatus, string> = {
  new: 'New',
  under_review: 'Under Review',
  lawyer_assigned: 'Lawyer Assigned',
  in_consultation: 'In Consultation',
  waiting_for_user: 'Waiting for User',
  resolved: 'Resolved',
  closed: 'Closed',
  emergency: 'Emergency',
};

export interface Case {
  id: string;
  caseNumber: string;
  userId: string;
  userName: string;
  lawyerId?: string;
  lawyerName?: string;
  category: LegalCategory;
  title: string;
  description: string;
  status: CaseStatus;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  documents: CaseDocument[];
  timeline: TimelineEvent[];
  messages: CaseMessage[];
  notes: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CaseDocument {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: string;
  uploadedBy: string;
  uploadedByName: string;
  uploadedByRole: UserRole;
}

export interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  type: 'status_change' | 'message' | 'document' | 'note' | 'assignment';
}

export interface CaseMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  content: string;
  timestamp: string;
  attachments?: CaseDocument[];
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  period: 'monthly' | 'yearly';
  features: string[];
  isPopular?: boolean;
  badge?: string;
}

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  planName: string;
  status: 'active' | 'expired' | 'cancelled';
  startDate: string;
  endDate: string;
  autoRenew: boolean;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  createdAt: string;
  link?: string;
}

export interface Payment {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  method: 'upi' | 'credit_card' | 'debit_card' | 'net_banking';
  status: 'success' | 'pending' | 'failed';
  planName: string;
  transactionId: string;
  createdAt: string;
}
