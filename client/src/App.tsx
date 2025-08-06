
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { trpc } from '@/utils/trpc';
import { useState, useEffect, useCallback, useRef } from 'react';
import type { UploadResponse, FileStats } from '../../server/src/schema';

function App() {
  const [fileStats, setFileStats] = useState<FileStats>({ total_files: 0 });
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null);
  const [showCopyNotification, setShowCopyNotification] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load file statistics
  const loadFileStats = useCallback(async () => {
    try {
      const stats = await trpc.getFileStats.query();
      setFileStats(stats);
    } catch (error) {
      console.error('Failed to load file stats:', error);
    }
  }, []);

  useEffect(() => {
    loadFileStats();
  }, [loadFileStats]);

  // Generate unique token for file upload
  const generateUploadToken = () => {
    return crypto.randomUUID();
  };

  // Handle file upload
  const handleFileUpload = async (file: File) => {
    if (file.size > 200 * 1024 * 1024) { // 200MB limit
      setError('File size exceeds 200MB limit');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setError(null);
    setUploadedFileUrl(null);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      const uploadToken = generateUploadToken();
      
      // Create upload input
      const uploadInput = {
        filename: `${uploadToken}_${file.name}`,
        original_filename: file.name,
        file_path: `/uploads/${uploadToken}_${file.name}`,
        file_size: file.size,
        mime_type: file.type || 'application/octet-stream',
        upload_token: uploadToken
      };

      const response: UploadResponse = await trpc.uploadFile.mutate(uploadInput);
      
      clearInterval(progressInterval);
      setUploadProgress(100);

      if (response.success) {
        // Generate dynamic file URL based on current location
        const baseUrl = window.location.origin;
        const fileUrl = `${baseUrl}/file/${response.token}`;
        setUploadedFileUrl(fileUrl);
        
        // Refresh file stats
        await loadFileStats();
      } else {
        setError('Upload failed. Please try again.');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setError('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
      setTimeout(() => {
        setUploadProgress(0);
      }, 2000);
    }
  };

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  // Handle drag and drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  // Copy link to clipboard
  const copyToClipboard = async () => {
    if (uploadedFileUrl) {
      try {
        await navigator.clipboard.writeText(uploadedFileUrl);
        setShowCopyNotification(true);
        setTimeout(() => setShowCopyNotification(false), 2000);
      } catch (error) {
        console.error('Failed to copy to clipboard:', error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      {/* Header */}
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">📦 Earl Box</h1>
          <p className="text-gray-600">Simple file upload and sharing service</p>
          <div className="mt-4">
            <Badge variant="secondary" className="text-sm">
              📊 {fileStats.total_files} files uploaded by all users
            </Badge>
          </div>
        </div>

        {/* Upload Area */}
        <div className="max-w-2xl mx-auto">
          <Card className={`transition-all duration-300 ${dragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-200'} ${isUploading ? 'border-green-400' : ''}`}>
            <CardContent className="p-8">
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragOver ? 'border-blue-400 bg-blue-25' : 'border-gray-300'
                } ${isUploading ? 'border-green-400' : ''}`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={isUploading}
                />
                
                <div className="space-y-4">
                  {isUploading ? (
                    <>
                      <div className="text-3xl">📤</div>
                      <p className="text-lg font-medium text-green-600">Uploading...</p>
                      <div className="max-w-xs mx-auto">
                        <Progress value={uploadProgress} className="h-2" />
                        <p className="text-sm text-gray-500 mt-1">{uploadProgress}%</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-5xl">☁️</div>
                      <div>
                        <p className="text-lg font-medium text-gray-700 mb-2">
                          Drop your file here or click to browse
                        </p>
                        <p className="text-sm text-gray-500">
                          Maximum file size: 200MB
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Error Alert */}
              {error && (
                <Alert className="mt-4 border-red-200 bg-red-50">
                  <AlertDescription className="text-red-700">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              {/* Success - File uploaded */}
              {uploadedFileUrl && !isUploading && (
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-800 mb-1">
                        ✅ File uploaded successfully!
                      </p>
                      <p className="text-xs text-green-600 break-all">
                        {uploadedFileUrl}
                      </p>
                    </div>
                    <Button
                      onClick={copyToClipboard}
                      variant="outline"
                      size="sm"
                      className="ml-4 border-green-300 text-green-700 hover:bg-green-100"
                    >
                      📋 Copy Link
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Copy notification popup */}
      {showCopyNotification && (
        <div className="fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-in slide-in-from-right">
          ✅ Link copied to clipboard!
        </div>
      )}

      {/* Footer */}
      <div className="mt-auto py-6 text-center border-t border-gray-200 bg-white/50">
        <p className="text-gray-600">
          Created by Earl Store<span className="text-red-500">❤️</span>
        </p>
      </div>
    </div>
  );
}

export default App;
