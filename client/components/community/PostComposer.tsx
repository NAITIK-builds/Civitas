import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCommunityStore, INDIA_STATES, IndiaState } from '@/lib/communityStore';
import { useCivitasStore } from '@/lib/store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ImagePlus, LogIn } from 'lucide-react';
import { toast } from 'sonner';

export default function PostComposer() {
  const { user, isAuthenticated } = useCivitasStore();
  const addPost = useCommunityStore(s => s.addPost);

  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [state, setState] = useState<IndiaState>((user?.region as IndiaState) || 'Delhi');
  const [submitting, setSubmitting] = useState(false);
  const limit = 500;

  if (!isAuthenticated || !user) {
    return (
      <Card id="composer" className="mb-4 border-gov-navy/20">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <div className="font-semibold text-gov-navy">Login to post updates</div>
            <div className="text-sm text-gray-600">Sign in to share with your Citizen ID and engage with the community.</div>
          </div>
          <Link to="/login">
            <Button>
              <LogIn className="w-4 h-4 mr-2" /> Login
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  const submit = async () => {
    const trimmed = content.trim();
    if (!trimmed) {
      toast.error('Write something before posting');
      return;
    }
    if (trimmed.length > limit) {
      toast.error('Post exceeds character limit');
      return;
    }
    setSubmitting(true);
    try {
      addPost({ userId: user.citizenId, state, content: trimmed, imageUrl: imageUrl.trim() || undefined });
      setContent('');
      setImageUrl('');
      toast.success('Posted');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card id="composer" className="mb-4 border-gov-navy/20">
      <CardContent className="p-4 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share an update with your fellow citizens"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Select a state and optionally add an image.</span>
              <span className={content.length > limit ? 'text-red-600' : ''}>{content.length}/{limit}</span>
            </div>
          </div>
          <div className="sm:w-64">
            <Select value={state} onValueChange={(v) => setState(v as IndiaState)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select state" />
              </SelectTrigger>
              <SelectContent>
                {INDIA_STATES.map(s => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <div className="flex gap-3 items-center">
            <Input
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="Optional image URL"
            />
            <Button type="button" onClick={submit} disabled={submitting || !content.trim() || content.length > limit}>
              <ImagePlus className="w-4 h-4 mr-2" />
              Post
            </Button>
          </div>
          {imageUrl.trim() && (
            <img src={imageUrl} alt="preview" className="mt-2 rounded-md max-h-60 object-cover" />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
