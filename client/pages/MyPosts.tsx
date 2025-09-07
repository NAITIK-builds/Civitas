import Navigation from '@/components/Navigation';
import { useCivitasStore } from '@/lib/store';
import { useCommunityStore } from '@/lib/communityStore';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { Plus, Users, LayoutGrid } from 'lucide-react';
import BottomActionBar from '@/components/community/BottomActionBar';

export default function MyPosts() {
  const { user, isAuthenticated } = useCivitasStore();
  const getPostsByUser = useCommunityStore(s => s.getPostsByUser);

  const posts = user ? getPostsByUser(user.citizenId) : [];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="main-content">
        <section className="py-6">
          <div className="max-w-5xl mx-auto px-4">
            <div className="rounded-xl bg-gradient-to-r from-gov-navy to-gov-maroon p-5 text-white shadow">
              <h1 className="text-2xl font-bold mb-1 flex items-center gap-2">
                <LayoutGrid className="w-5 h-5" />
                My Posts
              </h1>
              <p className="text-white/90 text-sm">Your contributions shared with the community.</p>
            </div>

            <div className="mt-4 flex items-center gap-2">
              <Link to="/new-post">
                <Button className="bg-gov-navy text-white hover:bg-gov-navy/90">
                  <Plus className="w-4 h-4 mr-2" />
                  New Post
                </Button>
              </Link>
              <Link to="/community">
                <Button variant="outline">
                  <Users className="w-4 h-4 mr-2" />
                  Community Feed
                </Button>
              </Link>
              <Badge variant="secondary" className="ml-auto bg-gov-gold text-gov-navy border-0">
                {posts.length} total
              </Badge>
            </div>

            {!isAuthenticated || !user ? (
              <Card className="mt-4 p-6 text-center text-gray-600">
                Please log in to view your posts.
              </Card>
            ) : posts.length === 0 ? (
              <Card className="mt-4 p-6 text-center text-gray-600">
                You haven't posted yet. Click "New Post" to share your first update.
              </Card>
            ) : (
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
                {posts.map(p => (
                  <Link key={p.id} to={`/community#post-${p.id}`} className="group">
                    <div className="relative aspect-square overflow-hidden rounded-md border">
                      {p.imageUrl ? (
                        <img src={p.imageUrl} alt="post" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      ) : (
                        <div className="w-full h-full bg-white flex items-center justify-center p-3 text-center">
                          <div className="text-sm text-gray-700 whitespace-pre-wrap line-clamp-5">{p.content}</div>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                      <div className="absolute bottom-2 left-2 flex items-center gap-2 text-xs text-white">
                        <span className="font-mono bg-black/40 px-1.5 py-0.5 rounded">{p.userId}</span>
                        <span className="bg-black/40 px-1.5 py-0.5 rounded">{p.likes.length} ♥</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
            <BottomActionBar active="mine" />
          </div>
        </section>
      </main>
    </div>
  );
}
