/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

/**
 * Example response type for /api/demo
 */
export interface DemoResponse {
  message: string;
}

// User & Authentication Types
export interface User {
  citizenId: string;
  email?: string;
  isAdmin: boolean;
  points: number;
  badges: Badge[];
  createdAt: string;
  profile?: {
    displayName?: string;
    region?: string;
    preferredLanguage?: string;
  };
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: string;
}

// Task Types
export interface Task {
  id: string;
  type: TaskType;
  title: string;
  description: string;
  pointsReward: number;
  deadline?: string;
  assignedTo?: string[]; // citizen IDs
  createdBy: string; // admin ID
  createdAt: string;
  isActive: boolean;
}

export enum TaskType {
  TREE_PLANTING = 'tree_planting',
  POLLUTION_REPORT = 'pollution_report',
  CORRUPTION_REPORT = 'corruption_report',
  CLEANLINESS_DRIVE = 'cleanliness_drive',
  COMMUNITY_SERVICE = 'community_service'
}

// Report Types
export interface Report {
  id: string;
  citizenId: string;
  taskId: string;
  taskType: TaskType;
  title: string;
  description: string;
  photos: string[]; // URLs
  location: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  status: ReportStatus;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string; // admin ID
  reviewComments?: string;
  aiVerificationScore?: number;
  pointsAwarded?: number;
}

export enum ReportStatus {
  PENDING = 'pending',
  UNDER_REVIEW = 'under_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  VERIFIED = 'verified'
}

// Statistics Types
export interface PlatformStats {
  totalUsers: number;
  totalReports: number;
  verifiedReports: number;
  totalImpactValue: number;
  topContributors: LeaderboardEntry[];
}

export interface LeaderboardEntry {
  citizenId: string;
  displayName?: string;
  points: number;
  rank: number;
  badges: Badge[];
  region?: string;
}

// API Request/Response Types
export interface RegisterRequest {
  email?: string;
  password: string;
  region?: string;
  preferredLanguage?: string;
}

export interface RegisterResponse {
  citizenId: string;
  message: string;
}

export interface LoginRequest {
  citizenId?: string;
  email?: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

export interface SubmitReportRequest {
  taskId: string;
  title: string;
  description: string;
  photos: File[];
  location: {
    latitude: number;
    longitude: number;
    address?: string;
  };
}

export interface SubmitReportResponse {
  reportId: string;
  message: string;
  pointsEarned?: number;
}

export interface CreateTaskRequest {
  type: TaskType;
  title: string;
  description: string;
  pointsReward: number;
  deadline?: string;
  assignToAll?: boolean;
  assignToRegions?: string[];
}

export interface AdminDashboardData {
  pendingReports: Report[];
  recentTasks: Task[];
  stats: PlatformStats;
  regionalBreakdown: { [region: string]: number };
}

// Utility Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}
