'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiSearch, FiLoader } from 'react-icons/fi';

export default function CompactUrlInput() {
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url) {
      setError('Please enter a URL');
      return;
    }
    
    // Basic URL validation
    try {
      new URL(url);
    } catch (error) {
      setError('Please enter a valid URL');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Store the response data in sessionStorage for the results page
      sessionStorage.setItem('articleData', JSON.stringify(data));
      
      // Navigate to results page
      router.push('/results');
    } catch (error) {
      console.error('Error analyzing URL:', error);
      setError('Failed to analyze the URL. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="animate-fade-in">
      <div className="flex items-center max-w-3xl mx-auto bg-slate-800 border border-slate-700 rounded-md h-12 overflow-hidden transition-all hover:border-slate-600 focus-within:border-green-500 focus-within:ring-1 focus-within:ring-green-500">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter article URL"
          className="flex-1 px-4 bg-transparent border-none focus:outline-none text-gray-200"
        />
        <button
          type="submit"
          disabled={loading}
          className="h-full px-6 bg-green-600 text-white flex items-center justify-center transition-all hover:bg-green-500 disabled:bg-green-800 disabled:cursor-not-allowed"
        >
          {loading ? <FiLoader className="animate-spin" /> : <FiSearch />}
        </button>
      </div>
      {error && (
        <div className="text-red-500 text-sm mt-2 text-center animate-fade-in">{error}</div>
      )}
    </form>
  );
}