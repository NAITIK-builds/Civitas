import { useMemo, useState } from 'react';
import { Post, useCommunityStore } from '@/lib/communityStore';
import { useCivitasStore } from '@/lib/store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Heart, MessageCircle, Share2, Send, Trash2 } from 'lucide-react';
import LikeButton from '@/components/community/LikeButton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface Props { post: Post }

function highlightContent(text: string) {
  const parts = text.split(/(#[A-Za-z0-9_]+)/g);
  return parts.map((part, i) =>
    part.startsWith('#') ? (
      <span key={i} className="text-gov-maroon font-semibold">{part}</span>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

export default function PostCard({ post }: Props) {
  const { user } = useCivitasStore();
  const toggleLike = useCommunityStore(s => s.toggleLike);
  const addComment = useCommunityStore(s => s.addComment);
  const addShare = useCommunityStore(s => s.addShare);
  const deletePost = useCommunityStore(s => s.deletePost);

  const [commentText, setCommentText] = useState('');
  const [showAllComments, setShowAllComments] = useState(false);
  const [openComments, setOpenComments] = useState(false);

  const isLiked = useMemo(() => {
    if (!user) return false;
    return post.likes.includes(user.citizenId);
  }, [post.likes, user]);

  const handleLike = () => {
    if (!user) return;
    toggleLike(post.id, user.citizenId);
  };

  const handleComment = () => {
    if (!user) return;
    const text = commentText.trim();
    if (!text) return;
    addComment(post.id, { userId: user.citizenId, content: text });
    setCommentText('');
  };

  const handleShare = async () => {
    addShare(post.id);
    const shareData = { title: 'Civitas Post', text: post.content, url: window.location.href };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(`${post.content}\n${window.location.href}`);
      }
    } catch {}
  };

  const initials = post.userId.slice(0, 2).toUpperCase();
  const comments = showAllComments ? post.comments : post.comments.slice(-3);

  return (
    <>
    <Card id={`post-${post.id}`} className="mb-4 border border-gov-navy/15 hover:shadow-lg transition-shadow">
      <CardContent className="p-4">
        <div className="flex gap-3">
          <Avatar className="ring-2 ring-gov-navy/20">
            <AvatarFallback className="bg-gov-navy/10 text-gov-navy font-mono font-bold">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="font-mono font-semibold text-gov-navy truncate">{post.userId}</span>
              <Badge variant="secondary" className="bg-gov-gold text-gov-navy border-0">{post.state}</Badge>
              <span className="text-gray-500">{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
              {user && user.citizenId === post.userId && (
                <div className="ml-auto">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="text-red-600 hover:text-white hover:bg-red-600 border-red-200">
                        <Trash2 className="w-4 h-4 mr-1" /> Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete this post?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently remove your post and its comments.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-red-600 hover:bg-red-700"
                          onClick={() => {
                            if (!user) return;
                            const ok = deletePost(post.id, user.citizenId);
                            if (ok) toast.success('Post deleted');
                          }}
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              )}
            </div>

            <div className="mt-2 whitespace-pre-wrap text-[15px] leading-relaxed">
              {highlightContent(post.content)}
            </div>

            {post.imageUrl && (
              <div className="mt-3 overflow-hidden rounded-md border">
                <AspectRatio ratio={16/9}>
                  <img src={post.imageUrl} alt="post" className="h-full w-full object-cover" />
                </AspectRatio>
              </div>
            )}

            <div className="mt-3 flex items-center text-sm text-gray-600">
              <div className="flex gap-4">
                <span className="inline-flex items-center gap-1"><Heart className={`w-4 h-4 ${isLiked ? 'text-gov-maroon' : ''}`} /> {post.likes.length}</span>
                <span className="inline-flex items-center gap-1"><MessageCircle className="w-4 h-4" /> {post.comments.length}</span>
                <span className="inline-flex items-center gap-1 font-semibold text-gov-navy"><Share2 className="w-4 h-4" /> {post.shareCount}</span>
              </div>
            </div>

            <div className="mt-2 grid grid-cols-3 gap-2 sm:flex sm:gap-2">
              <LikeButton count={post.likes.length} liked={isLiked} onClick={handleLike} />
              <Button variant="outline" size="sm" onClick={() => setOpenComments(true)}>
                <MessageCircle className="w-4 h-4" /> Comment
              </Button>
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="w-4 h-4" /> Share
              </Button>
            </div>

          </div>
        </div>
      </CardContent>
    </Card>

    <Dialog open={openComments} onOpenChange={setOpenComments}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="font-mono text-gov-navy">{post.userId}</span>
            <Badge variant="secondary" className="bg-gov-gold text-gov-navy border-0">{post.state}</Badge>
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="text-sm text-gray-700 whitespace-pre-wrap">
            {highlightContent(post.content)}
          </div>
          {post.imageUrl && (
            <div className="overflow-hidden rounded-md border">
              <AspectRatio ratio={16/9}>
                <img src={post.imageUrl} alt="post" className="h-full w-full object-cover" />
              </AspectRatio>
            </div>
          )}
          <div className="text-xs text-gray-500">{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</div>
        </div>

        <div className="mt-2 border rounded-md">
          <ScrollArea className="h-64 p-3">
            <div className="space-y-3">
              {post.comments.map(c => (
                <div key={c.id} className="flex items-start gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-[10px] bg-gov-navy/10 text-gov-navy font-mono">{c.userId.slice(0,2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="bg-gray-50 border rounded-2xl px-3 py-2 max-w-full">
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <span className="font-mono text-gov-navy font-semibold">{c.userId}</span>
                      <span>•</span>
                      <span>{formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}</span>
                    </div>
                    <div className="text-sm">{c.content}</div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
          <div className="p-3 border-t flex gap-2">
            <Input
              id={`cmt-modal-${post.id}`}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a comment"
              className="rounded-full"
            />
            <Button onClick={handleComment} disabled={!user || !commentText.trim()} className="rounded-full" size="icon">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
}
