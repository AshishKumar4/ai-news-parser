'use client';

import { useState, useEffect, FormEvent, useRef } from 'react';
import { FiSettings, FiSave, FiX, FiEye, FiEyeOff, FiAlertCircle } from 'react-icons/fi';

export default function ApiConfigForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [openaiKey, setOpenaiKey] = useState('');
  const [geminiKey, setGeminiKey] = useState('');
  const [provider, setProvider] = useState('gemini'); // Default to gemini
  const [isSaved, setIsSaved] = useState(false);
  const [showOpenAIKey, setShowOpenAIKey] = useState(false);
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{openai?: string; gemini?: string}>({});
  
  const modalRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // Load saved config from localStorage
    const savedOpenaiKey = localStorage.getItem('openaiApiKey') || '';
    const savedGeminiKey = localStorage.getItem('geminiApiKey') || '';
    // Default to 'gemini' if no provider is saved
    const savedProvider = localStorage.getItem('apiProvider') || 'gemini';
    
    setOpenaiKey(savedOpenaiKey);
    setGeminiKey(savedGeminiKey);
    setProvider(savedProvider);
  }, []);

  // Handle clicks outside the modal
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        isOpen &&
        modalRef.current && 
        !modalRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    
    // Handle escape key
    function handleEscapeKey(event: KeyboardEvent) {
      if (isOpen && event.key === 'Escape') {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscapeKey);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen]);

  const validateKeys = () => {
    const errors: {openai?: string; gemini?: string} = {};
    
    // Validate OpenAI key if it's the selected provider or if a key is entered
    if ((provider === 'openai' || openaiKey) && !validateOpenAIKey(openaiKey)) {
      errors.openai = 'Invalid OpenAI key format (should start with "sk-")';
    }
    
    // Validate Gemini key if it's the selected provider or if a key is entered
    if ((provider === 'gemini' || geminiKey) && !validateGeminiKey(geminiKey)) {
      errors.gemini = 'Invalid Gemini key format';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Key format validators
  const validateOpenAIKey = (key: string) => {
    return key === '' || key.startsWith('sk-');
  };
  
  const validateGeminiKey = (key: string) => {
    // Simple validation - should be non-empty if Gemini is selected
    return key !== '' || provider !== 'gemini';
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    // Validate keys before saving
    if (!validateKeys()) {
      return;
    }
    
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

  const toggleModal = () => {
    setIsOpen(!isOpen);
    // Reset validation errors when opening
    if (!isOpen) {
      setValidationErrors({});
    }
  };

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={toggleModal}
        className="dark-btn p-2 rounded-full"
        aria-label="Configure API settings"
        aria-expanded={isOpen}
        aria-haspopup="dialog"
      >
        <FiSettings size={20} />
      </button>
      
      {isOpen && (
        <>
          {/* Invisible overlay to detect outside clicks */}
          <div className="fixed inset-0 z-10" aria-hidden="true" />
          
          <div 
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="api-config-title"
            className="absolute right-0 mt-2 w-80 card p-4 z-20 animate-scale-in shadow-lg"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 id="api-config-title" className="font-bold">API Configuration</h3>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-gray-700 rounded-full transition-colors"
                aria-label="Close dialog"
              >
                <FiX size={18} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <fieldset>
                  <legend className="block mb-2 text-sm">API Provider</legend>
                  <div className="flex space-x-4">
                    <label className="flex items-center cursor-pointer">
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
                    <label className="flex items-center cursor-pointer">
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
                </fieldset>
              </div>
              
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <label htmlFor="openai-key" className="block text-sm">
                    OpenAI API Key
                  </label>
                  {provider === 'openai' && (
                    <span className="text-xs text-primary">Required</span>
                  )}
                </div>
                <div className="relative">
                  <input
                    id="openai-key"
                    type={showOpenAIKey ? "text" : "password"}
                    value={openaiKey}
                    onChange={(e) => {
                      setOpenaiKey(e.target.value);
                      if (validationErrors.openai) {
                        setValidationErrors({...validationErrors, openai: undefined});
                      }
                    }}
                    className={`w-full p-2 bg-gray-800 rounded border ${
                      validationErrors.openai ? 'border-red-500' : 'border-gray-700'
                    }`}
                    placeholder="sk-..."
                    aria-invalid={validationErrors.openai ? "true" : "false"}
                    aria-describedby={validationErrors.openai ? "openai-key-error" : undefined}
                  />
                  <button
                    type="button"
                    onClick={() => setShowOpenAIKey(!showOpenAIKey)}
                    className="absolute inset-y-0 right-0 px-2 flex items-center"
                    aria-label={showOpenAIKey ? "Hide OpenAI API key" : "Show OpenAI API key"}
                  >
                    {showOpenAIKey ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                  </button>
                </div>
                {validationErrors.openai && (
                  <div id="openai-key-error" className="mt-1 text-xs text-red-400 flex items-center">
                    <FiAlertCircle className="mr-1" /> {validationErrors.openai}
                  </div>
                )}
              </div>
              
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <label htmlFor="gemini-key" className="block text-sm">
                    Gemini API Key
                  </label>
                  {provider === 'gemini' && (
                    <span className="text-xs text-primary">Required</span>
                  )}
                </div>
                <div className="relative">
                  <input
                    id="gemini-key"
                    type={showGeminiKey ? "text" : "password"}
                    value={geminiKey}
                    onChange={(e) => {
                      setGeminiKey(e.target.value);
                      if (validationErrors.gemini) {
                        setValidationErrors({...validationErrors, gemini: undefined});
                      }
                    }}
                    className={`w-full p-2 bg-gray-800 rounded border ${
                      validationErrors.gemini ? 'border-red-500' : 'border-gray-700'
                    }`}
                    placeholder="AI..."
                    aria-invalid={validationErrors.gemini ? "true" : "false"}
                    aria-describedby={validationErrors.gemini ? "gemini-key-error" : undefined}
                  />
                  <button
                    type="button"
                    onClick={() => setShowGeminiKey(!showGeminiKey)}
                    className="absolute inset-y-0 right-0 px-2 flex items-center"
                    aria-label={showGeminiKey ? "Hide Gemini API key" : "Show Gemini API key"}
                  >
                    {showGeminiKey ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                  </button>
                </div>
                {validationErrors.gemini && (
                  <div id="gemini-key-error" className="mt-1 text-xs text-red-400 flex items-center">
                    <FiAlertCircle className="mr-1" /> {validationErrors.gemini}
                  </div>
                )}
              </div>
              
              <button
                type="submit"
                className="primary-btn w-full py-2 px-4 rounded flex items-center justify-center"
              >
                <FiSave className="mr-2" /> Save Configuration
              </button>
            </form>
            
            {isSaved && (
              <div className="mt-3 text-sm text-green-400 text-center animate-fade-in" role="status">
                Configuration saved successfully!
              </div>
            )}
            
            <p className="mt-4 text-xs text-gray-400">
              Your API keys are stored locally in your browser and are never sent to our servers.
            </p>
          </div>
        </>
      )}
    </div>
  );
}