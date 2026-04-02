import React, { useState, useRef } from 'react';
import { Button } from './ui/button';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

interface ImageUploadProps {
  currentImageUrl?: string;
  onUpload: (file: File) => Promise<string>;
  onDelete?: () => Promise<void>;
  label?: string;
  folder?: 'products' | 'users';
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  currentImageUrl,
  onUpload,
  onDelete,
  label = 'Tải ảnh lên',
  folder = 'products'
}) => {
  const [imageUrl, setImageUrl] = useState<string | undefined>(currentImageUrl);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | undefined>(currentImageUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file ảnh');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Kích thước ảnh không được vượt quá 5MB');
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload
    try {
      setUploading(true);
      const url = await onUpload(file);
      setImageUrl(url);
      toast.success('Tải ảnh lên thành công');
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Không thể tải ảnh lên');
      setPreview(currentImageUrl);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;

    try {
      setUploading(true);
      await onDelete();
      setImageUrl(undefined);
      setPreview(undefined);
      toast.success('Xóa ảnh thành công');
    } catch (error: any) {
      console.error('Delete error:', error);
      toast.error(error.message || 'Không thể xóa ảnh');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>

      {/* Preview */}
      <div className="relative w-full h-64 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden bg-gray-50">
        {preview ? (
          <>
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-contain"
            />
            {onDelete && (
              <button
                onClick={handleDelete}
                disabled={uploading}
                className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 disabled:opacity-50"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <ImageIcon className="w-16 h-16 mb-2" />
            <p className="text-sm">Chưa có ảnh</p>
          </div>
        )}
      </div>

      {/* Upload Button */}
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex-1"
        >
          <Upload className="w-4 h-4 mr-2" />
          {uploading ? 'Đang tải...' : preview ? 'Thay đổi ảnh' : 'Chọn ảnh'}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      <p className="text-xs text-gray-500">
        Định dạng: JPG, PNG, GIF. Kích thước tối đa: 5MB
      </p>
    </div>
  );
};
