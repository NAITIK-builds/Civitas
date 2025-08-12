import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Upload, X, Image as ImageIcon, Video } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface MediaUploadProps {
  onUploadComplete?: (mediaUrl: string, mediaType: string) => void;
  allowedTypes?: string[];
  maxSize?: number; // in MB
  userId: string;
}

export default function MediaUpload({
  onUploadComplete,
  allowedTypes = ["image/jpeg", "image/png", "image/gif", "video/mp4"],
  maxSize = 10, // 10MB default
  userId
}: MediaUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!allowedTypes.includes(file.type)) {
      toast.error("Invalid file type. Please upload an image or video.");
      return;
    }

    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      toast.error(`File too large. Maximum size is ${maxSize}MB`);
      return;
    }

    setSelectedFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      setUploading(true);

      // Generate unique filename
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;
      const filePath = `media/${fileName}`;

      // Upload to Supabase Storage
      // Check if storage bucket exists
      try {
        const { error: bucketError } = await supabase.storage
          .from('media')
          .list();

        if (bucketError) {
          console.error('Bucket error:', bucketError);
          throw new Error('Storage bucket not available. Please contact administrator.');
        }
      } catch (error: any) {
        console.error('Storage error:', error);
        throw new Error('Storage system not properly configured. Please contact administrator.');
      }

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('media')
        .upload(filePath, selectedFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        if (uploadError.message.includes('bucket')) {
          throw new Error('Storage not properly configured. Please contact administrator.');
        }
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(filePath);

      // Save to database
      const { error: dbError } = await supabase
        .from('user_media')
        .insert({
          user_id: userId,
          file_url: publicUrl,
          file_type: selectedFile.type,
          title: title.trim() || selectedFile.name,
          description: description.trim(),
          metadata: {
            size: selectedFile.size,
            lastModified: selectedFile.lastModified,
            type: selectedFile.type
          }
        });

      if (dbError) throw dbError;

      toast.success("Media uploaded successfully!");
      onUploadComplete?.(publicUrl, selectedFile.type);

      // Reset form
      setSelectedFile(null);
      setPreview(null);
      setTitle("");
      setDescription("");

    } catch (error: any) {
      toast.error("Upload failed: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Upload Media
        </CardTitle>
        <CardDescription>
          Share photos and videos of your civic activities
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* File Selection Area */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            {!preview ? (
              <>
                <Input
                  type="file"
                  accept={allowedTypes.join(",")}
                  onChange={handleFileSelect}
                  className="hidden"
                  id="media-upload"
                />
                <Label
                  htmlFor="media-upload"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                    <Upload className="w-6 h-6 text-gray-600" />
                  </div>
                  <div className="text-sm text-gray-600">
                    Click to upload or drag and drop
                  </div>
                  <div className="text-xs text-gray-500">
                    Supported formats: JPG, PNG, GIF, MP4
                  </div>
                </Label>
              </>
            ) : (
              <div className="relative">
                {selectedFile?.type.startsWith('image/') ? (
                  <img
                    src={preview}
                    alt="Preview"
                    className="max-h-[300px] mx-auto rounded-lg"
                  />
                ) : (
                  <video
                    src={preview}
                    controls
                    className="max-h-[300px] mx-auto rounded-lg"
                  />
                )}
                <button
                  onClick={() => {
                    setSelectedFile(null);
                    setPreview(null);
                  }}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Title and Description */}
          {selectedFile && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Give your media a title"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add a description..."
                  rows={3}
                />
              </div>
              <Button
                onClick={handleUpload}
                disabled={uploading}
                className="w-full"
              >
                {uploading ? "Uploading..." : "Upload"}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
