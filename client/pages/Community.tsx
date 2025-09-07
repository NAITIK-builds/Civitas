import Navigation from '@/components/Navigation';
import PostComposer from '@/components/community/PostComposer';
import PostCard from '@/components/community/PostCard';
import StateFilter from '@/components/community/StateFilter';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState, useMemo } from 'react';
import { IndiaState, useCommunityStore, Post } from '@/lib/communityStore';
import { useCivitasStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import BottomActionBar from '@/components/community/BottomActionBar';

export default function Community() {
  const { user } = useCivitasStore();
  const posts = useCommunityStore(s => s.posts);

  const [selectedState, setSelectedState] = useState<IndiaState>((user?.region as IndiaState) || 'Delhi');
  const [sortBy, setSortBy] = useState<'latest' | 'likes' | 'shares'>('latest');

  const sortPosts = (arr: Post[]) => {
    const copy = [...arr];
    if (sortBy === 'likes') {
      return copy.sort((a, b) => b.likes.length - a.likes.length || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    if (sortBy === 'shares') {
      return copy.sort((a, b) => b.shareCount - a.shareCount || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return copy.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };

  const allPosts = useMemo(() => sortPosts(posts), [posts, sortBy]);
  const statePosts = useMemo(() => sortPosts(posts.filter(p => p.state === selectedState)), [posts, selectedState, sortBy]);

  const totalPosts = posts.length;
  const stateCount = posts.filter(p => p.state === selectedState).length;
  const trendingTags = useMemo(() => {
    const map = new Map<string, number>();
    posts.forEach(p => {
      const tags = p.content.match(/#[A-Za-z0-9_]+/g) || [];
      tags.forEach(t => map.set(t, (map.get(t) || 0) + 1));
    });
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([t]) => t);
  }, [posts]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="main-content">
        <section className="py-6">
          <div className="max-w-3xl mx-auto px-4">
            <div className="rounded-xl bg-gradient-to-r from-gov-navy to-gov-maroon p-5 text-white shadow">
              <h1 className="text-2xl font-bold mb-1">Community Feed</h1>
              <p className="text-white/90 text-sm">Share updates with your Citizen ID and explore contributions across India.</p>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
                <span className="bg-white/10 rounded-full px-3 py-1">All posts: <strong className="ml-1">{totalPosts}</strong></span>
                <span className="bg-white/10 rounded-full px-3 py-1">{selectedState}: <strong className="ml-1">{stateCount}</strong></span>
                {trendingTags.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-white/80">Trending:</span>
                    {trendingTags.map(tag => (
                      <Badge key={tag} className="bg-gov-gold text-gov-navy border-0">{tag}</Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-3" />
            <PostComposer />

            <div className="sticky top-[4.5rem] z-30 bg-gray-50/80 backdrop-blur supports-[backdrop-filter]:bg-gray-50/60 -mx-4 px-4 py-2 border-b">
              <div className="flex items-center justify-between max-w-3xl mx-auto">
                <Tabs defaultValue="all" className="w-full">
                  <div className="flex items-center justify-between gap-3">
                    <TabsList className="mb-0">
                      <TabsTrigger value="all">All India</TabsTrigger>
                      <TabsTrigger value="state">By State</TabsTrigger>
                    </TabsList>
                    <div className="flex items-center gap-2">
                      <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="latest">Latest</SelectItem>
                          <SelectItem value="likes">Most Liked</SelectItem>
                          <SelectItem value="shares">Most Shared</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button onClick={() => document.getElementById('composer')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>
                        <Plus className="w-4 h-4 mr-2" /> New Post
                      </Button>
                    </div>
                  </div>

                  <TabsContent value="all" className="mt-3">
                    {allPosts.length === 0 ? (
                      <div className="text-center text-gray-600 py-10">No posts yet. Be the first to post!</div>
                    ) : (
                      allPosts.map(p => (<PostCard key={p.id} post={p} />))
                    )}
                  </TabsContent>

                  <TabsContent value="state" className="mt-3">
                    <div className="mb-3">
                      <StateFilter value={selectedState} onChange={setSelectedState} />
                    </div>
                    {statePosts.length === 0 ? (
                      <div className="text-center text-gray-600 py-10">No posts in this state yet.</div>
                    ) : (
                      statePosts.map(p => (<PostCard key={p.id} post={p} />))
                    )}
                  </TabsContent>
                </Tabs>
              </div>
            </div>

            <div className="hidden" />
            <BottomActionBar active="all" />
          </div>
        </section>
      </main>
    </div>
  );
}
