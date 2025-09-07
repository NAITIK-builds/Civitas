import Navigation from '@/components/Navigation';
import PostComposer from '@/components/community/PostComposer';
import { useCivitasStore } from '@/lib/store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import BottomActionBar from '@/components/community/BottomActionBar';

export default function NewPost() {
  const { isAuthenticated } = useCivitasStore();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="main-content">
        <section className="py-6">
          <div className="max-w-3xl mx-auto px-4">
            <div className="rounded-xl bg-gradient-to-r from-gov-navy to-gov-maroon p-5 text-white shadow">
              <h1 className="text-2xl font-bold mb-1">Create a Post</h1>
              <p className="text-white/90 text-sm">Share your impact with the community.</p>
            </div>

            <div className="mt-4" />
            <PostComposer />

            <Card className="mt-4 border-gov-navy/20">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="text-sm text-gray-600">Want to see what others are sharing?</div>
                <Link to="/community">
                  <Button variant="outline">Go to Community Feed</Button>
                </Link>
              </CardContent>
            </Card>
            <BottomActionBar active="post" />
          </div>
        </section>
      </main>
    </div>
  );
}
