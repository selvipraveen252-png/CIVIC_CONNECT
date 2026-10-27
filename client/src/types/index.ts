export type UserRole = 'citizen' | 'officer' | 'admin';

export interface User {
  id?: string;
  _id?: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  department?: Department | string | null;
  profileImage?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Department {
  _id: string;
  name: string;
  description: string;
  contactEmail: string;
  contactPhone: string;
  createdAt?: string;
  updatedAt?: string;
}

export type IssueCategory =
  | 'Road Damage'
  | 'Pothole'
  | 'Water Leakage'
  | 'Garbage Overflow'
  | 'Streetlight Failure'
  | 'Drainage Problem'
  | 'Traffic Problem'
  | 'Public Infrastructure'
  | 'Other';

export type IssuePriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type IssueStatus =
  | 'REPORTED'
  | 'VERIFIED'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'RESOLVED'
  | 'CLOSED'
  | 'REJECTED'
  | 'REOPENED';

export interface StatusHistoryItem {
  _id?: string;
  status: IssueStatus;
  changedBy: User | string;
  changedAt: string;
  remarks?: string;
  evidenceImage?: string;
}

export interface Issue {
  _id: string;
  title: string;
  description: string;
  category: IssueCategory;
  priority: IssuePriority;
  status: IssueStatus;
  image?: string;
  location: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  address: string;
  reportedBy: User;
  assignedDepartment?: Department | null;
  assignedOfficer?: User | null;
  statusHistory: StatusHistoryItem[];
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationItem {
  _id: string;
  user: string;
  issue?: Issue | null;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface DashboardStats {
  totalUsers?: number;
  totalIssues?: number;
  totalReports?: number;
  assignedIssues?: number;
  pendingVerification?: number;
  pending: number;
  inProgress: number;
  resolved: number;
  closedCount?: number;
  rejectedCount?: number;
  resolutionRate?: number;
  departmentsCount?: number;
  byCategory?: { category: string; count: number }[];
  byStatus?: { status: string; count: number }[];
  byPriority?: { priority: string; count: number }[];
  recentIssues?: Issue[];
  criticalIssues?: Issue[];
  recentUsers?: User[];
  recentReports?: Issue[];
  issuesList?: Issue[];
}
