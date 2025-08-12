import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from './supabase';

// Types
export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: string;
  color: string;
}

export interface User {
  id: string;
  citizenId: string;
  email: string;
  isAdmin: boolean;
  points: number;
  isLoggedIn: boolean;
  rank: number;
  tasksCompleted: number;
  successRate: number;
  badges: Badge[];
  region: string;
  preferredLanguage: string;
  created_at?: string;
}

export interface Task {
  id: string;
  type: "tree_planting" | "pollution_report" | "corruption_report" | "cleanliness_drive";
  title: string;
  description: string;
  points: number;
  deadline: string;
  location: string;
  requirements: string[];
  createdBy: string;
  createdAt: string;
  isActive: boolean;
  assignedRegions?: string[];
}

export interface Report {
  id: string;
  citizenId: string;
  taskId: string;
  title: string;
  description: string;
  photos: string[];
  status: "pending" | "under_review" | "approved" | "rejected";
  location: {
    address: string;
    coordinates: { lat: number; lng: number };
  };
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewComments?: string;
  aiVerificationScore: number;
  pointsAwarded?: number;
}

interface LoginCredentials {
  citizenId?: string;
  email?: string;
  password: string;
}

interface SupabaseProfile {
  id: string;
  citizen_id: string;
  email: string;
  is_admin: boolean;
  points: number;
  rank: number;
  tasks_completed: number;
  success_rate: number;
  region: string;
  preferred_language: string;
}

// Store interface
interface CivitasStore {
  user: User | null;
  isAuthenticated: boolean;
  tasks: Task[];
  reports: Report[];
  allUsers: User[];
  
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => Promise<void>;
  register: (data: any) => Promise<string>;
  
  createTask: (taskData: Omit<Task, 'id' | 'createdAt' | 'createdBy'>) => void;
  submitReport: (reportData: Omit<Report, 'id' | 'submittedAt' | 'status' | 'aiVerificationScore'>) => void;
  reviewReport: (reportId: string, action: 'approve' | 'reject', comments?: string) => void;
  
  getUserTasks: () => Task[];
  getUserReports: () => Report[];
  getPendingReports: () => Report[];
  getLeaderboard: () => User[];
  
  createUser: (userData: Omit<User, 'citizenId'>) => string;
  updateUser: (citizenId: string, updates: Partial<User>) => boolean;
  deleteUser: (citizenId: string) => boolean;
  getAllUsersWithCurrent: () => User[];
}

export const useCivitasStore = create<CivitasStore>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      tasks: [],
      reports: [],
      allUsers: [],

      login: async (credentials) => {
        try {
          if (!credentials.email && !credentials.citizenId) {
            throw new Error('Either email or citizen ID is required');
          }

          if (!credentials.password) {
            throw new Error('Password is required');
          }

          let loginEmail = credentials.email;

          // If using citizen ID, get the email from profiles
          if (credentials.citizenId) {
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('email')
              .eq('citizen_id', credentials.citizenId)
              .single();

            if (profileError || !profile) {
              throw new Error('Invalid Citizen ID');
            }
            loginEmail = profile.email;
          }

          if (!loginEmail) {
            throw new Error('Email is required for login');
          }

          // Sign in with Supabase
          const { data, error } = await supabase.auth.signInWithPassword({
            email: loginEmail,
            password: credentials.password,
          });

          if (error) throw error;

          // Get user profile
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();

          if (profileError) throw profileError;

          const userProfile = profile as SupabaseProfile;

          const user: User = {
            id: data.user.id,
            citizenId: userProfile.citizen_id,
            email: userProfile.email,
            isAdmin: userProfile.is_admin,
            points: userProfile.points,
            isLoggedIn: true,
            rank: userProfile.rank,
            tasksCompleted: userProfile.tasks_completed,
            successRate: userProfile.success_rate,
            badges: [],
            region: userProfile.region,
            preferredLanguage: userProfile.preferred_language
          };

          set({ user, isAuthenticated: true });
          return true;
        } catch (error) {
          console.error('Login error:', error);
          return false;
        }
      },

      logout: async () => {
        try {
          await supabase.auth.signOut();
          set({ user: null, isAuthenticated: false });
        } catch (error) {
          console.error('Logout error:', error);
        }
      },

      register: async (data) => {
        const citizenId = `CIV${Date.now().toString().slice(-6)}${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        return citizenId;
      },

      createTask: (taskData) => {
        const task: Task = {
          ...taskData,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          createdBy: get().user?.citizenId || 'system',
          isActive: true
        };
        set(state => ({ tasks: [...state.tasks, task] }));
      },

      submitReport: (reportData) => {
        const report: Report = {
          ...reportData,
          id: Date.now().toString(),
          status: 'pending',
          submittedAt: new Date().toISOString(),
          aiVerificationScore: Math.random()
        } as Report;
        set(state => ({ reports: [...state.reports, report] }));
      },

      reviewReport: (reportId, action, comments) => {
        set(state => ({
          reports: state.reports.map(report => {
            if (report.id === reportId) {
              return {
                ...report,
                status: action === 'approve' ? 'approved' : 'rejected',
                reviewedAt: new Date().toISOString(),
                reviewedBy: get().user?.citizenId,
                reviewComments: comments,
                pointsAwarded: action === 'approve' ? Math.floor(Math.random() * 100) + 50 : 0
              } as Report;
            }
            return report;
          })
        }));
      },

      getUserTasks: () => {
        const user = get().user;
        if (!user) return [];
        return get().tasks.filter(task => 
          !task.assignedRegions || task.assignedRegions.includes(user.region)
        );
      },

      getUserReports: () => {
        const user = get().user;
        if (!user) return [];
        return get().reports.filter(report => report.citizenId === user.citizenId);
      },

      getPendingReports: () => {
        return get().reports.filter(report => report.status === 'pending');
      },

      getLeaderboard: () => {
        return [...get().allUsers].sort((a, b) => b.points - a.points);
      },

      createUser: (userData) => {
        const citizenId = `CIV${Date.now().toString().slice(-6)}${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        const newUser: User = {
          ...userData,
          citizenId,
          isLoggedIn: false,
          points: 0,
          rank: 0,
          tasksCompleted: 0,
          successRate: 100,
          badges: []
        };
        set(state => ({ allUsers: [...state.allUsers, newUser] }));
        return citizenId;
      },

      updateUser: (citizenId, updates) => {
        let success = false;
        set(state => ({
          allUsers: state.allUsers.map(user => {
            if (user.citizenId === citizenId) {
              success = true;
              return { ...user, ...updates };
            }
            return user;
          })
        }));
        return success;
      },

      deleteUser: (citizenId) => {
        let success = false;
        set(state => ({
          allUsers: state.allUsers.filter(user => {
            if (user.citizenId === citizenId) {
              success = true;
              return false;
            }
            return true;
          })
        }));
        return success;
      },

      getAllUsersWithCurrent: () => {
        return get().allUsers;
      }
    }),
    {
      name: 'civitas-store'
    }
  )
);
