import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface PhotoSubmission {
  id: string;
  userId: string;
  taskId: string;
  taskType: string;
  photos: string[];
  verificationResults: any[];
  status: "pending" | "approved" | "rejected";
  submittedAt: string;
  location: {
    address: string;
    coordinates: { lat: number; lng: number };
  };
  formData: {
    description: string;
    additionalNotes: string;
  };
  aiVerificationScore: number;
  adminReview?: {
    reviewedBy: string;
    reviewedAt: string;
    comments: string;
  };
}

interface SubmissionStore {
  submissions: PhotoSubmission[];
  addSubmission: (submission: Omit<PhotoSubmission, 'id' | 'submittedAt' | 'status'>) => void;
  updateSubmissionStatus: (id: string, status: "pending" | "approved" | "rejected", adminReview?: any) => void;
  getSubmissionsByStatus: (status: "pending" | "approved" | "rejected") => PhotoSubmission[];
  getSubmissionsByUser: (userId: string) => PhotoSubmission[];
}

export const useSubmissionStore = create<SubmissionStore>()(
  persist(
    (set, get) => ({
      submissions: [],
      
      addSubmission: (submissionData) => {
        const newSubmission: PhotoSubmission = {
          ...submissionData,
          id: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          submittedAt: new Date().toISOString(),
          status: "pending"
        };
        
        set((state) => ({
          submissions: [...state.submissions, newSubmission]
        }));
      },
      
      updateSubmissionStatus: (id, status, adminReview) => {
        set((state) => ({
          submissions: state.submissions.map(submission =>
            submission.id === id
              ? {
                  ...submission,
                  status,
                  adminReview: adminReview ? {
                    reviewedBy: "admin_user",
                    reviewedAt: new Date().toISOString(),
                    comments: adminReview.comments || ""
                  } : submission.adminReview
                }
              : submission
          )
        }));
      },
      
      getSubmissionsByStatus: (status) => {
        return get().submissions.filter(sub => sub.status === status);
      },
      
      getSubmissionsByUser: (userId) => {
        return get().submissions.filter(sub => sub.userId === userId);
      }
    }),
    {
      name: 'submission-store',
    }
  )
);
