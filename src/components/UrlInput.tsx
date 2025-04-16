'use client';

import { useState, FormEvent, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { FiSearch, FiHelpCircle, FiAlertCircle } from 'react-icons/fi';
import ApiConfigForm from './ApiConfigForm';

export default function UrlInput() {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showHelp, setShowHelp] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Simple URL validation regex
  const urlRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    setError('');
    
    // Validate URL format
    if (!url) {
      setError('Please enter a URL');
      inputRef.current?.focus();
      return;
    }
    
    if (!urlRegex.test(url)) {
      setError('Please enter a valid URL (e.g., https://example.com/article)');
      inputRef.current?.focus();
      return;
    }
    
    // Ensure URL has http/https protocol
    let formattedUrl = url;
    if (!url.startsWith('http')) {
      formattedUrl = `https://${url}`;
    }
    
    try {
      setIsLoading(true);
      
      // Get API keys from localStorage
      const openaiKey = localStorage.getItem('openaiApiKey');
      const geminiKey = localStorage.getItem('geminiApiKey');
      const apiProvider = localStorage.getItem('apiProvider') || 'openai';
      
      // // Check if at least one API key is available
      // if (apiProvider === 'openai' && !openaiKey) {
      //   setError('OpenAI API key is required. Please configure it in settings.');
      //   setIsLoading(false);
      //   return;
      // }
      
      // if (apiProvider === 'gemini' && !geminiKey) {
      //   setError('Gemini API key is required. Please configure it in settings.');
      //   setIsLoading(false);
      //   return;
      // }
      
      // Make API call to analyze the URL
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
      
      // Store the data in sessionStorage
      sessionStorage.setItem('articleData', JSON.stringify(data));
      
      // Redirect to results page
      router.push('/results');
    } catch (err: any) {
      console.error('Analysis error:', err);
      setError(err.message || 'An unexpected error occurred while analyzing the article');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleHelp = () => {
    setShowHelp(!showHelp);
  };

  return (
    <div className="w-full max-w-3xl mx-auto card p-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-lg font-bold">ARTICLE URL</h2>
        </div>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <button 
              className="p-1 rounded-full hover:bg-gray-700 transition-colors" 
              aria-label={showHelp ? "Hide help" : "Show help"}
              onClick={toggleHelp}
            >
              <FiHelpCircle size={20} />
            </button>
            
            {showHelp && (
              <div className="absolute right-0 mt-2 w-64 p-3 bg-card rounded-md shadow-lg border border-border z-10 text-sm animate-fade-in">
                <p className="mb-2">Enter the URL of a news article to analyze.</p>
                <p>The AI will extract key information and create a structured summary of the content.</p>
              </div>
            )}
          </div>
          <ApiConfigForm />
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="relative">
        <div className="flex items-center border border-gray-600 rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-primary focus-within:border-primary">
          <input
            ref={inputRef}
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="flex-1 p-4 bg-gray-800 text-white outline-none text-lg"
            placeholder="https://example.com/article"
            disabled={isLoading}
            aria-label="Article URL"
            aria-describedby={error ? "url-error" : undefined}
          />
          <button
            type="submit"
            disabled={isLoading}
            className="primary-btn flex items-center justify-center px-6 py-4 h-full text-lg font-medium transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            aria-label="Analyze Article"
          >
            {isLoading ? (
              <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" aria-hidden="true" />
            ) : (
              <>
                <FiSearch className="mr-2" /> Analyze Article
              </>
            )}
          </button>
        </div>
      </form>
      
      {error && (
        <div id="url-error" className="flex items-center text-red-400 mt-2 text-sm" role="alert">
          <FiAlertCircle className="mr-1 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}
    </div>
  );
}