'use client';

import { ArticleMetadata } from '@/types';
import { FiSun, FiMoon, FiExternalLink } from 'react-icons/fi';
import ImageGallery from './ImageGallery';

interface RightSidebarProps {
  metadata: ArticleMetadata;
  view: 'summary' | 'detailed';
  onViewChange: (view: 'summary' | 'detailed') => void;
}

export default function RightSidebar({ metadata, view, onViewChange }: RightSidebarProps) {
  return (
    <div className="right-sidebar space-y-6">
      {/* View Toggle Buttons */}
      <div className="flex space-x-2 mb-6">
        <button 
          className={`px-4 py-2 rounded-md text-sm flex-1 ${view === 'summary' ? 'primary-btn' : 'dark-btn'}`}
          onClick={() => onViewChange('summary')}
        >
          <FiSun className="inline mr-1" /> Summary View
        </button>
        <button 
          className={`px-4 py-2 rounded-md text-sm flex-1 ${view === 'detailed' ? 'primary-btn' : 'dark-btn'}`}
          onClick={() => onViewChange('detailed')}
        >
          <FiMoon className="inline mr-1" /> Detailed View
        </button>
      </div>
      
      {/* Story Details */}
      <div className="border border-gray-700 rounded-md p-4 bg-gray-800/50">
        <h3 className="text-lg font-bold mb-3">Story Details</h3>
        <div className="space-y-2 text-sm">
          <div>
            <span className="text-gray-400">Published:</span> {metadata.date}
          </div>
          <div>
            <span className="text-gray-400">Source:</span> {metadata.source}
          </div>
          <div>
            <span className="text-gray-400">By:</span> {metadata.author}
          </div>
          <div>
            <span className="text-gray-400">Search By:</span> URL
          </div>
        </div>
      </div>
      
      {/* View Original Article Button */}
      <a 
        href={metadata.url} 
        target="_blank" 
        rel="noopener noreferrer"
        className="primary-btn py-2 px-4 rounded w-full text-center flex items-center justify-center"
      >
        <FiExternalLink className="mr-2" /> View Original Article
      </a>
      
      {/* Featured Image */}
      {metadata.featuredImage && (
        <div className="animate-fade-in">
          <h3 className="text-lg font-bold mb-3 text-green-400">FEATURED IMAGE</h3>
          <div className="relative border border-gray-700 rounded-md overflow-hidden bg-gray-800/50">
            <div className="w-full aspect-video relative">
              <img 
                src={metadata.featuredImage.url} 
                alt={metadata.featuredImage.alt || metadata.title} 
                className="w-full h-full object-cover transition-opacity duration-300"
                onLoad={(e) => {
                  // Ensure image is visible with a fade-in effect
                  e.currentTarget.style.opacity = "1";
                }}
                onError={(e) => {
                  // Replace with placeholder on error
                  const parent = e.currentTarget.parentElement;
                  if (parent) {
                    const placeholder = document.createElement('div');
                    placeholder.className = 'absolute inset-0 flex flex-col items-center justify-center bg-gray-800 text-gray-500';
                    placeholder.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg><p class="mt-2">Image could not be loaded</p>';
                    parent.appendChild(placeholder);
                    e.currentTarget.style.display = 'none';
                  }
                }}
                style={{ opacity: 0 }} // Start with opacity 0 for fade effect
              />
            </div>
            {metadata.featuredImage.alt && (
              <div className="p-2 text-sm text-gray-300 bg-gradient-to-t from-gray-900/90 to-transparent">
                {metadata.featuredImage.alt}
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Image Gallery */}
      {metadata.images && metadata.images.length > 0 && (
        <ImageGallery images={metadata.images} />
      )}
    </div>
  );
}