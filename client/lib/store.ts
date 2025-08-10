import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Types
export interface User {
  citizenId: string;
  email?: string;
  isAdmin: boolean;
  points: number;
  isLoggedIn: boolean;
  rank: number;
  tasksCompleted: number;
  successRate: number;
  badges: Badge[];
  region: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: string;
  color: string;
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
  location: {
    address: string;
    coordinates: { lat: number; lng: number };
  };
  status: "pending" | "under_review" | "approved" | "rejected";
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewComments?: string;
  aiVerificationScore: number;
  pointsAwarded?: number;
}

// Store interface
interface CivitasStore {
  // User state
  user: User | null;
  isAuthenticated: boolean;
  
  // Data
  tasks: Task[];
  reports: Report[];
  allUsers: User[];
  
  // Actions
  login: (credentials: { citizenId?: string; email?: string; password: string }) => Promise<boolean>;
  logout: () => void;
  register: (data: any) => Promise<string>;
  
  // Tasks
  createTask: (taskData: Omit<Task, 'id' | 'createdAt' | 'createdBy'>) => void;
  submitReport: (reportData: Omit<Report, 'id' | 'submittedAt' | 'status' | 'aiVerificationScore'>) => void;
  reviewReport: (reportId: string, action: 'approve' | 'reject', comments?: string) => void;
  
  // Data fetchers
  getUserTasks: () => Task[];
  getUserReports: () => Report[];
  getPendingReports: () => Report[];
  getLeaderboard: () => User[];

  // User management functions
  createUser: (userData: Omit<User, 'citizenId'>) => string;
  updateUser: (citizenId: string, updates: Partial<User>) => boolean;
  deleteUser: (citizenId: string) => boolean;
  getAllUsersWithCurrent: () => User[];
}

// Initialize with mock data
const initialTasks: Task[] = [
  {
    id: "1",
    type: "tree_planting",
    title: "Plant Trees in Sector 14",
    description: "Plant saplings in the designated green belt area and upload verification photos",
    points: 50,
    deadline: "2024-12-30",
    location: "Sector 14, Chandigarh",
    requirements: [
      "Plant minimum 3 saplings",
      "Use only native species provided", 
      "Ensure 6-foot spacing between plants",
      "Take photos showing before/during/after"
    ],
    createdBy: "admin",
    createdAt: "2024-12-20",
    isActive: true,
    assignedRegions: ["Delhi", "Chandigarh", "Punjab"]
  },
  {
    id: "2",
    type: "pollution_report",
    title: "Monitor Air Quality - Delhi NCR",
    description: "Report pollution levels and upload photos of affected areas",
    points: 30,
    deadline: "2024-12-28",
    location: "Delhi NCR",
    requirements: [
      "Take photos of pollution sources",
      "Record time and weather conditions",
      "Provide detailed description"
    ],
    createdBy: "admin",
    createdAt: "2024-12-19",
    isActive: true,
    assignedRegions: ["Delhi", "Gurgaon", "Noida"]
  },
  {
    id: "3",
    type: "corruption_report",
    title: "Report Government Office Issues",
    description: "Anonymous reporting of any irregularities in government offices",
    points: 40,
    deadline: "2024-12-31",
    location: "Any Government Office",
    requirements: [
      "Maintain complete anonymity",
      "Provide specific details",
      "Include evidence if possible"
    ],
    createdBy: "admin",
    createdAt: "2024-12-18",
    isActive: true
  }
];

const initialBadges: Badge[] = [
  {
    id: "green_warrior",
    name: "Green Warrior",
    description: "Planted 10+ trees",
    icon: "🌳",
    earnedAt: "2024-12-15",
    color: "bg-green-500"
  },
  {
    id: "pollution_fighter", 
    name: "Pollution Fighter",
    description: "5+ pollution reports",
    icon: "💨",
    earnedAt: "2024-12-10",
    color: "bg-blue-500"
  }
];

// Mock users for leaderboard
const initialUsers: User[] = [
  {
    citizenId: "CIV***A7B2",
    isAdmin: false,
    points: 15420,
    isLoggedIn: false,
    rank: 1,
    tasksCompleted: 234,
    successRate: 96,
    badges: initialBadges,
    region: "Delhi"
  },
  {
    citizenId: "CIV***C9D4", 
    isAdmin: false,
    points: 14850,
    isLoggedIn: false,
    rank: 2,
    tasksCompleted: 198,
    successRate: 94,
    badges: [initialBadges[0]],
    region: "Maharashtra"
  }
];

