import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type IndiaState =
  | 'Andhra Pradesh'
  | 'Arunachal Pradesh'
  | 'Assam'
  | 'Bihar'
  | 'Chhattisgarh'
  | 'Goa'
  | 'Gujarat'
  | 'Haryana'
  | 'Himachal Pradesh'
  | 'Jharkhand'
  | 'Karnataka'
  | 'Kerala'
  | 'Madhya Pradesh'
  | 'Maharashtra'
  | 'Manipur'
  | 'Meghalaya'
  | 'Mizoram'
  | 'Nagaland'
  | 'Odisha'
  | 'Punjab'
  | 'Rajasthan'
  | 'Sikkim'
  | 'Tamil Nadu'
  | 'Telangana'
  | 'Tripura'
  | 'Uttar Pradesh'
  | 'Uttarakhand'
  | 'West Bengal'
  | 'Andaman and Nicobar Islands'
  | 'Chandigarh'
  | 'Dadra and Nagar Haveli and Daman and Diu'
  | 'Delhi'
  | 'Jammu and Kashmir'
  | 'Ladakh'
  | 'Lakshadweep'
  | 'Puducherry';

export const INDIA_STATES: IndiaState[] = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal','Andaman and Nicobar Islands','Chandigarh','Dadra and Nagar Haveli and Daman and Diu','Delhi','Jammu and Kashmir','Ladakh','Lakshadweep','Puducherry'
];

export interface Comment {
  id: string;
  postId: string;
  userId: string; // citizenId
  content: string;
  createdAt: string;
}

export interface Post {
  id: string;
  userId: string; // citizenId
  state: IndiaState;
  content: string;
  imageUrl?: string;
  createdAt: string;
  likes: string[]; // userIds who liked
  shareCount: number;
  comments: Comment[];
}

interface CommunityStore {
  posts: Post[];
  addPost: (data: { userId: string; state: IndiaState; content: string; imageUrl?: string }) => string;
  deletePost: (postId: string, requestUserId: string) => boolean;
  toggleLike: (postId: string, userId: string) => void;
  addComment: (postId: string, data: { userId: string; content: string }) => string;
  addShare: (postId: string) => void;
  getAllIndiaPosts: () => Post[];
  getPostsByState: (state: IndiaState) => Post[];
  getPostsByUser: (userId: string) => Post[];
}

function sortByDateDesc(a: Post, b: Post) {
  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
}

const seedPosts: Post[] = [
  {
    id: 'P' + Math.random().toString(36).slice(2),
    userId: 'CIV123456',
    state: 'Maharashtra',
    content: 'Beach cleanup drive completed at Juhu! 50+ citizens joined and collected 300kg of waste. #SwachhBharat',
    imageUrl: 'https://images.unsplash.com/photo-1542902093-d55926021d7b?q=80&w=1200&auto=format&fit=crop',
    createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    likes: ['CIV654321', 'CIV000111'],
    shareCount: 3,
    comments: [
      { id: 'C' + Math.random().toString(36).slice(2), postId: '', userId: 'CIV654321', content: 'Great work! Proud of the volunteers.', createdAt: new Date(Date.now() - 1000 * 60 * 50).toISOString() }
    ]
  },
  {
    id: 'P' + Math.random().toString(36).slice(2),
    userId: 'CIV777888',
    state: 'Kerala',
    content: 'Planted 200 mangrove saplings along the backwaters to prevent soil erosion.',
    imageUrl: 'https://images.unsplash.com/photo-1523978591478-c753949ff840?q=80&w=1200&auto=format&fit=crop',
    createdAt: new Date(Date.now() - 1000 * 60 * 150).toISOString(),
    likes: [],
    shareCount: 1,
    comments: []
  }
].map(p => ({ ...p, comments: p.comments.map(c => ({ ...c, postId: p.id })) }));

export const useCommunityStore = create<CommunityStore>()(
  persist(
    (set, get) => ({
      posts: seedPosts.sort(sortByDateDesc),

      addPost: ({ userId, state, content, imageUrl }) => {
        const id = 'P' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6).toUpperCase();
        const post: Post = {
          id,
          userId,
          state,
          content: content.trim(),
          imageUrl: imageUrl?.trim() || undefined,
          createdAt: new Date().toISOString(),
          likes: [],
          shareCount: 0,
          comments: []
        };
        set(s => ({ posts: [post, ...s.posts].sort(sortByDateDesc) }));
        return id;
      },

      deletePost: (postId, requestUserId) => {
        let deleted = false;
        set(s => {
          const post = s.posts.find(p => p.id === postId);
          if (!post) return s;
          if (post.userId !== requestUserId) return s;
          deleted = true;
          return { posts: s.posts.filter(p => p.id !== postId).sort(sortByDateDesc) };
        });
        return deleted;
      },

      toggleLike: (postId, userId) => {
        set(s => ({
          posts: s.posts.map(p => {
            if (p.id !== postId) return p;
            const liked = p.likes.includes(userId);
            return { ...p, likes: liked ? p.likes.filter(id => id !== userId) : [...p.likes, userId] };
          })
        }));
      },

      addComment: (postId, { userId, content }) => {
        const id = 'C' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6).toUpperCase();
        const newComment: Comment = {
          id,
          postId,
          userId,
          content: content.trim(),
          createdAt: new Date().toISOString()
        };
        set(s => ({
          posts: s.posts.map(p => (p.id === postId ? { ...p, comments: [...p.comments, newComment] } : p))
        }));
        return id;
      },

      addShare: (postId) => {
        set(s => ({
          posts: s.posts.map(p => (p.id === postId ? { ...p, shareCount: p.shareCount + 1 } : p))
        }));
      },

      getAllIndiaPosts: () => {
        return [...get().posts].sort(sortByDateDesc);
      },

      getPostsByState: (state) => {
        return get().posts.filter(p => p.state === state).sort(sortByDateDesc);
      },

      getPostsByUser: (userId) => {
        return get().posts.filter(p => p.userId === userId).sort(sortByDateDesc);
      },
    }),
    { name: 'community-store' }
  )
);
