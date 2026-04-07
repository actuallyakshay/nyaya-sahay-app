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
  password: string;
  fullName: string;
  avatarUrl: string | null;
  accountStatus?: 'active' | 'inactive' | 'pending' | 'blocked';
}

export interface UsersListResponse {
  data: User[];
  pagination: Pagination;
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
  | 'documentation'
  | 'other';

export const LEGAL_CATEGORIES: Record<LegalCategory, string> = {
  civil: 'Civil Law',
  criminal: 'Criminal Law',
  family: 'Family Law',
  property: 'Property Dispute',
  corporate: 'Corporate Law',
  consumer: 'Consumer Complaint',
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
  caseId: string;
  author: UserRole;
  assetUrl: string;
  assetType: string;
  assetName?: string;
  createdAt: string;
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

export interface LawyersListUser {
  id: string;
  fullName: string;
  avatarUrl: string | null;
  email?: string;
  phone?: string;
  userRole?: {
    id: string;
    status: 'active' | 'inactive' | 'pending' | 'blocked';
  };
}

export interface LawyerPracticeAreaRow {
  practiceArea?: { id: string; name: string };
}

export interface LawyerListItem {
  id: string;
  userId: string;
  degree: string | null;
  barCouncilId: string | null;
  careerStartDate: string | null;
  bio: string | null;
  gender: string | null;
  createdAt: string;
  updatedAt: string;
  user: LawyersListUser;
  lawyerPracticeAreas: LawyerPracticeAreaRow[];
}

export interface LawyersPagination {
  total: number;
  totalPages: number;
  next: string | null;
  prev: string | null;
}

export interface LawyersListResponse {
  data: LawyerListItem[];
  pagination: LawyersPagination;
}

// Auth user (from API — has fullName, roles, avatarUrl)
export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  roles: UserRole[];
}

// Cases list API response types
export interface CaseItem {
  id: string;
  caseCode: string;
  title: string;
  status: CaseStatus;
  description?: string;
  practiceArea: { id: string; name: string } | null;
  assignedLawyer: { user: { fullName: string } } | null;
  user?: { fullName: string };
  isEmergency?: boolean;
  createdAt: string;
}

export interface Pagination {
  total: number;
  totalPages: number;
  next: number | null;
  prev: number | null;
}

export interface CasesResponse {
  data: CaseItem[];
  pagination: Pagination;
}

// Upload API response
export interface UploadedDoc {
  assetUrl: string;
  assetType: string;
  assetName?: string;
}

/** Align with backend CallType enum (adjust if your API uses different strings). */
export type CaseSessionCallType = 'video' | 'audio';

/** Align with backend CaseSessionRequestRaisedBy enum. */
export type CaseSessionRequestRaisedBy = 'user' | 'lawyer';

export interface CreateCaseSessionRequestBody {
  caseId: string;
  requestedDate: string;
  requestedTime: string;
  callType?: CaseSessionCallType;
  raisedBy?: CaseSessionRequestRaisedBy;
}

// Notification types
export type NotificationType =
  | 'info'
  | 'success'
  | 'warning'
  | 'error'
  | 'consultation';

export type ConsultationStatus = 'pending' | 'accepted' | 'declined';

export interface ConsultationDetails {
  sessionType: string;
  date: string;
  time: string;
  userName: string;
  caseNumber: string;
  status: ConsultationStatus;
  meetLink?: string;
}

export interface ConsultationNotification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
  link?: string;
  consultationDetails?: ConsultationDetails;
}

// Form validation types
export interface FieldErrors {
  email?: string;
  phone?: string;
  password?: string;
}

export interface RegistrationFields {
  name: string;
  email: string;
  phone: string;
  password: string;
}
