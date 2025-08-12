import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { 
  Upload, X, Image as ImageIcon, Video, File, 
  Camera, Play, CheckCircle, AlertTriangle, 
  FileImage, FileVideo, Loader2, CloudUpload,
  Trash2, Eye
} from "lucide-react";
import { supabase } from "@/lib/supabase";

interface MediaUploadProps {
  onUploadComplete?: (mediaUrl: string, mediaType: string) => void;
  allowedTypes?: string[];
  maxSize?: number; // in MB
  userId: string;
  showTitle?: boolean;
  compact?: boolean;
}

interface FileWithPreview {
  file: File;
  preview: string;
  id: string;
}

export default function MediaUpload({
  onUploadComplete,
  allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp", "video/mp4", "video/webm", "video/mov"],
  maxSize = 50, // Increased to 50MB
  userId,
  showTitle = true,
  compact = false
}: MediaUploadProps) {
  const [selectedFiles, setSelectedFiles] = useState<FileWithPreview[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateFileId = () => Math.random().toString(36).substring(2, 15);

  const handleFileSelect = useCallback((files: FileList) => {
    const validFiles: FileWithPreview[] = [];

    Array.from(files).forEach((file) => {
      // Check file type
      if (!allowedTypes.includes(file.type)) {
        toast.error(`Invalid file type: ${file.name}. Allowed types: ${allowedTypes.map(type => type.split('/')[1]).join(', ')}`);
        return;
      }

      // Check file size
      if (file.size > maxSize * 1024 * 1024) {
        toast.error(`File too large: ${file.name}. Maximum size is ${maxSize}MB`);
        return;
      }

      // Create preview
      const reader = new FileReader();
      const fileId = generateFileId();
      
      reader.onloadend = () => {
        validFiles.push({
          file,
          preview: reader.result as string,
          id: fileId
        });

        // Update state after all files are processed
        if (validFiles.length === Array.from(files).filter(f => 
          allowedTypes.includes(f.type) && f.size <= maxSize * 1024 * 1024
        ).length) {
          setSelectedFiles(prev => [...prev, ...validFiles]);
        }
      };
      reader.readAsDataURL(file);
    });
  }, [allowedTypes, maxSize]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files);
    }
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  }, []);

  const handleDragOut = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileSelect(files);
    }
  }, [handleFileSelect]);

  const removeFile = (id: string) => {
    setSelectedFiles(prev => prev.filter(f => f.id !== id));
  };

  const clearAllFiles = () => {
    setSelectedFiles([]);
    setTitle("");
    setDescription("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return FileImage;
    if (fileType.startsWith('video/')) return FileVideo;
    return File;
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    try {
      setUploading(true);
      setUploadProgress(0);

      // Check storage bucket availability
      try {
        const { error: bucketError } = await supabase.storage
          .from('media')
          .list('', { limit: 1 });

        if (bucketError) {
          throw new Error('Storage bucket not available. Please contact administrator.');
        }
      } catch (error) {
        throw new Error('Storage system not properly configured. Please contact administrator.');
      }

      const totalFiles = selectedFiles.length;
      let uploadedCount = 0;

      for (const fileWithPreview of selectedFiles) {
        const { file } = fileWithPreview;
        
        // Generate unique filename
        const fileExt = file.name.split('.').pop();
        const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `media/${fileName}`;

        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('media')
          .upload(filePath, file, {
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
            file_type: file.type,
            title: title.trim() || file.name,
            description: description.trim(),
            metadata: {
              size: file.size,
              lastModified: file.lastModified,
              type: file.type,
              originalName: file.name
            }
          });

        if (dbError) throw dbError;

        uploadedCount++;
        setUploadProgress((uploadedCount / totalFiles) * 100);

        // Call callback for each uploaded file
        onUploadComplete?.(publicUrl, file.type);
      }

      toast.success(`Successfully uploaded ${totalFiles} file${totalFiles > 1 ? 's' : ''}!`);

      // Reset form
      clearAllFiles();

    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error("Upload failed: " + error.message);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  if (compact) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Add Media
          </Button>
          {selectedFiles.length > 0 && (
            <Badge variant="secondary">
              {selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''} selected
            </Badge>
          )}
        </div>

        <Input
          ref={fileInputRef}
          type="file"
          accept={allowedTypes.join(",")}
          onChange={handleInputChange}
          multiple
          className="hidden"
        />

        {selectedFiles.length > 0 && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {selectedFiles.map((fileWithPreview) => {
                const IconComponent = getFileIcon(fileWithPreview.file.type);
                return (
                  <div key={fileWithPreview.id} className="flex items-center gap-2 p-2 border rounded-lg">
                    <IconComponent className="w-4 h-4 text-gray-600" />
                    <span className="text-sm truncate flex-1">{fileWithPreview.file.name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(fileWithPreview.id)}
                      className="h-6 w-6 p-0"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                );
              })}
            </div>
            
            <Button
              onClick={handleUpload}
              disabled={uploading}
              className="w-full"
              size="sm"
            >
              {uploading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Uploading... {Math.round(uploadProgress)}%
                </div>
              ) : (
                <>Upload {selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''}</>
              )}
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <Card className="w-full shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
      {showTitle && (
        <CardHeader className="pb-6">
          <CardTitle className="text-2xl flex items-center gap-3 text-gray-900">
            <div className="p-2 bg-blue-100 rounded-xl">
              <CloudUpload className="w-6 h-6 text-blue-600" />
            </div>
            Upload Media
          </CardTitle>
          <CardDescription className="text-base text-gray-600">
            Share photos and videos of your civic activities. Support for multiple files up to {maxSize}MB each.
          </CardDescription>
        </CardHeader>
      )}
      
      <CardContent className="space-y-6">
        {/* Enhanced File Drop Zone */}
        <div 
          className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ${
            dragActive 
              ? 'border-blue-500 bg-blue-50 scale-105' 
              : selectedFiles.length > 0 
                ? 'border-green-300 bg-green-50' 
                : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
          }`}
          onDragEnter={handleDragIn}
          onDragLeave={handleDragOut}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <Input
            ref={fileInputRef}
            type="file"
            accept={allowedTypes.join(",")}
            onChange={handleInputChange}
            multiple
            className="hidden"
            id="media-upload"
          />

          {selectedFiles.length === 0 ? (
            <Label
              htmlFor="media-upload"
              className="cursor-pointer flex flex-col items-center gap-4 py-4"
            >
              <div className={`w-20 h-20 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                dragActive ? 'bg-blue-200 scale-110' : 'bg-gray-100 hover:bg-gray-200'
              }`}>
                <Upload className={`w-8 h-8 ${dragActive ? 'text-blue-600' : 'text-gray-600'}`} />
              </div>
              
              <div className="space-y-2">
                <div className={`text-lg font-medium ${dragActive ? 'text-blue-600' : 'text-gray-700'}`}>
                  {dragActive ? 'Drop files here!' : 'Drop files here or click to browse'}
                </div>
                <div className="text-sm text-gray-500 space-y-1">
                  <div>Supported formats: JPG, PNG, GIF, WebP, MP4, WebM, MOV</div>
                  <div>Maximum file size: {maxSize}MB per file</div>
                  <div>Multiple files supported</div>
                </div>
              </div>

              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 rounded-full">
                  <ImageIcon className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-blue-600 font-medium">Photos</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-purple-100 rounded-full">
                  <Video className="w-4 h-4 text-purple-600" />
                  <span className="text-sm text-purple-600 font-medium">Videos</span>
                </div>
              </div>
            </Label>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <span className="text-lg font-medium text-gray-900">
                    {selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''} selected
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFiles}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Clear All
                </Button>
              </div>
              
              <div className="text-sm text-gray-600">
                Total size: {formatFileSize(selectedFiles.reduce((total, f) => total + f.file.size, 0))}
              </div>
            </div>
          )}
        </div>

        {/* File Preview Grid */}
        {selectedFiles.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">File Previews</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                Add More
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {selectedFiles.map((fileWithPreview) => {
                const isImage = fileWithPreview.file.type.startsWith('image/');
                const isVideo = fileWithPreview.file.type.startsWith('video/');

                return (
                  <Card key={fileWithPreview.id} className="overflow-hidden group hover:shadow-md transition-shadow">
                    <div className="relative aspect-video bg-gray-100">
                      {isImage ? (
                        <img
                          src={fileWithPreview.preview}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      ) : isVideo ? (
                        <div className="relative w-full h-full">
                          <video
                            src={fileWithPreview.preview}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                            <Play className="w-8 h-8 text-white" />
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <File className="w-8 h-8 text-gray-600" />
                        </div>
                      )}
                      
                      <div className="absolute top-2 right-2 flex gap-1">
                        <Button
                          variant="secondary"
                          size="icon"
                          className="h-8 w-8 bg-white/90 hover:bg-white shadow-sm"
                          onClick={() => window.open(fileWithPreview.preview, '_blank')}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          className="h-8 w-8 bg-red-500/90 hover:bg-red-500 shadow-sm"
                          onClick={() => removeFile(fileWithPreview.id)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      <div className="absolute bottom-2 left-2">
                        <Badge variant="secondary" className="text-xs">
                          {fileWithPreview.file.type.split('/')[0]}
                        </Badge>
                      </div>
                    </div>
                    
                    <CardContent className="p-3">
                      <div className="space-y-2">
                        <p className="font-medium text-sm truncate" title={fileWithPreview.file.name}>
                          {fileWithPreview.file.name}
                        </p>
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>{formatFileSize(fileWithPreview.file.size)}</span>
                          <span>{fileWithPreview.file.type}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Title and Description Form */}
        {selectedFiles.length > 0 && (
          <div className="space-y-4 p-6 bg-white rounded-xl border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Media Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title" className="text-sm font-medium text-gray-700">
                  Title <span className="text-gray-400">(optional)</span>
                </Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Give your media a descriptive title"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                  Description <span className="text-gray-400">(optional)</span>
                </Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add context about your civic activity..."
                  rows={3}
                  className="mt-1"
                />
              </div>
            </div>
          </div>
        )}

        {/* Upload Progress */}
        {uploading && (
          <div className="space-y-3 p-4 bg-blue-50 rounded-xl border border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                <span className="font-medium text-blue-900">Uploading files...</span>
              </div>
              <span className="text-sm font-medium text-blue-700">
                {Math.round(uploadProgress)}%
              </span>
            </div>
            <Progress value={uploadProgress} className="h-2" />
          </div>
        )}

        {/* Upload Button */}
        {selectedFiles.length > 0 && (
          <Button
            onClick={handleUpload}
            disabled={uploading}
            className="w-full h-12 text-lg font-medium bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-200"
          >
            {uploading ? (
              <div className="flex items-center gap-3">
                <Loader2 className="w-5 h-5 animate-spin" />
                Uploading... {Math.round(uploadProgress)}%
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <CloudUpload className="w-5 h-5" />
                Upload {selectedFiles.length} File{selectedFiles.length > 1 ? 's' : ''}
              </div>
            )}
          </Button>
        )}

        {/* Help Text */}
        <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-xl border border-amber-200">
          <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-amber-800">
            <p className="font-medium mb-1">Upload Tips:</p>
            <ul className="space-y-1 text-xs">
              <li>• High-quality images and videos help document your civic activities better</li>
              <li>• Include location and date information in descriptions when relevant</li>
              <li>• Multiple files can be uploaded simultaneously for efficiency</li>
              <li>• Uploaded media will be visible in your profile and may be featured in reports</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}