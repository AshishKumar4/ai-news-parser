'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { FiSearch, FiHelpCircle } from 'react-icons/fi';
import ApiConfigForm from './ApiConfigForm';

export default function UrlInput() {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!url) {
      setError('Please enter a valid URL');
      return;
    }
    
    try {
      setIsLoading(true);
      setError('');
      
      // Get API keys from localStorage
      const openaiKey = localStorage.getItem('openaiApiKey');
      const geminiKey = localStorage.getItem('geminiApiKey');
      const apiProvider = localStorage.getItem('apiProvider') || 'openai';
      
      // Make API call to analyze the URL
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-OpenAI-Key': openaiKey || '',
          'X-Gemini-Key': geminiKey || '',
          'X-API-Provider': apiProvider
        },
        body: JSON.stringify({ url }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to analyze article');
      }
      
      const data = await response.json();
      
      // Store the data in sessionStorage
      sessionStorage.setItem('articleData', JSON.stringify(data));
      
      // Redirect to results page
      router.push('/results');
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto card p-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-lg font-bold">ARTICLE URL</h2>
        </div>
        <div className="flex items-center space-x-2">
          <button className="p-1 rounded-full hover:bg-gray-700" aria-label="Help">
            <FiHelpCircle size={20} />
          </button>
          <ApiConfigForm />
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="relative">
        <div className="flex items-center border border-gray-600 rounded-md overflow-hidden">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="flex-1 p-4 bg-gray-800 text-white outline-none text-lg"
            placeholder="https://example.com/article"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading}
            className="primary-btn flex items-center justify-center px-6 py-4 h-full text-lg font-medium"
            aria-label="Analyze Article"
          >
            {isLoading ? (
              <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              <>
                <FiSearch className="mr-2" /> Analyze Article
              </>
            )}
          </button>
        </div>
      </form>
      {error && <p className="text-red-400 mt-2 text-sm">{error}</p>}
    </div>
  );
}