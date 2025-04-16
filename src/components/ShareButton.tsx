'use client';

import { useState } from 'react';
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
  
  const { title, url } = articleData.metadata;
  const encodedTitle = encodeURIComponent(title);
  const encodedUrl = encodeURIComponent(url);
  
  // Share URLs for different platforms
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
  const mailUrl = `mailto:?subject=${encodedTitle}&body=Check out this article: ${encodedUrl}`;

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative">
      <button 
        onClick={toggleDropdown}
        className="dark-btn px-3 py-2 rounded-md flex items-center"
        aria-label="Share article"
      >
        <FiShare2 className="mr-2" /> Share
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-card border border-border z-10 animate-scale-in">
          <div className="py-1 rounded-md bg-card shadow-xs">
            <button 
              onClick={() => window.open(twitterUrl, '_blank')}
              className="w-full text-left px-4 py-2 flex items-center hover:bg-card-highlight transition-colors"
            >
              <FiTwitter className="mr-3 text-blue-400" /> Twitter
            </button>
            <button 
              onClick={() => window.open(facebookUrl, '_blank')}
              className="w-full text-left px-4 py-2 flex items-center hover:bg-card-highlight transition-colors"
            >
              <FiFacebook className="mr-3 text-blue-600" /> Facebook
            </button>
            <button 
              onClick={() => window.open(linkedinUrl, '_blank')}
              className="w-full text-left px-4 py-2 flex items-center hover:bg-card-highlight transition-colors"
            >
              <FiLinkedin className="mr-3 text-blue-500" /> LinkedIn
            </button>
            <button 
              onClick={() => window.open(mailUrl, '_blank')}
              className="w-full text-left px-4 py-2 flex items-center hover:bg-card-highlight transition-colors"
            >
              <FiMail className="mr-3 text-gray-400" /> Email
            </button>
            <button 
              onClick={copyToClipboard}
              className="w-full text-left px-4 py-2 flex items-center hover:bg-card-highlight transition-colors"
            >
              {copied ? <FiCheck className="mr-3 text-green-500" /> : <FiCopy className="mr-3 text-gray-400" />}
              {copied ? 'Copied!' : 'Copy link'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}