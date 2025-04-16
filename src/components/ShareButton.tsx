'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  FiShare2, 
  FiTwitter, 
  FiLinkedin, 
  FiFacebook, 
  FiMail,
  FiCopy,
  FiCheck 
} from 'react-icons/fi';
import { ParsedArticle } from '@/types';

interface ShareButtonProps {
  articleData: ParsedArticle;
}

export default function ShareButton({ articleData }: ShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  
  const { title, url } = articleData.metadata;
  const encodedTitle = encodeURIComponent(title);
  const encodedUrl = encodeURIComponent(url);
  
  // Share URLs for different platforms
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
  const mailUrl = `mailto:?subject=${encodedTitle}&body=Check out this article: ${encodedUrl}`;

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    
    // Handle escape key to close dropdown
    function handleEscapeKey(event: KeyboardEvent) {
      if (event.key === 'Escape' && isOpen) {
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

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };
  
  const copyToClipboard = () => {
    try {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy URL:', error);
      // Fallback method for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = url;
      textArea.style.position = 'fixed';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      try {
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Fallback: Could not copy text:', err);
      }
      
      document.body.removeChild(textArea);
    }
  };

  // Share handlers with proper window features for security
  const handleShare = (shareUrl: string) => {
    window.open(
      shareUrl, 
      'share-dialog', 
      'width=800,height=600,location=yes,left=200,top=200'
    );
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button 
        ref={buttonRef}
        onClick={toggleDropdown}
        className="dark-btn px-3 py-2 rounded-md flex items-center"
        aria-label="Share article"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <FiShare2 className="mr-2" /> Share
      </button>
      
      {isOpen && (
        <>
          {/* Invisible overlay to detect outside clicks on mobile */}
          <div className="fixed inset-0 z-10" aria-hidden="true" />
          
          <div 
            ref={dropdownRef}
            className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-card border border-border z-20 animate-scale-in"
            role="menu"
            aria-orientation="vertical"
            aria-labelledby="share-button"
          >
            <div className="py-1 rounded-md bg-card shadow-xs">
              <button 
                onClick={() => handleShare(twitterUrl)}
                className="w-full text-left px-4 py-2 flex items-center hover:bg-card-highlight transition-colors"
                role="menuitem"
              >
                <FiTwitter className="mr-3 text-blue-400" /> Twitter
              </button>
              <button 
                onClick={() => handleShare(facebookUrl)}
                className="w-full text-left px-4 py-2 flex items-center hover:bg-card-highlight transition-colors"
                role="menuitem"
              >
                <FiFacebook className="mr-3 text-blue-600" /> Facebook
              </button>
              <button 
                onClick={() => handleShare(linkedinUrl)}
                className="w-full text-left px-4 py-2 flex items-center hover:bg-card-highlight transition-colors"
                role="menuitem"
              >
                <FiLinkedin className="mr-3 text-blue-500" /> LinkedIn
              </button>
              <button 
                onClick={() => window.location.href = mailUrl}
                className="w-full text-left px-4 py-2 flex items-center hover:bg-card-highlight transition-colors"
                role="menuitem"
              >
                <FiMail className="mr-3 text-gray-400" /> Email
              </button>
              <button 
                onClick={copyToClipboard}
                className="w-full text-left px-4 py-2 flex items-center hover:bg-card-highlight transition-colors"
                role="menuitem"
              >
                {copied ? <FiCheck className="mr-3 text-green-500" /> : <FiCopy className="mr-3 text-gray-400" />}
                {copied ? 'Copied!' : 'Copy link'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}