// Create store
export const useCivitasStore = create<CivitasStore>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      tasks: initialTasks,
      reports: [],
      allUsers: initialUsers,

      login: async (credentials) => {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const { citizenId, email, password } = credentials;
        
        // Simple validation
        if (password.length < 6) return false;
        if (citizenId && citizenId.length < 6) return false;
        if (email && !email.includes('@')) return false;

        // Create user object
        const isAdmin = citizenId?.toLowerCase().includes('admin') || email?.includes('admin') || false;
        const generatedId = citizenId || `CIV${Date.now().toString().slice(-6)}${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        
        const user: User = {
          citizenId: generatedId,
          email,
          isAdmin,
          points: Math.floor(Math.random() * 5000) + 1000,
          isLoggedIn: true,
          rank: Math.floor(Math.random() * 500) + 1,
          tasksCompleted: Math.floor(Math.random() * 50) + 1,
          successRate: Math.floor(Math.random() * 20) + 80,
          badges: Math.random() > 0.5 ? [initialBadges[0]] : [],
          region: "Delhi"
        };

        set({ user, isAuthenticated: true });
        return true;
      },

      logout: () => {
        set({ user: null, isAuthenticated: false });
      },

      register: async (data) => {
        await new Promise(resolve => setTimeout(resolve, 2000));
        const citizenId = `CIV${Date.now().toString().slice(-6)}${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        return citizenId;
      },

      createTask: (taskData) => {
        const newTask: Task = {
          ...taskData,
          id: `task_${Date.now()}`,
          createdAt: new Date().toISOString(),
          createdBy: get().user?.citizenId || 'admin'
        };
        
        set(state => ({
          tasks: [...state.tasks, newTask]
        }));
      },

      submitReport: (reportData) => {
        const report: Report = {
          ...reportData,
          id: `report_${Date.now()}`,
          submittedAt: new Date().toISOString(),
          status: 'pending',
          aiVerificationScore: Math.floor(Math.random() * 30) + 70 // 70-100%
        };

        set(state => ({
          reports: [...state.reports, report]
        }));

        // Simulate AI verification after 2 seconds
        setTimeout(() => {
          const { reports, user } = get();
          const updatedReports = reports.map(r => {
            if (r.id === report.id) {
              const approved = r.aiVerificationScore > 75;
              return {
                ...r,
                status: approved ? 'approved' : 'rejected' as const,
                pointsAwarded: approved ? reportData.taskId === '1' ? 50 : reportData.taskId === '2' ? 30 : 40 : 0,
                reviewedAt: new Date().toISOString()
              };
            }
            return r;
          });

          // Update user points if approved
          const approvedReport = updatedReports.find(r => r.id === report.id);
          if (approvedReport?.status === 'approved' && user) {
            const updatedUser = {
              ...user,
              points: user.points + (approvedReport.pointsAwarded || 0),
              tasksCompleted: user.tasksCompleted + 1
            };
            set({ user: updatedUser, reports: updatedReports });
          } else {
            set({ reports: updatedReports });
          }
        }, 2000);
      },

      reviewReport: (reportId, action, comments) => {
        const { reports, user } = get();
        const updatedReports = reports.map(report => {
          if (report.id === reportId) {
            const pointsAwarded = action === 'approve' ? 
              (report.taskId === '1' ? 50 : report.taskId === '2' ? 30 : 40) : 0;
              
            return {
              ...report,
              status: action === 'approve' ? 'approved' : 'rejected' as const,
              reviewedAt: new Date().toISOString(),
              reviewedBy: user?.citizenId || 'admin',
              reviewComments: comments,
              pointsAwarded
            };
          }
          return report;
        });

        set({ reports: updatedReports });
      },

      getUserTasks: () => {
        const { tasks, user } = get();
        if (!user) return [];
        
        return tasks.filter(task => 
          task.isActive && 
          (!task.assignedRegions || task.assignedRegions.includes(user.region))
        );
      },

      getUserReports: () => {
        const { reports, user } = get();
        if (!user) return [];
        return reports.filter(report => report.citizenId === user.citizenId);
      },

      getPendingReports: () => {
        const { reports } = get();
        return reports.filter(report => report.status === 'pending' || report.status === 'under_review');
      },

      getLeaderboard: () => {
        const { allUsers, user } = get();
        const usersWithCurrent = user ? [...allUsers, user] : allUsers;

        return usersWithCurrent
          .sort((a, b) => b.points - a.points)
          .map((user, index) => ({ ...user, rank: index + 1 }));
      },

      // User Management Functions
      createUser: (userData) => {
        const citizenId = `CIV${Date.now().toString().slice(-6)}${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        const newUser: User = {
          ...userData,
          citizenId,
          isLoggedIn: false
        };

        set(state => ({
          allUsers: [...state.allUsers, newUser]
        }));

        return citizenId;
      },

      updateUser: (citizenId, updates) => {
        const { allUsers, user } = get();

        // Update in allUsers array
        const updatedAllUsers = allUsers.map(u =>
          u.citizenId === citizenId ? { ...u, ...updates } : u
        );

        // Update current user if it's the same
        let updatedUser = user;
        if (user && user.citizenId === citizenId) {
          updatedUser = { ...user, ...updates };
        }

        set({
          allUsers: updatedAllUsers,
          user: updatedUser
        });

        return true;
      },

      deleteUser: (citizenId) => {
        const { allUsers, user } = get();

        // Don't allow deleting the current logged-in user
        if (user && user.citizenId === citizenId) {
          return false;
        }

        const updatedAllUsers = allUsers.filter(u => u.citizenId !== citizenId);

        set({
          allUsers: updatedAllUsers
        });

        return true;
      },

      getAllUsersWithCurrent: () => {
        const { allUsers, user } = get();
        const usersWithCurrent = user ? [...allUsers, user] : allUsers;

        // Remove duplicates and sort by creation time (newest first)
        const uniqueUsers = usersWithCurrent.filter((user, index, self) =>
          index === self.findIndex(u => u.citizenId === user.citizenId)
        );

        return uniqueUsers.sort((a, b) => b.points - a.points);
      }
    }),
    {
      name: 'civitas-store',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        tasks: state.tasks,
        reports: state.reports,
        allUsers: state.allUsers
      })
    }
  )
);
