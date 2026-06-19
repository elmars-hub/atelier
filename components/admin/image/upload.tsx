"use client";

import { useState } from "react";

type ImageUploadProps = {
  preview: string | null;
  onPick: (file: File) => void;
  onRemove: () => void;
  label?: string;
  description?: string;
  size?: "sm" | "md" | "lg";
};

const sizeClasses = {
  sm: "w-16 h-16",
  md: "w-24 h-24",
  lg: "w-32 h-32",
};

export function ImageUpload({
  preview,
  onPick,
  onRemove,
  label = "Upload",
  description,
  size = "md",
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    onPick(file);
  };

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <div className="flex items-start gap-4">
        <div className="shrink-0">
          {preview ? (
            <div className="relative">
              <img
                src={preview}
                alt="Preview"
                className={`${sizeClasses[size]} rounded-lg object-cover border border-gray-200`}
              />
              <button
                type="button"
                onClick={onRemove}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center shadow cursor-pointer hover:bg-red-600 transition-colors"
              >
                ×
              </button>
            </div>
          ) : (
            <label
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                handleFile(e.dataTransfer.files[0]);
              }}
              className={`flex flex-col items-center justify-center ${sizeClasses[size]} border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                isDragging
                  ? "border-gray-900 bg-gray-50"
                  : "border-gray-300 hover:border-gray-400"
              }`}
            >
              <svg
                className="w-6 h-6 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span className="text-xs text-gray-500 mt-1">Upload</span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFile(e.target.files?.[0])}
                className="hidden"
              />
            </label>
          )}
        </div>
        {description && (
          <p className="text-xs text-gray-500 pt-2">{description}</p>
        )}
      </div>
    </div>
  );
}
