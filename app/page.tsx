'use client';

import { useState } from 'react';

export default function Home() {
  const [url, setUrl] = useState('');
  const [format, setFormat] = useState(''); // State for the selected video quality
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    if (!url) {
      alert('Please enter a YouTube URL');
      return;
    }

    setLoading(true);
    try {
      // Call our API route with the URL and the selected format
      const response = await fetch(`/api/download?url=${encodeURIComponent(url)}&format=${format}`);

      if (!response.ok) {
        const contentType = response.headers.get('Content-Type') || '';
        let errorMessage = 'Download failed';

        if (contentType.includes('application/json')) {
          const errorJson = await response.json().catch(() => null);
          errorMessage = errorJson?.error ? `${errorJson.error}${errorJson.details ? ': ' + errorJson.details : ''}` : errorMessage;
        } else {
          const text = await response.text().catch(() => null);
          if (text) errorMessage = `${errorMessage}: ${text}`;
        }

        throw new Error(errorMessage);
      }

      // Create a blob from the response and trigger a download
      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;

      // Extract filename from Content-Disposition header or create a default one
      const contentDisposition = response.headers.get('Content-Disposition');
      const filename = contentDisposition?.split('filename=')[1]?.replace(/"/g, '') || 'video.mp4';
      a.download = filename;

      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download video. Please check the URL and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-100">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
          YouTube Video Downloader
        </h1>
        <input
          type="text"
          placeholder="Paste YouTube URL here..."
          className="w-full px-4 py-2 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <select
          className="w-full px-4 py-2 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
          value={format}
          onChange={(e) => setFormat(e.target.value)}
        >
          <option value="">Select Quality (Highest)</option>
          <option value="lowest">Lowest Quality</option>
          <option value="144p">144p</option>
          <option value="360p">360p</option>
          <option value="480p">480p</option>
          <option value="720p">720p</option>
          <option value="1080p">1080p</option>
        </select>
        <button
          onClick={handleDownload}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition duration-200 disabled:opacity-50"
        >
          {loading ? 'Processing...' : 'Download'}
        </button>
      </div>
    </main>
  );
}