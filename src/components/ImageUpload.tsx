import { useState } from "react";

interface ImageUploadProps {
  onImageUpload: (file: File, uploadedUrl?: string) => void;
  label: string;
  imageCount?: number;
}

export default function ImageUpload({
  onImageUpload,
  label,
  imageCount = 0,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploading(true);

      try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          console.log("File uploaded successfully:", data.url);
          onImageUpload(file, data.url);
        } else {
          console.error("Upload failed");
        }
      } catch (error) {
        console.error("Error uploading file:", error);
      } finally {
        setUploading(false);
      }
    }
  };

  return (
    <div className="relative">
      <label className="cursor-pointer group">
        <div
          className={`flex items-center justify-center px-4 py-2.5 border-2 border-dashed border-gray-200 rounded-lg text-sm text-gray-600 hover:border-violet-300 hover:bg-violet-50 transition-all ${
            uploading
              ? "opacity-50 cursor-not-allowed animate-pulse"
              : "group-hover:text-violet-700"
          } ${
            imageCount > 0
              ? "border-violet-200 bg-violet-50 text-violet-700"
              : ""
          }`}
        >
          <div className="flex items-center space-x-2">
            {uploading ? (
              <>
                <div className="w-4 h-4 border-2 border-violet-300 border-t-violet-600 rounded-full animate-spin"></div>
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                <span>
                  {label}
                  {imageCount > 0 ? ` (${imageCount})` : ""}
                </span>
              </>
            )}
          </div>
        </div>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="hidden"
          disabled={uploading}
        />
      </label>
    </div>
  );
}
