'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { FiSearch, FiLoader, FiAlertCircle } from 'react-icons/fi';

export default function CompactUrlInput() {
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Simple URL validation regex
  const urlRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Validate URL format
    if (!url) {
      setError('Please enter a URL');
      inputRef.current?.focus();
      return;
    }
    
    if (!urlRegex.test(url)) {
      setError('Please enter a valid URL');
      inputRef.current?.focus();
      return;
    }
    
    // Ensure URL has http/https protocol
    let formattedUrl = url;
    if (!url.startsWith('http')) {
      formattedUrl = `https://${url}`;
    }
    
    setLoading(true);
    
    try {
      // Get API keys from localStorage
      const openaiKey = localStorage.getItem('openaiApiKey');
      const geminiKey = localStorage.getItem('geminiApiKey');
      const apiProvider = localStorage.getItem('apiProvider') || 'openai';
      
      // Check if API keys are configured
      if (apiProvider === 'openai' && !openaiKey) {
        throw new Error('OpenAI API key not configured. Click settings to add it.');
      }
      
      if (apiProvider === 'gemini' && !geminiKey) {
        throw new Error('Gemini API key not configured. Click settings to add it.');
      }
      
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-OpenAI-Key': openaiKey || '',
          'X-Gemini-Key': geminiKey || '',
          'X-API-Provider': apiProvider
        },
        body: JSON.stringify({ url: formattedUrl }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error ${response.status}: Failed to analyze article`);
      }
      
      const data = await response.json();
      
      // Store the response data in sessionStorage for the results page
      sessionStorage.setItem('articleData', JSON.stringify(data));
      
      // Navigate to results page
      router.push('/results');
    } catch (error: any) {
      console.error('Error analyzing URL:', error);
      setError(error.message || 'Failed to analyze the URL. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="animate-fade-in">
      <div className="flex items-center max-w-3xl mx-auto bg-slate-800 border border-slate-700 rounded-md h-12 overflow-hidden transition-all hover:border-slate-600 focus-within:border-green-500 focus-within:ring-1 focus-within:ring-green-500">
        <input
          ref={inputRef}
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter article URL"
          className="flex-1 px-4 bg-transparent border-none focus:outline-none text-gray-200"
          disabled={loading}
          aria-label="Article URL for analysis"
          aria-describedby={error ? "compact-url-error" : undefined}
        />
        <button
          type="submit"
          disabled={loading}
          className="h-full px-6 bg-green-600 text-white flex items-center justify-center transition-all hover:bg-green-500 disabled:bg-green-800 disabled:cursor-not-allowed"
          aria-label={loading ? "Analyzing article..." : "Analyze article"}
        >
          {loading ? (
            <FiLoader className="animate-spin" aria-hidden="true" />
          ) : (
            <FiSearch aria-hidden="true" />
          )}
        </button>
      </div>
      {error && (
        <div 
          id="compact-url-error"
          className="flex items-center justify-center text-red-400 text-sm mt-2 animate-fade-in"
          role="alert"
        >
          <FiAlertCircle className="mr-1 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </form>
  );
}