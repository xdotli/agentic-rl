"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface SeedTaskUploadProps {
  onUpload: (file: File) => void
  onSkip: () => void
  onComplete: () => void
  disabled?: boolean
}

export function SeedTaskUpload({ onUpload, onSkip, onComplete, disabled = false }: SeedTaskUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      if (!selectedFile.name.endsWith('.zip')) {
        setErrorMessage('Please upload a .zip file')
        setFile(null)
        return
      }
      setFile(selectedFile)
      setErrorMessage('')
      setUploadStatus('idle')
    }
  }

  const handleUpload = async () => {
    if (!file) return

    setUploadStatus('uploading')
    setErrorMessage('')

    try {
      await onUpload(file)
      setUploadStatus('success')
      setTimeout(() => onComplete(), 1500)
    } catch (error) {
      setUploadStatus('error')
      setErrorMessage(error instanceof Error ? error.message : 'Upload failed')
    }
  }

  const handleSkip = () => {
    onSkip()
  }

  return (
    <Card className="w-full border border-gray-200 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white/80 backdrop-blur-sm">
      <CardHeader className="space-y-1 border-b border-gray-100 pb-4">
        <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <span className="text-xl">📦</span>
          Upload Seed Tasks
        </CardTitle>
        <CardDescription className="text-sm text-gray-500">
          Optional: Upload custom seed tasks for generating tasks, or purely let agents build it.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5 pt-5">
        <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center hover:border-gray-300 transition-colors">
          <input
            type="file"
            accept=".zip"
            onChange={handleFileChange}
            className="hidden"
            id="seed-task-upload"
            disabled={disabled || uploadStatus === 'uploading'}
          />
          <label
            htmlFor="seed-task-upload"
            className={`cursor-pointer ${disabled || uploadStatus === 'uploading' ? 'cursor-not-allowed opacity-50' : ''}`}
          >
            <div className="flex flex-col items-center gap-3">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <div className="text-sm text-gray-700">
                {file ? file.name : "Click to upload .zip file"}
              </div>
              {file && (
                <div className="text-xs text-gray-500">
                  {(file.size / 1024).toFixed(2)} KB
                </div>
              )}
            </div>
          </label>
        </div>

        {uploadStatus === 'success' && (
          <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-md p-3">
            Seed tasks uploaded successfully
          </div>
        )}

        {errorMessage && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">
            {errorMessage}
          </div>
        )}

        <div className="flex gap-3">
          <Button
            onClick={handleUpload}
            disabled={!file || disabled || uploadStatus === 'uploading' || uploadStatus === 'success'}
            className="flex-1 h-11 bg-black hover:bg-gray-800 text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm shadow-md hover:shadow-lg transform hover:scale-[1.01] active:scale-[0.99]"
          >
            {uploadStatus === 'uploading' ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin">⚙️</span> Uploading...
              </span>
            ) : uploadStatus === 'success' ? (
              <span className="flex items-center gap-2">
                <span>✓</span> Uploaded
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Upload <span>↑</span>
              </span>
            )}
          </Button>
          <Button
            onClick={handleSkip}
            disabled={disabled || uploadStatus === 'uploading'}
            variant="outline"
            className="flex-1 h-11 border-2 border-gray-300 hover:bg-gray-50 hover:border-gray-400 font-semibold rounded-lg transition-all duration-200 text-sm transform hover:scale-[1.01] active:scale-[0.99]"
          >
            <span className="flex items-center gap-2">
              Skip <span>→</span>
            </span>
          </Button>
        </div>

        <div className="text-xs text-gray-500 text-center">
          If no seed tasks are uploaded, default Terminal Bench tasks will be used
        </div>
      </CardContent>
    </Card>
  )
}
