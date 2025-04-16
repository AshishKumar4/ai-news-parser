'use client';

import { useState, useEffect, FormEvent } from 'react';
import { FiSettings, FiSave, FiX } from 'react-icons/fi';

export default function ApiConfigForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [openaiKey, setOpenaiKey] = useState('');
  const [geminiKey, setGeminiKey] = useState('');
  const [provider, setProvider] = useState('openai');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    // Load saved config from localStorage
    const savedOpenaiKey = localStorage.getItem('openaiApiKey') || '';
    const savedGeminiKey = localStorage.getItem('geminiApiKey') || '';
    const savedProvider = localStorage.getItem('apiProvider') || 'openai';
    
    setOpenaiKey(savedOpenaiKey);
    setGeminiKey(savedGeminiKey);
    setProvider(savedProvider);
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    // Save config to localStorage
    localStorage.setItem('openaiApiKey', openaiKey);
    localStorage.setItem('geminiApiKey', geminiKey);
    localStorage.setItem('apiProvider', provider);
    
    // Show saved message
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
    
    // Close the form
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="dark-btn p-2 rounded-full"
        aria-label="Configure API settings"
      >
        <FiSettings size={20} />
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 card p-4 z-10">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold">API Configuration</h3>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-gray-700 rounded-full"
            >
              <FiX size={18} />
            </button>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block mb-2 text-sm">API Provider</label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="provider"
                    value="openai"
                    checked={provider === 'openai'}
                    onChange={() => setProvider('openai')}
                    className="mr-2"
                  />
                  <span>OpenAI</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="provider"
                    value="gemini"
                    checked={provider === 'gemini'}
                    onChange={() => setProvider('gemini')}
                    className="mr-2"
                  />
                  <span>Gemini</span>
                </label>
              </div>
            </div>
            
            <div className="mb-4">
              <label htmlFor="openai-key" className="block mb-2 text-sm">
                OpenAI API Key
              </label>
              <input
                id="openai-key"
                type="password"
                value={openaiKey}
                onChange={(e) => setOpenaiKey(e.target.value)}
                className="w-full p-2 bg-gray-800 rounded border border-gray-700"
                placeholder="sk-..."
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="gemini-key" className="block mb-2 text-sm">
                Gemini API Key
              </label>
              <input
                id="gemini-key"
                type="password"
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                className="w-full p-2 bg-gray-800 rounded border border-gray-700"
                placeholder="AI..."
              />
            </div>
            
            <button
              type="submit"
              className="primary-btn w-full py-2 px-4 rounded flex items-center justify-center"
            >
              <FiSave className="mr-2" /> Save Configuration
            </button>
          </form>
          
          {isSaved && (
            <div className="mt-3 text-sm text-green-400 text-center">
              Configuration saved successfully!
            </div>
          )}
          
          <p className="mt-4 text-xs text-gray-400">
            Your API keys are stored locally in your browser and are never sent to our servers.
          </p>
        </div>
      )}
    </div>
  );
}